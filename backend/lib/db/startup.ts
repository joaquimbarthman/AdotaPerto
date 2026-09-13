import "dotenv/config";
import { fileURLToPath } from "node:url";
import { migrate } from "drizzle-orm/node-postgres/migrator";
import { db } from "./index.ts";
import { ensureImageBucket, imageBucket } from "../storage/index.ts";

async function startup() {
  console.log("Aplicando migrations...");
  await migrate(db, {
    migrationsFolder: fileURLToPath(new URL("./migrations", import.meta.url)),
  });
  console.log("Migrations aplicadas. Preparando MinIO...");
  await ensureImageBucket();
  console.log(`Startup concluído. Bucket ${imageBucket} pronto.`);
}

startup().catch((error) => {
  console.error("Falha no startup:", error);
  process.exitCode = 1;
}).finally(async () => {
  await db.$client.end();
});
