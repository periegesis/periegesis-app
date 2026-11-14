import * as Location from "expo-location";
import * as Notifications from "expo-notifications";
import { Alert, Linking, Platform } from "react-native";

import { SIGHT_CHANNEL_ID, geofencingSupported } from "./constants";

let warnedAboutNotifications = false;

/** The name of the background location setting as the OS labels it. */
const ALWAYS_SETTING = Platform.OS === "ios" ? '"Always"' : '"Allow all the time"';

function explainDenied(message: string) {
  Alert.alert("Location access needed", message, [
    { text: "Cancel", style: "cancel" },
    { text: "Open Settings", onPress: () => Linking.openSettings() },
  ]);
}

/** Tells the user that sight notifications need background location, with a link to Settings. */
export function explainBackgroundLocationNeeded() {
  explainDenied(
    `Sight notifications work while the app is closed, so location access must be set to ${ALWAYS_SETTING}. Turn it on in Settings, then try again.`,
  );
}

/** Whether background location is currently missing, e.g. to explain a failure. */
export async function isBackgroundLocationMissing(): Promise<boolean> {
  if (!geofencingSupported) return false;
  try {
    return !(await Location.getBackgroundPermissionsAsync()).granted;
  } catch {
    return false;
  }
}

/** Explains why background location is needed; resolves true if the user wants to continue. */
function confirmBackgroundLocation(): Promise<boolean> {
  return new Promise((resolve) => {
    Alert.alert(
      "Alerts near sights",
      `Sight notifications let you know when you're near a sight, even while Periegesis is closed. ` +
        `To do that, Periegesis needs location access set to ${ALWAYS_SETTING}.\n\n` +
        `Your location is only used on this device to check whether you're near a sight for which you've turned on notifications.`,
      [
        { text: "Not Now", style: "cancel", onPress: () => resolve(false) },
        { text: "Continue", onPress: () => resolve(true) },
      ],
      { cancelable: true, onDismiss: () => resolve(false) },
    );
  });
}

/** The notification channel must exist before Android 13+ will ask for permission. */
export async function ensureSightChannel(): Promise<void> {
  await Notifications.setNotificationChannelAsync(SIGHT_CHANNEL_ID, {
    name: "Nearby sights",
    description: "Alerts when you're near a sight for which you've turned on notifications",
    importance: Notifications.AndroidImportance.HIGH,
  });
}

/**
 * Asks for what sight notifications need: background ("Always") location to monitor
 * regions, and notifications to alert the user. Returns false, after telling
 * the user why, if location isn't granted. Missing notification permission
 * only warns, since the geofence itself still works.
 */
export async function ensureGeofencePermissions(): Promise<boolean> {
  // Explain before the OS prompts appear the first time; afterwards the OS
  // remembers the answer, so the explanation would only get in the way.
  const current = await Location.getBackgroundPermissionsAsync();
  if (current.status === Location.PermissionStatus.UNDETERMINED) {
    if (!(await confirmBackgroundLocation())) return false;
  }

  const foreground = await Location.requestForegroundPermissionsAsync();
  if (!foreground.granted) {
    explainDenied(
      "Allow location access so Periegesis can alert you when you're near a sight.",
    );
    return false;
  }

  const background = await Location.requestBackgroundPermissionsAsync();
  if (!background.granted) {
    explainBackgroundLocationNeeded();
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
      "Periegesis will watch for this sight, but you won't be alerted until you allow notifications for Periegesis in Settings.",
    );
  }
  return true;
}
