"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";

type StatusCount = { status: string; total: number };
type Overview = {
  generatedAt: string;
  users: number;
  newUsers: number;
  activeSessions: number;
  animals: StatusCount[];
  items: StatusCount[];
  adoptions: StatusCount[];
  donations: StatusCount[];
  recentUsers: { id: string; name: string; role: string | null; city: string | null; state: string | null; createdAt: string }[];
};
const number = new Intl.NumberFormat("pt-BR");
const total = (rows: StatusCount[]) => rows.reduce((sum, row) => sum + row.total, 0);

function StatusPanel({ title, description, rows }: { title: string; description: string; rows: StatusCount[] }) {
  const sum = total(rows);
  return (
    <section className="rounded-2xl border border-[#e1e8e2] bg-white p-6">
      <div className="flex items-start justify-between gap-4"><div><h2 className="font-bold text-[#253129]">{title}</h2><p className="mt-1 text-xs text-[#68726b]">{description}</p></div><span className="rounded-lg bg-[#eef7f0] px-3 py-1 text-sm font-bold text-[#256441]">{number.format(sum)}</span></div>
      {rows.length === 0 ? <p className="py-8 text-sm text-[#68726b]">Nenhum registro por aqui ainda.</p> : <ul className="mt-6 space-y-4">{rows.map((row) => (
        <li key={row.status}><div className="mb-2 flex justify-between gap-3 text-sm"><span className="text-[#4d5b53]">{row.status}</span><strong>{number.format(row.total)}</strong></div><div aria-hidden="true" className="h-1.5 overflow-hidden rounded-full bg-[#eef3ef]"><div className="h-full rounded-full bg-[#43805a]" style={{ width: `${sum ? row.total / sum * 100 : 0}%` }} /></div></li>
      ))}</ul>}
    </section>
  );
}

