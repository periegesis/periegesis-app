import { Link } from "expo-router";
import { SymbolView } from "expo-symbols";
import { Pressable, Text, View, useColorScheme } from "react-native";

import { Photo } from "@/components/photo";
import { useColors } from "@/theme/colors";
import type { City } from "@/types/city";

/**
 * A city in the home list. Tapping it opens the city, unless `onDelete` is
 * given (delete mode): then it shows a trash button instead and doesn't open.
 */
export function CityCard({
  id,
  city,
  displayName,
  onDelete,
}: {
  id: string;
  city: City;
  /** Overrides `city.name`, e.g. to tell apart cities with the same name. */
  displayName?: string;
  /** Shows a trash button that calls this, and turns off opening the city. */
  onDelete?: () => void;
}) {
  const colors = useColors();
  useColorScheme(); // re-render on theme change so Android dynamic colors update
  const name = displayName ?? city.name;

  const content = (
    <>
      <Photo photo={city.photo} />
      <View style={{ padding: 4, gap: 8 }}>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
          <Text style={{ flex: 1, fontSize: 20, fontWeight: "600", color: colors.label }}>
            {name}
          </Text>
          {onDelete ? (
            <Pressable
              onPress={onDelete}
              hitSlop={8}
              accessibilityRole="button"
              accessibilityLabel={`Delete ${name}`}
              style={({ pressed }) => ({ padding: 4, opacity: pressed ? 0.6 : 1 })}
            >
              <SymbolView
                name={{ ios: "trash", android: "delete", web: "delete" }}
                size={24}
                tintColor={colors.destructive}
              />
            </Pressable>
          ) : null}
        </View>
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
    </>
  );

  // In delete mode the card is a plain view, so the trash button is its only
  // action and can't be confused with opening the city.
  if (onDelete) return <View>{content}</View>;

  // Link's asChild merges styles by spreading objects, which drops a style
  // function, so the card style stays a plain object and the pressed state is
  // applied by the children instead.
  return (
    <Link href={{ pathname: "/city/[id]", params: { id, name } }} asChild>
      <Pressable accessibilityRole="link">
        {({ pressed }) => <View style={{ opacity: pressed ? 0.7 : 1 }}>{content}</View>}
      </Pressable>
    </Link>
  );
}
