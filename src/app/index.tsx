import { useCallback, useMemo, useState } from "react";
import { Alert, FlatList, Text, View, useColorScheme } from "react-native";

import { AddCityButton } from "@/components/add-city-button";
import { CityCard } from "@/components/city-card";
import { HomeHeader } from "@/components/home-header";
import { LoadingState, MessageState } from "@/components/screen-state";
import { useCities, withDisplayNames } from "@/hooks/use-cities";
import { useCityImport } from "@/hooks/use-city-import";
import { removeCity } from "@/storage/cities";
import { useColors } from "@/theme/colors";
import { confirmDelete } from "@/utils/confirm";

export default function Index() {
  const colors = useColors();
  useColorScheme();
  const { cities, loading, error, retry, reload } = useCities();
  const { startImport, importing } = useCityImport(reload);
  const displayCities = useMemo(() => withDisplayNames(cities), [cities]);
  const [deleteMode, setDeleteMode] = useState(false);
  // Leaves delete mode once there's nothing left to delete.
  const deleting = deleteMode && displayCities.length > 0;

  const deleteCity = useCallback(
    async (id: string, name: string) => {
      if (!(await confirmDelete(`Are you sure you want to delete ${name}?`))) return;
      try {
        await removeCity(id);
      } catch (e) {
        console.error(e);
        Alert.alert("Couldn't delete city", "Something went wrong. Please try again.");
      }
      await reload();
    },
    [reload],
  );

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
      <HomeHeader
        deleting={deleting}
        canDelete={displayCities.length > 0}
        onStartDeleting={() => setDeleteMode(true)}
        onDone={() => setDeleteMode(false)}
        onAdd={startImport}
        addDisabled={importing}
      />
      <FlatList
        data={displayCities}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <CityCard
            id={item.id}
            city={item.city}
            displayName={item.displayName}
            onDelete={deleting ? () => deleteCity(item.id, item.displayName) : undefined}
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
      {/* Adding is in the header on iOS; elsewhere it's this button, hidden while deleting. */}
      {deleting ? null : <AddCityButton onPress={startImport} disabled={importing} />}
    </View>
  );
}
