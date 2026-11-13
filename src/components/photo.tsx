import { Image, type ImageStyle } from "expo-image";
import { useState } from "react";
import type { StyleProp } from "react-native";

import { resolvePhotoUri } from "@/storage/cities";
import { colors } from "@/theme/colors";
import type { PhotoRef } from "@/types/city";

/** A 16:9 photo that renders nothing when missing or unloadable. */
export function Photo({
  photo,
  style,
}: {
  photo?: PhotoRef;
  style?: StyleProp<ImageStyle>;
}) {
  const uri = resolvePhotoUri(photo);
  const [failed, setFailed] = useState(false);
  if (uri == null || failed) return null;

  return (
    <Image
      source={{ uri }}
      style={[{ aspectRatio: 16 / 9, backgroundColor: colors.placeholder }, style]}
      contentFit="cover"
      transition={200}
      accessibilityIgnoresInvertColors
      onError={() => setFailed(true)}
    />
  );
}
