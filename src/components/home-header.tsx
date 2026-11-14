import { Stack } from "expo-router";
import { Pressable, Text } from "react-native";

import { useTintColors } from "@/theme/colors";

export type HomeHeaderProps = {
  /** Whether the city list is in delete mode. */
  deleting: boolean;
  /** Whether there's anything to delete; disables the Delete action if not. */
  canDelete: boolean;
  onStartDeleting: () => void;
  onDone: () => void;
  /** Adds a city. Only shown in the header on iOS; Android uses a floating button. */
  onAdd: () => void;
  addDisabled?: boolean;
};

/**
 * Web header actions. Native toolbar menus aren't available on web, so this
 * is a plain "Delete" / "Done" text button.
 */
export function HomeHeader({ deleting, canDelete, onStartDeleting, onDone }: HomeHeaderProps) {
  const { onTint } = useTintColors();
  const label = deleting ? "Done" : "Delete";
  const disabled = !deleting && !canDelete;

  return (
    <Stack.Screen
      options={{
        headerRight: () => (
          <Pressable
            onPress={deleting ? onDone : onStartDeleting}
            disabled={disabled}
            accessibilityRole="button"
            style={{ paddingHorizontal: 16, opacity: disabled ? 0.4 : 1 }}
          >
            <Text style={{ fontSize: 17, fontWeight: deleting ? "600" : "400", color: onTint }}>
              {label}
            </Text>
          </Pressable>
        ),
      }}
    />
  );
}
