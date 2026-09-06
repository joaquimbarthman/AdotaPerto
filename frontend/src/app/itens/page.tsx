"use client";

import { useEffect, useMemo, useState } from "react";
import { DirectionalChevron } from "@/components/directional-chevron";
import { SkeletonLoader } from "@/components/skeleton-loader";
import { LoadErrorState } from "@/components/load-error-state";
import { DonationItemCard } from "@/components/donation-item-card";
import { EmptyState } from "@/components/empty-state";
import { ExploreTabs } from "@/components/explore-tabs";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { useSession } from "@/lib/auth-client";
import { distanceInKm, type Coordinates } from "@/lib/map-distance";
import { mapApi } from "@/lib/map-api";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";
const CATEGORY_OPTIONS = ["Ração", "Petiscos", "Produtos de higiene", "Caminhas e cobertores", "Coleiras e guias", "Caixas de transporte", "Brinquedos", "Utensílios", "Produtos de limpeza", "Outros"];
const CONDITION_OPTIONS = ["Novo", "Lacrado", "Aberto em boas condições", "Usado em boas condições"];

export type DonationItem = {
  id: string; title: string; category: string; itemName: string; quantity: number; unit: string;
  condition: string; description: string; mainImage: string; images?: string[]; deliveryMethod: string;
  availableUntil?: string | null; expirationDate?: string | null; status: string; createdAt?: string; distance?: string;
};

