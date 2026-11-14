import * as Notifications from "expo-notifications";
import { DarkTheme, DefaultTheme, Stack, ThemeProvider, router } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useEffect } from "react";
import { useColorScheme } from "react-native";

import { ToastHost } from "@/components/toast";
import { geofencingSupported } from "@/geofencing/constants";
import { syncRegions } from "@/geofencing/store";
import { useColors, useTintColors } from "@/theme/colors";

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
  const colors = useColors();
  const colorScheme = useColorScheme();
  useNotificationDeepLinks();

  useEffect(() => {
    if (geofencingSupported) syncRegions().catch(console.error);
  }, []);

  return (
    <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
      <Stack
        screenOptions={{
          // Shows behind screens, e.g. during transitions, in light and dark mode.
          contentStyle: { backgroundColor: colors.background },
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
    </ThemeProvider>
  );
}
