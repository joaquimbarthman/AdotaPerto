"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useSession } from "@/lib/auth-client";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

export type DonationItemCardData = {
  id: string; title: string; category: string; itemName: string; quantity: number; unit: string;
  condition: string; mainImage: string; deliveryMethod: string; distance?: string;
};

export function DonationItemCard({ item, compactMobile = false, isInitiallyFavorite = false, onFavoriteChange }: { item: DonationItemCardData; compactMobile?: boolean; isInitiallyFavorite?: boolean; onFavoriteChange?: (favorite: boolean) => void }) {
  const router = useRouter();
  const { data: session } = useSession();
  const [favorite, setFavorite] = useState(isInitiallyFavorite);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!session || isInitiallyFavorite) return;
    const controller = new AbortController();
    fetch(`${API_BASE_URL}/api/favorites/items/check/${item.id}`, { credentials: "include", signal: controller.signal })
      .then((response) => response.ok ? response.json() : null)
      .then((data) => { if (data) setFavorite(Boolean(data.favorite)); })
      .catch(() => {});
    return () => controller.abort();
  }, [isInitiallyFavorite, item.id, session]);

  async function toggleFavorite(event: React.MouseEvent) {
    event.preventDefault(); event.stopPropagation();
    if (!session) { router.push("/login?reason=unauthenticated"); return; }
    const next = !favorite;
    setFavorite(next); setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/favorites/items/${item.id}`, { method: next ? "POST" : "DELETE", credentials: "include" });
      if (!response.ok) throw new Error();
      onFavoriteChange?.(next);
    } catch {
      setFavorite(!next);
    } finally {
      setLoading(false);
    }
  }

  return <article className="group flex h-full flex-col overflow-hidden rounded-xl bg-white shadow-[0_4px_12px_rgba(38,51,43,0.05)] transition duration-300 hover:-translate-y-1.5 hover:shadow-[0_12px_24px_rgba(38,51,43,0.12)]">
    <div className={`relative shrink-0 overflow-hidden bg-[#ddece0] ${compactMobile ? "h-28 sm:h-[210px]" : "h-[210px]"}`}><Link href={`/itens/${item.id}`} className="block size-full"><Image src={item.mainImage || "/images/login-cover-v2.png"} alt={item.title} fill sizes="(max-width:640px) 50vw,(max-width:1024px) 50vw,270px" className="object-cover transition-transform duration-500 group-hover:scale-105" /></Link><span className={`pointer-events-none absolute max-w-[calc(100%-1rem)] truncate rounded-lg bg-[#eefdf1] font-semibold text-[#256441] shadow-sm ${compactMobile ? "left-2 top-2 px-2 py-1 text-[9px] sm:left-3 sm:top-3 sm:px-3 sm:py-1.5 sm:text-xs" : "left-3 top-3 px-3 py-1.5 text-xs"}`}>{item.category}</span></div>
    <div className={`flex min-w-0 flex-1 flex-col ${compactMobile ? "p-2.5 sm:p-6" : "p-5 sm:p-6"}`}><div className="flex min-w-0 items-start justify-between gap-1.5 sm:gap-3"><Link href={`/itens/${item.id}`} title={item.title} className={`min-w-0 flex-1 truncate font-semibold hover:text-[#256441] ${compactMobile ? "text-sm leading-7 sm:text-xl sm:leading-9" : "text-xl leading-9"}`}>{item.title}</Link><button type="button" disabled={loading} onClick={toggleFavorite} className={`grid shrink-0 place-items-center rounded-full transition-all hover:bg-[#e8f7eb] active:scale-90 ${compactMobile ? "size-7 sm:size-9" : "size-9"} ${favorite ? "bg-[#e8f7eb] text-[#d33f56]" : "text-[#59675e]"}`} aria-label={favorite ? "Remover item dos favoritos" : "Adicionar item aos favoritos"}><svg viewBox="0 0 24 24" className={compactMobile ? "size-4 sm:size-5" : "size-5"} fill={favorite ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2.2" aria-hidden="true"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78L12 21.23l8.84-8.84a5.5 5.5 0 0 0 0-7.78Z" strokeLinecap="round" strokeLinejoin="round" /></svg></button></div><p title={item.itemName} className={`mt-1 min-w-0 truncate text-[#404942] ${compactMobile ? "h-4 text-[10px] leading-4 sm:h-5 sm:text-sm sm:leading-5" : "h-5 text-sm leading-5"}`}>{item.itemName}</p><div className={`flex min-w-0 flex-nowrap overflow-hidden ${compactMobile ? "mt-2 h-6 gap-1 sm:mt-3 sm:h-7 sm:gap-2" : "mt-3 h-7 gap-2"}`}><Tag compactMobile={compactMobile}>{item.quantity} {item.unit}</Tag><Tag compactMobile={compactMobile}>{item.condition}</Tag></div><div className={`mt-auto ${compactMobile ? "pt-2.5 sm:pt-5" : "pt-5"}`}><div className={`flex items-center border-t border-[#d7e6da] ${compactMobile ? "min-h-8 pt-2 sm:min-h-10 sm:pt-3" : "min-h-10 pt-3"}`}><p className={`flex min-w-0 items-center font-medium text-[#4d5b53] ${compactMobile ? "gap-1 text-[9px] sm:gap-2 sm:text-xs" : "gap-2 text-xs"}`}><Image src="/icons/location.svg" alt="" width={compactMobile ? 10 : 14} height={compactMobile ? 12 : 17} className="shrink-0" /><span className="truncate">A aproximadamente {item.distance || "5 km"} de você</span></p></div></div></div>
  </article>;
}

function Tag({ children, compactMobile = false }: { children: React.ReactNode; compactMobile?: boolean }) { return <span className={`max-w-[calc(50%-0.25rem)] shrink truncate rounded-lg bg-[#eefdf1] font-semibold text-[#256441] ${compactMobile ? "h-6 px-1.5 py-1 text-[9px] leading-4 sm:h-7 sm:px-3 sm:py-1.5 sm:text-xs" : "h-7 px-3 py-1.5 text-xs leading-4"}`}>{children}</span>; }
