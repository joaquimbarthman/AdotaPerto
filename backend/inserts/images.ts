import { readdir } from "node:fs/promises";
import { existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { join } from "node:path";
import {
  ensureImageBucket,
  imageBucket,
  imageStorageConfigured,
  publicImageUrl,
  uploadImageFile,
} from "../lib/storage/index.ts";

const root = fileURLToPath(new URL("./images/", import.meta.url));

export function seedPhotos(mediaKey: string) {
  const available = [1, 2, 3].filter((number) => existsSync(join(root, mediaKey, `${number}.jpg`)));
  if (!available.length) throw new Error(`Nenhuma imagem encontrada para ${mediaKey}`);
  return available.map((number) =>
    publicImageUrl(`seed/${mediaKey.replaceAll("/", "-")}-${number}.jpg`),
  );
}

export async function uploadSeedImages() {
  if (!imageStorageConfigured) {
    throw new Error("Configure o Supabase Storage ou MinIO local antes de enviar imagens do seed.");
  }
  await ensureImageBucket();
  let count = 0;
  for (const category of ["animals", "items"]) {
    for (const entry of await readdir(join(root, category), { withFileTypes: true })) {
      if (!entry.isDirectory()) continue;
      for (const number of [1, 2, 3]) {
        if (!existsSync(join(root, category, entry.name, `${number}.jpg`))) {
          console.warn(`Imagem ausente, ignorada: ${category}/${entry.name}/${number}.jpg`);
          continue;
        }
        await uploadImageFile(`seed/${category}-${entry.name}-${number}.jpg`,
          join(root, category, entry.name, `${number}.jpg`), "image/jpeg", true);
        count++;
      }
    }
  }
  console.log(`${count} imagens enviadas ao bucket ${imageBucket}.`);
}
