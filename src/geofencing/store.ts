import * as Location from "expo-location";

import Storage from "@/storage/kv-store";

import {
  GEOFENCE_LIMIT,
  GEOFENCE_RADIUS,
  GEOFENCE_TASK,
  geofencingSupported,
} from "./constants";

export const GEOFENCES_KEY = "periegesis-geofences";

/** A sight the user has set an alarm for. */
export type GeofenceEntry = {
  cityId: string;
  neighborhood: number;
  sight: number;
  name: string;
  latitude: number;
  longitude: number;
};

export type Geofences = Readonly<Record<string, GeofenceEntry>>;

/**
 * Region identifier for a sight. It mirrors the sight's route params, so a
 * geofence event can be turned back into a deep link.
 */
export function geofenceId(cityId: string, neighborhood: number, sight: number) {
  return `${cityId}:${neighborhood}:${sight}`;
}

/** The sight route for a stored geofence. */
export function geofenceUrl(entry: GeofenceEntry): string {
  return `/city/${entry.cityId}/${entry.neighborhood}/${entry.sight}`;
}

function isEntry(value: unknown): value is GeofenceEntry {
  if (!value || typeof value !== "object") return false;
  const entry = value as Record<string, unknown>;
  return (
    typeof entry.cityId === "string" &&
    typeof entry.name === "string" &&
    Number.isInteger(entry.neighborhood) &&
    Number.isInteger(entry.sight) &&
    Number.isFinite(entry.latitude) &&
    Number.isFinite(entry.longitude)
  );
}

/** Reads the stored geofences straight from storage. Safe in background tasks. */
export async function readGeofences(): Promise<Geofences> {
  const raw = await Storage.getItem(GEOFENCES_KEY);
  if (raw == null) return {};
  try {
    const parsed: unknown = JSON.parse(raw);
    if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
      return Object.fromEntries(
        Object.entries(parsed).filter((entry): entry is [string, GeofenceEntry] =>
          isEntry(entry[1]),
        ),
      );
    }
  } catch {}
  console.warn(`Ignoring malformed value for "${GEOFENCES_KEY}"`);
  return {};
}

// In-memory snapshot shared by every toggle, kept in step with storage.
let snapshot: Geofences = {};
let loaded: Promise<void> | null = null;
const listeners = new Set<() => void>();

export function subscribe(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function getSnapshot(): Geofences {
  return snapshot;
}

function publish(next: Geofences) {
  snapshot = next;
  listeners.forEach((listener) => listener());
}

/** Loads stored geofences into the shared snapshot (once). */
export function loadGeofences(): Promise<void> {
  loaded ??= readGeofences().then(publish, (e) => {
    loaded = null;
    throw e;
  });
  return loaded;
}

/** Points the OS at exactly the stored regions, stopping when there are none. */
async function syncWith(geofences: Geofences): Promise<void> {
  if (!geofencingSupported) return;
  const regions: Location.LocationRegion[] = Object.entries(geofences).map(
    ([identifier, entry]) => ({
      identifier,
      latitude: entry.latitude,
      longitude: entry.longitude,
      radius: GEOFENCE_RADIUS,
      notifyOnEnter: true,
      notifyOnExit: false,
    }),
  );
  if (regions.length > 0) {
    await Location.startGeofencingAsync(GEOFENCE_TASK, regions);
  } else if (
    // Querying geofencing throws without background location access, and
    // nothing can have been started without it, so there's nothing to stop.
    (await Location.getBackgroundPermissionsAsync()).granted &&
    (await Location.hasStartedGeofencingAsync(GEOFENCE_TASK))
  ) {
    await Location.stopGeofencingAsync(GEOFENCE_TASK);
  }
}

// Serializes changes so rapid toggles can't interleave read-modify-write.
let queue: Promise<unknown> = Promise.resolve();

function enqueue<T>(work: () => Promise<T>): Promise<T> {
  const result = queue.then(work);
  queue = result.catch(() => {});
  return result;
}

async function commit(next: Geofences): Promise<void> {
  const previous = snapshot;
  publish(next);
  try {
    await Storage.setItem(GEOFENCES_KEY, JSON.stringify(next));
    await syncWith(next);
  } catch (e) {
    publish(previous);
    await Storage.setItem(GEOFENCES_KEY, JSON.stringify(previous)).catch(() => {});
    throw e;
  }
}

/**
 * Turns on geofences for the given sights. Changes nothing and returns
 * "limit" if that would monitor more regions than the platform allows.
 */
export function enableSights(entries: GeofenceEntry[]): Promise<"ok" | "limit"> {
  return enqueue(async () => {
    await loadGeofences();
    const next: Record<string, GeofenceEntry> = { ...snapshot };
    for (const entry of entries) {
      next[geofenceId(entry.cityId, entry.neighborhood, entry.sight)] = entry;
    }
    if (Object.keys(next).length > GEOFENCE_LIMIT) return "limit";
    await commit(next);
    return "ok";
  });
}

/** Turns off geofences by region identifier. */
export function disableSights(ids: string[]): Promise<void> {
  return enqueue(async () => {
    await loadGeofences();
    const next = { ...snapshot };
    for (const id of ids) delete next[id];
    await commit(next);
  });
}

/** Removes every geofence belonging to a city, e.g. when it's deleted or replaced. */
export function removeCityGeofences(cityId: string): Promise<void> {
  return enqueue(async () => {
    await loadGeofences();
    const next = Object.fromEntries(
      Object.entries(snapshot).filter(([, entry]) => entry.cityId !== cityId),
    );
    if (Object.keys(next).length === Object.keys(snapshot).length) return;
    await commit(next);
  });
}

/**
 * Re-registers the stored regions with the OS, healing drift after an OS
 * reset or reinstall. Skips registering when background location isn't
 * granted, since starting geofencing would fail.
 */
export function syncRegions(): Promise<void> {
  return enqueue(async () => {
    await loadGeofences();
    if (!geofencingSupported) return;
    if (Object.keys(snapshot).length > 0) {
      const { granted } = await Location.getBackgroundPermissionsAsync();
      if (!granted) return;
    }
    await syncWith(snapshot);
  });
}
