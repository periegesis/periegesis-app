import { Link } from "expo-router";
import { Pressable, Text, View } from "react-native";

import { AlarmToggle } from "@/components/alarm-toggle";
import { Chevron } from "@/components/chevron";
import { colors } from "@/theme/colors";
import type { Sight } from "@/types/city";

/**
 * A tappable sight summary (name and description) that opens its details,
 * with an optional alarm toggle beside it.
 */
export function SightRow({
  cityId,
  neighborhoodIndex,
  sightIndex,
  sight,
  alarm,
}: {
  cityId: string;
  neighborhoodIndex: number;
  sightIndex: number;
  sight: Sight;
  alarm?: { enabled: boolean; disabled: boolean; onToggle: () => void };
}) {
  return (
    <View style={{ flexDirection: "row", alignItems: "center" }}>
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
            flex: 1,
            paddingVertical: 12,
            paddingLeft: 16,
            paddingRight: alarm ? 8 : 16,
          }}
        >
          {({ pressed }) => (
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                gap: 12,
                opacity: pressed ? 0.6 : 1,
              }}
            >
              <View style={{ flex: 1, gap: 2 }}>
                <Text style={{ fontSize: 17, color: colors.label }}>{sight.name}</Text>
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
      {alarm ? (
        <View style={{ paddingRight: 12 }}>
          <AlarmToggle
            value={alarm.enabled}
            disabled={alarm.disabled}
            onToggle={alarm.onToggle}
            accessibilityLabel={`Alarm near ${sight.name}`}
            accessibilityHint={
              alarm.disabled ? "Sight alarm limit reached" : undefined
            }
          />
        </View>
      ) : null}
    </View>
  );
}
