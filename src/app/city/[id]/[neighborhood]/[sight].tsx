import { Stack, useLocalSearchParams } from "expo-router";
import { ScrollView, Text, View, useColorScheme } from "react-native";

import { OpenInMapsButton } from "@/components/open-in-maps-button";
import { Photo } from "@/components/photo";
import { LoadingState, MessageState } from "@/components/screen-state";
import { SightMap } from "@/components/sight-map";
import { useCity } from "@/hooks/use-city";
import { colors } from "@/theme/colors";
import { formatCoordinates } from "@/utils/maps-url";

export default function SightScreen() {
  useColorScheme();
  const params = useLocalSearchParams<{
    id: string;
    neighborhood: string;
    sight: string;
  }>();
  const { city, loading, error, retry } = useCity(params.id);

  if (loading) return <LoadingState />;

  if (error) {
    return (
      <MessageState
        title="Couldn't load this sight"
        message={error.message}
        onRetry={retry}
      />
    );
  }

  const neighborhood = city?.neighborhoods?.[Number(params.neighborhood)];
  const sight = neighborhood?.sights?.[Number(params.sight)];

  if (!neighborhood || !sight) {
    return (
      <>
        <Stack.Screen options={{ title: "" }} />
        <MessageState title="Sight not found" message="It may have been removed." />
      </>
    );
  }

  const hasCoordinates =
    Number.isFinite(sight.latitude) && Number.isFinite(sight.longitude);

  return (
    <ScrollView
      contentInsetAdjustmentBehavior="automatic"
      style={{ backgroundColor: colors.background }}
      contentContainerStyle={{ padding: 16, gap: 20 }}
    >
      <Stack.Screen options={{ title: sight.name }} />
      <Photo photo={sight.photo} style={{ borderRadius: 16 }} />

      <View style={{ gap: 8 }}>
        <Text
          selectable
          style={{
            fontSize: 13,
            fontWeight: "600",
            textTransform: "uppercase",
            color: colors.secondaryLabel,
          }}
        >
          {neighborhood.name}
        </Text>
        {sight.description ? (
          <Text
            selectable
            style={{ fontSize: 17, lineHeight: 24, fontWeight: "500", color: colors.label }}
          >
            {sight.description}
          </Text>
        ) : null}
      </View>

      {sight.details ? (
        <Text selectable style={{ fontSize: 17, lineHeight: 24, color: colors.label }}>
          {sight.details}
        </Text>
      ) : null}

      {hasCoordinates ? (
        <View style={{ gap: 12 }}>
          <SightMap
            name={sight.name}
            latitude={sight.latitude}
            longitude={sight.longitude}
          />
          <Text
            selectable
            style={{
              fontSize: 15,
              color: colors.secondaryLabel,
              fontVariant: ["tabular-nums"],
            }}
          >
            {formatCoordinates(sight.latitude, sight.longitude)}
          </Text>
          <OpenInMapsButton
            name={sight.name}
            latitude={sight.latitude}
            longitude={sight.longitude}
          />
        </View>
      ) : null}
    </ScrollView>
  );
}
