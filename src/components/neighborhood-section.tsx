import { useState } from "react";
import { Pressable, Text, View } from "react-native";
import Animated, { FadeIn, LinearTransition } from "react-native-reanimated";

import { AlarmToggle } from "@/components/alarm-toggle";
import { Chevron } from "@/components/chevron";
import { SightRow } from "@/components/sight-row";
import { hasCoordinates, useGeofences } from "@/hooks/use-geofences";
import { colors } from "@/theme/colors";
import type { Neighborhood } from "@/types/city";

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
  const count = neighborhood.sights.length;
  const geofences = useGeofences();
  const alarmable = neighborhood.sights.filter(hasCoordinates).length;
  const alarmsOn = neighborhood.sights.filter(
    (sight, sightIndex) =>
      hasCoordinates(sight) && geofences.isEnabled(cityId, index, sightIndex),
  ).length;
  const showAlarms = geofences.supported && alarmable > 0;

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
      <View style={{ flexDirection: "row", alignItems: "center" }}>
        <Pressable
          onPress={() => setExpanded((value) => !value)}
          accessibilityRole="button"
          accessibilityState={{ expanded }}
          accessibilityHint={expanded ? "Hides sights" : "Shows sights"}
          style={({ pressed }) => ({
            flex: 1,
            flexDirection: "row",
            alignItems: "center",
            gap: 12,
            padding: 16,
            paddingRight: showAlarms ? 8 : 16,
            opacity: pressed ? 0.6 : 1,
          })}
        >
          <View style={{ flex: 1, gap: 4 }}>
            <Text style={{ fontSize: 17, fontWeight: "600", color: colors.label }}>
              {neighborhood.name}
            </Text>
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
        {showAlarms ? (
          <View style={{ paddingRight: 12 }}>
            {/* Any alarm on (even partially) shows as on; toggling clears them all. */}
            <AlarmToggle
              value={alarmsOn > 0}
              disabled={alarmsOn === 0 && geofences.atLimit}
              onToggle={() => geofences.toggleNeighborhood(cityId, index, neighborhood)}
              label={`${alarmsOn}/${alarmable}`}
              accessibilityLabel={`Alarms for all sights in ${neighborhood.name}`}
              accessibilityHint={`This device allows up to ${geofences.limit} sight alarms in total`}
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
                alarm={
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
