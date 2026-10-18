import "dotenv/config";
import { asc } from "drizzle-orm";
import { db } from "./index.ts";
import { user } from "./schemas/index.ts";
import { seedForUser } from "./seed.ts";

async function seed() {
  const [firstUser] = await db
    .select({ id: user.id, name: user.name })
    .from(user)
    .orderBy(asc(user.createdAt), asc(user.id))
    .limit(1);

  if (!firstUser) {
    throw new Error("Nenhum usuário encontrado. Crie um usuário antes de executar o seeder.");
  }

  await seedForUser(firstUser);
}

seed()
  .catch((error) => {
    console.error("Falha ao executar o seeder:", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await db.$client.end();
  });
