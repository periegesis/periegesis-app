// expo-sqlite's web build needs a WebAssembly worker plus COOP/COEP headers,
// and can't run during static rendering, so web uses localStorage instead.
// Only the subset of the kv-store API that the app uses is implemented.

function storage(): Storage | null {
  try {
    return typeof window === "undefined" ? null : window.localStorage;
  } catch {
    return null;
  }
}

const Storage = {
  async getItem(key: string): Promise<string | null> {
    return storage()?.getItem(key) ?? null;
  },
  async setItem(key: string, value: string): Promise<void> {
    storage()?.setItem(key, value);
  },
  async removeItem(key: string): Promise<void> {
    storage()?.removeItem(key);
  },
  async multiGet(keys: string[]): Promise<[string, string | null][]> {
    const store = storage();
    return keys.map((key) => [key, store?.getItem(key) ?? null]);
  },
};

export default Storage;
