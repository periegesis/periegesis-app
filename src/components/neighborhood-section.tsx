import { useState } from "react";
import { Pressable, Text, View } from "react-native";
import Animated, { FadeIn, LinearTransition } from "react-native-reanimated";

import { NOTIFICATION_TOGGLE_HEIGHT, NotificationToggle } from "@/components/notification-toggle";
import { Chevron } from "@/components/chevron";
import { SightRow } from "@/components/sight-row";
import { hasCoordinates, useGeofences } from "@/hooks/use-geofences";
import { colors } from "@/theme/colors";
import type { Neighborhood } from "@/types/city";

const PADDING = 16;
const NAME_LINE_HEIGHT = 22;
/** Space between the toggle's box and its neighbors; its 4pt padding adds the rest. */
const TOGGLE_GAP = 8;

/** A neighborhood header that expands to list the neighborhood's sights. */
export function NeighborhoodSection({
  cityId,
  index,
  neighborhood,
  initiallyExpanded = false,
}: {
  cityId: string;
  index: number;
  neighborhood: Neighborhood;
  initiallyExpanded?: boolean;
}) {
  const [expanded, setExpanded] = useState(initiallyExpanded);
  // The toggle's measured width (it has an "n/m" label) and where the name
  // ends, so the toggle can be drawn right after the name.
  const [toggleWidth, setToggleWidth] = useState(NOTIFICATION_TOGGLE_HEIGHT);
  const [toggleX, setToggleX] = useState<number | null>(null);
  const count = neighborhood.sights.length;
  const geofences = useGeofences();
  const notifiable = neighborhood.sights.filter(hasCoordinates).length;
  const notificationsOn = neighborhood.sights.filter(
    (sight, sightIndex) =>
      hasCoordinates(sight) && geofences.isEnabled(cityId, index, sightIndex),
  ).length;
  const showNotifications = geofences.supported && notifiable > 0;

  return (
    <Animated.View
      layout={LinearTransition}
      style={{
        backgroundColor: colors.cardBackground,
        borderRadius: 16,
        borderCurve: "continuous",
        overflow: "hidden",
      }}
    >
      <View>
        <Pressable
          onPress={() => setExpanded((value) => !value)}
          accessibilityRole="button"
          accessibilityState={{ expanded }}
          accessibilityHint={expanded ? "Hides sights" : "Shows sights"}
          style={({ pressed }) => ({
            flexDirection: "row",
            alignItems: "center",
            gap: 12,
            padding: PADDING,
            opacity: pressed ? 0.6 : 1,
          })}
        >
          <View style={{ flex: 1, gap: 4 }}>
            <View style={{ flexDirection: "row", alignItems: "center", gap: TOGGLE_GAP }}>
              <Text
                style={{
                  flexShrink: 1,
                  fontSize: 17,
                  lineHeight: NAME_LINE_HEIGHT,
                  fontWeight: "600",
                  color: colors.label,
                }}
              >
                {neighborhood.name}
              </Text>
              {showNotifications ? (
                // Holds the place the notification toggle is drawn over.
                <View
                  onLayout={(event) => setToggleX(event.nativeEvent.layout.x)}
                  style={{ width: toggleWidth, height: NAME_LINE_HEIGHT }}
                />
              ) : null}
            </View>
            {neighborhood.description ? (
              <Text style={{ fontSize: 15, lineHeight: 20, color: colors.secondaryLabel }}>
                {neighborhood.description}
              </Text>
            ) : null}
            <Text style={{ fontSize: 13, color: colors.secondaryLabel }}>
              {count === 1 ? "1 sight" : `${count} sights`}
            </Text>
          </View>
          <Chevron expanded={expanded} />
        </Pressable>
        {showNotifications ? (
          // A sibling of the header button rather than a child, so screen
          // readers can reach it on its own; drawn right after the name.
          // Hidden until the name has been laid out.
          <View
            onLayout={(event) => setToggleWidth(event.nativeEvent.layout.width)}
            style={{
              position: "absolute",
              top: PADDING + (NAME_LINE_HEIGHT - NOTIFICATION_TOGGLE_HEIGHT) / 2,
              left: PADDING + (toggleX ?? 0),
              opacity: toggleX == null ? 0 : 1,
            }}
          >
            {/* Any notification on (even partially) shows as on; toggling clears them all. */}
            <NotificationToggle
              value={notificationsOn > 0}
              disabled={notificationsOn === 0 && geofences.atLimit}
              onToggle={() => geofences.toggleNeighborhood(cityId, index, neighborhood)}
              label={`${notificationsOn}/${notifiable}`}
              accessibilityLabel={`Notifications for all sights in ${neighborhood.name}`}
              accessibilityHint={`This device allows up to ${geofences.limit} sight notifications in total`}
            />
          </View>
        ) : null}
      </View>

      {expanded && count > 0 ? (
        <Animated.View entering={FadeIn} style={{ paddingBottom: 4 }}>
          {neighborhood.sights.map((sight, sightIndex) => (
            <View key={sightIndex}>
              <View
                style={{
                  height: 1,
                  marginLeft: 16,
                  backgroundColor: colors.placeholder,
                }}
              />
              <SightRow
                cityId={cityId}
                neighborhoodIndex={index}
                sightIndex={sightIndex}
                sight={sight}
                notification={
                  geofences.supported && hasCoordinates(sight)
                    ? {
                        enabled: geofences.isEnabled(cityId, index, sightIndex),
                        disabled:
                          geofences.atLimit &&
                          !geofences.isEnabled(cityId, index, sightIndex),
                        onToggle: () =>
                          geofences.toggleSight(cityId, index, sightIndex, sight),
                      }
                    : undefined
                }
              />
            </View>
          ))}
        </Animated.View>
      ) : null}
    </Animated.View>
  );
}
