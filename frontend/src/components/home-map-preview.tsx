"use client";

import { useEffect, useRef, useState } from "react";
import "maplibre-gl/dist/maplibre-gl.css";
import type { Map as MapLibreMap } from "maplibre-gl";
import { currentMapStyle } from "@/lib/map-style";
import { loadMapLibre } from "@/lib/map-runtime";
import { configureMapImages } from "@/lib/map-images";

export function HomeMapPreview() {
  const elementRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<MapLibreMap | null>(null);
  const [mapError, setMapError] = useState(false);

  useEffect(() => {
    let cancelled = false;
    let observer: MutationObserver | undefined;
    let resizeObserver: ResizeObserver | undefined;

    void loadMapLibre().then((M) => {
      if (cancelled || !elementRef.current) return;
      const map = new M.Map({
        container: elementRef.current,
        style: currentMapStyle(),
        center: [-46.6333, -23.5505],
        zoom: 12,
        interactive: false,
        attributionControl: false,
      });
      mapRef.current = map;
      configureMapImages(map);
      map.addControl(new M.AttributionControl({ compact: false }), "bottom-right");
      map.on("error", () => { if (!cancelled) setMapError(true); });
      map.on("idle", () => { if (!cancelled) setMapError(false); });

      const addLayer = () => {
        setMapError(false);
        map.setStyle(currentMapStyle());
      };

      const previewPoints = [
        { position: [-23.544, -46.642] as [number, number], icon: "/icons/adocao.svg", color: "#256441", label: "Animal para adoção" },
        { position: [-23.555, -46.624] as [number, number], icon: "/icons/map-box.svg", color: "#3f7d58", label: "Doação disponível" },
        { position: [-23.562, -46.646] as [number, number], icon: "/icons/map-stethoscope.svg", color: "#2f6f63", label: "Atendimento veterinário" },
        { position: [-23.538, -46.622] as [number, number], icon: "/icons/map-house.svg", color: "#315d46", label: "ONG ou abrigo" },
      ];
      previewPoints.forEach((point) => {
        const element = document.createElement("div");
        element.className = "map-marker-shell";
        element.title = point.label;
        element.innerHTML = `<span class="map-marker home-map-marker" style="--marker:${point.color}"><img src="${point.icon}" alt="" /></span>`;
        new M.Marker({ element, anchor: "center" }).setLngLat([point.position[1], point.position[0]]).addTo(map);
      });
      observer = new MutationObserver(addLayer);
      observer.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
      resizeObserver = new ResizeObserver(() => map.resize());
      resizeObserver.observe(elementRef.current);
    }).catch(() => { if (!cancelled) setMapError(true); });

    return () => {
      cancelled = true;
      observer?.disconnect();
      resizeObserver?.disconnect();
      mapRef.current?.remove();
      mapRef.current = null;
    };
  }, []);

  return <>
    <div ref={elementRef} className="map-viewport" aria-label="Prévia do mapa de adoção e serviços próximos" />
    {mapError ? <div role="status" className="map-load-error absolute left-1/2 top-1/2 z-10 -translate-x-1/2 -translate-y-1/2 text-center"><strong>Não foi possível carregar o mapa</strong><span>Atualize a página para tentar novamente.</span></div> : null}
  </>;
}
