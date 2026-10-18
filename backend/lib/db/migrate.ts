import "dotenv/config";
import { fileURLToPath } from "node:url";
import { migrate } from "drizzle-orm/node-postgres/migrator";
import { db } from "./index.ts";

async function runMigrations() {
  console.log("Aplicando migrations...");
  await migrate(db, {
    migrationsFolder: fileURLToPath(new URL("./migrations", import.meta.url)),
  });
  console.log("Migrations aplicadas.");
}

runMigrations()
  .catch((error) => {
    console.error("Falha ao aplicar migrations:", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await db.$client.end();
  });
