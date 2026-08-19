import { Client } from "minio";

export const imageBucket = process.env.MINIO_BUCKET || "adotaperto-images";

const endpoint = process.env.MINIO_ENDPOINT || "localhost";
const port = Number(process.env.MINIO_API_PORT || 9000);
const useSSL = process.env.MINIO_USE_SSL === "true";

export const storage = new Client({
  endPoint: endpoint,
  port,
  useSSL,
  accessKey: process.env.MINIO_ROOT_USER || "minioadmin",
  secretKey: process.env.MINIO_ROOT_PASSWORD || "minioadmin",
});

let bucketPromise: Promise<void> | null = null;

export function ensureImageBucket() {
  bucketPromise ??= (async () => {
    if (!(await storage.bucketExists(imageBucket))) {
      await storage.makeBucket(imageBucket);
    }

  })().catch((error) => {
    bucketPromise = null;
    throw error;
  });

  return bucketPromise;
}

export function publicImageUrl(objectName: string) {
  const apiBaseUrl = process.env.API_PUBLIC_URL || "http://localhost:4000";
  return `${apiBaseUrl}/api/uploads/images/${objectName}`;
}
