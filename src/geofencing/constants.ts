import { Platform } from "react-native";

export const GEOFENCE_TASK = "periegesis-sight-geofences";

/** Meters around a sight that count as "near" it. */
export const GEOFENCE_RADIUS = 800;

/** Maximum regions the OS will monitor for one app at a time. */
export const GEOFENCE_LIMIT = Platform.OS === "ios" ? 20 : 100;

/** Android notification channel for sight alerts. */
export const SIGHT_CHANNEL_ID = "sights";

export const geofencingSupported = Platform.OS !== "web";
