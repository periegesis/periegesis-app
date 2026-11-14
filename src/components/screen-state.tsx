import { ActivityIndicator, Pressable, Text, View } from "react-native";

import { useColors, useTintColors, type Colors } from "@/theme/colors";

function centered(colors: Colors) {
  return {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
    gap: 12,
    backgroundColor: colors.background,
  } as const;
}

export function LoadingState() {
  const colors = useColors();
  return (
    <View style={centered(colors)}>
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
  const colors = useColors();
  const { tint } = useTintColors();
  return (
    <View style={centered(colors)}>
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
