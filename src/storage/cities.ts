import { Directory, File, Paths } from "expo-file-system";
import Storage from "./kv-store";

import { removeCityGeofences } from "@/geofencing/store";
import type { City, PhotoRef, StoredCity } from "@/types/city";

export const CITIES_INDEX_KEY = "periegesis-cities";
export const CITY_HASHES_KEY = "periegesis-city-hashes";

async function readIndex(): Promise<string[] | null> {
  const raw = await Storage.getItem(CITIES_INDEX_KEY);
  if (raw == null) return null;
  try {
    const parsed: unknown = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      return parsed.filter((id): id is string => typeof id === "string");
    }
  } catch {}
  console.warn(`Ignoring malformed value for "${CITIES_INDEX_KEY}"`);
  return [];
}

function parseCity(id: string, raw: string | null): City | null {
  if (raw == null) {
    console.warn(`City "${id}" is listed but has no stored data`);
    return null;
  }
  try {
    const city = JSON.parse(raw);
    if (typeof city?.name === "string") return city as City;
  } catch {}
  console.warn(`Skipping malformed data for city "${id}"`);
  return null;
}

export async function hasCityIndex(): Promise<boolean> {
  return (await Storage.getItem(CITIES_INDEX_KEY)) != null;
}

/** Loads every city in the index, in index order. */
export async function loadCities(): Promise<StoredCity[]> {
  const ids = await readIndex();
  if (!ids?.length) return [];

  const entries = await Storage.multiGet(ids);
  const values = new Map(entries);

  const cities: StoredCity[] = [];
  for (const id of ids) {
    const city = parseCity(id, values.get(id) ?? null);
    if (city) cities.push({ id, city });
  }
  return cities;
}

/** Loads one city, or null if it isn't stored or its data is malformed. */
export async function loadCity(id: string): Promise<City | null> {
  return parseCity(id, await Storage.getItem(id));
}

/** SHA-256 hashes of imported source files, keyed by city id. */
export async function getCityHashes(): Promise<Record<string, string>> {
  const raw = await Storage.getItem(CITY_HASHES_KEY);
  if (raw == null) return {};
  try {
    const parsed: unknown = JSON.parse(raw);
    if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
      return Object.fromEntries(
        Object.entries(parsed).filter(
          (entry): entry is [string, string] => typeof entry[1] === "string",
        ),
      );
    }
  } catch {}
  console.warn(`Ignoring malformed value for "${CITY_HASHES_KEY}"`);
  return {};
}

async function setCityHash(id: string, hash: string | undefined): Promise<void> {
  const hashes = await getCityHashes();
  if (hash == null) delete hashes[id];
  else hashes[id] = hash;
  await Storage.setItem(CITY_HASHES_KEY, JSON.stringify(hashes));
}

/** Cities whose name matches, ignoring case and surrounding whitespace. */
export async function findCitiesByName(name: string): Promise<StoredCity[]> {
  const target = normalizeCityName(name);
  return (await loadCities()).filter(
    ({ city }) => normalizeCityName(city.name) === target,
  );
}

export function normalizeCityName(name: string): string {
  return name.trim().toLocaleLowerCase();
}

/** Where a city's imported photos live, relative to the document directory. */
export function cityPhotoPath(id: string): string {
  return `photos/${id}`;
}

export function cityPhotoDir(id: string): Directory {
  return new Directory(Paths.document, cityPhotoPath(id));
}

/**
 * Saves a city. Pass the source file's hash for imported cities; it replaces
 * any hash stored for the same id.
 */
export async function saveCity(
  id: string,
  city: City,
  hash?: string,
): Promise<void> {
  await Storage.setItem(id, JSON.stringify(city));
  await setCityHash(id, hash);
  const ids = (await readIndex()) ?? [];
  if (!ids.includes(id)) {
    await Storage.setItem(CITIES_INDEX_KEY, JSON.stringify([...ids, id]));
  }
}

export async function removeCity(id: string): Promise<void> {
  const ids = (await readIndex()) ?? [];
  await Storage.setItem(
    CITIES_INDEX_KEY,
    JSON.stringify(ids.filter((existing) => existing !== id)),
  );
  await Storage.removeItem(id);
  await setCityHash(id, undefined);
  await removeCityGeofences(id);
  try {
    const dir = cityPhotoDir(id);
    if (dir.exists) dir.delete();
  } catch {
    // No document directory (e.g. on web), so there are no photos to remove.
  }
}

/** True for photo references that are full URIs rather than stored files. */
export function isUri(photo: PhotoRef): boolean {
  return /^[a-z][a-z0-9+.-]*:/i.test(photo);
}

/** Turns a stored photo reference into a URI the image component can load. */
export function resolvePhotoUri(photo?: PhotoRef): string | undefined {
  if (!photo) return undefined;
  if (isUri(photo)) return photo;
  try {
    return new File(Paths.document, photo).uri;
  } catch {
    // No document directory (e.g. on web); the card falls back to text only.
    return undefined;
  }
}
