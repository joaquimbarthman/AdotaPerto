import { Hono } from "hono";
import { db } from "../../lib/db/index.ts";
import {
  checkImageBucket,
  imageBucket,
  imageStorageConfigured,
} from "../../lib/storage/index.ts";

async function checkService(check: () => Promise<unknown>) {
  let timer: ReturnType<typeof setTimeout> | undefined;
  try {
    await Promise.race([
      check(),
      new Promise((_, reject) => {
        timer = setTimeout(() => reject(new Error("timeout")), 5000);
      }),
    ]);
    return { status: "ok" as const };
  } catch {
    return { status: "error" as const };
  } finally {
    clearTimeout(timer);
  }
}

export const statusRoutes = new Hono();

statusRoutes.get("/", async (c) => {
  const [database, bucket] = await Promise.all([
    checkService(async () => {
      await db.$client.query("SELECT 1");
    }),
    imageStorageConfigured
      ? checkService(async () => {
          if (!(await checkImageBucket())) throw new Error("Bucket ausente");
        })
      : Promise.resolve({ status: "not_configured" as const }),
  ]);
  const healthy = database.status === "ok" && bucket.status !== "error";
  c.header("Cache-Control", "no-store");
  return c.json({
    status: healthy ? "ok" : "error",
    server: { status: "ok", uptime: Math.floor(process.uptime()) },
    database,
    bucket: { ...bucket, name: imageBucket },
  }, healthy ? 200 : 503);
});
