import * as Location from "expo-location";
import * as Notifications from "expo-notifications";
import { Alert, Linking } from "react-native";

import { SIGHT_CHANNEL_ID } from "./constants";

let warnedAboutNotifications = false;

function explainDenied(message: string) {
  Alert.alert("Location access needed", message, [
    { text: "Cancel", style: "cancel" },
    { text: "Open Settings", onPress: () => Linking.openSettings() },
  ]);
}

/** The notification channel must exist before Android 13+ will ask for permission. */
export async function ensureSightChannel(): Promise<void> {
  await Notifications.setNotificationChannelAsync(SIGHT_CHANNEL_ID, {
    name: "Nearby sights",
    description: "Alerts when you're near a sight you've set an alarm for",
    importance: Notifications.AndroidImportance.HIGH,
  });
}

/**
 * Asks for what sight alarms need: background ("Always") location to monitor
 * regions, and notifications to alert the user. Returns false, after telling
 * the user why, if location isn't granted. Missing notification permission
 * only warns, since the geofence itself still works.
 */
export async function ensureGeofencePermissions(): Promise<boolean> {
  const foreground = await Location.requestForegroundPermissionsAsync();
  if (!foreground.granted) {
    explainDenied(
      "Allow location access so Periegesis can alert you when you're near a sight.",
    );
    return false;
  }

  const background = await Location.requestBackgroundPermissionsAsync();
  if (!background.granted) {
    explainDenied(
      'Sight alarms work while the app is closed, so location access must be set to "Always" (iOS) or "Allow all the time" (Android).',
    );
    return false;
  }

  await ensureSightChannel();
  let notifications = await Notifications.getPermissionsAsync();
  if (!notifications.granted && notifications.canAskAgain) {
    notifications = await Notifications.requestPermissionsAsync();
  }
  if (!notifications.granted && !warnedAboutNotifications) {
    warnedAboutNotifications = true;
    Alert.alert(
      "Notifications are off",
      "Your alarm is set, but you won't be alerted until you allow notifications for Periegesis in Settings.",
    );
  }
  return true;
}
