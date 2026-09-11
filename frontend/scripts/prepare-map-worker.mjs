import { copyFile, mkdir, readFile } from "node:fs/promises";
import { createRequire } from "node:module";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const require = createRequire(import.meta.url);
const packagePath = require.resolve("maplibre-gl/package.json");
const { version } = JSON.parse(await readFile(packagePath, "utf8"));
const destination = fileURLToPath(new URL(`../public/maplibre/${version}/`, import.meta.url));
await mkdir(destination, { recursive: true });
for (const name of ["maplibre-gl-worker.mjs", "maplibre-gl-shared.mjs", "maplibre-gl-worker.mjs.map", "maplibre-gl-shared.mjs.map"]) {
  await copyFile(join(dirname(packagePath), "dist", name), join(destination, name));
}
console.log(`MapLibre ${version}: worker preparado.`);
