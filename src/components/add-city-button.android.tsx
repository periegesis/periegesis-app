import Add from "@expo/material-symbols/add.xml";
import { FloatingActionButton, Host, Icon } from "@expo/ui/jetpack-compose";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useTintColors } from "@/theme/colors";

import type { AddCityButtonProps } from "./add-city-button";

export function AddCityButton({ onPress, disabled }: AddCityButtonProps) {
  const insets = useSafeAreaInsets();
  const { tint, onTint } = useTintColors();
  return (
    <Host
      matchContents
      style={{
        position: "absolute",
        right: 16 + insets.right,
        bottom: 16 + insets.bottom,
      }}
    >
      <FloatingActionButton
        containerColor={tint}
        onClick={() => {
          if (!disabled) onPress();
        }}
      >
        <FloatingActionButton.Icon>
          <Icon source={Add} tint={onTint} contentDescription="Add city" />
        </FloatingActionButton.Icon>
      </FloatingActionButton>
    </Host>
  );
}
