import Delete from "@expo/material-symbols/delete.xml";
import MoreVert from "@expo/material-symbols/more_vert.xml";
import {
  DropdownMenu,
  DropdownMenuItem,
  Host,
  Icon,
  IconButton,
  Text,
  TextButton,
} from "@expo/ui/jetpack-compose";
import { Stack } from "expo-router";
import { useState } from "react";

import { useTintColors } from "@/theme/colors";

import type { HomeHeaderProps } from "./home-header";

/**
 * Home screen header actions: an overflow menu with "Delete", which becomes a
 * "Done" button while the list is in delete mode. Adding a city is the
 * floating button, so it isn't here.
 *
 * Built from Compose components rather than `Stack.Toolbar`, whose Android
 * buttons can only show icons, not a "Done" label.
 */
export function HomeHeader(props: HomeHeaderProps) {
  return <Stack.Screen options={{ headerRight: () => <HeaderActions {...props} /> }} />;
}

function HeaderActions({ deleting, canDelete, onStartDeleting, onDone }: HomeHeaderProps) {
  const { onTint } = useTintColors();
  const [menuOpen, setMenuOpen] = useState(false);

  if (deleting) {
    return (
      <Host matchContents>
        <TextButton onClick={onDone} colors={{ contentColor: onTint }}>
          <Text color={onTint}>Done</Text>
        </TextButton>
      </Host>
    );
  }

  return (
    <Host matchContents>
      <DropdownMenu expanded={menuOpen} onDismissRequest={() => setMenuOpen(false)}>
        <DropdownMenu.Trigger>
          <IconButton onClick={() => setMenuOpen(true)}>
            <Icon source={MoreVert} tint={onTint} size={24} contentDescription="More options" />
          </IconButton>
        </DropdownMenu.Trigger>
        <DropdownMenu.Items>
          <DropdownMenuItem
            enabled={canDelete}
            onClick={() => {
              setMenuOpen(false);
              onStartDeleting();
            }}
          >
            <DropdownMenuItem.LeadingIcon>
              <Icon source={Delete} size={24} />
            </DropdownMenuItem.LeadingIcon>
            <DropdownMenuItem.Text>
              <Text>Delete</Text>
            </DropdownMenuItem.Text>
          </DropdownMenuItem>
        </DropdownMenu.Items>
      </DropdownMenu>
    </Host>
  );
}
