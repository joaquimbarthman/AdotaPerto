"use client";
import { useEffect, useMemo, useState } from "react";
import { ExploreTabs } from "@/components/explore-tabs";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { SkeletonLoader } from "@/components/skeleton-loader";
import { EmptyState } from "@/components/empty-state";
import { OrganizationNeedCard, type OrganizationNeed } from "@/components/organization-need-card";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";
const categories = ["Ração", "Medicamentos", "Higiene", "Camas e cobertores", "Transporte", "Brinquedos", "Limpeza", "Serviços", "Outros"];

export default function NeedsPage() {
  const [needs, setNeeds] = useState<OrganizationNeed[]>([]); const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState(""); const [category, setCategory] = useState(""); const [priority, setPriority] = useState("");
  useEffect(() => { fetch(`${API}/api/organization-needs`).then((r) => r.ok ? r.json() : Promise.reject()).then((data) => setNeeds(Array.isArray(data) ? data : [])).finally(() => setLoading(false)); }, []);
  const filtered = useMemo(() => needs.filter((need) => (!category || need.category === category) && (!priority || need.priority === priority) && (!search || [need.title, need.description, need.organization?.name].some((v) => v?.toLocaleLowerCase("pt-BR").includes(search.toLocaleLowerCase("pt-BR"))))), [needs, category, priority, search]);
  return <div className="min-h-screen bg-[#eefdf1] text-[#121e17]"><SiteHeader /><main className="mx-auto max-w-[1200px] px-3 py-4 sm:px-10 sm:py-8 lg:px-20 lg:py-12"><ExploreTabs />
    <section className="mb-5 overflow-hidden rounded-2xl bg-[#194b30] px-5 py-6 text-white sm:px-8 sm:py-8"><p className="text-xs font-bold uppercase tracking-[0.14em] text-[#aff1c4]">Rede de solidariedade</p><h1 className="mt-1 text-2xl font-extrabold sm:text-4xl">O que as ONGs precisam agora</h1><p className="mt-2 max-w-2xl text-sm leading-6 text-[#dcefe2]">Encontre necessidades reais de organizações verificadas e entre em contato para transformar uma doação em cuidado.</p></section>
    <div className="mb-5 grid gap-2 rounded-xl border border-[#d7e6da] bg-white p-3 sm:grid-cols-[1fr_220px_180px] sm:p-4"><input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Buscar necessidade ou ONG..." className="h-11 rounded-lg border border-[#c6d5ca] px-4 text-sm outline-none focus:border-[#256441]"/><select value={category} onChange={(e) => setCategory(e.target.value)} className="h-11 rounded-lg border border-[#c6d5ca] px-3 text-sm"><option value="">Todas as categorias</option>{categories.map((c) => <option key={c}>{c}</option>)}</select><select value={priority} onChange={(e) => setPriority(e.target.value)} className="h-11 rounded-lg border border-[#c6d5ca] px-3 text-sm"><option value="">Toda prioridade</option>{["Urgente", "Alta", "Média", "Baixa"].map((p) => <option key={p}>{p}</option>)}</select></div>
    <div className="mb-4 flex items-end justify-between"><div><h2 className="text-xl font-extrabold sm:text-3xl">Necessidades publicadas</h2><p className="text-xs text-[#5b675f] sm:text-sm">{filtered.length} {filtered.length === 1 ? "necessidade encontrada" : "necessidades encontradas"}</p></div></div>
    {loading ? <SkeletonLoader variant="cards" /> : filtered.length ? <div className="grid grid-cols-2 gap-2.5 sm:gap-6 lg:grid-cols-3">{filtered.map((need) => <OrganizationNeedCard key={need.id} need={need} />)}</div> : <EmptyState message="Nenhuma necessidade encontrada." description="Tente alterar os filtros ou volte em breve." />}
  </main><SiteFooter /></div>;
}
