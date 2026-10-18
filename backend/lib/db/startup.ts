import "dotenv/config";
import { fileURLToPath } from "node:url";
import { migrate } from "drizzle-orm/node-postgres/migrator";

async function startup() {
  const databaseUrl = process.env.DATABASE_URL?.trim();
  if (!databaseUrl) {
    throw new Error("DATABASE_URL não configurada no ambiente do serviço.");
  }

  let parsedDatabaseUrl: URL;
  try {
    parsedDatabaseUrl = new URL(databaseUrl);
  } catch {
    throw new Error("DATABASE_URL inválida. Copie a URI PostgreSQL completa em Supabase > Connect > Session pooler, sem aspas nem placeholders.");
  }
  if (
    !["postgresql:", "postgres:"].includes(parsedDatabaseUrl.protocol) ||
    !parsedDatabaseUrl.hostname ||
    !parsedDatabaseUrl.username ||
    !parsedDatabaseUrl.pathname ||
    /[<>]/.test(databaseUrl)
  ) {
    throw new Error("DATABASE_URL inválida. Use a URI PostgreSQL completa do Supabase Session pooler, substituindo todos os placeholders.");
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
