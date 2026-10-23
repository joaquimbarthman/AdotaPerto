"use client";

import Image from "next/image";
import Link from "next/link";
import { useSession } from "@/lib/auth-client";
import { useApproximateDistance } from "@/hooks/use-approximate-distance";

export type OrganizationNeed = {
  id: string; title: string; itemName?: string; category: string; quantity: number; unit: string; condition?: string; deliveryMethod?: string; mainImage?: string; images?: string[]; priority: string; description: string; status: string; createdAt: string; expirationDate?: string | null; availableUntil?: string | null;
  organization?: { id: string; name?: string | null; image?: string | null; city?: string | null; state?: string | null; whatsapp?: string | null; instagram?: string | null; website?: string | null; description?: string | null };
};

const priorityStyle: Record<string, string> = { Urgente: "bg-[#fff0f0] text-[#b42318]", Alta: "bg-[#fff7e8] text-[#9a5b13]", Média: "bg-[#fffce8] text-[#776814]", Baixa: "bg-[#e8f7eb] text-[#256441]" };

export function OrganizationNeedCard({ need }: { need: OrganizationNeed }) {
  const { data: session, isPending } = useSession();
  const distance = useApproximateDistance(need.id, Boolean(session), isPending);
  const location = [need.organization?.city, need.organization?.state].filter(Boolean).join(", ");
  return <article className="group flex h-full flex-col overflow-hidden rounded-xl bg-white shadow-[0_4px_12px_rgba(38,51,43,0.05)] transition duration-300 hover:-translate-y-1.5 hover:shadow-[0_12px_24px_rgba(38,51,43,0.12)]">
    <div className="relative h-28 shrink-0 overflow-hidden bg-[#ddece0] sm:h-[210px]"><Link href={`/necessidades/${need.id}`} className="block size-full"><Image src={need.mainImage || "/images/login-cover-v2.png"} alt={need.title} fill sizes="(max-width:640px) 50vw,(max-width:1024px) 50vw,270px" className="object-cover transition-transform duration-500 group-hover:scale-105" /></Link><span className="pointer-events-none absolute left-2 top-2 max-w-[calc(100%-1rem)] truncate rounded-lg bg-[#eefdf1] px-2 py-1 text-[9px] font-semibold text-[#256441] shadow-sm sm:left-3 sm:top-3 sm:px-3 sm:py-1.5 sm:text-xs">{need.category}</span><span className={`pointer-events-none absolute right-2 top-2 rounded-lg px-2 py-1 text-[9px] font-bold shadow-sm sm:right-3 sm:top-3 sm:px-3 sm:py-1.5 sm:text-xs ${priorityStyle[need.priority] || priorityStyle.Média}`}>{need.priority}</span></div>
    <div className="flex min-w-0 flex-1 flex-col p-2.5 sm:p-6"><Link href={`/necessidades/${need.id}`} title={need.title} className="truncate text-sm font-semibold leading-7 hover:text-[#256441] sm:text-xl sm:leading-9">{need.title}</Link><p className="h-4 truncate text-[10px] leading-4 text-[#404942] sm:h-5 sm:text-sm sm:leading-5">{need.itemName || "Item solicitado"}</p><div className="mt-2 flex h-6 min-w-0 gap-1 overflow-hidden sm:mt-3 sm:h-7 sm:gap-2"><Tag>{need.quantity} {need.unit}</Tag>{need.condition && <Tag>{need.condition}</Tag>}</div><div className="mt-auto pt-2.5 sm:pt-5"><div className="flex min-h-8 items-center border-t border-[#d7e6da] pt-2 sm:min-h-10 sm:pt-3"><p className="flex min-w-0 items-center gap-1 text-[9px] font-medium text-[#4d5b53] sm:gap-2 sm:text-xs"><Image src="/icons/location.svg" alt="" width={12} height={14} className="shrink-0" /><span className="truncate">{distance ? `A aproximadamente ${distance} de você` : location || need.organization?.name || "ONG verificada"}</span></p></div></div></div>
  </article>;
}

function Tag({ children }: { children: React.ReactNode }) { return <span className="max-w-[calc(50%-0.25rem)] shrink truncate rounded-lg bg-[#eefdf1] px-1.5 py-1 text-[9px] font-semibold text-[#256441] sm:px-3 sm:py-1.5 sm:text-xs">{children}</span>; }
