"use client";

import { useEffect, useRef } from "react";
import type { MapCategory } from "@/types/map";
import { MapCategoryIcon } from "@/components/map/map-category-icon";

const filters: Array<{ value: MapCategory; label: string }> = [
  { value: "adoption", label: "Adoção" }, { value: "donation", label: "Doações" },
  { value: "veterinary", label: "Veterinários" }, { value: "pet_shop", label: "Pet Shops" },
  { value: "shelter", label: "ONGs / Abrigos" },
];

export function MapFilterChips({ value, onChange }: { value: MapCategory; onChange: (value: MapCategory) => void }) {
  const scrollRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const element = scrollRef.current;
    if (!element) return;
    const onWheel = (event: globalThis.WheelEvent) => {
      if (Math.abs(event.deltaY) <= Math.abs(event.deltaX)) return;
      event.preventDefault();
      element.scrollBy({ left: event.deltaY, behavior: "smooth" });
    };
    element.addEventListener("wheel", onWheel, { passive: false });
    return () => element.removeEventListener("wheel", onWheel);
  }, []);
  function move(direction: -1 | 1) {
    scrollRef.current?.scrollBy({ left: direction * 180, behavior: "smooth" });
  }
  return <div className="map-chip-navigation"><button type="button" onClick={() => move(-1)} className="map-chip-arrow hidden !h-9 lg:grid" aria-label="Categorias anteriores">‹</button><div ref={scrollRef} className="map-chip-scroll flex min-w-0 flex-1 items-center gap-1.5 overflow-x-auto py-0.5 lg:gap-2 lg:py-1" role="group" aria-label="Filtrar resultados do mapa">{filters.map((filter) => <button key={filter.value} type="button" onClick={() => onChange(filter.value)} aria-pressed={value === filter.value} className={`map-filter-chip flex h-8 shrink-0 items-center gap-1.5 whitespace-nowrap rounded-lg border px-3 text-[11px] font-semibold leading-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#256441] lg:h-9 lg:gap-2 lg:px-4 lg:text-xs ${value === filter.value ? "map-filter-chip-active" : ""}`}><MapCategoryIcon category={filter.value} size={15} className={value === filter.value ? "brightness-0 invert" : ""} /><span className="whitespace-nowrap leading-none">{filter.label}</span></button>)}</div><button type="button" onClick={() => move(1)} className="map-chip-arrow hidden !h-9 lg:grid" aria-label="Próximas categorias">›</button></div>;
}
