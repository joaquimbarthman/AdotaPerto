"use client";

import { useMemo, useState } from "react";
import { AnimalCard } from "@/components/animal-card";
import { DirectionalChevron } from "@/components/directional-chevron";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { adoptionAnimals, homeAnimals } from "@/data/animals";

export default function AdoptionPage() {
  const [species, setSpecies] = useState<string[]>([]);
  const [age, setAge] = useState<string[]>([]);
  const [sex, setSex] = useState("Qualquer");
  const [size, setSize] = useState("");
  const [distance, setDistance] = useState(10);
  const [visible, setVisible] = useState(4);
  const [filtersOpen, setFiltersOpen] = useState(true);
  const activeFilters = species.length + age.length + (sex !== "Qualquer" ? 1 : 0) + (size ? 1 : 0) + (distance !== 10 ? 1 : 0);

  const animals = useMemo(() => [...adoptionAnimals, ...homeAnimals].filter((animal) => {
    const matchesSpecies = species.length === 0 || species.includes(animal.species);
    const matchesSex = sex === "Qualquer" || animal.sex === sex;
    const matchesSize = !size || animal.size === size;
    const matchesAge = age.length === 0 || age.includes(ageGroup(animal.age));
    return matchesSpecies && matchesSex && matchesSize && matchesAge;
  }), [age, sex, size, species]);
  const clear = () => { setSpecies([]); setAge([]); setSex("Qualquer"); setSize(""); setDistance(10); };
  const toggle = (value: string, values: string[], setter: (values: string[]) => void) => setter(values.includes(value) ? values.filter((item) => item !== value) : [...values, value]);

  return (
    <div className="min-h-screen bg-[#eefdf1] text-[#121e17]">
      <SiteHeader />
      <main className="mx-auto max-w-[1200px] px-5 py-8 sm:px-10 lg:px-20 lg:py-12">
        <div className="grid items-start gap-6 lg:grid-cols-[256px_1fr]">
          <aside className="lg:sticky lg:top-28">
            <details className="group relative overflow-hidden rounded-2xl border border-[#d7e6da] bg-white shadow-[0_8px_24px_rgba(38,51,43,0.06)]" open={filtersOpen}>
              <summary onClick={(event) => { event.preventDefault(); if (window.innerWidth < 1024) setFiltersOpen((value) => !value); }} className="flex cursor-pointer list-none items-center justify-between border-b border-[#e7eee9] bg-[#f7fcf8] px-5 py-4 [&::-webkit-details-marker]:hidden lg:cursor-default"><div className="flex items-center gap-2"><h2 className="text-xl font-semibold">Filtros</h2>{activeFilters > 0 && <span className="grid size-5 place-items-center rounded-full bg-[#256441] text-[10px] font-bold text-white">{activeFilters}</span>}</div><DirectionalChevron direction="down" className={`text-[#256441] transition-transform lg:hidden ${filtersOpen ? "rotate-90" : ""}`} /></summary>
              <button type="button" onClick={clear} disabled={activeFilters === 0} className="absolute right-4 top-[13px] hidden rounded-lg px-2.5 py-1.5 text-xs font-semibold text-[#256441] transition hover:bg-[#e8f7eb] disabled:pointer-events-none disabled:text-[#9aa69e] lg:block">Limpar</button>
              <div className="flex flex-col px-5 pb-4">
                <FilterChecks title="Espécie" options={["Cachorro", "Gato"]} selected={species} onToggle={(value) => toggle(value, species, setSpecies)} />
                <FilterPills title="Sexo" options={["Qualquer", "Fêmea", "Macho"]} selected={sex} onSelect={setSex} />
                <FilterChecks title="Idade" options={["Filhote (0-1 ano)", "Jovem (1-3 anos)", "Adulto (3-8 anos)", "Sênior (8+ anos)"]} selected={age} onToggle={(value) => toggle(value, age, setAge)} />
                <FilterPills title="Porte" options={["P", "M", "G"]} selected={size} onSelect={setSize} />
                <div className="pt-4"><div className="mb-3 flex items-center justify-between"><h3 className="text-[13px] font-semibold tracking-[0.04em] text-[#4d5b53]">Distância</h3><output className="rounded-full bg-[#e8f7eb] px-2.5 py-1 text-[11px] font-semibold text-[#256441]">Até {distance} km</output></div><input type="range" min="1" max="50" value={distance} onChange={(event) => setDistance(Number(event.target.value))} className="filter-range w-full" style={{ background: `linear-gradient(to right, #256441 0 ${(distance - 1) / 49 * 100}%, #d6e6db ${(distance - 1) / 49 * 100}% 100%)` }} aria-label="Distância máxima" /><div className="mt-1.5 flex justify-between text-[10px] font-medium text-[#7b8980]"><span>1 km</span><span>50 km</span></div></div>
                {(activeFilters > 0 || distance !== 10) && <button onClick={clear} className="mt-5 rounded-xl border border-[#256441] py-2.5 text-sm font-semibold text-[#256441] transition hover:bg-[#e8f7eb] lg:hidden">Limpar todos os filtros</button>}
              </div>
            </details>
          </aside>
          <section>
            <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
              <div><h1 className="text-3xl font-extrabold tracking-[-0.02em] sm:text-[40px] sm:leading-12">Encontre seu novo amigo</h1><p className="mt-1 text-base text-[#404942]">42 animais aguardando adoção perto de você.</p></div>
              <label className="flex items-center gap-2 text-xs text-[#404942]">Ordenar por:<select className="rounded-lg border border-[#d6e6db] bg-white px-3 py-2 text-sm outline-none focus:border-[#256441]"><option>Mais próximos</option><option>Mais recentes</option></select></label>
            </div>
            {animals.length ? <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">{animals.slice(0, visible).map((animal) => <AnimalCard key={animal.id} animal={animal} />)}</div> : <div className="rounded-xl bg-white p-12 text-center text-[#404942]">Nenhum animal encontrado com esses filtros.</div>}
            {visible < animals.length && <div className="flex justify-center pt-14"><button onClick={() => setVisible((value) => value + 3)} className="group flex min-w-56 items-center justify-center gap-2 rounded-xl border-2 border-[#256441] px-8 py-3.5 text-sm font-semibold tracking-[0.05em] text-[#256441] transition-all duration-200 hover:-translate-y-0.5 hover:bg-[#256441] hover:text-white active:scale-[0.98]">Carregar mais <DirectionalChevron direction="down" className="transition-transform group-hover:-translate-x-0.5" /></button></div>}
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
  return <section className="border-b border-[#e7eee9] py-4"><h3 className="mb-2 text-[13px] font-semibold tracking-[0.04em] text-[#4d5b53]">{title}</h3><div className="flex flex-wrap gap-1.5">{options.map((option) => <button type="button" key={option} onClick={() => onSelect(option)} className={`min-w-10 rounded-full border px-3 py-1 text-xs font-semibold transition-all active:scale-95 ${selected === option ? "border-[#256441] bg-[#256441] text-white shadow-sm" : "border-[#c6d5ca] bg-white text-[#4d5b53] hover:border-[#256441] hover:bg-[#eefdf1] hover:text-[#256441]"}`}>{option}</button>)}</div></section>;
}

function ageGroup(age: string) {
  if (age.includes("mes")) return "Filhote (0-1 ano)";
  const years = Number.parseInt(age, 10);
  if (years <= 1) return "Filhote (0-1 ano)";
  if (years <= 3) return "Jovem (1-3 anos)";
  if (years <= 8) return "Adulto (3-8 anos)";
  return "Sênior (8+ anos)";
}
