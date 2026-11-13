import * as Notifications from "expo-notifications";
import { Stack, router } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useEffect } from "react";

import { ToastHost } from "@/components/toast";
import { geofencingSupported } from "@/geofencing/constants";
import { syncRegions } from "@/geofencing/store";
import { useTintColors } from "@/theme/colors";

/** Opens the sight linked from a tapped geofence notification. */
function useNotificationDeepLinks() {
  useEffect(() => {
    function open(response: Notifications.NotificationResponse | null) {
      const url = response?.notification.request.content.data?.url;
      if (typeof url === "string") router.push(url as never);
    }

    // A tap that launched the app from a terminated state.
    open(Notifications.getLastNotificationResponse());
    const subscription = Notifications.addNotificationResponseReceivedListener(open);
    return () => subscription.remove();
  }, []);
}

export default function RootLayout() {
  const { tint, onTint, onTintStatusBar } = useTintColors();
  useNotificationDeepLinks();

  useEffect(() => {
    if (geofencingSupported) syncRegions().catch(console.error);
  }, []);

  return (
    <>
      <Stack
        screenOptions={{
          headerStyle: { backgroundColor: tint },
          headerLargeStyle: { backgroundColor: tint },
          headerTintColor: onTint,
          headerTitleStyle: { color: onTint },
          headerLargeTitleStyle: { color: onTint },
        }}
      >
        <Stack.Screen
          name="index"
          options={{ title: "Periegesis", headerLargeTitle: true }}
        />
      </Stack>
      <ToastHost />
      <StatusBar style={onTintStatusBar} />
    </>
  );
}
