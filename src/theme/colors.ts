import { Color } from "expo-router";
import { Platform, useColorScheme } from "react-native";

export const colors = {
  label: Platform.select({
    ios: Color.ios.label,
    android: Color.android.dynamic.onSurface,
    default: "#000000",
  })!,
  secondaryLabel: Platform.select({
    ios: Color.ios.secondaryLabel,
    android: Color.android.dynamic.onSurfaceVariant,
    default: "#3c3c43",
  })!,
  background: Platform.select({
    ios: Color.ios.systemGroupedBackground,
    android: Color.android.dynamic.surface,
    default: "#f2f2f7",
  })!,
  cardBackground: Platform.select({
    ios: Color.ios.secondarySystemGroupedBackground,
    android: Color.android.dynamic.surfaceContainerLow,
    default: "#ffffff",
  })!,
  placeholder: Platform.select({
    ios: Color.ios.tertiarySystemFill,
    android: Color.android.dynamic.surfaceContainer,
    default: "#e5e5ea",
  })!,
};

/**
 * Brand theme color, lightened in dark mode to stay legible on dark
 * backgrounds. `onTint` is for content (text, icons) drawn on top of `tint`,
 * and `onTintStatusBar` is the status bar style that stays legible over it.
 */
export function useTintColors() {
  return useColorScheme() === "dark"
    ? { tint: "#E07FAE", onTint: "#2B0618", onTintStatusBar: "dark" as const }
    : { tint: "#80134A", onTint: "#ffffff", onTintStatusBar: "light" as const };
}
