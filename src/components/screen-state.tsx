import { ActivityIndicator, Pressable, Text, View } from "react-native";

import { colors, useTintColors } from "@/theme/colors";

const centered = {
  flex: 1,
  alignItems: "center",
  justifyContent: "center",
  padding: 24,
  gap: 12,
  backgroundColor: colors.background,
} as const;

export function LoadingState() {
  return (
    <View style={centered}>
      <ActivityIndicator />
    </View>
  );
}

/** A full-screen message, with an optional retry action. */
export function MessageState({
  title,
  message,
  onRetry,
}: {
  title: string;
  message?: string;
  onRetry?: () => void;
}) {
  const { tint } = useTintColors();
  return (
    <View style={centered}>
      <Text selectable style={{ fontSize: 17, color: colors.label }}>
        {title}
      </Text>
      {message ? (
        <Text
          selectable
          style={{ color: colors.secondaryLabel, textAlign: "center" }}
        >
          {message}
        </Text>
      ) : null}
      {onRetry ? (
        <Pressable onPress={onRetry} hitSlop={8}>
          <Text style={{ fontSize: 17, color: tint }}>Try again</Text>
        </Pressable>
      ) : null}
    </View>
  );
}
