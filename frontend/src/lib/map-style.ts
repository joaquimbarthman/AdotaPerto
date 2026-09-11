export function currentMapStyle(): string {
  return document.documentElement.dataset.theme === "dark"
    ? process.env.NEXT_PUBLIC_MAP_STYLE_DARK_URL || "https://tiles.openfreemap.org/styles/dark"
    : process.env.NEXT_PUBLIC_MAP_STYLE_LIGHT_URL || "https://tiles.openfreemap.org/styles/positron";
}
