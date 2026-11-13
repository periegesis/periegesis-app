import { Directory, File } from "expo-file-system";
import { ImageManipulator, SaveFormat } from "expo-image-manipulator";

import { ImportError } from "./errors";

export const MAX_IMAGE_BYTES = 5 * 1024 * 1024;
const MAX_DOWNSCALE_ATTEMPTS = 5;

function safeFileName(ref: string): string {
  const name = ref.replace(/\\/g, "/").split("/").pop() ?? "";
  return name.replace(/[^\w.-]+/g, "_").replace(/^\.+/, "") || "photo";
}

function uniqueName(name: string, taken: Set<string>): string {
  const dot = name.lastIndexOf(".");
  const stem = dot > 0 ? name.slice(0, dot) : name;
  const ext = dot > 0 ? name.slice(dot) : "";
  let candidate = name;
  for (let n = 2; taken.has(candidate.toLowerCase()); n++) {
    candidate = `${stem}-${n}${ext}`;
  }
  taken.add(candidate.toLowerCase());
  return candidate;
}

function withJpegExtension(name: string): string {
  const dot = name.lastIndexOf(".");
  return `${dot > 0 ? name.slice(0, dot) : name}.jpg`;
}

/** Re-encodes an image as a JPEG, shrinking it until it fits the size limit. */
async function downscale(source: File, ref: string): Promise<File> {
  const context = ImageManipulator.manipulate(source.uri);
  try {
    let width: number;
    try {
      width = (await context.renderAsync()).width;
    } catch {
      throw new ImportError(`"${ref}" couldn't be read as an image.`);
    }

    let scale = Math.min(1, Math.sqrt(MAX_IMAGE_BYTES / source.size) * 0.95);
    for (let attempt = 0; attempt < MAX_DOWNSCALE_ATTEMPTS; attempt++) {
      context.reset().resize({ width: Math.max(1, Math.round(width * scale)) });
      const image = await context.renderAsync();
      const result = await image.saveAsync({
        format: SaveFormat.JPEG,
        compress: 0.85,
      });
      const output = new File(result.uri);
      if (output.size <= MAX_IMAGE_BYTES) return output;
      output.delete();
      scale *= 0.8;
    }
    throw new ImportError(`"${ref}" is too large and couldn't be shrunk.`);
  } finally {
    context.release();
  }
}

/**
 * Writes bundled images into `output`, downscaling any over 5MB. `scratch`
 * holds the original bytes while they are processed. Returns the file name
 * each photo reference was saved under.
 */
export async function stageImages(
  images: Map<string, Uint8Array>,
  { output, scratch }: { output: Directory; scratch: Directory },
): Promise<Map<string, string>> {
  const names = new Map<string, string>();
  const taken = new Set<string>();

  for (const [ref, bytes] of images) {
    const name = safeFileName(ref);
    const original = new File(scratch, `${names.size}-${name}`);
    original.write(bytes);

    if (bytes.length <= MAX_IMAGE_BYTES) {
      const finalName = uniqueName(name, taken);
      original.moveSync(new File(output, finalName));
      names.set(ref, finalName);
      continue;
    }

    const resized = await downscale(original, ref);
    original.delete();
    const finalName = uniqueName(withJpegExtension(name), taken);
    resized.moveSync(new File(output, finalName));
    names.set(ref, finalName);
  }
  return names;
}
