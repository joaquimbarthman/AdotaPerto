import Image from "next/image";
import { formatDistance } from "@/lib/map-distance";
import type { MapResult } from "@/types/map";
import { MapCategoryIcon } from "@/components/map/map-category-icon";

const labels = { adoption: "Adoção", donation: "Doação", veterinary: "Veterinário", pet_shop: "Pet Shop", shelter: "ONG / Abrigo" };

export function MapResultCard({ result, selected, onSelect }: { result: MapResult; selected: boolean; onSelect: () => void }) {
  const detail = result.category === "adoption" ? [result.breed, result.age].filter(Boolean).join(" • ") : result.itemCategory || result.address || labels[result.category];
  return <button id={`map-result-${result.id}`} type="button" onClick={onSelect} className={`map-result-card group flex w-full gap-4 rounded-lg border p-4 text-left transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#256441] ${selected ? "map-result-card-selected" : ""}`}>
    <div className="map-result-media relative size-24 shrink-0 overflow-hidden rounded-md">{result.image ? <Image src={result.image} alt="" fill sizes="96px" className="object-cover" /> : <div className="grid size-full place-items-center" aria-hidden="true"><MapCategoryIcon category={result.category} size={34} /></div>}</div>
    <span className="min-w-0 flex-1"><span className="flex items-start justify-between gap-2"><strong className="map-result-title truncate text-[15px] font-semibold">{result.name}</strong><small className="map-result-distance shrink-0 rounded-md px-2 py-1 text-[10px] font-semibold">{formatDistance(result.distanceKm)}</small></span><span className="map-result-category mt-1 block text-[11px] font-semibold uppercase tracking-wide">{labels[result.category]}</span><span className="map-result-description mt-2 line-clamp-2 block text-[13px] leading-5">{result.description || detail}</span><span className="map-result-location mt-2.5 flex items-start gap-1.5 text-[11px] leading-4"><Image src="/icons/location.svg" alt="" width={11} height={14} className="mt-px shrink-0 opacity-70" />{result.approximate ? "Localização aproximada • " : ""}{result.region || result.address || detail}</span>{(result.phone || result.email || result.mapsUrl) && <span className="map-result-links mt-2 flex flex-wrap gap-x-3 gap-y-1 text-[11px] font-semibold">{result.phone && <span>Tel. {result.phone}</span>}{result.email && <span className="truncate">{result.email}</span>}{result.mapsUrl && <a href={result.mapsUrl} target="_blank" rel="noreferrer" onClick={(event) => event.stopPropagation()} className="underline-offset-2 hover:underline">Abrir no mapa &gt;</a>}</span>}</span>
  </button>;
}
