import { Stack } from "expo-router";

import { useTintColors } from "@/theme/colors";

import type { HomeHeaderProps } from "./home-header";

/**
 * Home screen header actions: Add and an overflow menu with "Delete", which
 * become a single "Done" button while the list is in delete mode.
 */
export function HomeHeader({
  deleting,
  canDelete,
  onStartDeleting,
  onDone,
  onAdd,
  addDisabled,
}: HomeHeaderProps) {
  const { tint } = useTintColors();
  return (
    <Stack.Toolbar placement="right">
      <Stack.Toolbar.Button
        icon="plus"
        tintColor={tint}
        accessibilityLabel="Add city"
        onPress={onAdd}
        disabled={addDisabled}
        hidden={deleting}
      />
      <Stack.Toolbar.Menu
        icon="ellipsis"
        tintColor={tint}
        accessibilityLabel="More options"
        hidden={deleting}
      >
        <Stack.Toolbar.MenuAction icon="trash" onPress={onStartDeleting} disabled={!canDelete}>
          Delete
        </Stack.Toolbar.MenuAction>
      </Stack.Toolbar.Menu>
      <Stack.Toolbar.Button variant="done" tintColor={tint} onPress={onDone} hidden={!deleting}>
        Done
      </Stack.Toolbar.Button>
    </Stack.Toolbar>
  );
}
