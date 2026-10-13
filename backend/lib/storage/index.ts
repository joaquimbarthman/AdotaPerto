import "dotenv/config";
import { Client } from "minio";

export const imageBucket =
  process.env.RUSTFS_BUCKET || process.env.MINIO_BUCKET || "adotaperto-images";

const endpoint =
  process.env.RUSTFS_ENDPOINT || process.env.MINIO_ENDPOINT || "localhost";
const port = Number(
  process.env.RUSTFS_API_PORT || process.env.MINIO_API_PORT || 9000,
);
const useSSL =
  (process.env.RUSTFS_USE_SSL || process.env.MINIO_USE_SSL) === "true";

export const storage = new Client({
  endPoint: endpoint,
  port,
  useSSL,
  accessKey:
    process.env.RUSTFS_ACCESS_KEY ||
    process.env.MINIO_ROOT_USER ||
    "minioadmin",
  secretKey:
    process.env.RUSTFS_SECRET_KEY ||
    process.env.MINIO_ROOT_PASSWORD ||
    "minioadmin",
});

let bucketPromise: Promise<void> | null = null;

export function ensureImageBucket() {
  bucketPromise ??= (async () => {
    if (!(await storage.bucketExists(imageBucket))) {
      try {
        await storage.makeBucket(imageBucket);
      } catch (error) {
        if ((error as { code?: string }).code !== "BucketAlreadyOwnedByYou")
          throw error;
      }
    }
  })().catch((error) => {
    bucketPromise = null;
    throw error;
  });

  return bucketPromise;
}

export async function removeStorageObjects(prefix?: string) {
  if (!(await storage.bucketExists(imageBucket))) return;

  let objectNames: string[] = [];

  async function removeBatch() {
    const responses = await storage.removeObjects(imageBucket, objectNames);
    const failure = responses.find((response) => response?.Error);
    if (failure?.Error) {
      throw new Error(
        `Falha ao remover objeto do storage: ${failure.Error.Code || "erro desconhecido"}`,
      );
    }
    objectNames = [];
  }

  for await (const object of storage.listObjectsV2(imageBucket, prefix, true)) {
    if (!object.name) continue;
    objectNames.push(object.name);
    if (objectNames.length === 1000) await removeBatch();
  }

  if (objectNames.length > 0) await removeBatch();
}

export function publicImageUrl(objectName: string) {
  const apiBaseUrl = process.env.API_PUBLIC_URL || "http://localhost:4000";
  return `${apiBaseUrl}/api/uploads/images/${objectName}`;
}
