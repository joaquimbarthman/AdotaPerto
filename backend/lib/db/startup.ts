import "dotenv/config";
import { fileURLToPath } from "node:url";
import { migrate } from "drizzle-orm/node-postgres/migrator";

async function startup() {
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL não configurada no ambiente do serviço.");
  }

  console.log("Conectando ao PostgreSQL...");
  const { db } = await import("./index.ts");

  try {
    console.log("Aplicando migrations...");
    await migrate(db, {
      migrationsFolder: fileURLToPath(new URL("./migrations", import.meta.url)),
    });
    console.log("Migrations aplicadas. Preparando armazenamento de imagens...");
    const { ensureImageBucket, imageBucket } = await import("../storage/index.ts");
    await ensureImageBucket();
    console.log(`Startup concluído. Bucket ${imageBucket} pronto.`);
  } finally {
    await db.$client.end();
  }
}

startup().catch((error) => {
  console.error("Falha no startup:", error);
  process.exitCode = 1;
});
