import type { Map as MapLibreMap } from "maplibre-gl";

// Some basemap sprites omit the woodland texture referenced by their style.
// Supply a small, seamless tree pattern only when that specific image is missing.
export function configureMapImages(map: MapLibreMap) {
  map.setMissingStyleImageResolver((id) => {
    if (id !== "wood-pattern" || map.hasImage(id)) return;
    const width = 16;
    const data = new Uint8Array(width * width * 4);
    for (let y = 4; y <= 11; y++) {
      const halfWidth = y <= 9 ? Math.floor((y - 4) / 2) : 0;
      for (let x = 8 - halfWidth; x <= 8 + halfWidth; x++) {
        data.set([76, 112, 82, 72], (y * width + x) * 4);
      }
    }
    map.addImage(id, { width, height: width, data });
  });
}
