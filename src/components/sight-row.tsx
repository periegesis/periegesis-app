import { Link } from "expo-router";
import { useState } from "react";
import { Pressable, Text, View } from "react-native";

import { Chevron } from "@/components/chevron";
import { NOTIFICATION_TOGGLE_HEIGHT, NotificationToggle } from "@/components/notification-toggle";
import { useColors, useTintColors } from "@/theme/colors";
import type { Sight } from "@/types/city";

const PADDING_VERTICAL = 12;
const PADDING_HORIZONTAL = 16;
const GAP = 12;
const NAME_LINE_HEIGHT = 22;
/** Space between the toggle's box and its neighbors; its 4pt padding adds the rest. */
const TOGGLE_GAP = 8;

/**
 * A tappable sight summary (name and description) that opens its details,
 * with an optional notification toggle right after the name.
 */
export function SightRow({
  cityId,
  neighborhoodIndex,
  sightIndex,
  sight,
  notification,
}: {
  cityId: string;
  neighborhoodIndex: number;
  sightIndex: number;
  sight: Sight;
  notification?: { enabled: boolean; disabled: boolean; onToggle: () => void };
}) {
  const colors = useColors();
  const { tint } = useTintColors();
  // Where the name ends, so the notification toggle can be drawn right after it.
  const [toggleX, setToggleX] = useState<number | null>(null);

  return (
    <View>
      <Link
        href={{
          pathname: "/city/[id]/[neighborhood]/[sight]",
          params: {
            id: cityId,
            neighborhood: String(neighborhoodIndex),
            sight: String(sightIndex),
          },
        }}
        asChild
      >
        {/*
          Link's asChild merges styles by spreading objects, which drops a
          style function, so layout stays in a plain object and the pressed
          state is applied by the children instead.
        */}
        <Pressable
          accessibilityRole="link"
          style={{
            paddingVertical: PADDING_VERTICAL,
            paddingRight: PADDING_HORIZONTAL,
            paddingLeft: PADDING_HORIZONTAL - 8,
          }}
        >
          {({ pressed }) => (
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                gap: GAP,
                opacity: pressed ? 0.6 : 1,
                borderLeftColor: tint,
                borderLeftWidth: 1,
                paddingLeft: 8
              }}
            >
              <View style={{ flex: 1, gap: 2 }}>
                <View style={{ flexDirection: "row", alignItems: "center", gap: TOGGLE_GAP }}>
                  <Text
                    style={{
                      flexShrink: 1,
                      fontSize: 17,
                      lineHeight: NAME_LINE_HEIGHT,
                      color: colors.label,
                    }}
                  >
                    {sight.name}
                  </Text>
                  {notification ? (
                    // Holds the place the notification toggle is drawn over.
                    <View
                      onLayout={(event) => setToggleX(event.nativeEvent.layout.x)}
                      style={{ width: NOTIFICATION_TOGGLE_HEIGHT, height: NAME_LINE_HEIGHT }}
                    />
                  ) : null}
                </View>
                {sight.description ? (
                  <Text
                    numberOfLines={2}
                    style={{ fontSize: 15, lineHeight: 20, color: colors.secondaryLabel }}
                  >
                    {sight.description}
                  </Text>
                ) : null}
              </View>
              <Chevron />
            </View>
          )}
        </Pressable>
      </Link>
      {notification ? (
        // A sibling of the link rather than a child, so screen readers can
        // reach it on its own; drawn right after the name. Without a label
        // the toggle is square. Hidden until the name has been laid out.
        <View
          style={{
            position: "absolute",
            top: PADDING_VERTICAL + (NAME_LINE_HEIGHT - NOTIFICATION_TOGGLE_HEIGHT) / 2,
            left: PADDING_HORIZONTAL + (toggleX ?? 0),
            opacity: toggleX == null ? 0 : 1,
          }}
        >
          <NotificationToggle
            value={notification.enabled}
            disabled={notification.disabled}
            onToggle={notification.onToggle}
            accessibilityLabel={`Notification near ${sight.name}`}
            accessibilityHint={
              notification.disabled ? "Sight notification limit reached" : undefined
            }
          />
        </View>
      ) : null}
    </View>
  );
}
