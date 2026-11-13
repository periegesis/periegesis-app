import * as Linking from "expo-linking";
import { Pressable, Text } from "react-native";

import { useTintColors } from "@/theme/colors";
import { nativeMapsUrl, webMapsUrl } from "@/utils/maps-url";

/** Opens the coordinates in the default maps app, or a web map if none. */
export function OpenInMapsButton({
  name,
  latitude,
  longitude,
}: {
  name: string;
  latitude: number;
  longitude: number;
}) {
  const { tint, onTint } = useTintColors();
  const open = async () => {
    try {
      await Linking.openURL(nativeMapsUrl(name, latitude, longitude));
    } catch {
      await Linking.openURL(webMapsUrl(latitude, longitude)).catch(() => {});
    }
  };

  return (
    <Pressable
      onPress={open}
      accessibilityRole="button"
      accessibilityHint="Opens this location in your maps app"
      style={({ pressed }) => ({
        alignItems: "center",
        paddingVertical: 14,
        borderRadius: 12,
        borderCurve: "continuous",
        backgroundColor: tint,
        opacity: pressed ? 0.8 : 1,
      })}
    >
      <Text style={{ fontSize: 17, fontWeight: "600", color: onTint }}>
        Open in Maps
      </Text>
    </Pressable>
  );
}
