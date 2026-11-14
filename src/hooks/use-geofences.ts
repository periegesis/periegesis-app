import { useCallback, useEffect, useMemo, useSyncExternalStore } from "react";
import { Alert } from "react-native";

import { showToast } from "@/components/toast";
import { GEOFENCE_LIMIT, geofencingSupported } from "@/geofencing/constants";
import {
  ensureGeofencePermissions,
  explainBackgroundLocationNeeded,
  isBackgroundLocationMissing,
} from "@/geofencing/permissions";
import {
  disableSights,
  enableSights,
  geofenceId,
  getSnapshot,
  loadGeofences,
  subscribe,
  type GeofenceEntry,
} from "@/geofencing/store";
import type { Neighborhood, Sight } from "@/types/city";

export function hasCoordinates(sight: Sight): boolean {
  return Number.isFinite(sight.latitude) && Number.isFinite(sight.longitude);
}

function toEntry(
  cityId: string,
  neighborhood: number,
  sightIndex: number,
  sight: Sight,
): GeofenceEntry {
  return {
    cityId,
    neighborhood,
    sight: sightIndex,
    name: sight.name,
    latitude: sight.latitude,
    longitude: sight.longitude,
  };
}

function limitMessage(adding: number) {
  const notifications = adding === 1 ? "1 notification" : `${adding} notifications`;
  return `Can't turn on ${notifications}: this device allows up to ${GEOFENCE_LIMIT} sight notifications at once.`;
}

async function reportError(e: unknown) {
  console.error(e);
  // Background location can be revoked in Settings at any time, which makes
  // geofencing calls fail; say so instead of showing a generic error.
  if (await isBackgroundLocationMissing()) {
    explainBackgroundLocationNeeded();
    return;
  }
  Alert.alert("Couldn't update notifications", "Something went wrong. Please try again.");
}

/** Sight notification (geofence) state shared across the app, with actions to change it. */
export function useGeofences() {
  const geofences = useSyncExternalStore(subscribe, getSnapshot);
  const count = Object.keys(geofences).length;

  useEffect(() => {
    if (geofencingSupported) loadGeofences().catch(console.error);
  }, []);

  const isEnabled = useCallback(
    (cityId: string, neighborhood: number, sight: number) =>
      geofenceId(cityId, neighborhood, sight) in geofences,
    [geofences],
  );

  const enable = useCallback(async (entries: GeofenceEntry[]) => {
    // Checked up front so the user isn't asked for permissions to no effect.
    if (Object.keys(getSnapshot()).length + entries.length > GEOFENCE_LIMIT) {
      showToast(limitMessage(entries.length));
      return;
    }
    if (!(await ensureGeofencePermissions())) return;
    if ((await enableSights(entries)) === "limit") {
      showToast(limitMessage(entries.length));
    }
  }, []);

  const toggleSight = useCallback(
    async (cityId: string, neighborhood: number, sightIndex: number, sight: Sight) => {
      try {
        const id = geofenceId(cityId, neighborhood, sightIndex);
        if (id in getSnapshot()) await disableSights([id]);
        else await enable([toEntry(cityId, neighborhood, sightIndex, sight)]);
      } catch (e) {
        await reportError(e);
      }
    },
    [enable],
  );

  /**
   * Turns off every notification in the neighborhood if any are on; otherwise turns
   * them all on, unless that would exceed the platform limit.
   */
  const toggleNeighborhood = useCallback(
    async (cityId: string, neighborhoodIndex: number, neighborhood: Neighborhood) => {
      try {
        const current = getSnapshot();
        const sights = neighborhood.sights
          .map((sight, index) => ({ sight, index }))
          .filter(({ sight }) => hasCoordinates(sight));
        const ids = sights.map(({ index }) => geofenceId(cityId, neighborhoodIndex, index));
        const enabledIds = ids.filter((id) => id in current);
        if (enabledIds.length > 0) {
          await disableSights(enabledIds);
        } else if (sights.length > 0) {
          await enable(
            sights.map(({ sight, index }) => toEntry(cityId, neighborhoodIndex, index, sight)),
          );
        }
      } catch (e) {
        await reportError(e);
      }
    },
    [enable],
  );

  return useMemo(
    () => ({
      supported: geofencingSupported,
      count,
      limit: GEOFENCE_LIMIT,
      atLimit: count >= GEOFENCE_LIMIT,
      isEnabled,
      toggleSight,
      toggleNeighborhood,
    }),
    [count, isEnabled, toggleSight, toggleNeighborhood],
  );
}
