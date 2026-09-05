"use client";

import { Notification } from "@/components/notification";

import { FormEvent, useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { PhotoGallery } from "@/components/photo-gallery";
import { SkeletonLoader } from "@/components/skeleton-loader";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { useSession } from "@/lib/auth-client";
import type { DonationItem } from "../page";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";
type ItemDetails = DonationItem & { owner?: { name: string; image?: string | null; city?: string | null; state?: string | null; verified?: boolean | null } };

export default function ItemDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { data: session } = useSession();
  const [item, setItem] = useState<ItemDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [notice, setNotice] = useState<{ type: "success" | "error"; text: string } | null>(null);

  useEffect(() => {
    if (!id) return;
    fetch(`${API_BASE_URL}/api/donation-items/${id}`, { credentials: "include" })
      .then(async (response) => response.ok ? response.json() : null)
      .then(setItem).catch(() => setItem(null)).finally(() => setLoading(false));
  }, [id]);

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
    <main className="mx-auto max-w-[1200px] px-5 py-8 sm:px-10 lg:px-20 lg:py-12">
      <Link href="/itens" className="mb-8 inline-flex items-center gap-2 rounded-lg px-2 py-1 text-sm font-semibold text-[#256441] hover:bg-[#e8f7eb]"><span aria-hidden="true">‹</span> Voltar para doações</Link>
      <div className="grid items-start gap-6 lg:grid-cols-[2fr_1fr]">
        <div className="space-y-6">
          <PhotoGallery animalName={item.title} photos={photos.length ? photos : ["/images/login-cover-v2.png"]} />
          <section className="rounded-xl bg-white p-6 shadow-[0_4px_6px_rgba(38,51,43,0.05)] sm:p-10 lg:p-12">
            <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-center"><div><p className="text-xs font-bold uppercase tracking-[0.12em] text-[#3f7d58]">{item.category}</p><h1 className="mt-1 text-3xl font-extrabold tracking-[-0.02em] sm:text-[40px]">{item.title}</h1><p className="mt-1 text-lg text-[#404942]">{item.itemName}</p></div><span className="flex w-fit items-center gap-2 rounded-xl border border-[#aff1c4] bg-[#e8f7eb] px-4 py-2 text-sm font-semibold text-[#256441]"><Image src="/icons/available-detail.svg" alt="" width={17} height={17} />{item.status}</span></div>
            <div className="mt-6 grid gap-5 border-t border-[#c0c9bf] pt-6 min-[460px]:grid-cols-3"><Stat label="Quantidade" value={`${item.quantity} ${item.unit}`} /><Stat label="Condição" value={item.condition} /><Stat label="Entrega" value={item.deliveryMethod} /></div>
          </section>
          <section className="rounded-xl bg-white p-6 shadow-[0_4px_6px_rgba(38,51,43,0.05)] sm:p-10 lg:p-12"><h2 className="mb-4 text-2xl font-semibold">Sobre esta doação</h2><p className="whitespace-pre-line leading-7 text-[#404942]">{item.description}</p></section>
          {(item.expirationDate || item.availableUntil) && <section className="rounded-xl bg-white p-6 shadow-[0_4px_6px_rgba(38,51,43,0.05)] sm:p-10 lg:p-12"><h2 className="mb-5 text-2xl font-semibold">Datas importantes</h2><dl className="grid gap-5 sm:grid-cols-2">{item.expirationDate && <Detail label="Validade do produto" value={formatDate(item.expirationDate)} />}{item.availableUntil && <Detail label="Disponível para retirada até" value={formatDate(item.availableUntil)} />}</dl></section>}
        </div>
        <aside className="space-y-6 lg:sticky lg:top-28">
          <section className="rounded-xl bg-white p-6 shadow-[0_4px_6px_rgba(38,51,43,0.05)]"><h2 className="text-sm font-semibold uppercase tracking-[0.05em] text-[#404942]">Doado por</h2><div className="mt-4 flex items-center gap-4"><div className="relative grid size-16 shrink-0 place-items-center overflow-hidden rounded-full bg-[#e3f2e6]">{item.owner?.image ? <Image src={item.owner.image} alt={ownerName} fill className="object-cover" /> : <span className="text-xl font-bold text-[#256441]">{ownerName.charAt(0).toUpperCase()}</span>}</div><div><h3 className="text-xl font-semibold">{ownerName}</h3>{ownerLocation && <p className="mt-1 text-xs text-[#526057]">{ownerLocation}</p>}<p className="mt-1 text-xs text-[#404942]">Responsável cadastrado</p></div></div></section>
          {notice && <Notification text={notice.text} type={notice.type} />}
          <form onSubmit={requestItem}><input type="hidden" name="quantity" value="1" /><button type="submit" disabled={sending || unavailable} className="w-full rounded-xl bg-[#256441] px-6 py-4 text-sm font-semibold text-white shadow-sm transition hover:-translate-y-0.5 hover:bg-[#194b30] disabled:cursor-not-allowed disabled:opacity-60">{unavailable ? "Item indisponível" : sending ? "Enviando..." : "Solicitar este item"}</button></form>
          <section className="rounded-xl border border-[#d7e6da] bg-[#f7fcf8] p-6 text-sm leading-6 text-[#404942]"><h2 className="mb-2 font-bold text-[#256441]">Privacidade e segurança</h2><p>Os dados de contato são liberados somente após a aprovação da solicitação pelo responsável.</p></section>
        </aside>
      </div>
    </main><div className="mt-20"><SiteFooter /></div>
  </div>;
}

function Stat({ label, value }: { label: string; value: string }) { return <div><small className="block text-xs font-medium text-[#526057]">{label}</small><strong className="mt-1 block text-sm font-semibold">{value}</strong></div>; }
function Detail({ label, value }: { label: string; value: string }) { return <div><dt className="text-sm font-semibold">{label}</dt><dd className="mt-1 text-[#404942]">{value}</dd></div>; }
function formatDate(value: string) { const [year, month, day] = value.slice(0, 10).split("-"); return day && month && year ? `${day}/${month}/${year}` : value; }
