import { useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";

import { loadCities, normalizeCityName } from "@/storage/cities";
import { seedIfEmpty } from "@/storage/seed";
import type { StoredCity } from "@/types/city";

export function useCities() {
  const [cities, setCities] = useState<StoredCity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const reload = useCallback(async () => {
    try {
      await seedIfEmpty();
      setCities(await loadCities());
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e : new Error(String(e)));
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      reload();
    }, [reload]),
  );

  const retry = useCallback(() => {
    setLoading(true);
    setError(null);
    reload();
  }, [reload]);

  return { cities, loading, error, retry, reload };
}

/**
 * Pairs each city with the name to show for it. Cities that share a name are
 * numbered in list order ("Rome", "Rome (2)"), without changing stored data.
 */
export function withDisplayNames(
  cities: StoredCity[],
): (StoredCity & { displayName: string })[] {
  const seen = new Map<string, number>();
  return cities.map((entry) => {
    const key = normalizeCityName(entry.city.name);
    const count = (seen.get(key) ?? 0) + 1;
    seen.set(key, count);
    const displayName =
      count === 1 ? entry.city.name : `${entry.city.name} (${count})`;
    return { ...entry, displayName };
  });
}
