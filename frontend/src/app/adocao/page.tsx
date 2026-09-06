"use client";

import { useEffect, useMemo, useState } from "react";
import { AnimalCard } from "@/components/animal-card";
import { DirectionalChevron } from "@/components/directional-chevron";
import { SkeletonLoader } from "@/components/skeleton-loader";
import { LoadErrorState } from "@/components/load-error-state";
import { EmptyState } from "@/components/empty-state";
import { ExploreTabs } from "@/components/explore-tabs";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { useSession } from "@/lib/auth-client";
import { distanceInKm, type Coordinates } from "@/lib/map-distance";
import { mapApi } from "@/lib/map-api";
import type { Animal } from "@/data/animals";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

export default function AdoptionPage() {
  const { data: session, isPending: sessionPending } = useSession();
  const [dbAnimals, setDbAnimals] = useState<Animal[]>([]);
  const [distances, setDistances] = useState<Record<string, number>>({});
  const [locationReady, setLocationReady] = useState(false);
  const [loadingAnimals, setLoadingAnimals] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [species, setSpecies] = useState<string[]>([]);
  const [age, setAge] = useState<string[]>([]);
  const [sex, setSex] = useState("Qualquer");
  const [size, setSize] = useState("");
  const [distance, setDistance] = useState(10);
  const [visible, setVisible] = useState(6);
  const [filtersOpen, setFiltersOpen] = useState(true);

  useEffect(() => {
    async function loadAnimals() {
      try {
        const res = await fetch(`${API_BASE_URL}/api/animals`);
        if (!res.ok) throw new Error("Falha ao carregar animais");
        const data = await res.json();
        setDbAnimals(Array.isArray(data) ? data : []);
      } catch {
        setLoadError(true);
      } finally {
        setLoadingAnimals(false);
      }
    }
    loadAnimals();
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

    async function resolveOrigin() {
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
        setDistances(Object.fromEntries(listings.filter((item) => item.category === "adoption").map((item) => [item.id, distanceInKm(origin, item)])));
      } catch {
        if (!cancelled) setDistances({});
      } finally {
        if (!cancelled) setLocationReady(true);
      }
    }

    void resolveOrigin();
    return () => { cancelled = true; };
  }, [session, sessionPending]);

  const activeFilters = species.length + age.length + (sex !== "Qualquer" ? 1 : 0) + (size ? 1 : 0) + (distance !== 10 ? 1 : 0);

  const animals = useMemo(() => dbAnimals.filter((animal) => {
    const matchesSpecies = species.length === 0 || species.includes(animal.species);
    const matchesSex = sex === "Qualquer" || animal.sex === sex;
    const matchesSize = !size || animal.size === size;
    const matchesAge = age.length === 0 || age.includes(ageGroup(animal.age));
    const animalDistance = distances[animal.id];
    const matchesDistance = !locationReady || animalDistance == null || animalDistance <= distance;
    return matchesSpecies && matchesSex && matchesSize && matchesAge && matchesDistance;
  }).map((animal) => distances[animal.id] == null ? animal : ({ ...animal, distance: `${distances[animal.id].toLocaleString("pt-BR", { minimumFractionDigits: 1, maximumFractionDigits: 1 })} km` })), [dbAnimals, age, sex, size, species, distance, distances, locationReady]);

  const clear = () => { setSpecies([]); setAge([]); setSex("Qualquer"); setSize(""); setDistance(10); };
  const toggle = (value: string, values: string[], setter: (values: string[]) => void) => setter(values.includes(value) ? values.filter((item) => item !== value) : [...values, value]);

  return (
    <div className="min-h-screen bg-[#eefdf1] text-[#121e17]">
      <SiteHeader />
      <main className="explore-page mx-auto max-w-[1200px] px-3 py-4 sm:px-10 sm:py-8 lg:px-20 lg:py-12">
        <ExploreTabs />
        <div className="grid items-start gap-4 sm:gap-6 lg:grid-cols-[256px_1fr]">
          <aside className="lg:sticky lg:top-28">
            <details className="group relative overflow-hidden rounded-xl border border-[#d7e6da] bg-white shadow-[0_8px_24px_rgba(38,51,43,0.06)] sm:rounded-2xl" open={filtersOpen}>
              <summary onClick={(event) => { event.preventDefault(); if (window.innerWidth < 1024) setFiltersOpen((value) => !value); }} className="flex cursor-pointer list-none items-center justify-between border-b border-[#e7eee9] bg-[#f7fcf8] px-4 py-2.5 [&::-webkit-details-marker]:hidden sm:px-5 sm:py-4 lg:cursor-default"><div className="flex items-center gap-2"><h2 className="text-base font-semibold sm:text-xl sm:leading-7">Filtros</h2>{activeFilters > 0 && <span className="grid size-5 place-items-center rounded-full bg-[#256441] text-[10px] font-bold text-white">{activeFilters}</span>}</div><div className="flex items-center"><button type="button" onClick={(event) => { event.preventDefault(); event.stopPropagation(); clear(); }} disabled={activeFilters === 0} className="hidden min-h-8 items-center justify-center rounded-lg px-2.5 text-xs font-semibold leading-none text-[#256441] transition hover:bg-[#e8f7eb] disabled:pointer-events-none disabled:text-[#9aa69e] lg:inline-flex">Limpar</button><DirectionalChevron direction="down" className={`text-[#256441] transition-transform lg:hidden ${filtersOpen ? "rotate-90" : ""}`} /></div></summary>
              <div className="flex flex-col px-4 pb-3 sm:px-5 sm:pb-4">
                <FilterChecks title="Espécie" options={["Cachorro", "Gato"]} selected={species} onToggle={(value) => toggle(value, species, setSpecies)} />
                <FilterPills title="Sexo" options={["Qualquer", "Fêmea", "Macho"]} selected={sex} onSelect={setSex} />
                <FilterChecks title="Idade" options={["Filhote (0-1 ano)", "Jovem (1-3 anos)", "Adulto (3-8 anos)", "Sênior (8+ anos)"]} selected={age} onToggle={(value) => toggle(value, age, setAge)} />
                <FilterPills title="Porte" options={["P", "M", "G"]} selected={size} onSelect={setSize} />
                <div className="pt-4"><div className="mb-3 flex items-center justify-between"><h3 className="text-[13px] font-semibold tracking-[0.04em] text-[#4d5b53]">Distância</h3><output className="rounded-full bg-[#e8f7eb] px-2.5 py-1 text-[11px] font-semibold text-[#256441]">Até {distance} km</output></div><input type="range" min="1" max="100" value={distance} onChange={(event) => setDistance(Number(event.target.value))} className="filter-range w-full" style={{ background: `linear-gradient(to right, #256441 0 ${(distance - 1) / 99 * 100}%, #d6e6db ${(distance - 1) / 99 * 100}% 100%)` }} aria-label="Distância máxima" /><div className="mt-1.5 flex justify-between text-[10px] font-medium text-[#7b8980]"><span>1 km</span><span>100 km</span></div></div>
                {activeFilters > 0 && <button onClick={clear} className="mt-5 rounded-xl border border-[#256441] py-2.5 text-sm font-semibold text-[#256441] transition hover:bg-[#e8f7eb] lg:hidden">Limpar todos os filtros</button>}
              </div>
            </details>
          </aside>
          <section>
            <div className="mb-4 flex flex-col justify-between gap-2.5 sm:mb-6 sm:flex-row sm:items-end sm:gap-4">
              <div><h1 className="text-xl font-extrabold tracking-[-0.02em] sm:text-[40px] sm:leading-12">Encontre seu novo amigo</h1><p className="mt-0.5 text-xs text-[#404942] sm:mt-1 sm:text-base">{animals.length} animais aguardando adoção perto de você.</p></div>
              <label className="flex items-center gap-2 text-[10px] text-[#404942] sm:text-xs">Ordenar por:<select className="h-8 rounded-lg border border-[#d6e6db] bg-white px-2 text-xs outline-none focus:border-[#256441] sm:h-auto sm:px-3 sm:py-2 sm:text-sm"><option>Mais próximos</option><option>Mais recentes</option></select></label>
            </div>
            {loadingAnimals ? <SkeletonLoader variant="cards" /> : loadError ? <LoadErrorState message="Não foi possível carregar os animais." /> : animals.length ? <div className="grid grid-cols-2 gap-2.5 sm:gap-6 xl:grid-cols-3">{animals.slice(0, visible).map((animal) => <AnimalCard key={animal.id} animal={animal} compactMobile />)}</div> : <EmptyState message="Nenhum animal disponível agora." />}
            {visible < animals.length && <div className="flex justify-center pt-8 sm:pt-14"><button onClick={() => setVisible((value) => value + 3)} className="group flex min-h-9 min-w-40 items-center justify-center gap-1.5 rounded-lg border-2 border-[#256441] px-5 py-2 text-xs font-semibold tracking-[0.04em] text-[#256441] transition-all hover:bg-[#256441] hover:text-white active:scale-[0.98] sm:min-w-56 sm:gap-2 sm:rounded-xl sm:px-8 sm:py-3.5 sm:text-sm">Carregar mais <DirectionalChevron direction="down" /></button></div>}
          </section>
        </div>
      </main>
      <div className="mt-10"><SiteFooter /></div>
    </div>
  );
}

