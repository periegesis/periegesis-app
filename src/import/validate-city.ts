import type { City, Neighborhood, Sight } from "@/types/city";

import { ImportError } from "./errors";

type Obj = Record<string, unknown>;

function expectObject(value: unknown, path: string): Obj {
  if (value == null || typeof value !== "object" || Array.isArray(value)) {
    throw new ImportError(`"${path}" must be an object.`);
  }
  return value as Obj;
}

function expectString(obj: Obj, key: string, path: string): string {
  const value = obj[key];
  if (typeof value !== "string") {
    throw new ImportError(`"${join(path, key)}" must be text.`);
  }
  return value;
}

function expectOptionalString(
  obj: Obj,
  key: string,
  path: string,
): string | undefined {
  if (obj[key] == null) return undefined;
  return expectString(obj, key, path);
}

function expectNumber(obj: Obj, key: string, path: string): number {
  const value = obj[key];
  if (typeof value !== "number" || !Number.isFinite(value)) {
    throw new ImportError(`"${join(path, key)}" must be a number.`);
  }
  return value;
}

function expectArray(obj: Obj, key: string, path: string): unknown[] {
  const value = obj[key];
  if (!Array.isArray(value)) {
    throw new ImportError(`"${join(path, key)}" must be a list.`);
  }
  return value;
}

function join(path: string, key: string): string {
  return path ? `${path}.${key}` : key;
}

function validateSight(value: unknown, path: string): Sight {
  const obj = expectObject(value, path);
  const sight: Sight = {
    name: expectString(obj, "name", path),
    description: expectString(obj, "description", path),
    details: expectString(obj, "details", path),
    latitude: expectNumber(obj, "latitude", path),
    longitude: expectNumber(obj, "longitude", path),
  };
  const photo = expectOptionalString(obj, "photo", path);
  if (photo) sight.photo = photo;
  return sight;
}

function validateNeighborhood(value: unknown, path: string): Neighborhood {
  const obj = expectObject(value, path);
  return {
    name: expectString(obj, "name", path),
    description: expectString(obj, "description", path),
    sights: expectArray(obj, "sights", path).map((sight, i) =>
      validateSight(sight, `${path}.sights[${i}]`),
    ),
  };
}

/** Checks that parsed JSON has the shape of a City and returns a clean copy. */
export function validateCity(data: unknown): City {
  const obj = expectObject(data, "city");
  const name = expectString(obj, "name", "");
  if (!name.trim()) throw new ImportError(`"name" can't be empty.`);

  const city: City = {
    name,
    description: expectString(obj, "description", ""),
    neighborhoods: expectArray(obj, "neighborhoods", "").map((n, i) =>
      validateNeighborhood(n, `neighborhoods[${i}]`),
    ),
  };
  const photo = expectOptionalString(obj, "photo", "");
  if (photo) city.photo = photo;
  return city;
}

/** Calls `fn` for every photo field in the city, letting it replace the value. */
export function mapPhotos(
  city: City,
  fn: (photo: string) => string | undefined,
): City {
  const mapPhoto = <T extends { photo?: string }>(item: T): T => {
    if (!item.photo) return item;
    const { photo, ...rest } = item;
    const next = fn(photo);
    return (next ? { ...rest, photo: next } : rest) as T;
  };
  return mapPhoto({
    ...city,
    neighborhoods: city.neighborhoods.map((n) => ({
      ...n,
      sights: n.sights.map(mapPhoto),
    })),
  });
}

