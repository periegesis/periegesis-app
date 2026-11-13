import { Stack } from "expo-router";

import { useTintColors } from "@/theme/colors";

import type { AddCityButtonProps } from "./add-city-button";

export function AddCityButton({ onPress, disabled }: AddCityButtonProps) {
  const { tint } = useTintColors();
  return (
    <Stack.Toolbar placement="right">
      <Stack.Toolbar.Button
        icon="plus"
        tintColor={tint}
        accessibilityLabel="Add city"
        onPress={onPress}
        disabled={disabled}
      />
    </Stack.Toolbar>
  );
}
