"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

type Notice = { id: string; title: string; description: string; href: string; createdAt: string; tone: "success" | "info" | "publication" };
type RequestRecord = { id: string; status?: string; createdAt?: string; animal?: { name?: string }; item?: { title?: string; itemName?: string }; requester?: { name?: string } };
type PublicationRecord = { id: string; createdAt?: string; name?: string; title?: string; itemName?: string };

export function NotificationCenter({ userId }: { userId?: string }) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [notices, setNotices] = useState<Notice[]>([]);
  const [readIds, setReadIds] = useState<string[]>([]);
  const rootRef = useRef<HTMLDivElement>(null);
  const storageKey = `adotaperto:notifications-read:${userId || "guest"}`;

  useEffect(() => {
    let active = true;
    async function loadNotifications() {
      setLoading(true);
      try {
        const endpoints = ["/api/adoption-requests", "/api/adoption-requests/received", "/api/donation-item-requests", "/api/donation-item-requests/received", "/api/animals/mine", "/api/donation-items/mine"];
        const responses = await Promise.all(endpoints.map((endpoint) => fetch(`${API_BASE_URL}${endpoint}`, { credentials: "include" })));
        const data = await Promise.all(responses.map(async (response) => response.ok ? response.json() : []));
        if (!active) return;
        const [sentAnimals, receivedAnimals, sentItems, receivedItems, animals, items] = data as [RequestRecord[], RequestRecord[], RequestRecord[], RequestRecord[], PublicationRecord[], PublicationRecord[]];
        const next: Notice[] = [];
        const addSent = (request: RequestRecord, kind: "animal" | "item") => {
          const subject = kind === "animal" ? request.animal?.name || "animal" : request.item?.title || request.item?.itemName || "item";
          const approved = request.status === "Aprovada" || request.status === "APPROVED";
          const refused = request.status === "Recusada" || request.status === "REJECTED";
          next.push({ id: `sent-${kind}-${request.id}-${request.status || "pending"}`, title: approved ? "Solicitação aprovada" : refused ? "Solicitação atualizada" : "Solicitação enviada", description: approved ? `Seu pedido para ${subject} foi aprovado.` : refused ? `Seu pedido para ${subject} não foi aprovado.` : `Seu pedido para ${subject} está em análise.`, href: "/perfil#solicitacoes", createdAt: request.createdAt || new Date(0).toISOString(), tone: approved ? "success" : "info" });
        };
        const addReceived = (request: RequestRecord, kind: "animal" | "item") => {
          const subject = kind === "animal" ? request.animal?.name || "seu animal" : request.item?.title || request.item?.itemName || "seu item";
          next.push({ id: `received-${kind}-${request.id}-${request.status || "pending"}`, title: "Nova solicitação", description: `${request.requester?.name || "Alguém"} demonstrou interesse em ${subject}.`, href: "/perfil#solicitacoes", createdAt: request.createdAt || new Date(0).toISOString(), tone: "info" });
        };
        const addPublication = (publication: PublicationRecord, kind: "animal" | "item") => {
          const subject = kind === "animal" ? publication.name || "Animal" : publication.title || publication.itemName || "Item";
          next.push({ id: `publication-${kind}-${publication.id}`, title: "Publicação ativa", description: `${subject} já está visível para a comunidade.`, href: "/perfil#publicacoes", createdAt: publication.createdAt || new Date(0).toISOString(), tone: "publication" });
        };
        (Array.isArray(sentAnimals) ? sentAnimals : []).forEach((item) => addSent(item, "animal"));
        (Array.isArray(receivedAnimals) ? receivedAnimals : []).forEach((item) => addReceived(item, "animal"));
        (Array.isArray(sentItems) ? sentItems : []).forEach((item) => addSent(item, "item"));
        (Array.isArray(receivedItems) ? receivedItems : []).forEach((item) => addReceived(item, "item"));
        (Array.isArray(animals) ? animals : []).forEach((item) => addPublication(item, "animal"));
        (Array.isArray(items) ? items : []).forEach((item) => addPublication(item, "item"));
        setNotices(next.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).slice(0, 10));
      } finally { if (active) setLoading(false); }
    }
    queueMicrotask(() => {
      if (!active) return;
      if (!userId) { setNotices([]); return; }
      try { setReadIds(JSON.parse(window.localStorage.getItem(storageKey) || "[]")); } catch { setReadIds([]); }
      loadNotifications();
    });
    return () => { active = false; };
  }, [storageKey, userId]);

  useEffect(() => {
    function close(event: MouseEvent) { if (!rootRef.current?.contains(event.target as Node)) setOpen(false); }
    function closeOnEscape(event: KeyboardEvent) { if (event.key === "Escape") setOpen(false); }
    document.addEventListener("mousedown", close); document.addEventListener("keydown", closeOnEscape);
    return () => { document.removeEventListener("mousedown", close); document.removeEventListener("keydown", closeOnEscape); };
  }, []);

  const unread = useMemo(() => notices.filter((notice) => !readIds.includes(notice.id)).length, [notices, readIds]);
  function saveRead(ids: string[]) { setReadIds(ids); window.localStorage.setItem(storageKey, JSON.stringify(ids)); }
  function markAsRead(id: string) { saveRead(Array.from(new Set([...readIds, id]))); setOpen(false); }

  return <div ref={rootRef} className="relative">
    <button type="button" onClick={() => setOpen((value) => !value)} disabled={!userId} className="relative grid size-9 place-items-center rounded-full transition hover:bg-[#e1f2e5] disabled:opacity-50" aria-label={unread ? `Notificações, ${unread} não lidas` : "Notificações"} aria-expanded={open} aria-haspopup="dialog">
      <BellIcon />
      {unread > 0 && <span className="absolute right-0 top-0 grid min-h-4 min-w-4 place-items-center rounded-full bg-red-500 px-1 text-[9px] font-extrabold leading-none text-white ring-2 ring-[#eefdf1]">{unread > 9 ? "9+" : unread}</span>}
    </button>
    <section role="dialog" aria-label="Central de notificações" className={`notification-dropdown absolute right-0 top-[calc(100%+14px)] w-[min(390px,calc(100vw-24px))] origin-top-right overflow-hidden rounded-xl border border-[#dce7df] bg-white shadow-[0_20px_55px_rgba(18,45,29,0.18)] transition-all duration-200 ${open ? "visible translate-y-0 scale-100 opacity-100" : "invisible -translate-y-2 scale-[0.97] opacity-0"}`}>
      <span className="absolute right-3 top-0 h-0.5 w-12 rounded-b-full bg-[#256441]" aria-hidden="true" />
      <header className="flex items-center justify-between gap-4 px-5 pb-4 pt-5"><div className="flex items-center gap-2.5"><h2 className="text-base font-extrabold text-[#253129]">Notificações</h2>{unread > 0 && <span className="rounded-full bg-[#e3f2e6] px-2 py-0.5 text-[11px] font-extrabold text-[#256441]">{unread} nova{unread === 1 ? "" : "s"}</span>}</div>{unread > 0 && <button type="button" onClick={() => saveRead(notices.map((notice) => notice.id))} className="shrink-0 text-[11px] font-bold text-[#526057] transition hover:text-[#256441]">Limpar novas</button>}</header>
      <div className="notification-list max-h-[430px] overflow-y-auto border-y border-[#edf2ee]">
        {loading ? <NotificationSkeleton /> : notices.length === 0 ? <div className="px-6 py-12 text-center"><div className="mx-auto mb-3 grid size-11 place-items-center rounded-full bg-[#e8f7eb] text-[#256441]"><BellIcon /></div><p className="text-sm font-bold text-[#253129]">Nenhuma novidade</p><p className="mx-auto mt-1 max-w-60 text-xs leading-5 text-[#68726b]">Suas atualizações aparecerão aqui quando algo acontecer.</p></div> : notices.map((notice) => {
          const read = readIds.includes(notice.id);
          return <Link key={notice.id} href={notice.href} onClick={() => markAsRead(notice.id)} className={`notification-item group relative flex min-h-[88px] items-start gap-3.5 border-b border-[#edf2ee] px-5 py-4 transition last:border-b-0 hover:bg-[#f5fbf7] ${read ? "notification-item-read opacity-65" : "bg-white"}`}>
            <span data-tone={notice.tone} className={`notification-type-icon grid size-9 shrink-0 place-items-center rounded-full ${notice.tone === "success" ? "bg-emerald-50 text-emerald-700" : notice.tone === "publication" ? "bg-violet-50 text-violet-700" : "bg-blue-50 text-blue-700"}`}><NoticeIcon tone={notice.tone} /></span>
            <span className="min-w-0 flex-1"><span className="flex items-start justify-between gap-3"><strong className="truncate text-[13px] font-extrabold text-[#253129]">{notice.title}</strong><span className="inline-flex shrink-0 items-center gap-1.5 text-[10px] font-medium text-[#859087]">{!read && <span className="size-1.5 rounded-full bg-[#256441]" aria-label="Não lida" />}{formatNoticeDate(notice.createdAt)}</span></span><span className="mt-1 block text-xs leading-[1.55] text-[#68726b]">{notice.description}</span></span>
            <svg viewBox="0 0 20 20" className="absolute bottom-2.5 right-3 size-3.5 text-[#9aa49d] opacity-0 transition group-hover:translate-x-0.5 group-hover:opacity-100" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true"><path d="m7.5 4.5 5 5.5-5 5.5" /></svg>
          </Link>;
        })}
      </div>
      <Link href="/perfil#solicitacoes" onClick={() => setOpen(false)} className="notification-footer flex min-h-12 items-center justify-center gap-1.5 text-xs font-extrabold text-[#256441] transition hover:bg-[#f5fbf7]">Abrir central de solicitações<svg viewBox="0 0 20 20" className="size-3.5" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true"><path d="m7.5 4.5 5 5.5-5 5.5" /></svg></Link>
    </section>
  </div>;
}

