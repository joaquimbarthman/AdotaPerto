"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import type { Animal } from "@/data/animals";
import { useSession } from "@/lib/auth-client";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

export function AnimalCard({ animal, isInitiallyFavorite = false }: { animal: Animal; isInitiallyFavorite?: boolean }) {
  const router = useRouter();
  const { data: session } = useSession();
  const [favorite, setFavorite] = useState(isInitiallyFavorite);
  const [loadingFav, setLoadingFav] = useState(false);

  useEffect(() => {
    if (!session) {
      setFavorite(false);
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

    const nextState = !favorite;
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
    } catch {
      setFavorite(!nextState);
    } finally {
      setLoadingFav(false);
    }
  }

  const traits = Array.isArray(animal.traits) ? animal.traits : [];
  const distance = animal.distance || "5 km";

  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-xl bg-white shadow-[0_4px_12px_rgba(38,51,43,0.05)] transition-all duration-300 hover:-translate-y-1.5 hover:shadow-[0_12px_24px_rgba(38,51,43,0.12)]">
      <Link href={`/adocao/${animal.id}`} className="relative block h-[210px] shrink-0 overflow-hidden bg-[#ddece0]">
        <Image
          src={animal.image || "/images/login-cover-v2.png"}
          alt={animal.name}
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-105"
          sizes="(max-width:640px) 100vw,(max-width:1024px) 50vw,270px"
        />
        <span className="absolute left-3 top-3 flex items-center gap-1.5 rounded-lg bg-[#eefdf1] px-3 py-1.5 text-xs font-semibold text-[#256441] shadow-sm">
          <i className="size-2 rounded-full bg-[#256441]" />
          {animal.status || "Disponível"}
        </span>
      </Link>

      <div className="flex flex-1 flex-col p-5 sm:p-6">
        <div className="flex items-start justify-between gap-3">
          <Link href={`/adocao/${animal.id}`} className="text-2xl font-semibold leading-8 transition-colors hover:text-[#256441]">
            {animal.name}
          </Link>
          <button
            type="button"
            disabled={loadingFav}
            onClick={toggleFavorite}
            className={`grid size-9 shrink-0 place-items-center rounded-full transition-all hover:bg-[#e8f7eb] active:scale-90 ${favorite ? "bg-[#e8f7eb]" : "bg-transparent"}`}
            aria-label={favorite ? "Remover dos favoritos" : "Adicionar aos favoritos"}
          >
            <Image
              src="/icons/heart.svg"
              alt=""
              width={20}
              height={19}
              className={`transition-all ${favorite ? "scale-110 drop-shadow-sm filter-[invert(28%)_sepia(85%)_saturate(2000%)_hue-rotate(330deg)]" : "opacity-60"}`}
            />
          </button>
        </div>

        <p className="mt-1 min-h-12 text-sm leading-6 text-[#404942]">
          {animal.species} <span className="mx-1 text-[#c0c9bf]">•</span> {animal.sex} <span className="mx-1 text-[#c0c9bf]">•</span> {animal.age}
        </p>

        <div className="mt-4 flex min-h-14 flex-wrap content-start gap-2">
          <Tag>Porte {animal.size}</Tag>
          {traits.slice(0, 2).map((trait) => <Tag key={trait}>{trait}</Tag>)}
        </div>

        <div className="mb-4 mt-1 flex items-center gap-2 border-t border-[#d7e6da] pt-3 text-xs font-medium text-[#4d5b53]">
          <Image src="/icons/location.svg" alt="" width={14} height={17} className="shrink-0" />
          <span>A aproximadamente {distance} de você</span>
        </div>

      </div>
    </article>
  );
}

function Tag({ children }: { children: React.ReactNode }) {
  return <span className="h-fit rounded-lg bg-[#eefdf1] px-3 py-1.5 text-xs font-semibold text-[#256441]">{children}</span>;
}
