import { useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";

import { loadCity } from "@/storage/cities";
import type { City } from "@/types/city";

/** Loads one stored city, reloading whenever the screen regains focus. */
export function useCity(id: string | undefined) {
  const [city, setCity] = useState<City | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const reload = useCallback(async () => {
    try {
      setCity(id ? await loadCity(id) : null);
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e : new Error(String(e)));
    } finally {
      setLoading(false);
    }
  }, [id]);

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

  return { city, loading, error, retry };
}
