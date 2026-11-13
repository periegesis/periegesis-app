// Background tasks must be defined before anything else runs, including when
// the OS launches the app headless for a geofence event.
import "@/geofencing/task";
import "expo-router/entry";