export default function AdminPage() {
  const [data, setData] = useState<Overview | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [access, setAccess] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [version, setVersion] = useState(0);

  useEffect(() => {
    const controller = new AbortController();
    async function load() {
      try {
        const base = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";
        const response = await fetch(`${base}/api/admin/overview`, { credentials: "include", cache: "no-store", signal: controller.signal });
        if (!response.ok) {
          setAccess(response.status);
          throw new Error(response.status === 401 ? "Entre na sua conta para acessar o painel." : response.status === 403 ? "Esta área é exclusiva para administradores." : "Não foi possível carregar o painel. Tente novamente.");
        }
        const overview: Overview = await response.json();
        if (!controller.signal.aborted) { setData(overview); setError(null); setAccess(null); }
      } catch (cause) {
        if (!controller.signal.aborted) { setData(null); setError(cause instanceof Error ? cause.message : "Não foi possível conectar ao servidor."); }
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    }
    void load();
    return () => controller.abort();
  }, [version]);

  function refresh() { setLoading(true); setData(null); setError(null); setVersion((value) => value + 1); }

  return (
    <div className="min-h-screen bg-[#f7faf7] text-[#253129]">
      <SiteHeader />
      <main className="mx-auto max-w-[1200px] px-4 py-8 pb-24 sm:px-6 lg:px-12 lg:py-12">
        <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
          <div><Link href="/" className="text-xs font-semibold text-[#68726b] hover:underline">← Voltar ao site</Link><p className="mt-6 text-xs font-bold uppercase tracking-[0.18em] text-[#43805a]">Administração</p><h1 className="mt-2 text-3xl font-extrabold tracking-tight sm:text-4xl">Visão geral do sistema</h1><p className="mt-3 text-sm text-[#68726b]">Acompanhe a comunidade e as oportunidades de ajudar.</p></div>
          {data && <button onClick={refresh} disabled={loading} className="rounded-xl border border-[#cadbce] bg-white px-5 py-3 text-sm font-bold text-[#256441] hover:bg-[#eef7f0] disabled:opacity-50">Atualizar dados</button>}
        </div>

        {loading && <div role="status" className="rounded-2xl border border-[#e1e8e2] bg-white p-10 text-center text-[#68726b]">Carregando informações do sistema…</div>}
        {!loading && error && <section role="alert" className="rounded-2xl border border-[#e1e8e2] bg-white p-8"><h2 className="text-lg font-bold">{access === 403 ? "Acesso restrito" : access === 401 ? "Autenticação necessária" : "Painel indisponível"}</h2><p className="mt-2 text-sm text-[#68726b]">{error}</p><div className="mt-5 flex gap-4">{access === 401 ? <Link href="/login" className="font-bold text-[#256441] hover:underline">Entrar</Link> : access !== 403 && <button onClick={refresh} className="font-bold text-[#256441] hover:underline">Tentar novamente</button>}<Link href="/" className="text-sm text-[#68726b] hover:underline">Voltar ao início</Link></div></section>}

        {data && !loading && <>
          <section className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4" aria-label="Indicadores gerais">
            {[
              { label: "Usuários cadastrados", value: data.users, detail: `${number.format(data.newUsers)} novos nos últimos 7 dias` },
              { label: "Animais publicados", value: total(data.animals), detail: "Todas as situações" },
              { label: "Itens para doação", value: total(data.items), detail: "Anúncios cadastrados" },
              { label: "Sessões válidas", value: data.activeSessions, detail: "Sessões ainda não expiradas" },
            ].map((card, index) => <article key={card.label} className={`rounded-2xl border p-6 ${index === 0 ? "border-[#256441] bg-[#256441] text-white" : "border-[#e1e8e2] bg-white"}`}><p className={`text-sm font-semibold ${index === 0 ? "text-white/80" : "text-[#68726b]"}`}>{card.label}</p><p className="my-3 text-4xl font-extrabold tracking-tight">{number.format(card.value)}</p><p className={`text-xs ${index === 0 ? "text-white/75" : "text-[#68726b]"}`}>{card.detail}</p></article>)}
          </section>
          <div className="grid gap-5 md:grid-cols-2">
            <StatusPanel title="Animais" description="Situação das publicações" rows={data.animals} />
            <StatusPanel title="Itens para doação" description="Situação dos anúncios" rows={data.items} />
            <StatusPanel title="Solicitações de adoção" description="Distribuição por situação" rows={data.adoptions} />
            <StatusPanel title="Solicitações de itens" description="Distribuição por situação" rows={data.donations} />
          </div>
          <section className="mt-6 overflow-hidden rounded-2xl border border-[#e1e8e2] bg-white">
            <div className="p-6"><h2 className="font-bold">Cadastros recentes</h2><p className="mt-1 text-xs text-[#68726b]">As últimas oito contas da comunidade.</p></div>
            {data.recentUsers.length === 0 ? <p className="px-6 pb-6 text-sm text-[#68726b]">Nenhum usuário cadastrado.</p> : <div className="overflow-x-auto"><table className="w-full text-left text-sm"><caption className="sr-only">Usuários cadastrados recentemente</caption><thead className="border-y border-[#e1e8e2] bg-[#f7faf7] text-xs text-[#68726b]"><tr>{["Nome", "Localização", "Perfil", "Cadastro"].map((label) => <th scope="col" key={label} className="px-6 py-3 font-semibold">{label}</th>)}</tr></thead><tbody className="divide-y divide-[#eef3ef]">{data.recentUsers.map((person) => <tr key={person.id}><td className="px-6 py-4 font-semibold">{person.name}</td><td className="px-6 py-4 text-[#68726b]">{[person.city, person.state].filter(Boolean).join(" / ") || "Não informada"}</td><td className="px-6 py-4"><span className="rounded-full bg-[#eef7f0] px-3 py-1 text-xs font-semibold text-[#256441]">{person.role?.split(",").includes("admin") ? "Administrador" : "Usuário"}</span></td><td className="whitespace-nowrap px-6 py-4 text-[#68726b]">{new Date(person.createdAt).toLocaleDateString("pt-BR")}</td></tr>)}</tbody></table></div>}
          </section>
          <p className="mt-5 text-right text-xs text-[#68726b]">Atualizado em {new Date(data.generatedAt).toLocaleString("pt-BR")}</p>
        </>}
      </main>
      <SiteFooter />
    </div>
  );
}
