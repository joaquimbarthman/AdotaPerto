"use client";

import { useEffect, useMemo, useState } from "react";
import { EmptyState } from "@/components/empty-state";
import { ExploreTabs } from "@/components/explore-tabs";
import { OrganizationNeedCard, type OrganizationNeed } from "@/components/organization-need-card";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { SkeletonLoader } from "@/components/skeleton-loader";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";
const categories = ["Ração", "Medicamentos", "Higiene", "Camas e cobertores", "Transporte", "Brinquedos", "Limpeza", "Serviços", "Outros"];
const priorities = ["Urgente", "Alta", "Média", "Baixa"];

export default function NeedsPage() {
  const [needs, setNeeds] = useState<OrganizationNeed[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [priority, setPriority] = useState("");
  const [filtersOpen, setFiltersOpen] = useState(true);

  useEffect(() => { fetch(`${API}/api/organization-needs`).then((response) => response.ok ? response.json() : Promise.reject()).then((data) => setNeeds(Array.isArray(data) ? data : [])).finally(() => setLoading(false)); }, []);
  const filtered = useMemo(() => needs.filter((need) => (!category || need.category === category) && (!priority || need.priority === priority) && (!search || [need.title, need.description, need.organization?.name].some((value) => value?.toLocaleLowerCase("pt-BR").includes(search.toLocaleLowerCase("pt-BR"))))), [needs, category, priority, search]);
  const activeFilters = Number(Boolean(category)) + Number(Boolean(priority));
  const clear = () => { setCategory(""); setPriority(""); setSearch(""); };

  return <div className="min-h-screen bg-[#eefdf1] text-[#121e17]"><SiteHeader /><main className="explore-page mx-auto max-w-[1200px] px-3 py-4 sm:px-10 sm:py-8 lg:px-20 lg:py-12"><ExploreTabs />
    <div className="grid items-start gap-4 sm:gap-6 lg:grid-cols-[256px_1fr]">
      <aside className="lg:sticky lg:top-28"><details className="group overflow-hidden rounded-xl border border-[#d7e6da] bg-white shadow-[0_8px_24px_rgba(38,51,43,0.06)] sm:rounded-2xl" open={filtersOpen}><summary onClick={(event) => { event.preventDefault(); if (window.innerWidth < 1024) setFiltersOpen((value) => !value); }} className="flex cursor-pointer list-none items-center justify-between border-b border-[#e7eee9] bg-[#f7fcf8] px-4 py-2.5 [&::-webkit-details-marker]:hidden sm:px-5 sm:py-4 lg:cursor-default"><div className="flex items-center gap-2"><h2 className="text-base font-semibold sm:text-xl">Filtros</h2>{activeFilters > 0 && <span className="grid size-5 place-items-center rounded-full bg-[#256441] text-[10px] font-bold text-white">{activeFilters}</span>}</div><button type="button" onClick={(event) => { event.preventDefault(); event.stopPropagation(); clear(); }} disabled={!search && !activeFilters} className="hidden rounded-lg px-2.5 py-1.5 text-xs font-semibold text-[#256441] hover:bg-[#e8f7eb] disabled:text-[#9aa69e] lg:block">Limpar</button></summary>
        <div className="space-y-4 px-4 pb-4 pt-4 sm:px-5"><label className="block text-[13px] font-semibold tracking-[.04em] text-[#4d5b53]">Buscar<input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Necessidade ou ONG" className="mt-2 h-10 w-full rounded-lg border border-[#c6d5ca] bg-white px-3 text-sm font-normal outline-none focus:border-[#256441]" /></label><FilterGroup title="Categoria" values={categories} selected={category} onSelect={setCategory} /><FilterGroup title="Prioridade" values={priorities} selected={priority} onSelect={setPriority} /></div>
      </details></aside>
      <section><div className="mb-4 flex flex-col justify-between gap-2.5 sm:mb-6 sm:flex-row sm:items-end"><div><h1 className="text-xl font-extrabold tracking-[-.02em] sm:text-[40px] sm:leading-12">Necessidades das ONGs</h1><p className="mt-0.5 text-xs text-[#404942] sm:mt-1 sm:text-base">{filtered.length} {filtered.length === 1 ? "necessidade publicada" : "necessidades publicadas"} por organizações verificadas.</p></div></div>{loading ? <SkeletonLoader variant="cards" /> : filtered.length ? <div className="grid grid-cols-2 gap-2.5 sm:gap-6 xl:grid-cols-3">{filtered.map((need) => <OrganizationNeedCard key={need.id} need={need} />)}</div> : <EmptyState message="Nenhuma necessidade encontrada." description="Tente remover alguns filtros ou volte em breve." />}</section>
    </div>
  </main><div className="mt-10"><SiteFooter /></div></div>;
}

function FilterGroup({ title, values, selected, onSelect }: { title: string; values: string[]; selected: string; onSelect: (value: string) => void }) { return <section className="border-t border-[#e7eee9] pt-4"><h3 className="mb-2 text-[13px] font-semibold tracking-[.04em] text-[#4d5b53]">{title}</h3><div className="space-y-2">{values.map((value) => <label key={value} className="flex cursor-pointer items-center gap-2.5 text-sm text-[#26332b]"><input type="radio" name={title} checked={selected === value} onChange={() => onSelect(selected === value ? "" : value)} className="peer sr-only" /><span className="grid size-[18px] place-items-center rounded-full border border-[#c6d5ca] peer-checked:border-[#256441] peer-checked:bg-[#256441]"><span className="size-1.5 rounded-full bg-white" /></span>{value}</label>)}</div></section>; }
