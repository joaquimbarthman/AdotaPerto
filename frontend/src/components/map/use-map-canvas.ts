"use client";

import type { Coordinates } from "@/lib/map-distance";
import { configureMapImages } from "@/lib/map-images";
import { loadMapLibre } from "@/lib/map-runtime";
import { currentMapStyle } from "@/lib/map-style";
import type { MapResult } from "@/types/map";
import type { Map as MapLibreMap, Marker } from "maplibre-gl";
import { useEffect, useRef, useState } from "react";
import { colors, iconPaths, popupHtml } from "./map-popup";

type MapLibreApi = typeof import("maplibre-gl");

export function useMapCanvas({ center, results, selectedId, userLocation, onSelect }: { center: Coordinates; results: MapResult[]; selectedId: string | null; userLocation: Coordinates | null; onSelect: (result: MapResult) => void }) {
  const elementRef = useRef<HTMLDivElement>(null);
  const initialCenterRef = useRef(center);
  const mapRef = useRef<MapLibreMap | null>(null);
  const mapLibreRef = useRef<MapLibreApi | null>(null);
  const markersRef = useRef<Map<string, Marker>>(new Map());
  const userMarkerRef = useRef<Marker | null>(null);
  const [ready, setReady] = useState(false);
  const [mapError, setMapError] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const markers = markersRef.current;
    let resizeObserver: ResizeObserver | undefined;
    async function setup() {
      const M = await loadMapLibre();
      if (cancelled || !elementRef.current || mapRef.current) return;
      mapLibreRef.current = M;
      const initial = initialCenterRef.current;
      const map = new M.Map({
        container: elementRef.current,
        style: currentMapStyle(),
        center: [initial.lng, initial.lat],
        zoom: 12,
        minZoom: 4,
        maxZoom: 18,
        attributionControl: false,
      });
      configureMapImages(map);
      map.addControl(
        new M.AttributionControl({ compact: false }),
        "bottom-right",
      );
      map.on("error", () => {
        if (!cancelled) setMapError(true);
      });
      map.on("idle", () => {
        if (!cancelled) setMapError(false);
      });
      mapRef.current = map;
      setReady(true);
      setMapError(false);
      resizeObserver = new ResizeObserver(() => map.resize());
      resizeObserver.observe(elementRef.current);
    }
    setup().catch(() => {
      if (!cancelled) setMapError(true);
    });
  
  return () => {
      cancelled = true;
      resizeObserver?.disconnect();
      markers.forEach((marker) => marker.remove());
      markers.clear();
      userMarkerRef.current?.remove();
      userMarkerRef.current = null;
      mapRef.current?.remove();
      mapRef.current = null;
      mapLibreRef.current = null;
    };
  }, []);

  useEffect(() => {
    const observer = new MutationObserver(() => {
      const map = mapRef.current;
      if (!map) return;
      setMapError(false);
      map.setStyle(currentMapStyle());
    });
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["data-theme"],
    });
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    mapRef.current?.flyTo({ center: [center.lng, center.lat], zoom: 13 });
  }, [center, ready]);

  useEffect(() => {
    const map = mapRef.current;
    const M = mapLibreRef.current;
    if (!map || !M) return;
    markersRef.current.forEach((marker) => marker.remove());
    markersRef.current.clear();
    results.forEach((result) => {
      const selected = selectedId === result.id;
      const size = selected ? 46 : 40;
      const element = document.createElement("button");
      element.type = "button";
      element.className = "map-marker-shell";
      element.title = result.name;
      element.setAttribute("aria-label", result.name);
      element.setAttribute("aria-pressed", String(selected));
      element.innerHTML = `<span class="map-marker ${selected ? "map-marker-selected" : ""}" style="--marker:${colors[result.category]}"><img src="${iconPaths[result.category]}" alt="" /></span>`;
      const marker = new M.Marker({ element, anchor: "center" })
        .setLngLat([result.lng, result.lat])
        .addTo(map);
      const popup = new M.Popup({
        closeButton: false,
        maxWidth: "290px",
        offset: size / 2 + 8,
      })
        .setLngLat([result.lng, result.lat])
        .setHTML(popupHtml(result));
      marker.setPopup(popup);
      element.addEventListener("click", (event) => {
        event.stopPropagation();
        if (selected) popup.addTo(map);
        onSelect(result);
      });
      markersRef.current.set(result.id, marker);
      if (selected) popup.addTo(map);
    });
  }, [ready, results, selectedId, onSelect]);

  useEffect(() => {
    const selected = results.find((result) => result.id === selectedId);
    if (selected)
      mapRef.current?.flyTo({ center: [selected.lng, selected.lat], zoom: 15 });
  }, [ready, results, selectedId]);

  useEffect(() => {
    const map = mapRef.current;
    const M = mapLibreRef.current;
    userMarkerRef.current?.remove();
    userMarkerRef.current = null;
    if (!map || !M || !userLocation) return;
    const element = document.createElement("button");
    element.type = "button";
    element.className = "map-user-marker";
    element.setAttribute("aria-label", "Sua localização aproximada");
    userMarkerRef.current = new M.Marker({ element, anchor: "center" })
      .setLngLat([userLocation.lng, userLocation.lat])
      .setPopup(
        new M.Popup({ offset: 14 }).setText("Sua localização aproximada"),
      )
      .addTo(map);
  }, [ready, userLocation]);

  return { elementRef, mapRef, mapError };
}
