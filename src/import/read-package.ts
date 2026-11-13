import type { DocumentPickerAsset } from "expo-document-picker";
import { File } from "expo-file-system";
import { strFromU8, unzipSync } from "fflate";

import { isUri } from "@/storage/cities";
import type { City } from "@/types/city";

import { ImportError } from "./errors";
import { mapPhotos, validateCity } from "./validate-city";

export type CityPackage = {
  /** The picked file's raw bytes, used for duplicate detection. */
  bytes: Uint8Array<ArrayBuffer>;
  city: City;
  /** Bundled images, keyed by the photo reference used in the city JSON. */
  images: Map<string, Uint8Array>;
};

function isZip(asset: DocumentPickerAsset): boolean {
  return (
    /\.zip$/i.test(asset.name) ||
    asset.mimeType === "application/zip" ||
    asset.mimeType === "application/x-zip-compressed"
  );
}

function normalizePath(path: string): string {
  const parts: string[] = [];
  for (const part of path.replace(/\\/g, "/").split("/")) {
    if (!part || part === ".") continue;
    if (part === "..") parts.pop();
    else parts.push(part);
  }
  return parts.join("/");
}

function dirname(path: string): string {
  const i = path.lastIndexOf("/");
  return i === -1 ? "" : path.slice(0, i);
}

function basename(path: string): string {
  return path.slice(path.lastIndexOf("/") + 1);
}

function parseCityJson(bytes: Uint8Array): City {
  let data: unknown;
  try {
    data = JSON.parse(strFromU8(bytes));
  } catch {
    throw new ImportError("This file isn't valid JSON.");
  }
  return validateCity(data);
}

function readZip(bytes: Uint8Array<ArrayBuffer>): CityPackage {
  let entries: Record<string, Uint8Array>;
  try {
    entries = unzipSync(bytes, {
      filter: (file) =>
        !file.name.endsWith("/") && !file.name.startsWith("__MACOSX/"),
    });
  } catch {
    throw new ImportError("This .zip file couldn't be opened.");
  }

  const files = new Map<string, Uint8Array>();
  for (const [name, data] of Object.entries(entries)) {
    files.set(normalizePath(name), data);
  }

  const jsonPaths = [...files.keys()].filter((path) => /\.json$/i.test(path));
  if (jsonPaths.length === 0) {
    throw new ImportError("The .zip file doesn't contain a JSON file.");
  }
  if (jsonPaths.length > 1) {
    throw new ImportError("The .zip file should contain only one JSON file.");
  }
  const jsonPath = jsonPaths[0];
  const city = parseCityJson(files.get(jsonPath)!);
  const baseDir = dirname(jsonPath);

  const findImage = (ref: string): Uint8Array | undefined => {
    const exact = files.get(normalizePath(`${baseDir}/${ref}`));
    if (exact) return exact;
    const name = basename(normalizePath(ref));
    const matches = [...files.keys()].filter((path) => basename(path) === name);
    return matches.length === 1 ? files.get(matches[0]) : undefined;
  };

  const images = new Map<string, Uint8Array>();
  mapPhotos(city, (photo) => {
    if (isUri(photo) || images.has(photo)) return photo;
    const data = findImage(photo);
    if (!data) {
      throw new ImportError(`The image "${photo}" isn't in the .zip file.`);
    }
    images.set(photo, data);
    return photo;
  });

  return { bytes, city, images };
}

/** Reads a picked .json or .zip file and validates the city inside it. */
export async function readPackage(
  asset: DocumentPickerAsset,
): Promise<CityPackage> {
  const bytes = await new File(asset.uri).bytes();
  if (isZip(asset)) return readZip(bytes);

  const city = parseCityJson(bytes);
  mapPhotos(city, (photo) => {
    if (!isUri(photo)) {
      throw new ImportError(
        `This city uses the image "${photo}". Upload a .zip file that contains the JSON file and its images.`,
      );
    }
    return photo;
  });
  return { bytes, city, images: new Map() };
}
