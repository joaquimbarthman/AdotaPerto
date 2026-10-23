"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { Notification } from "@/components/notification";
import { SkeletonLoader } from "@/components/skeleton-loader";
import { SectionHeading } from "./profile-ui";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";
type Need = { id: string; title: string; itemName: string; category?: string; quantity: number; unit: string; status: string; mainImage: string; priority: string };

export function OrganizationNeedsPanel() {
  const [needs, setNeeds] = useState<Need[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [removing, setRemoving] = useState<string | null>(null);

  useEffect(() => {
    fetch(`${API}/api/organization-needs/mine`, { credentials: "include" })
      .then((response) => { if (!response.ok) throw new Error("Não foi possível carregar as necessidades."); return response.json(); })
      .then((rows) => setNeeds(Array.isArray(rows) ? rows : []))
      .catch((cause) => setError(cause instanceof Error ? cause.message : "Falha ao carregar."))
      .finally(() => setLoading(false));
  }, []);

  async function remove() {
    if (!removing) return;
    const response = await fetch(`${API}/api/organization-needs/${removing}`, { method: "DELETE", credentials: "include" });
    if (response.ok) { setNeeds((items) => items.filter((item) => item.id !== removing)); setRemoving(null); }
    else setError("Não foi possível excluir a necessidade.");
  }

  return <section className="space-y-5 sm:space-y-7">
    <div className="flex flex-wrap items-end justify-between gap-3"><SectionHeading flush eyebrow="Organização" title="Necessidades da ONG" description="Gerencie o que sua organização precisa receber." /><Link href="/doacoes/necessidade" className="profile-action rounded-xl bg-[#256441] px-4 py-2.5 text-sm font-bold text-white hover:bg-[#194b30]">+ Publicar necessidade</Link></div>
    {error && <Notification type="error" text={error} />}
    {loading ? <SkeletonLoader variant="cards" /> : needs.length ? <div className="grid gap-4 sm:grid-cols-2">{needs.map((need) => <NeedCard key={need.id} need={need} onRemove={() => setRemoving(need.id)} />)}</div> : <div className="grid min-h-36 place-items-center rounded-2xl border-2 border-dashed border-[#b7cbbd] px-5 py-8 text-center"><div><p className="font-semibold text-[#404942]">Nenhuma necessidade publicada</p><p className="mt-2 text-sm text-[#718078]">Sua primeira necessidade aparecerá aqui com opções de edição e status.</p></div></div>}
    {removing && <div className="fixed inset-0 z-[1000] grid place-items-center bg-[#0d1c13]/65 p-4 backdrop-blur-sm" role="presentation"><section role="alertdialog" aria-modal="true" className="w-full max-w-[330px] overflow-hidden rounded-xl border border-[#d7e6da] bg-white shadow-[0_28px_80px_rgba(5,22,12,.32)] sm:max-w-md"><div className="p-4 sm:p-7"><p className="text-[9px] font-extrabold uppercase tracking-[.12em] text-red-700 sm:text-[10px]">Excluir necessidade</p><h2 className="mt-1.5 text-base font-extrabold sm:text-xl">Excluir esta necessidade?</h2><p className="mt-2 text-xs leading-4 text-[#5b675f] sm:mt-3 sm:text-sm sm:leading-6">Ela deixará de aparecer no AdotaPerto. Essa ação não poderá ser desfeita.</p></div><footer className="grid grid-cols-2 gap-2 border-t border-[#e1e8e2] bg-[#f7fcf8] p-3 sm:gap-3 sm:px-7 sm:py-5"><button type="button" onClick={() => setRemoving(null)} className="min-h-9 rounded-lg border border-[#bfcfc3] bg-white px-3 text-xs font-bold text-[#404942] sm:min-h-11 sm:text-sm">Cancelar</button><button type="button" onClick={() => void remove()} className="min-h-9 rounded-lg bg-red-700 px-3 text-xs font-bold text-white hover:bg-red-800 sm:min-h-11 sm:text-sm">Excluir publicação</button></footer></section></div>}
  </section>;
}

function NeedCard({ need, onRemove }: { need: Need; onRemove: () => void }) {
  return <article className="group grid grid-cols-[112px_1fr] overflow-hidden rounded-xl border border-[#e1e8e2] bg-white shadow-[0_5px_16px_rgba(38,51,43,0.06)] transition-all duration-300 ease-out hover:border-[#9fc5aa] hover:shadow-[0_18px_38px_rgba(31,91,57,0.15)] sm:block sm:rounded-2xl sm:hover:-translate-y-1.5 sm:hover:scale-[1.01]">
    <div className="relative h-full min-h-[150px] overflow-hidden bg-[#e3f2e6] sm:h-44 sm:min-h-0"><Image src={need.mainImage || "/images/login-cover-v2.png"} alt={need.title} fill className="object-cover transition-transform duration-500 ease-out group-hover:scale-[1.06]" /><span className="absolute left-2 top-2 max-w-[calc(100%-1rem)] truncate rounded-full bg-white/95 px-2 py-1 text-[10px] font-bold text-[#256441] shadow-sm sm:left-3 sm:top-3 sm:px-3 sm:py-1.5 sm:text-xs">{need.status}</span></div>
    <div className="min-w-0 p-3.5 sm:p-5"><p className="text-[10px] font-bold uppercase tracking-wider text-[#708078] sm:text-xs">Necessidade da ONG</p><h3 className="mt-0.5 truncate text-base font-extrabold transition-colors group-hover:text-[#256441] sm:mt-1 sm:text-xl">{need.title}</h3><p className="mt-0.5 truncate text-xs text-[#526057] sm:mt-1 sm:text-sm">{need.quantity} {need.unit} • {need.itemName}{need.category ? ` • ${need.category}` : ""}</p><p className="mt-1 truncate text-[10px] font-bold text-[#8a6414] sm:text-xs">Prioridade {need.priority}</p><div className="mt-3 grid gap-1.5 border-t border-[#e7eee9] pt-3 sm:mt-5 sm:grid-cols-[1fr_auto] sm:gap-2 sm:pt-4"><Link href={`/doacoes/necessidade?edit=${need.id}`} className="rounded-lg bg-[#e3f2e6] px-2 py-2 text-center text-[11px] font-bold text-[#256441] transition hover:bg-[#d7eeda] sm:px-4 sm:py-2.5 sm:text-sm">Editar</Link><button type="button" onClick={onRemove} className="rounded-lg px-2 py-1.5 text-[11px] font-bold text-red-700 transition hover:bg-red-50 sm:px-3 sm:py-2.5 sm:text-sm" aria-label={`Excluir ${need.title}`}>Excluir</button></div></div>
  </article>;
}
