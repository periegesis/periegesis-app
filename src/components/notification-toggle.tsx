import { SymbolView } from "expo-symbols";
import { Pressable, Text } from "react-native";

import { useColors, useTintColors } from "@/theme/colors";

/** The toggle's height: a 22pt icon plus 4pt padding above and below. */
export const NOTIFICATION_TOGGLE_HEIGHT = 30;

/** A bell-icon switch for sight notifications, optionally with a short label such as "3/8". */
export function NotificationToggle({
  value,
  onToggle,
  disabled = false,
  label,
  accessibilityLabel,
  accessibilityHint,
}: {
  value: boolean;
  onToggle: () => void;
  disabled?: boolean;
  label?: string;
  accessibilityLabel: string;
  accessibilityHint?: string;
}) {
  const colors = useColors();
  const { tint } = useTintColors();
  const color = value ? tint : colors.secondaryLabel;

  return (
    <Pressable
      onPress={onToggle}
      disabled={disabled}
      hitSlop={8}
      accessibilityRole="switch"
      accessibilityLabel={accessibilityLabel}
      accessibilityHint={accessibilityHint}
      accessibilityValue={label ? { text: label } : undefined}
      accessibilityState={{ checked: value, disabled }}
      style={({ pressed }) => ({
        flexDirection: "row",
        alignItems: "center",
        gap: 4,
        padding: 4,
        opacity: disabled ? 0.35 : pressed ? 0.6 : 1,
      })}
    >
      {label ? (
        <Text
          style={{ fontSize: 13, color, fontVariant: ["tabular-nums"] }}
        >
          {label}
        </Text>
      ) : null}
      <SymbolView
        name={
          value
            ? {
                ios: "bell.fill",
                android: "notifications_active",
                web: "notifications_active",
              }
            : { ios: "bell.slash", android: "notifications_off", web: "notifications" }
        }
        size={22}
        tintColor={color}
      />
    </Pressable>
  );
}
