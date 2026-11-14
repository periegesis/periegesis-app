import { Link } from "expo-router";
import { Pressable, Text, View, useColorScheme } from "react-native";

import { Photo } from "@/components/photo";
import { useColors } from "@/theme/colors";
import type { City } from "@/types/city";

export function CityCard({
  id,
  city,
  displayName,
}: {
  id: string;
  city: City;
  /** Overrides `city.name`, e.g. to tell apart cities with the same name. */
  displayName?: string;
}) {
  const colors = useColors();
  useColorScheme(); // re-render on theme change so Android dynamic colors update
  const name = displayName ?? city.name;

  return (
    <Link href={{ pathname: "/city/[id]", params: { id, name } }} asChild>
      <Pressable
        accessibilityRole="link"
        style={({ pressed }) => ({
          backgroundColor: colors.cardBackground,
          borderRadius: 16,
          borderCurve: "continuous",
          overflow: "hidden",
          boxShadow: "0 1px 3px rgba(0, 0, 0, 0.08)",
          opacity: pressed ? 0.7 : 1,
        })}
      >
        <Photo photo={city.photo} />
        <View style={{ padding: 16, gap: 6 }}>
          <Text style={{ fontSize: 20, fontWeight: "600", color: colors.label }}>
            {name}
          </Text>
          {city.description ? (
            <Text
              numberOfLines={3}
              ellipsizeMode="tail"
              style={{ fontSize: 15, lineHeight: 20, color: colors.secondaryLabel }}
            >
              {city.description}
            </Text>
          ) : null}
        </View>
      </Pressable>
    </Link>
  );
}
