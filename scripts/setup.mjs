import { copyFile, access, readFile, writeFile } from "node:fs/promises";
import { randomBytes } from "node:crypto";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import path from "node:path";

const root = fileURLToPath(new URL("..", import.meta.url));
const envPath = path.join(root, "backend", ".env");
const envExamplePath = path.join(root, "backend", ".env.example");
const npmCli = process.env.npm_execpath;
const npm = npmCli ? process.execPath : process.platform === "win32" ? "npm.exe" : "npm";
const npmPrefix = npmCli ? [npmCli] : [];

async function exists(filePath) {
  try {
    await access(filePath);
    return true;
  } catch {
    return false;
  }
}

if (!(await exists(envPath))) {
  await copyFile(envExamplePath, envPath);
  console.log("Criado backend/.env a partir de backend/.env.example.");
}

const env = await readFile(envPath, "utf8");
if (env.includes("BETTER_AUTH_SECRET=replace-with-a-random-secret")) {
  await writeFile(
    envPath,
    env.replace(
      "BETTER_AUTH_SECRET=replace-with-a-random-secret",
      `BETTER_AUTH_SECRET=${randomBytes(32).toString("base64url")}`,
    ),
  );
  console.log("Gerado BETTER_AUTH_SECRET local em backend/.env.");
}

for (const directory of ["backend", "frontend"]) {
  console.log(`Instalando dependências de ${directory}...`);
  const result = spawnSync(
    npm,
    [...npmPrefix, "install", ...(directory === "backend" ? ["--legacy-peer-deps"] : [])],
    { cwd: path.join(root, directory), stdio: "inherit" },
  );
  if (result.status !== 0) process.exit(result.status ?? 1);
}

console.log("Preparação concluída. Inicie o projeto com npm run dev.");
