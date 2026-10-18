"use client";

import type { Coordinates } from "@/lib/map-distance";
import type { MapResult } from "@/types/map";
import "maplibre-gl/dist/maplibre-gl.css";
import { useMapCanvas } from "./use-map-canvas";

export function MapCanvas({
  center,
  results,
  selectedId,
  userLocation,
  onSelect,
  onLocate,
}: {
  center: Coordinates;
  results: MapResult[];
  selectedId: string | null;
  userLocation: Coordinates | null;
  onSelect: (result: MapResult) => void;
  onLocate: () => void;
}) {
  const { elementRef, mapRef, mapError } = useMapCanvas({
    center,
    results,
    selectedId,
    userLocation,
    onSelect,
  });

  return (
    <div className="map-surface relative min-h-0 flex-1">
      <div
        ref={elementRef}
        className="map-viewport"
        aria-label="Mapa interativo com resultados próximos"
      />
      {mapError ? (
        <div className="map-load-error absolute left-1/2 top-1/2 z-[500] -translate-x-1/2 -translate-y-1/2 text-center">
          <strong>Não foi possível carregar o mapa</strong>
          <span>Atualize a página para tentar novamente.</span>
        </div>
      ) : null}
      <div className="absolute right-4 top-4 z-[500] flex flex-col gap-2">
        <button
          type="button"
          onClick={() => mapRef.current?.zoomIn()}
          className="map-control"
          aria-label="Aumentar zoom"
        >
          +
        </button>
        <button
          type="button"
          onClick={() => mapRef.current?.zoomOut()}
          className="map-control"
          aria-label="Diminuir zoom"
        >
          −
        </button>
        <button
          type="button"
          onClick={onLocate}
          className="map-control mt-2 text-[#256441]"
          aria-label="Usar minha localização"
          title="Minha localização"
        >
          <svg
            viewBox="0 0 24 24"
            width="20"
            height="20"
            fill="none"
            aria-hidden="true"
          >
            <circle
              cx="12"
              cy="12"
              r="4"
              stroke="currentColor"
              strokeWidth="1.8"
            />
            <path
              d="M12 3v2.4M12 18.6V21M3 12h2.4M18.6 12H21"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
            />
          </svg>
        </button>
      </div>
      <div className="map-privacy-note absolute bottom-2 left-1.5 right-1.5 z-[500] whitespace-nowrap rounded-md px-2 py-1 text-center text-[clamp(5px,1.7vw,8px)] leading-none shadow-sm backdrop-blur-md lg:bottom-4 lg:left-1/2 lg:right-auto lg:w-[min(500px,calc(100%-28px))] lg:-translate-x-1/2 lg:whitespace-normal lg:px-5 lg:py-2.5 lg:text-xs lg:leading-4">
        Para sua segurança, localizações residenciais são aproximadas em um raio
        de 2 km.
      </div>
    </div>
  );
}
