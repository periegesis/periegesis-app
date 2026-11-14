import { Color } from "expo-router";
import { useMemo } from "react";
import { Platform, useColorScheme, type ColorValue } from "react-native";

export type Colors = {
  label: ColorValue;
  secondaryLabel: ColorValue;
  background: ColorValue;
  cardBackground: ColorValue;
  placeholder: ColorValue;
  /** For destructive actions, such as delete buttons. */
  destructive: ColorValue;
};

// Web fallbacks, matching the iOS system colors.
const WEB_LIGHT: Colors = {
  label: "#000000",
  secondaryLabel: "#3c3c43",
  background: "#f2f2f7",
  cardBackground: "#ffffff",
  placeholder: "#e5e5ea",
  destructive: "#ff3b30",
};

const WEB_DARK: Colors = {
  label: "#ffffff",
  secondaryLabel: "#ebebf599",
  background: "#000000",
  cardBackground: "#1c1c1e",
  placeholder: "#2c2c2e",
  destructive: "#ff453a",
};

function resolveColors(scheme: "light" | "dark"): Colors {
  if (Platform.OS === "ios") {
    // iOS system colors adapt to dark mode natively.
    return {
      label: Color.ios.label,
      secondaryLabel: Color.ios.secondaryLabel,
      background: Color.ios.systemGroupedBackground,
      cardBackground: Color.ios.secondarySystemGroupedBackground,
      placeholder: Color.ios.tertiarySystemFill,
      destructive: Color.ios.systemRed,
    };
  }
  if (Platform.OS === "android") {
    // Android dynamic colors resolve to a fixed value for the color scheme
    // at the moment they're read, so they must be read again on every change.
    return {
      label: Color.android.dynamic.onSurface,
      secondaryLabel: Color.android.dynamic.onSurfaceVariant,
      background: Color.android.dynamic.surface,
      cardBackground: Color.android.dynamic.surfaceContainerLow,
      placeholder: Color.android.dynamic.surfaceContainer,
      destructive: Color.android.dynamic.error,
    };
  }
  return scheme === "dark" ? WEB_DARK : WEB_LIGHT;
}

/** App colors for the current light/dark mode; re-renders when it changes. */
export function useColors(): Colors {
  const scheme = useColorScheme() === "dark" ? "dark" : "light";
  return useMemo(() => resolveColors(scheme), [scheme]);
}

/**
 * Brand theme color, lightened in dark mode to stay legible on dark
 * backgrounds. `onTint` is for content (text, icons) drawn on top of `tint`,
 * and `onTintStatusBar` is the status bar style that stays legible over it.
 */
export function useTintColors() {
  return useColorScheme() === "dark"
    ? { tint: "#e2b0b7", onTint: "#2B0618", onTintStatusBar: "dark" as const }
    : { tint: "#541039", onTint: "#ffffff", onTintStatusBar: "light" as const };
}
