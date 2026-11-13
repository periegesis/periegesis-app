import { SymbolView } from "expo-symbols";
import { Pressable, Text } from "react-native";

import { colors, useTintColors } from "@/theme/colors";

/** An alarm-icon switch, optionally with a short label such as "3/8". */
export function AlarmToggle({
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
            ? { ios: "alarm.fill", android: "alarm_on", web: "alarm_on" }
            : { ios: "alarm", android: "alarm", web: "alarm" }
        }
        size={22}
        tintColor={color}
      />
    </Pressable>
  );
}
