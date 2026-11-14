import { useMemo } from "react";
import { FlatList, Text, View, useColorScheme } from "react-native";

import { AddCityButton } from "@/components/add-city-button";
import { CityCard } from "@/components/city-card";
import { LoadingState, MessageState } from "@/components/screen-state";
import { useCities, withDisplayNames } from "@/hooks/use-cities";
import { useCityImport } from "@/hooks/use-city-import";
import { useColors } from "@/theme/colors";

export default function Index() {
  const colors = useColors();
  useColorScheme();
  const { cities, loading, error, retry, reload } = useCities();
  const { startImport, importing } = useCityImport(reload);
  const displayCities = useMemo(() => withDisplayNames(cities), [cities]);

  if (loading) return <LoadingState />;

  if (error && cities.length === 0) {
    return (
      <MessageState
        title="Couldn't load your cities"
        message={error.message}
        onRetry={retry}
      />
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <FlatList
        data={displayCities}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <CityCard
            id={item.id}
            city={item.city}
            displayName={item.displayName}
          />
        )}
        contentInsetAdjustmentBehavior="automatic"
        style={{ backgroundColor: colors.background }}
        contentContainerStyle={{
          padding: 16,
          // Leave room for the floating Add button on Android.
          paddingBottom: process.env.EXPO_OS === "android" ? 96 : 16,
          gap: 16,
          flexGrow: 1,
        }}
        ListEmptyComponent={
          <View style={{ flex: 1, alignItems: "center", justifyContent: "center", gap: 8 }}>
            <Text style={{ fontSize: 17, fontWeight: "600", color: colors.label }}>
              No cities yet
            </Text>
            <Text style={{ color: colors.secondaryLabel, textAlign: "center" }}>
              Cities you add will appear here.
            </Text>
          </View>
        }
      />
      <AddCityButton onPress={startImport} disabled={importing} />
    </View>
  );
}

