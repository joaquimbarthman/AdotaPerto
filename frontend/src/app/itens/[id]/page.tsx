"use client";

import { Notification, notify } from "@/components/notification";

import { FormEvent, useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { PhotoGallery } from "@/components/photo-gallery";
import { AuthBlurredContent } from "@/components/auth-blurred-content";
import { SkeletonLoader } from "@/components/skeleton-loader";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { useSession } from "@/lib/auth-client";
import { useApproximateDistance } from "@/hooks/use-approximate-distance";
import type { DonationItem } from "../page";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";
type ItemDetails = DonationItem & { owner?: { name: string; image?: string | null; city?: string | null; state?: string | null; verified?: boolean | null } };

export default function ItemDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { data: session, isPending } = useSession();
  const [item, setItem] = useState<ItemDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [favorite, setFavorite] = useState(false);
  const [favoriteLoading, setFavoriteLoading] = useState(false);
  const [notice, setNotice] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const approximateDistance = useApproximateDistance(id, Boolean(session), isPending);

  useEffect(() => {
    if (!id) return;
    fetch(`${API_BASE_URL}/api/donation-items/${id}`, { credentials: "include" })
      .then(async (response) => response.ok ? response.json() : null)
      .then(setItem).catch(() => setItem(null)).finally(() => setLoading(false));
  }, [id]);

  useEffect(() => {
    if (!session || !id) return;
    const controller = new AbortController();
    fetch(`${API_BASE_URL}/api/favorites/items/check/${id}`, { credentials: "include", signal: controller.signal })
      .then((response) => response.ok ? response.json() : null)
      .then((data) => { if (data) setFavorite(Boolean(data.favorite)); })
      .catch(() => {});
    return () => controller.abort();
  }, [id, session]);

  async function toggleFavorite() {
    if (!session) { router.push("/login?reason=unauthenticated"); return; }
    if (!item || favoriteLoading) return;
    const next = !favorite;
    setFavorite(next); setFavoriteLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/favorites/items/${item.id}`, { method: next ? "POST" : "DELETE", credentials: "include" });
      if (!response.ok) throw new Error();
    } catch {
      setFavorite(!next);
      notify("Não foi possível atualizar o favorito.", "error");
    } finally { setFavoriteLoading(false); }
  }

  async function requestItem(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!session) { router.push("/login?reason=unauthenticated"); return; }
    if (!item) return;
    const form = new FormData(event.currentTarget);
    setSending(true); setNotice(null);
    try {
    const response = await fetch(`${API_BASE_URL}/api/donation-item-requests`, { method: "POST", headers: { "Content-Type": "application/json" }, credentials: "include", body: JSON.stringify({ itemId: item.id, quantity: Number(form.get("quantity")), message: String(form.get("message") || "") || null }) });
    const result = await response.json().catch(() => ({}));
    setSending(false);
    setNotice(response.ok ? { type: "success", text: "Solicitação enviada. Acompanhe o status no seu perfil." } : { type: "error", text: result.error || "Não foi possível enviar a solicitação." });
    } catch {
      setNotice({ type: "error", text: "Não foi possível conectar ao servidor. Tente novamente." });
    } finally {
      setSending(false);
    }
  }

  if (loading) return <SkeletonLoader fullScreen variant="detail" />;
  if (!item) return <div className="flex min-h-screen flex-col items-center justify-center bg-[#eefdf1] px-4 text-center"><h1 className="text-2xl font-bold">Item não encontrado</h1><p className="mt-2 text-[#526057]">Esta doação não existe ou não está mais disponível.</p><Link href="/itens" className="mt-6 rounded-xl bg-[#256441] px-6 py-3 font-semibold text-white">Ver todas as doações</Link></div>;

  const photos = [item.mainImage, ...(item.images || [])].filter((photo, index, all) => Boolean(photo) && all.indexOf(photo) === index);
  const ownerName = item.owner?.name || "Responsável pela doação";
  const ownerLocation = [item.owner?.city, item.owner?.state].filter(Boolean).join(", ");
  const unavailable = item.status !== "Disponível";

  return <div className="min-h-screen bg-[#eefdf1] text-[#121e17]">
    <SiteHeader />
    <main className="detail-page mx-auto w-full min-w-0 max-w-[1200px] overflow-x-hidden px-3 py-4 sm:px-10 sm:py-8 lg:px-20 lg:py-12">
      <Link href="/itens" className="mb-3 inline-flex items-center gap-1 rounded-lg px-1 py-1 text-xs font-semibold text-[#256441] hover:bg-[#e8f7eb] sm:mb-8 sm:gap-2 sm:px-2 sm:text-sm"><span aria-hidden="true">‹</span> Voltar</Link>
      <div className="grid min-w-0 items-start gap-3 sm:gap-6 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
        <div className="detail-main-column min-w-0 space-y-3 sm:space-y-6">
          <PhotoGallery animalName={item.title} photos={photos.length ? photos : ["/images/login-cover-v2.png"]} locked={!isPending && !session} />
          <section className="rounded-xl bg-white p-6 shadow-[0_4px_6px_rgba(38,51,43,0.05)] sm:p-10 lg:p-12">
            <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-center"><div><h1 className="text-4xl font-extrabold tracking-[-0.02em] sm:text-[40px]">{item.title}</h1><p className="mt-1 text-lg text-[#404942]">{item.itemName} <span className="mx-1 text-[#c0c9bf]">•</span> {item.category}</p></div><span className="flex w-fit items-center gap-2 rounded-xl border border-[#aff1c4] bg-[#e8f7eb] px-4 py-2 text-sm font-semibold text-[#256441]"><Image src="/icons/available-detail.svg" alt="" width={17} height={17} />{item.status}</span></div>
            <div className="detail-stats mt-4 grid grid-cols-3 gap-2 border-t border-[#c0c9bf] pt-4 sm:mt-6 sm:gap-5 sm:pt-6"><Stat icon="/icons/map-box.svg" label="Quantidade" value={`${item.quantity} ${item.unit}`} /><Stat icon="/icons/check-detail.svg" label="Condição" value={item.condition} /><Stat icon="/icons/location.svg" label="Entrega" value={item.deliveryMethod} /></div>
          </section>
          <AuthBlurredContent locked={!isPending && !session}><div className="space-y-3 sm:space-y-6"><section className="rounded-xl bg-white p-6 shadow-[0_4px_6px_rgba(38,51,43,0.05)] sm:p-10 lg:p-12"><h2 className="mb-4 text-2xl font-semibold">Sobre esta doação</h2><p className="whitespace-pre-line leading-7 text-[#404942]">{item.description}</p></section>{(item.expirationDate || item.availableUntil) && <section className="rounded-xl bg-white p-6 shadow-[0_4px_6px_rgba(38,51,43,0.05)] sm:p-10 lg:p-12"><h2 className="mb-5 text-2xl font-semibold">Datas importantes</h2><dl className="grid grid-cols-2 gap-2 sm:gap-5">{item.expirationDate && <Detail label="Validade do produto" value={formatDate(item.expirationDate)} />}{item.availableUntil && <Detail label="Disponível para retirada até" value={formatDate(item.availableUntil)} />}</dl></section>}</div></AuthBlurredContent>
        </div>
        <aside className="detail-sidebar min-w-0 space-y-3 sm:space-y-6 lg:sticky lg:top-28">
          <section className="rounded-xl bg-white p-6 shadow-[0_4px_6px_rgba(38,51,43,0.05)]"><h2 className="text-sm font-semibold uppercase tracking-[0.05em] text-[#404942]">Doado por</h2><div className="mt-4 flex items-center gap-4"><div className="relative grid size-16 shrink-0 place-items-center overflow-hidden rounded-full bg-[#e3f2e6]">{item.owner?.image ? <Image src={item.owner.image} alt={ownerName} fill className="object-cover" /> : <span className="text-xl font-bold text-[#256441]">{ownerName.charAt(0).toUpperCase()}</span>}</div><div><h3 className="text-xl font-semibold">{ownerName}</h3>{ownerLocation && <p className="mt-1 text-xs text-[#526057]">{ownerLocation}</p>}<p className="mt-1 text-xs text-[#404942]">Responsável cadastrado</p>{approximateDistance && <p className="mt-1.5 flex items-center gap-1 text-xs font-semibold text-[#256441]"><Image src="/icons/location.svg" alt="" width={13} height={13} />Aproximadamente {approximateDistance} de distância</p>}</div></div></section>
          {notice && <Notification text={notice.text} type={notice.type} />}
          <div className="detail-primary-actions flex gap-2"><form onSubmit={requestItem} className="min-w-0 flex-1"><input type="hidden" name="quantity" value="1" /><button type="submit" disabled={sending || unavailable} className="h-full w-full rounded-xl bg-[#256441] px-6 py-4 text-sm font-semibold text-white shadow-sm transition hover:-translate-y-0.5 hover:bg-[#194b30] disabled:cursor-not-allowed disabled:opacity-60">{unavailable ? "Item indisponível" : sending ? "Enviando..." : "Solicitar este item"}</button></form><button type="button" disabled={favoriteLoading} onClick={toggleFavorite} className={`grid size-[52px] shrink-0 place-items-center rounded-xl border transition active:scale-95 disabled:opacity-60 ${favorite ? "border-[#ef9aaa] bg-[#fff0f3] text-[#d33f56]" : "border-[#86a590] bg-white text-[#526057] hover:bg-[#e8f7eb] hover:text-[#256441]"}`} aria-label={favorite ? "Remover dos favoritos" : "Adicionar aos favoritos"} aria-pressed={favorite}><svg viewBox="0 0 24 24" className="size-5" fill={favorite ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2.2" aria-hidden="true"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78L12 21.23l8.84-8.84a5.5 5.5 0 0 0 0-7.78Z" strokeLinecap="round" strokeLinejoin="round" /></svg></button></div>
          <section className="rounded-xl border border-[#d7e6da] bg-[#f7fcf8] p-6 text-sm leading-6 text-[#404942]"><h2 className="mb-2 font-bold text-[#256441]">Privacidade e segurança</h2><p>Os dados de contato são liberados somente após a aprovação da solicitação pelo responsável.</p></section>
        </aside>
      </div>
    </main><div className="mt-20"><SiteFooter /></div>
  </div>;
}

function Stat({ icon, label, value }: { icon: string; label: string; value: string }) { return <div className={`flex items-center gap-3 ${label === "Entrega" ? "lg:pl-5" : ""} ${label === "Condição" ? "lg:-ml-[34px]" : ""}`}><span className="grid size-10 shrink-0 place-items-center rounded-full bg-[#e3f2e6]"><Image src={icon} alt="" width={20} height={20} className="max-h-5 max-w-5 object-contain" /></span><span className="min-w-0"><small className="block text-xs font-medium text-[#404942]">{label}</small><strong className="mt-0.5 block text-sm font-semibold tracking-[0.02em] lg:whitespace-nowrap">{value}</strong></span></div>; }
function Detail({ label, value }: { label: string; value: string }) { return <div><dt className="text-sm font-semibold">{label}</dt><dd className="mt-1 text-[#404942]">{value}</dd></div>; }
function formatDate(value: string) { const [year, month, day] = value.slice(0, 10).split("-"); return day && month && year ? `${day}/${month}/${year}` : value; }
