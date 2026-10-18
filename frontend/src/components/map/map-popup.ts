import type { MapResult } from "@/types/map";



export const colors = {
  adoption: "#256441",
  donation: "#3f7d58",
  veterinary: "#2f6f63",
  pet_shop: "#527a5c",
  shelter: "#315d46",
};
export const iconPaths = {
  adoption: "/icons/adocao.svg",
  donation: "/icons/map-box.svg",
  veterinary: "/icons/map-stethoscope.svg",
  pet_shop: "/icons/map-store.svg",
  shelter: "/icons/map-house.svg",
};

function escapeHtml(value: string) {
  return value.replace(
    /[&<>'"]/g,
    (char) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;" })[
        char
      ] || char,
  );
}

export function popupHtml(result: MapResult) {
  const image = result.image
    ? `<img src="${escapeHtml(result.image)}" alt="" class="map-popup-image" />`
    : "";
  const details = escapeHtml(
    result.description ||
      result.address ||
      result.region ||
      "Informações disponíveis no mapa.",
  );
  const contacts = [
    result.phone
      ? `<a href="tel:${escapeHtml(result.phone)}">${escapeHtml(result.phone)}</a>`
      : "",
    result.email
      ? `<a href="mailto:${escapeHtml(result.email)}">${escapeHtml(result.email)}</a>`
      : "",
  ]
    .filter(Boolean)
    .join("");
  const action = result.href
    ? `<a href="${escapeHtml(result.href)}" class="map-popup-action">Ver detalhes &gt;</a>`
    : result.mapsUrl
      ? `<a href="${escapeHtml(result.mapsUrl)}" target="_blank" rel="noreferrer" class="map-popup-action">Abrir no mapa &gt;</a>`
      : "";
  const category =
    result.category === "adoption"
      ? "Adoção"
      : result.category === "donation"
        ? "Doação"
        : result.category === "veterinary"
          ? "Veterinário"
          : result.category === "pet_shop"
            ? "Pet Shop"
            : "ONG / Abrigo";
  return `<article class="map-popup-card">${image}<div class="map-popup-content"><div class="map-popup-heading"><strong>${escapeHtml(result.name)}</strong><span><img src="${iconPaths[result.category]}" alt="" />${category}</span></div><p>${details}</p>${contacts ? `<div class="map-popup-contacts">${contacts}</div>` : ""}${action}</div></article>`;
}
