import { Stack, useLocalSearchParams } from "expo-router";
import { ScrollView, Text, View, useColorScheme } from "react-native";

import { NeighborhoodSection } from "@/components/neighborhood-section";
import { Photo } from "@/components/photo";
import { LoadingState, MessageState } from "@/components/screen-state";
import { useCity } from "@/hooks/use-city";
import { useColors } from "@/theme/colors";

export default function CityScreen() {
  const colors = useColors();
  useColorScheme();
  const { id, name } = useLocalSearchParams<{ id: string; name?: string }>();
  const { city, loading, error, retry } = useCity(id);
  const title = name ?? city?.name ?? "";

  if (loading) return <LoadingState />;

  if (error) {
    return (
      <>
        <Stack.Screen options={{ title }} />
        <MessageState
          title="Couldn't load this city"
          message={error.message}
          onRetry={retry}
        />
      </>
    );
  }

  if (!city) {
    return (
      <>
        <Stack.Screen options={{ title }} />
        <MessageState title="City not found" message="It may have been removed." />
      </>
    );
  }

  const neighborhoods = city.neighborhoods ?? [];

  return (
    <ScrollView
      contentInsetAdjustmentBehavior="automatic"
      style={{ backgroundColor: colors.background }}
      contentContainerStyle={{ padding: 16, gap: 16 }}
    >
      <Stack.Screen options={{ title }} />
      <Photo photo={city.photo} style={{ borderRadius: 16 }} />
      {city.description ? (
        <Text
          selectable
          style={{ fontSize: 17, lineHeight: 24, color: colors.label }}
        >
          {city.description}
        </Text>
      ) : null}

      {neighborhoods.length > 0 ? (
        <View style={{ gap: 12 }}>
          {neighborhoods.map((neighborhood, index) => (
            <NeighborhoodSection
              key={index}
              cityId={id}
              index={index}
              neighborhood={neighborhood}
              initiallyExpanded={neighborhoods.length === 1}
            />
          ))}
        </View>
      ) : (
        <Text style={{ color: colors.secondaryLabel, textAlign: "center" }}>
          No neighborhoods yet.
        </Text>
      )}
    </ScrollView>
  );
}
