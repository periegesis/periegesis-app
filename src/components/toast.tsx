import { useEffect, useState } from "react";
import { Text } from "react-native";
import Animated, { FadeInUp, FadeOutDown } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const DURATION_MS = 2500;
const listeners = new Set<(message: string) => void>();

/** Briefly shows a message over the current screen. */
export function showToast(message: string) {
  listeners.forEach((listener) => listener(message));
}

/** Renders toasts; mount once at the root of the app. */
export function ToastHost() {
  const insets = useSafeAreaInsets();
  const [toast, setToast] = useState<{ id: number; message: string } | null>(null);

  useEffect(() => {
    const listener = (message: string) =>
      setToast((current) => ({ id: (current?.id ?? 0) + 1, message }));
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
    };
  }, []);

  useEffect(() => {
    if (!toast) return;
    const timeout = setTimeout(() => setToast(null), DURATION_MS);
    return () => clearTimeout(timeout);
  }, [toast]);

  if (!toast) return null;
  return (
    <Animated.View
      key={toast.id}
      entering={FadeInUp}
      exiting={FadeOutDown}
      pointerEvents="none"
      accessibilityLiveRegion="polite"
      style={{
        position: "absolute",
        left: 16,
        right: 16,
        bottom: insets.bottom + 24,
        alignItems: "center",
      }}
    >
      <Text
        accessibilityRole="alert"
        style={{
          overflow: "hidden",
          paddingVertical: 12,
          paddingHorizontal: 18,
          borderRadius: 20,
          borderCurve: "continuous",
          backgroundColor: "rgba(30, 30, 30, 0.92)",
          color: "#ffffff",
          fontSize: 15,
          textAlign: "center",
        }}
      >
        {toast.message}
      </Text>
    </Animated.View>
  );
}
