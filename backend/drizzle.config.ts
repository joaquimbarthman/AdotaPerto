import "dotenv/config";
import { defineConfig } from "drizzle-kit";

const databaseUrl = (globalThis as any)?.process?.env?.DATABASE_URL ?? "";

export default defineConfig({
  out: "./lib/db/migrations",
  schema: "./lib/db/schemas/**/*.ts",
  dialect: "postgresql",
  dbCredentials: {
    url: databaseUrl,
  },
});
