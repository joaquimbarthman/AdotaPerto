import Image from "next/image";
import { FormEvent } from "react";
import { MapFilterChips } from "@/components/map/map-filter-chips";
import { MapResultCard } from "@/components/map/map-result-card";
import type { MapCategory, MapResult } from "@/types/map";

export function MapSidebar({ category, results, selectedId, loading, error, search, onSearchChange, onSearch, onCategory, onSelect }: { category: MapCategory; results: MapResult[]; selectedId: string | null; loading: boolean; error: string | null; search: string; onSearchChange: (value: string) => void; onSearch: () => void; onCategory: (value: MapCategory) => void; onSelect: (result: MapResult) => void }) {
  function submit(event: FormEvent) { event.preventDefault(); onSearch(); }
  const visibleError = error && !/abort|signal/i.test(error) ? error : null;
  return <aside className="map-sidebar relative z-10 flex min-h-0 flex-col border-r shadow-[8px_0_28px_rgba(38,51,43,0.04)] lg:w-[480px] lg:shrink-0">
    <div className="map-sidebar-header border-b px-5 pb-5 pt-5 backdrop-blur-sm sm:px-6 sm:pb-6 sm:pt-6">
      <div className="flex items-center justify-between gap-4"><div><h1 className="text-2xl font-semibold leading-8 tracking-[-0.025em] text-[#256441]">Explorar Mapa</h1><p className="mt-0.5 text-xs text-[#707971]">Encontre cuidado e companhia por perto</p></div>{!loading && <span className="map-result-count rounded-md px-3 py-1.5 text-xs font-bold">{results.length} {results.length === 1 ? "resultado" : "resultados"}</span>}</div>
      <form onSubmit={submit} className="map-search-form relative mt-4"><label htmlFor="map-search" className="sr-only">Buscar por cidade, bairro ou CEP</label><Image src="/icons/map-search.svg" alt="" width={20} height={20} className="map-search-icon pointer-events-none absolute left-4 top-1/2 -translate-y-1/2" /><input id="map-search" value={search} onChange={(event) => onSearchChange(event.target.value)} placeholder="Buscar por cidade, bairro ou CEP..." className="map-search-input h-[50px] w-full rounded-lg border pl-12 pr-12 text-base outline-none transition" /><button type="submit" disabled={loading} className="map-search-button absolute right-2 top-1/2 grid size-9 -translate-y-1/2 place-items-center rounded-md text-lg font-bold transition focus-visible:outline-2 focus-visible:outline-[#256441] disabled:opacity-50" aria-label="Buscar localização">{loading ? <span className="size-4 animate-spin rounded-full border-2 border-[#86a590] border-t-[#256441]" /> : ">"}</button></form>
      <div className="mt-3"><MapFilterChips value={category} onChange={onCategory} /></div>
    </div>
    <div className="map-results-scroll min-h-0 flex-1 overflow-y-auto px-5 py-5 sm:px-6">{visibleError && <div role="alert" className="map-sidebar-error mb-4 rounded-xl px-3 py-2 text-xs">Não foi possível atualizar os resultados.</div>}{loading ? <div className="space-y-3">{[1,2,3].map((item) => <div key={item} className="skeleton-shimmer h-[130px] rounded-xl" />)}</div> : results.length ? <div className="space-y-3">{results.map((result) => <MapResultCard key={result.id} result={result} selected={selectedId === result.id} onSelect={() => onSelect(result)} />)}</div> : <div className="map-empty-state"><strong>Nenhum resultado nesta região</strong></div>}</div>
  </aside>;
}
