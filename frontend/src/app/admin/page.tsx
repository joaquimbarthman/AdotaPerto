"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useState, type ReactNode } from "react";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";

type StatusCount = { status: string; total: number };
type Overview = {
  generatedAt: string; users: number; newUsers: number; activeSessions: number;
  animals: StatusCount[]; items: StatusCount[]; adoptions: StatusCount[]; donations: StatusCount[];
  recentUsers: { id: string; name: string; role: string | null; city: string | null; state: string | null; createdAt: string }[];
};

const number = new Intl.NumberFormat("pt-BR");
const total = (rows: StatusCount[]) => rows.reduce((sum, row) => sum + row.total, 0);
const statusTone: Record<string, string> = {
  disponível: "admin-status-green", disponivel: "admin-status-green", aprovado: "admin-status-green", aprovada: "admin-status-green",
  adotado: "admin-status-blue", adotada: "admin-status-blue", doado: "admin-status-blue", doada: "admin-status-blue",
  pendente: "admin-status-amber", "em análise": "admin-status-amber", pausado: "admin-status-muted", pausada: "admin-status-muted",
  recusado: "admin-status-red", recusada: "admin-status-red", cancelado: "admin-status-red", cancelada: "admin-status-red",
};
const statusLabels: Record<string, string> = {
  pending: "Em análise",
  approved: "Aprovada",
  rejected: "Recusada",
  canceled: "Cancelada",
  cancelled: "Cancelada",
  available: "Disponível",
  paused: "Pausado",
  adopted: "Adotado",
  donated: "Doado",
};

function translateStatus(status: string) {
  return statusLabels[status.trim().toLocaleLowerCase("pt-BR")] || status;
}

function AnimalAdminIcon() {
  return <Image src="/icons/adocao.svg" alt="" width={22} height={22} className="admin-animal-icon" />;
}

function DashboardIcon({ name }: { name: "users" | "gift" | "session" | "refresh" | "shield" | "clock" }) {
  const props = { viewBox: "0 0 24 24", className: "size-5", fill: "none", stroke: "currentColor", strokeWidth: 1.9, strokeLinecap: "round" as const, strokeLinejoin: "round" as const, "aria-hidden": true };
  if (name === "users") return <svg {...props}><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" /></svg>;
  if (name === "gift") return <svg {...props}><path d="M20 12v9H4v-9M2 7h20v5H2zM12 22V7M12 7H7.5A2.5 2.5 0 1 1 10 4.5L12 7Zm0 0h4.5A2.5 2.5 0 1 0 14 4.5L12 7Z" /></svg>;
  if (name === "session") return <svg {...props}><rect x="3" y="4" width="18" height="16" rx="3" /><path d="M7 9h10M7 13h4M7 17h7" /><circle cx="17" cy="16" r="2.5" /><path d="m16 16 1 1 2-2" /></svg>;
  if (name === "refresh") return <svg {...props}><path d="M20 6v5h-5M4 18v-5h5" /><path d="M18.5 9A7 7 0 0 0 6.3 5.7L4 8m16 8-2.3 2.3A7 7 0 0 1 5.5 15" /></svg>;
  if (name === "shield") return <svg {...props}><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Z" /><path d="m9 12 2 2 4-4" /></svg>;
  return <svg {...props}><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></svg>;
}

function StatusPanel({ title, description, rows, icon }: { title: string; description: string; rows: StatusCount[]; icon: ReactNode }) {
  const sum = total(rows);
  return <section className="admin-card admin-status-panel">
    <div className="flex items-center justify-between gap-4"><div className="flex min-w-0 items-center gap-3"><span className="admin-panel-icon">{icon}</span><div><h2 className="admin-card-title">{title}</h2><p className="admin-muted mt-1 text-xs">{description}</p></div></div><span className="admin-total-badge">{number.format(sum)}</span></div>
    {rows.length === 0 ? <div className="admin-empty-state">Nenhum registro por aqui ainda.</div> : <ul className="mt-7 space-y-5">{rows.map((row) => {
      const label = translateStatus(row.status);
      const tone = statusTone[label.toLocaleLowerCase("pt-BR")] || "admin-status-green";
      const percentage = sum ? Math.round(row.total / sum * 100) : 0;
      return <li key={row.status}><div className="mb-2 flex items-center justify-between gap-3 text-sm"><span className="admin-status-label"><i className={tone} />{label}</span><span className="admin-status-value">{number.format(row.total)} <small>{percentage}%</small></span></div><div aria-hidden="true" className="admin-progress"><div className={tone} style={{ width: `${percentage}%` }} /></div></li>;
    })}</ul>}
  </section>;
}

