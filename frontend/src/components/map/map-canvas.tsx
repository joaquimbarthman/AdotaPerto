"use client";

import { useEffect, useRef, useState } from "react";
import "leaflet/dist/leaflet.css";
import type { CircleMarker, Map as LeafletMap, Marker, TileLayer } from "leaflet";
import type { Coordinates } from "@/lib/map-distance";
import { apiBaseUrl } from "@/lib/map-api";
import type { MapResult } from "@/types/map";

type LeafletApi = typeof import("leaflet");
type MapTheme = "light" | "dark";

const colors = { adoption: "#256441", donation: "#3f7d58", veterinary: "#2f6f63", pet_shop: "#527a5c", shelter: "#315d46" };
const iconPaths = { adoption: "/icons/adocao.svg", donation: "/icons/map-box.svg", veterinary: "/icons/map-stethoscope.svg", pet_shop: "/icons/map-store.svg", shelter: "/icons/map-house.svg" };

function currentTheme(): MapTheme {
  return document.documentElement.dataset.theme === "dark" ? "dark" : "light";
}

function createBaseLayer(L: LeafletApi, theme: MapTheme) {
  return L.tileLayer(`${apiBaseUrl()}/api/map/tiles/${theme}/{z}/{x}/{y}.png?v=6`, {
    maxNativeZoom: 18,
    maxZoom: 18,
    attribution: "© OpenStreetMap contributors © CARTO",
    crossOrigin: true,
    className: `carto-map-layer carto-map-layer-${theme}`,
  });
}

