import * as Crypto from "expo-crypto";
import type { DocumentPickerAsset } from "expo-document-picker";
import { Directory, File, Paths } from "expo-file-system";

import { removeCityGeofences } from "@/geofencing/store";
import {
  cityPhotoDir,
  cityPhotoPath,
  findCitiesByName,
  getCityHashes,
  saveCity,
} from "@/storage/cities";

import { stageImages } from "./images";
import { readPackage } from "./read-package";
import { mapPhotos } from "./validate-city";

export type NameConflictChoice = "replace" | "keepBoth" | "cancel";

export type ImportPrompts = {
  /** Asks what to do when a city with the same name already exists. */
  confirmNameConflict: () => Promise<NameConflictChoice>;
  /** Tells the user an identical file has already been imported. */
  notifyDuplicate: () => Promise<void>;
};

export type ImportResult = "imported" | "cancelled";

async function sha256(bytes: Uint8Array<ArrayBuffer>): Promise<string> {
  const digest = await Crypto.digest(Crypto.CryptoDigestAlgorithm.SHA256, bytes);
  return Array.from(new Uint8Array(digest), (b) =>
    b.toString(16).padStart(2, "0"),
  ).join("");
}

function newCityId(): string {
  return `city-${Crypto.randomUUID()}`;
}

/**
 * Validates a picked .json or .zip file and saves the city it contains.
 * Throws ImportError for problems the user should be told about.
 */
export async function importCity(
  asset: DocumentPickerAsset,
  prompts: ImportPrompts,
): Promise<ImportResult> {
  // 1. The file is valid JSON describing a city (and any images it needs).
  const pkg = await readPackage(asset);

  // 4. The exact same file hasn't been imported before. Checked before the
  //    name, since an identical file always has a matching name too.
  const hash = await sha256(pkg.bytes);
  if (Object.values(await getCityHashes()).includes(hash)) {
    await prompts.notifyDuplicate();
    return "cancelled";
  }

  // 3. No other city has the same name, unless the user says how to resolve it.
  //    Asked before processing images so that cancelling is quick.
  let id = newCityId();
  let replacing = false;
  const [existing] = await findCitiesByName(pkg.city.name);
  if (existing) {
    const choice = await prompts.confirmNameConflict();
    if (choice === "cancel") return "cancelled";
    if (choice === "replace") {
      id = existing.id;
      replacing = true;
    }
  }

  // 2. Every image is 5MB or smaller, downscaling the ones that aren't.
  const staging = new Directory(Paths.cache, `city-import-${Crypto.randomUUID()}`);
  try {
    const output = new Directory(staging, "photos");
    const scratch = new Directory(staging, "scratch");
    output.create({ intermediates: true });
    scratch.create({ intermediates: true });
    const fileNames = await stageImages(pkg.images, { output, scratch });

    const photoDir = cityPhotoDir(id);
    if (replacing && photoDir.exists) photoDir.delete();
    if (fileNames.size > 0) {
      photoDir.create({ intermediates: true, idempotent: true });
      for (const entry of output.list()) {
        if (entry instanceof File) entry.moveSync(new File(photoDir, entry.name));
      }
    }

    const city = mapPhotos(pkg.city, (photo) => {
      const fileName = fileNames.get(photo);
      return fileName ? `${cityPhotoPath(id)}/${fileName}` : photo;
    });
    await saveCity(id, city, hash);
    // Sights may have moved or changed, so their notifications no longer apply.
    if (replacing) await removeCityGeofences(id);
    return "imported";
  } finally {
    if (staging.exists) staging.delete();
  }
}
