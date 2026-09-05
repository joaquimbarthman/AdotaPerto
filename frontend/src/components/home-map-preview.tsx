"use client";

import { useEffect, useRef } from "react";
import "leaflet/dist/leaflet.css";
import type { Map as LeafletMap, Marker, TileLayer } from "leaflet";
import { apiBaseUrl } from "@/lib/map-api";

type Theme = "light" | "dark";

function theme(): Theme {
  return document.documentElement.dataset.theme === "dark" ? "dark" : "light";
}

export function HomeMapPreview() {
  const elementRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<LeafletMap | null>(null);
  const layerRef = useRef<TileLayer | null>(null);
  const markersRef = useRef<Marker[]>([]);

  useEffect(() => {
    let cancelled = false;
    let observer: MutationObserver | undefined;

    void import("leaflet").then((L) => {
      if (cancelled || !elementRef.current) return;
      const map = L.map(elementRef.current, {
        attributionControl: true,
        boxZoom: false,
        doubleClickZoom: false,
        dragging: false,
        keyboard: false,
        scrollWheelZoom: false,
        tapHold: false,
        touchZoom: false,
        zoomControl: false,
      }).setView([-23.5505, -46.6333], 12);

      const addLayer = () => {
        layerRef.current?.remove();
        layerRef.current = L.tileLayer(`${apiBaseUrl()}/api/map/tiles/${theme()}/{z}/{x}/{y}.png?v=6`, {
          attribution: "© OpenStreetMap contributors © CARTO",
          className: "carto-map-layer",
          maxNativeZoom: 18,
          maxZoom: 18,
        }).addTo(map);
      };

      addLayer();
      const previewPoints = [
        { position: [-23.544, -46.642] as [number, number], icon: "/icons/adocao.svg", color: "#256441", label: "Animal para adoção" },
        { position: [-23.555, -46.624] as [number, number], icon: "/icons/map-box.svg", color: "#3f7d58", label: "Doação disponível" },
        { position: [-23.562, -46.646] as [number, number], icon: "/icons/map-stethoscope.svg", color: "#2f6f63", label: "Atendimento veterinário" },
        { position: [-23.538, -46.622] as [number, number], icon: "/icons/map-house.svg", color: "#315d46", label: "ONG ou abrigo" },
      ];
      markersRef.current = previewPoints.map((point) => L.marker(point.position, {
        title: point.label,
        icon: L.divIcon({
          className: "map-marker-shell",
          html: `<span class="map-marker home-map-marker" style="--marker:${point.color}"><img src="${point.icon}" alt="" /></span>`,
          iconSize: [38, 38],
          iconAnchor: [19, 19],
        }),
      }).addTo(map));
      mapRef.current = map;
      observer = new MutationObserver(addLayer);
      observer.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
      requestAnimationFrame(() => map.invalidateSize());
    });

    return () => {
      cancelled = true;
      observer?.disconnect();
      markersRef.current = [];
      mapRef.current?.remove();
      mapRef.current = null;
      layerRef.current = null;
    };
  }, []);

  return <div ref={elementRef} className="absolute inset-0" aria-hidden="true" />;
}
