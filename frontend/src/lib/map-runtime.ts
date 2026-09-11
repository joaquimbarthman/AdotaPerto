import { version } from "maplibre-gl/package.json";

export async function loadMapLibre() {
  const mapLibre = await import("maplibre-gl");
  // The ESM worker's relative URL cannot be inferred from a Next.js bundle.
  // Serve it and its shared module from the same installed package version.
  mapLibre.setWorkerUrl(`/maplibre/${version}/maplibre-gl-worker.mjs`);
  return mapLibre;
}