function FilterChecks({ title, options, selected, onToggle }: { title: string; options: string[]; selected: string[]; onToggle: (value: string) => void }) {
  return <section className="border-b border-[#e7eee9] py-4"><h3 className="mb-2 text-[13px] font-semibold tracking-[0.04em] text-[#4d5b53]">{title}</h3><div className="space-y-2">{options.map((option) => <label key={option} className="group/check flex cursor-pointer items-center gap-2.5 text-sm text-[#26332b]"><input type="checkbox" checked={selected.includes(option)} onChange={() => onToggle(option)} className="peer sr-only" /><span className="grid size-[18px] shrink-0 place-items-center rounded-[5px] border border-[#c6d5ca] bg-white text-[12px] font-bold text-white transition group-hover/check:border-[#256441] peer-checked:border-[#256441] peer-checked:bg-[#256441] peer-focus-visible:ring-2 peer-focus-visible:ring-[#256441]/30">{selected.includes(option) ? "✓" : ""}</span><span className="transition-colors group-hover/check:text-[#256441]">{option}</span></label>)}</div></section>;
}

function FilterPills({ title, options, selected, onSelect }: { title: string; options: string[]; selected: string; onSelect: (value: string) => void }) {
  return <section className="border-b border-[#e7eee9] py-4"><h3 className="mb-2 text-[13px] font-semibold tracking-[0.04em] text-[#4d5b53]">{title}</h3><div className="flex flex-wrap gap-1.5">{options.map((option) => <button type="button" key={option} onClick={() => onSelect(option)} className={`min-w-10 rounded-xl border px-3 py-1 text-xs font-semibold transition-all active:scale-95 ${selected === option ? "border-[#256441] bg-[#256441] text-white shadow-sm" : "border-[#c6d5ca] bg-white text-[#4d5b53] hover:border-[#256441] hover:bg-[#eefdf1] hover:text-[#256441]"}`}>{option}</button>)}</div></section>;
}

function ageGroup(age: string) {
  if (!age) return "Filhote (0-1 ano)";
  if (age.includes("mes")) return "Filhote (0-1 ano)";
  const years = Number.parseInt(age, 10);
  if (isNaN(years) || years <= 1) return "Filhote (0-1 ano)";
  if (years <= 3) return "Jovem (1-3 anos)";
  if (years <= 8) return "Adulto (3-8 anos)";
  return "Sênior (8+ anos)";
}