function BellIcon() { return <svg viewBox="0 0 24 24" className="size-5 text-[#256441]" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9M10 21h4" /></svg>; }
function NoticeIcon({ tone }: { tone: Notice["tone"] }) { if (tone === "success") return <svg viewBox="0 0 20 20" className="size-4.5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="m4 10 4 4 8-9" /></svg>; if (tone === "publication") return <svg viewBox="0 0 20 20" className="size-4.5" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" aria-hidden="true"><path d="M4 6.5h12v10H4zM3 3.5h14v4H3zM7.5 10.5h5" /></svg>; return <svg viewBox="0 0 20 20" className="size-4.5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M15 7a5 5 0 0 0-10 0c0 5.5-2.5 5.5-2.5 7h15c0-1.5-2.5-1.5-2.5-7M8.5 17h3" /></svg>; }
function formatNoticeDate(value: string) { const date = new Date(value); if (Number.isNaN(date.getTime()) || date.getTime() === 0) return ""; const elapsed = Date.now() - date.getTime(); const minutes = Math.floor(elapsed / 60000); if (minutes < 1) return "agora"; if (minutes < 60) return `${minutes} min`; const hours = Math.floor(minutes / 60); if (hours < 24) return `${hours} h`; const days = Math.floor(hours / 24); if (days < 7) return `${days} d`; return date.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" }); }
function NotificationSkeleton() { return <div aria-label="Carregando notificações">{[0, 1, 2].map((item) => <div key={item} className="flex min-h-[88px] gap-3.5 border-b border-[#edf2ee] px-5 py-4 last:border-b-0"><div className="skeleton-shimmer size-9 shrink-0 rounded-full" /><div className="flex-1 space-y-2"><div className="skeleton-shimmer h-3.5 w-32 rounded" /><div className="skeleton-shimmer h-3 w-full rounded" /><div className="skeleton-shimmer h-3 w-2/3 rounded" /></div></div>)}</div>; }
