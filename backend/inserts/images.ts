import { readdir } from "node:fs/promises";
import { existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { join } from "node:path";
import { imageBucket, publicImageUrl, storage } from "../lib/storage/index.ts";

const root = fileURLToPath(new URL("./images/", import.meta.url));

export function seedPhotos(mediaKey: string) {
  const available = [1, 2, 3].filter((number) => existsSync(join(root, mediaKey, `${number}.jpg`)));
  if (!available.length) throw new Error(`Nenhuma imagem encontrada para ${mediaKey}`);
  return available.map((number) =>
    publicImageUrl(`seed/${mediaKey.replaceAll("/", "-")}-${number}.jpg`),
  );
}

export async function uploadSeedImages() {
  if (!(await storage.bucketExists(imageBucket))) {
    throw new Error("Bucket ausente. Execute npm run startup antes do seeder.");
  }
  let count = 0;
  for (const category of ["animals", "items"]) {
    for (const entry of await readdir(join(root, category), { withFileTypes: true })) {
      if (!entry.isDirectory()) continue;
      for (const number of [1, 2, 3]) {
        if (!existsSync(join(root, category, entry.name, `${number}.jpg`))) {
          console.warn(`Imagem ausente, ignorada: ${category}/${entry.name}/${number}.jpg`);
          continue;
        }
        await storage.fPutObject(imageBucket, `seed/${category}-${entry.name}-${number}.jpg`,
          join(root, category, entry.name, `${number}.jpg`), { "Content-Type": "image/jpeg" });
        count++;
      }
    }
  }
  console.log(`${count} imagens enviadas ao bucket ${imageBucket}.`);
}