function escapeHtml(value: string) {
  return value.replace(/[&<>'"]/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;" })[char] || char);
}

function popupHtml(result: MapResult) {
  const image = result.image ? `<img src="${escapeHtml(result.image)}" alt="" class="map-popup-image" />` : "";
  const details = escapeHtml(result.description || result.address || result.region || "Informações disponíveis no mapa.");
  const contacts = [result.phone ? `<a href="tel:${escapeHtml(result.phone)}">${escapeHtml(result.phone)}</a>` : "", result.email ? `<a href="mailto:${escapeHtml(result.email)}">${escapeHtml(result.email)}</a>` : ""].filter(Boolean).join("");
  const action = result.href ? `<a href="${escapeHtml(result.href)}" class="map-popup-action">Ver detalhes &gt;</a>` : result.mapsUrl ? `<a href="${escapeHtml(result.mapsUrl)}" target="_blank" rel="noreferrer" class="map-popup-action">Abrir no mapa &gt;</a>` : "";
  const category = result.category === "adoption" ? "Adoção" : result.category === "donation" ? "Doação" : result.category === "veterinary" ? "Veterinário" : result.category === "pet_shop" ? "Pet Shop" : "ONG / Abrigo";
  return `<article class="map-popup-card">${image}<div class="map-popup-content"><div class="map-popup-heading"><strong>${escapeHtml(result.name)}</strong><span><img src="${iconPaths[result.category]}" alt="" />${category}</span></div><p>${details}</p>${contacts ? `<div class="map-popup-contacts">${contacts}</div>` : ""}${action}</div></article>`;
}

export function MapCanvas({ center, results, selectedId, userLocation, onSelect, onLocate }: { center: Coordinates; results: MapResult[]; selectedId: string | null; userLocation: Coordinates | null; onSelect: (result: MapResult) => void; onLocate: () => void }) {
  const elementRef = useRef<HTMLDivElement>(null);
  const initialCenterRef = useRef(center);
  const mapRef = useRef<LeafletMap | null>(null);
  const leafletRef = useRef<LeafletApi | null>(null);
  const baseLayerRef = useRef<TileLayer | null>(null);
  const markersRef = useRef<Map<string, Marker>>(new Map());
  const userMarkerRef = useRef<CircleMarker | null>(null);
  const [ready, setReady] = useState(false);
  const [mapError, setMapError] = useState(false);

  useEffect(() => {
    let cancelled = false;
    async function setup() {
      const L = await import("leaflet");
      if (cancelled || !elementRef.current || mapRef.current) return;
      leafletRef.current = L;
      const initial = initialCenterRef.current;
      const map = L.map(elementRef.current, { zoomControl: false, attributionControl: true, minZoom: 4, maxZoom: 18 }).setView([initial.lat, initial.lng], 12);
      baseLayerRef.current = createBaseLayer(L, currentTheme()).addTo(map);
      mapRef.current = map;
      setReady(true);
      setMapError(false);
      requestAnimationFrame(() => map.invalidateSize());
    }
    setup().catch(() => setMapError(true));
    return () => {
      cancelled = true;
      baseLayerRef.current = null;
      mapRef.current?.remove();
      mapRef.current = null;
      leafletRef.current = null;
    };
  }, []);

  useEffect(() => {
    const observer = new MutationObserver(() => {
      const map = mapRef.current;
      const L = leafletRef.current;
      if (!map || !L) return;
      baseLayerRef.current?.remove();
      baseLayerRef.current = createBaseLayer(L, currentTheme()).addTo(map);
    });
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
    return () => observer.disconnect();
  }, []);

  useEffect(() => { mapRef.current?.flyTo([center.lat, center.lng], 13); }, [center]);

  useEffect(() => {
    const map = mapRef.current;
    const L = leafletRef.current;
    if (!map || !L) return;
    markersRef.current.forEach((marker) => marker.remove());
    markersRef.current.clear();
    results.forEach((result) => {
      const selected = selectedId === result.id;
      const size = selected ? 46 : 40;
      const icon = L.divIcon({
        className: "map-marker-shell",
        html: `<span class="map-marker ${selected ? "map-marker-selected" : ""}" style="--marker:${colors[result.category]}"><img src="${iconPaths[result.category]}" alt="" /></span>`,
        iconSize: [size, size],
        iconAnchor: [size / 2, size / 2],
        popupAnchor: [0, -(size / 2 + 8)],
      });
      const marker = L.marker([result.lat, result.lng], { icon, title: result.name }).addTo(map).bindPopup(popupHtml(result), { closeButton: false, maxWidth: 290 }).on("click", () => onSelect(result));
      markersRef.current.set(result.id, marker);
      if (selected) marker.openPopup();
    });
  }, [ready, results, selectedId, onSelect]);

  useEffect(() => {
    const selected = results.find((result) => result.id === selectedId);
    if (selected) mapRef.current?.flyTo([selected.lat, selected.lng], 15);
  }, [results, selectedId]);

  useEffect(() => {
    const map = mapRef.current;
    const L = leafletRef.current;
    userMarkerRef.current?.remove();
    userMarkerRef.current = null;
    if (!map || !L || !userLocation) return;
    userMarkerRef.current = L.circleMarker([userLocation.lat, userLocation.lng], { radius: 8, color: "#fff", weight: 3, fillColor: "#2f80ed", fillOpacity: 1 }).addTo(map).bindPopup("Sua localização aproximada");
  }, [ready, userLocation]);

  return (
    <div className="map-surface relative min-h-0 flex-1">
      <div ref={elementRef} className="absolute inset-0" aria-label="Mapa interativo com resultados próximos" />
      {mapError ? <div className="map-load-error absolute left-1/2 top-1/2 z-[500] -translate-x-1/2 -translate-y-1/2 text-center"><strong>Não foi possível carregar o mapa</strong><span>Atualize a página para tentar novamente.</span></div> : null}
      <div className="absolute right-4 top-4 z-[500] flex flex-col gap-2">
        <button type="button" onClick={() => mapRef.current?.zoomIn()} className="map-control" aria-label="Aumentar zoom">+</button>
        <button type="button" onClick={() => mapRef.current?.zoomOut()} className="map-control" aria-label="Diminuir zoom">−</button>
        <button type="button" onClick={onLocate} className="map-control mt-2 text-[#256441]" aria-label="Usar minha localização" title="Minha localização">
          <svg viewBox="0 0 24 24" width="20" height="20" fill="none" aria-hidden="true">
            <circle cx="12" cy="12" r="4" stroke="currentColor" strokeWidth="1.8" />
            <path d="M12 3v2.4M12 18.6V21M3 12h2.4M18.6 12H21" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
          </svg>
        </button>
      </div>
      <div className="map-privacy-note absolute bottom-2 left-1.5 right-1.5 z-[500] whitespace-nowrap rounded-full px-2 py-1 text-center text-[clamp(5px,1.7vw,8px)] leading-none shadow-sm backdrop-blur-md lg:bottom-4 lg:left-1/2 lg:right-auto lg:w-[min(500px,calc(100%-28px))] lg:-translate-x-1/2 lg:whitespace-normal lg:px-5 lg:py-2.5 lg:text-xs lg:leading-4">Para sua segurança, localizações residenciais são aproximadas em um raio de 2 km.</div>
    </div>
  );
}