function MetricCard({ label, value, detail, icon, featured = false }: { label: string; value: number; detail: string; icon: ReactNode; featured?: boolean }) {
  return <article className={`admin-metric-card ${featured ? "admin-metric-featured" : ""}`}><div className="flex items-center justify-between gap-3"><p className="admin-metric-label">{label}</p><span className="admin-metric-icon">{icon}</span></div><p className="admin-metric-value">{number.format(value)}</p><p className="admin-metric-detail">{detail}</p></article>;
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
        if (!response.ok) { setAccess(response.status); throw new Error(response.status === 401 ? "Entre na sua conta para acessar o painel." : response.status === 403 ? "Esta área é exclusiva para administradores." : "Não foi possível carregar o painel. Tente novamente."); }
        const overview: Overview = await response.json();
        if (!controller.signal.aborted) { setData(overview); setError(null); setAccess(null); }
      } catch (cause) {
        if (!controller.signal.aborted) { setData(null); setError(cause instanceof Error ? cause.message : "Não foi possível conectar ao servidor."); }
      } finally { if (!controller.signal.aborted) setLoading(false); }
    }
    void load(); return () => controller.abort();
  }, [version]);

  function refresh() { setLoading(true); setData(null); setError(null); setVersion((value) => value + 1); }

  return <div className="admin-shell min-h-screen"><SiteHeader />
    <main className="mx-auto max-w-[1200px] px-4 pb-28 pt-7 sm:px-6 lg:px-12 lg:pb-14 lg:pt-10">
      <Link href="/" className="admin-back-button"><svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="m12.5 15-5-5 5-5" /></svg><span>Voltar ao site</span></Link>
      <header className="admin-hero"><div className="relative z-10 max-w-2xl"><div className="admin-eyebrow"><DashboardIcon name="shield" />Área administrativa</div><h1>Visão geral do sistema</h1><p>Acompanhe o crescimento da comunidade, as publicações e as solicitações em um só lugar.</p></div><div className="admin-hero-decoration" aria-hidden="true"><span /><span /><span /></div>{data && <button onClick={refresh} disabled={loading} className="admin-refresh-button"><DashboardIcon name="refresh" /><span>Atualizar dados</span></button>}</header>

      {loading && <div role="status" className="admin-card admin-loading"><span className="admin-loader" /><div><strong>Preparando seu painel</strong><p>Buscando as informações mais recentes do sistema…</p></div></div>}
      {!loading && error && <section role="alert" className="admin-card admin-error-state"><span className="admin-error-icon">!</span><div><h2>{access === 403 ? "Acesso restrito" : access === 401 ? "Autenticação necessária" : "Painel indisponível"}</h2><p>{error}</p><div className="mt-5 flex flex-wrap gap-3">{access === 401 ? <Link href="/login" className="admin-primary-link">Entrar na conta</Link> : access !== 403 && <button onClick={refresh} className="admin-primary-link">Tentar novamente</button>}<Link href="/" className="admin-secondary-link">Voltar ao início</Link></div></div></section>}

      {data && !loading && <>
        <section className="admin-metrics-grid" aria-label="Indicadores gerais"><MetricCard featured label="Usuários cadastrados" value={data.users} detail={`${number.format(data.newUsers)} novos nos últimos 7 dias`} icon={<DashboardIcon name="users" />} /><MetricCard label="Animais publicados" value={total(data.animals)} detail="Em todas as situações" icon={<AnimalAdminIcon />} /><MetricCard label="Itens para doação" value={total(data.items)} detail="Anúncios cadastrados" icon={<DashboardIcon name="gift" />} /><MetricCard label="Sessões válidas" value={data.activeSessions} detail="Sessões ainda não expiradas" icon={<DashboardIcon name="session" />} /></section>
        <div className="mb-4 mt-10 flex items-end justify-between gap-4"><div><p className="admin-section-kicker">Distribuição</p><h2 className="admin-section-title">Atividade da plataforma</h2></div><p className="admin-muted hidden max-w-sm text-right text-xs sm:block">Uma leitura rápida da situação atual de anúncios e pedidos.</p></div>
        <div className="grid gap-5 md:grid-cols-2"><StatusPanel title="Animais" description="Situação das publicações" rows={data.animals} icon={<AnimalAdminIcon />} /><StatusPanel title="Itens para doação" description="Situação dos anúncios" rows={data.items} icon={<DashboardIcon name="gift" />} /><StatusPanel title="Solicitações de adoção" description="Distribuição por situação" rows={data.adoptions} icon={<DashboardIcon name="users" />} /><StatusPanel title="Solicitações de itens" description="Distribuição por situação" rows={data.donations} icon={<DashboardIcon name="session" />} /></div>
        <section className="admin-card mt-6 overflow-hidden p-0"><div className="flex items-center justify-between gap-4 px-5 py-5 sm:px-6"><div><p className="admin-section-kicker">Comunidade</p><h2 className="admin-card-title mt-1">Cadastros recentes</h2><p className="admin-muted mt-1 text-xs">As últimas oito contas cadastradas.</p></div><span className="admin-panel-icon hidden sm:grid"><DashboardIcon name="users" /></span></div>{data.recentUsers.length === 0 ? <p className="admin-muted px-6 pb-6 text-sm">Nenhum usuário cadastrado.</p> : <div className="admin-table-wrap overflow-x-auto"><table className="admin-table w-full text-left text-sm"><caption className="sr-only">Usuários cadastrados recentemente</caption><thead><tr>{["Nome", "Localização", "Perfil", "Cadastro"].map((label) => <th scope="col" key={label}>{label}</th>)}</tr></thead><tbody>{data.recentUsers.map((person) => <tr key={person.id}><td data-label="Nome"><span className="admin-avatar">{person.name.charAt(0).toUpperCase()}</span><strong>{person.name}</strong></td><td data-label="Localização" className="admin-muted">{[person.city, person.state].filter(Boolean).join(" / ") || "Não informada"}</td><td data-label="Perfil"><span className={person.role?.split(",").includes("admin") ? "admin-role-badge admin-role-manager" : "admin-role-badge"}>{person.role?.split(",").includes("admin") ? "Administrador" : "Usuário"}</span></td><td data-label="Cadastro" className="admin-muted whitespace-nowrap">{new Date(person.createdAt).toLocaleDateString("pt-BR")}</td></tr>)}</tbody></table></div>}</section>
        <p className="admin-updated"><DashboardIcon name="clock" />Atualizado em {new Date(data.generatedAt).toLocaleString("pt-BR")}</p>
      </>}
    </main><SiteFooter />
  </div>;
}
