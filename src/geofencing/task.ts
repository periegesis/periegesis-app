import * as Location from "expo-location";
import * as Notifications from "expo-notifications";
import * as TaskManager from "expo-task-manager";

import { GEOFENCE_TASK, SIGHT_CHANNEL_ID, geofencingSupported } from "./constants";
import { geofenceUrl, readGeofences } from "./store";

type GeofenceEvent = {
  eventType: Location.GeofencingEventType;
  region: Location.LocationRegion;
};

// Show sight alerts even while the app is in the foreground.
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

// Defined at module scope so it exists when the OS launches the app headless.
if (geofencingSupported) {
  TaskManager.defineTask<GeofenceEvent>(GEOFENCE_TASK, async ({ data, error }) => {
    if (error) {
      console.error(`Geofencing task failed: ${error.message}`);
      return;
    }
    if (data.eventType !== Location.GeofencingEventType.Enter) return;

    const id = data.region.identifier;
    const entry = id ? (await readGeofences())[id] : undefined;
    if (!entry) return;

    await Notifications.scheduleNotificationAsync({
      content: {
        title: entry.name,
        body: "You're near this sight. Tap to read about it.",
        data: { url: geofenceUrl(entry) },
      },
      trigger: { channelId: SIGHT_CHANNEL_ID },
    });
  });
}