export default function DonationItemsPage() {
  const { data: session, isPending: sessionPending } = useSession();
  const [items, setItems] = useState<DonationItem[]>([]);
  const [distances, setDistances] = useState<Record<string, number>>({});
  const [locationReady, setLocationReady] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [categories, setCategories] = useState<string[]>([]);
  const [conditions, setConditions] = useState<string[]>([]);
  const [distance, setDistance] = useState(10);
  const [sort, setSort] = useState("Mais recentes");
  const [visible, setVisible] = useState(6);
  const [filtersOpen, setFiltersOpen] = useState(true);

  useEffect(() => {
    fetch(`${API_BASE_URL}/api/donation-items`)
      .then(async (response) => { if (!response.ok) throw new Error("Não foi possível carregar as doações."); return response.json(); })
      .then((data) => setItems(Array.isArray(data) ? data : []))
      .catch((cause: unknown) => setError(cause instanceof Error ? cause.message : "Não foi possível carregar as doações."))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (sessionPending) return;
    let cancelled = false;
    const browserLocation = () => new Promise<Coordinates>((resolve, reject) => {
      if (!navigator.geolocation) return reject(new Error("Geolocalização indisponível"));
      navigator.geolocation.getCurrentPosition(
        ({ coords }) => resolve({ lat: coords.latitude, lng: coords.longitude }),
        reject,
        { enableHighAccuracy: false, timeout: 9000, maximumAge: 300000 },
      );
    });

    async function resolveDistances() {
      try {
        let origin: Coordinates | null = null;
        if (session) {
          const response = await fetch(`${API_BASE_URL}/api/users/me`, { credentials: "include" });
          if (response.ok) {
            const profile = await response.json() as { zipCode?: string | null };
            if (profile.zipCode) origin = await mapApi.geocode(profile.zipCode);
          }
        }
        if (!origin) origin = await browserLocation();
        const listings = await mapApi.listings();
        if (cancelled) return;
        setDistances(Object.fromEntries(listings.filter((item) => item.category === "donation").map((item) => [item.id, distanceInKm(origin, item)])));
      } catch {
        if (!cancelled) setDistances({});
      } finally {
        if (!cancelled) setLocationReady(true);
      }
    }
    void resolveDistances();
    return () => { cancelled = true; };
  }, [session, sessionPending]);

  const activeFilters = categories.length + conditions.length + (distance !== 10 ? 1 : 0);
  const filteredItems = useMemo(() => {
    const result = items.filter((item) => (!categories.length || categories.includes(item.category)) && (!conditions.length || conditions.includes(item.condition)) && (!locationReady || distances[item.id] == null || distances[item.id] <= distance)).map((item) => distances[item.id] == null ? item : ({ ...item, distance: `${distances[item.id].toLocaleString("pt-BR", { minimumFractionDigits: 1, maximumFractionDigits: 1 })} km` }));
    return [...result].sort((a, b) => sort === "Maior quantidade" ? b.quantity - a.quantity : new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
  }, [items, categories, conditions, sort, distance, distances, locationReady]);

  const toggle = (value: string, values: string[], setter: (next: string[]) => void) => { setter(values.includes(value) ? values.filter((item) => item !== value) : [...values, value]); setVisible(6); };
  const clear = () => { setCategories([]); setConditions([]); setDistance(10); setVisible(6); };

  return <div className="min-h-screen bg-[#eefdf1] text-[#121e17]">
    <SiteHeader />
    <main className="explore-page mx-auto max-w-[1200px] px-3 py-4 sm:px-10 sm:py-8 lg:px-20 lg:py-12">
      <ExploreTabs />
      <div className="grid items-start gap-4 sm:gap-6 lg:grid-cols-[256px_1fr]">
        <aside className="lg:sticky lg:top-28">
          <details className="group overflow-hidden rounded-xl border border-[#d7e6da] bg-white shadow-[0_8px_24px_rgba(38,51,43,0.06)] sm:rounded-2xl" open={filtersOpen}>
            <summary onClick={(event) => { event.preventDefault(); if (window.innerWidth < 1024) setFiltersOpen((value) => !value); }} className="flex cursor-pointer list-none items-center justify-between border-b border-[#e7eee9] bg-[#f7fcf8] px-4 py-2.5 [&::-webkit-details-marker]:hidden sm:px-5 sm:py-4 lg:cursor-default">
              <div className="flex items-center gap-2"><h2 className="text-base font-semibold sm:text-xl">Filtros</h2>{activeFilters > 0 && <span className="grid size-5 place-items-center rounded-full bg-[#256441] text-[10px] font-bold text-white">{activeFilters}</span>}</div>
              <div className="flex items-center"><button type="button" onClick={(event) => { event.preventDefault(); event.stopPropagation(); clear(); }} disabled={!activeFilters} className="hidden min-h-8 rounded-lg px-2.5 text-xs font-semibold text-[#256441] hover:bg-[#e8f7eb] disabled:pointer-events-none disabled:text-[#9aa69e] lg:block">Limpar</button><DirectionalChevron direction="down" className={`text-[#256441] transition-transform lg:hidden ${filtersOpen ? "rotate-90" : ""}`} /></div>
            </summary>
            <div className="flex flex-col px-4 pb-3 sm:px-5 sm:pb-4">
              <FilterChecks title="Categoria" options={CATEGORY_OPTIONS} selected={categories} onToggle={(value) => toggle(value, categories, setCategories)} />
              <FilterChecks title="Condição" options={CONDITION_OPTIONS} selected={conditions} onToggle={(value) => toggle(value, conditions, setConditions)} />
              <div className="border-t border-[#e7eee9] pt-4"><div className="mb-3 flex items-center justify-between"><h3 className="text-[13px] font-semibold tracking-[0.04em] text-[#4d5b53]">Distância</h3><output className="rounded-md bg-[#e8f7eb] px-2.5 py-1 text-[11px] font-semibold text-[#256441]">Até {distance} km</output></div><input type="range" min="1" max="100" value={distance} onChange={(event) => { setDistance(Number(event.target.value)); setVisible(6); }} className="filter-range w-full" style={{ background: `linear-gradient(to right, #256441 0 ${(distance - 1) / 99 * 100}%, #d6e6db ${(distance - 1) / 99 * 100}% 100%)` }} aria-label="Distância máxima" /><div className="mt-1.5 flex justify-between text-[10px] font-medium text-[#7b8980]"><span>1 km</span><span>100 km</span></div></div>
              {activeFilters > 0 && <button type="button" onClick={clear} className="mt-5 rounded-xl border border-[#256441] py-2.5 text-sm font-semibold text-[#256441] hover:bg-[#e8f7eb] lg:hidden">Limpar todos os filtros</button>}
            </div>
          </details>
        </aside>
        <section>
          <div className="mb-4 flex flex-col justify-between gap-2.5 sm:mb-6 sm:flex-row sm:items-end sm:gap-4">
            <div><h1 className="text-xl font-extrabold tracking-[-0.02em] sm:text-[40px] sm:leading-12">Itens disponíveis</h1><p className="mt-0.5 text-xs text-[#404942] sm:mt-1 sm:text-base">{filteredItems.length} {filteredItems.length === 1 ? "item disponível" : "itens disponíveis"} para ajudar quem precisa.</p></div>
            <label className="flex items-center gap-2 text-[10px] text-[#404942] sm:text-xs">Ordenar por:<select value={sort} onChange={(event) => setSort(event.target.value)} className="h-8 rounded-lg border border-[#d6e6db] bg-white px-2 text-xs outline-none focus:border-[#256441] sm:h-auto sm:px-3 sm:py-2 sm:text-sm"><option>Mais recentes</option><option>Maior quantidade</option></select></label>
          </div>
          {loading ? <SkeletonLoader variant="cards" /> : error ? <LoadErrorState message="Não foi possível carregar as doações." /> : filteredItems.length ? <div className="grid grid-cols-2 gap-2.5 sm:gap-6 xl:grid-cols-3">{filteredItems.slice(0, visible).map((item) => <DonationItemCard key={item.id} item={item} compactMobile />)}</div> : <EmptyItems filtered={activeFilters > 0} />}
          {visible < filteredItems.length && <div className="flex justify-center pt-8 sm:pt-14"><button type="button" onClick={() => setVisible((value) => value + 3)} className="group flex min-h-9 min-w-40 items-center justify-center gap-1.5 rounded-lg border-2 border-[#256441] px-5 py-2 text-xs font-semibold tracking-[0.04em] text-[#256441] transition hover:bg-[#256441] hover:text-white sm:min-w-56 sm:gap-2 sm:rounded-xl sm:px-8 sm:py-3.5 sm:text-sm">Carregar mais <DirectionalChevron direction="down" /></button></div>}
        </section>
      </div>
    </main>
    <div className="mt-10"><SiteFooter /></div>
  </div>;
}

function FilterChecks({ title, options, selected, onToggle }: { title: string; options: string[]; selected: string[]; onToggle: (value: string) => void }) { return <section className="border-b border-[#e7eee9] py-4"><h3 className="mb-2 text-[13px] font-semibold tracking-[0.04em] text-[#4d5b53]">{title}</h3><div className="space-y-2">{options.map((option) => <label key={option} className="flex cursor-pointer items-start gap-2.5 text-sm text-[#26332b]"><input type="checkbox" checked={selected.includes(option)} onChange={() => onToggle(option)} className="peer sr-only" /><span className="mt-0.5 grid size-[18px] shrink-0 place-items-center rounded-[5px] border border-[#c6d5ca] text-xs font-bold text-white peer-checked:border-[#256441] peer-checked:bg-[#256441]">{selected.includes(option) ? "✓" : ""}</span><span>{option}</span></label>)}</div></section>; }
function EmptyItems({ filtered }: { filtered: boolean }) {
  return <EmptyState message={filtered ? "Nenhum item encontrado com esses filtros." : "Nenhum item disponível agora."} description={filtered ? "Tente remover alguns filtros para ampliar os resultados." : undefined} />;
}
