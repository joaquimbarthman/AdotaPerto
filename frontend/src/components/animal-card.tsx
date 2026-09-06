"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import type { Animal } from "@/data/animals";
import { useSession } from "@/lib/auth-client";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

export function AnimalCard({ animal, compactMobile = false, isInitiallyFavorite = false, onFavoriteChange }: { animal: Animal; compactMobile?: boolean; isInitiallyFavorite?: boolean; onFavoriteChange?: (favorite: boolean) => void }) {
  const router = useRouter();
  const { data: session } = useSession();
  const [favorite, setFavorite] = useState(isInitiallyFavorite);
  const [loadingFav, setLoadingFav] = useState(false);
  const displayedFavorite = Boolean(session && favorite);

  useEffect(() => {
    if (!session) {
      return;
    }

    const controller = new AbortController();
    fetch(`${API_BASE_URL}/api/favorites/check/${animal.id}`, {
      credentials: "include",
      signal: controller.signal,
    })
      .then((response) => response.ok ? response.json() : null)
      .then((data) => {
        if (data) setFavorite(Boolean(data.favorite));
      })
      .catch(() => {});

    return () => controller.abort();
  }, [animal.id, session]);

  async function toggleFavorite(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();

    if (!session) {
      router.push("/login");
      return;
    }

    const nextState = !displayedFavorite;
    setFavorite(nextState);
    setLoadingFav(true);

    try {
      if (nextState) {
        const res = await fetch(`${API_BASE_URL}/api/favorites/${animal.id}`, {
          method: "POST",
          credentials: "include",
        });
        if (!res.ok) {
          throw new Error("Falha ao adicionar favorito");
        }
      } else {
        const res = await fetch(`${API_BASE_URL}/api/favorites/${animal.id}`, {
          method: "DELETE",
          credentials: "include",
        });
        if (!res.ok) {
          throw new Error("Falha ao remover favorito");
        }
      }
      onFavoriteChange?.(nextState);
    } catch {
      setFavorite(!nextState);
    } finally {
      setLoadingFav(false);
    }
  }

  const traits = Array.isArray(animal.traits) ? animal.traits : [];
  const distance = animal.distance?.trim();

  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-xl bg-white shadow-[0_4px_12px_rgba(38,51,43,0.05)] transition-all duration-300 hover:-translate-y-1.5 hover:shadow-[0_12px_24px_rgba(38,51,43,0.12)]">
      <Link href={`/adocao/${animal.id}`} className={`relative block shrink-0 overflow-hidden bg-[#ddece0] ${compactMobile ? "h-28 sm:h-[210px]" : "h-[210px]"}`}>
        <Image
          src={animal.image || "/images/login-cover-v2.png"}
          alt={animal.name}
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-105"
          sizes="(max-width:640px) 100vw,(max-width:1024px) 50vw,270px"
        />
        <span className={`absolute flex items-center rounded-lg bg-[#eefdf1] font-semibold text-[#256441] shadow-sm ${compactMobile ? "left-2 top-2 gap-1 px-2 py-1 text-[9px] sm:left-3 sm:top-3 sm:gap-1.5 sm:px-3 sm:py-1.5 sm:text-xs" : "left-3 top-3 gap-1.5 px-3 py-1.5 text-xs"}`}>
          <i className={`${compactMobile ? "size-1.5 sm:size-2" : "size-2"} rounded-full bg-[#256441]`} />
          {animal.status || "Disponível"}
        </span>
      </Link>

      <div className={`flex min-w-0 flex-1 flex-col ${compactMobile ? "p-2.5 sm:p-6" : "p-5 sm:p-6"}`}>
        <div className="flex min-w-0 items-start justify-between gap-3">
          <Link href={`/adocao/${animal.id}`} title={animal.name} className={`min-w-0 flex-1 truncate font-semibold transition-colors hover:text-[#256441] ${compactMobile ? "text-sm leading-7 sm:text-xl sm:leading-9" : "text-xl leading-9"}`}>
            {animal.name}
          </Link>
          <button
            type="button"
            disabled={loadingFav}
            onClick={toggleFavorite}
            className={`grid shrink-0 place-items-center rounded-full transition-all hover:bg-[#e8f7eb] active:scale-90 ${compactMobile ? "size-7 sm:size-9" : "size-9"} ${displayedFavorite ? "bg-[#e8f7eb]" : "bg-transparent"}`}
            aria-label={displayedFavorite ? "Remover dos favoritos" : "Adicionar aos favoritos"}
          >
            <svg viewBox="0 0 24 24" aria-hidden="true" className={`${compactMobile ? "size-4 sm:size-5" : "size-5"} transition-all ${displayedFavorite ? "scale-110 text-[#d33f56] drop-shadow-sm" : "text-[#59675e]"}`} fill={displayedFavorite ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2.2">
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78L12 21.23l8.84-8.84a5.5 5.5 0 0 0 0-7.78Z" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        </div>

        <p className={`mt-1 min-w-0 truncate text-[#404942] ${compactMobile ? "h-4 text-[10px] leading-4 sm:h-5 sm:text-sm sm:leading-5" : "h-5 text-sm leading-5"}`}>
          {animal.species} <span className="mx-1 text-[#c0c9bf]">•</span> {animal.sex} <span className="mx-1 text-[#c0c9bf]">•</span> {animal.age}
        </p>

        <div className={`${compactMobile ? "mt-2 h-6 gap-1 sm:mt-3 sm:h-7 sm:gap-2" : "mt-3 h-7 gap-2"} flex min-w-0 flex-nowrap overflow-hidden`}>
          <Tag compactMobile={compactMobile}>Porte {animal.size}</Tag>
          {traits.slice(0, 1).map((trait) => <Tag key={trait} compactMobile={compactMobile}>{trait}</Tag>)}
        </div>

        <div className={`mt-auto ${compactMobile ? "pt-2.5 sm:pt-5" : "pt-5"}`}>
          <div className={`flex items-center border-t border-[#d7e6da] ${compactMobile ? "min-h-8 pt-2 sm:min-h-10 sm:pt-3" : "min-h-10 pt-3"}`}><p className={`flex min-w-0 items-center font-medium text-[#4d5b53] ${compactMobile ? "gap-1 text-[9px] sm:gap-2 sm:text-xs" : "gap-2 text-xs"}`}><Image src="/icons/location.svg" alt="" width={compactMobile ? 10 : 14} height={compactMobile ? 12 : 17} className="shrink-0" /><span className="truncate">{distance ? <>A aproximadamente {distance} de você</> : "Distância indisponível"}</span></p></div>
        </div>

      </div>
    </article>
  );
}

function Tag({ children, compactMobile = false }: { children: React.ReactNode; compactMobile?: boolean }) {
  return <span className={`max-w-[calc(50%-0.25rem)] shrink truncate rounded-lg bg-[#eefdf1] font-semibold text-[#256441] ${compactMobile ? "h-6 px-1.5 py-1 text-[9px] leading-4 sm:h-7 sm:px-3 sm:py-1.5 sm:text-xs" : "h-7 px-3 py-1.5 text-xs leading-4"}`}>{children}</span>;
}
