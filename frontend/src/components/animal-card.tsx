"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import type { Animal } from "@/data/animals";

export function AnimalCard({ animal }: { animal: Animal }) {
  const [favorite, setFavorite] = useState(false);

  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-xl bg-white shadow-[0_4px_12px_rgba(38,51,43,0.05)] transition-all duration-300 hover:-translate-y-1.5 hover:shadow-[0_12px_24px_rgba(38,51,43,0.12)]">
      <Link href={`/adocao/${animal.id}`} className="relative block h-[210px] shrink-0 overflow-hidden bg-[#ddece0]">
        <Image
          src={animal.image}
          alt={animal.name}
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-105"
          sizes="(max-width:640px) 100vw,(max-width:1024px) 50vw,270px"
        />
        <span className="absolute left-3 top-3 flex items-center gap-1 rounded-full bg-[#eefdf1] px-2.5 py-1 text-xs font-medium text-[#256441] shadow-sm">
          <i className="size-2 rounded-full bg-[#256441]" />
          {animal.status}
        </span>
      </Link>

      <div className="flex flex-1 flex-col p-5 sm:p-6">
        <div className="flex items-start justify-between gap-3">
          <Link href={`/adocao/${animal.id}`} className="text-2xl font-semibold leading-8 transition-colors hover:text-[#256441]">
            {animal.name}
          </Link>
          <button
            type="button"
            onClick={() => setFavorite(!favorite)}
            className={`grid size-9 shrink-0 place-items-center rounded-full transition-all hover:bg-[#e8f7eb] active:scale-90 ${favorite ? "bg-[#e8f7eb]" : ""}`}
            aria-label={favorite ? "Remover dos favoritos" : "Adicionar aos favoritos"}
          >
            <Image src="/icons/heart.svg" alt="" width={20} height={19} className={favorite ? "opacity-100" : "opacity-65"} />
          </button>
        </div>

        <p className="mt-1 min-h-12 text-sm leading-6 text-[#404942]">
          {animal.species} <span className="mx-1 text-[#c0c9bf]">•</span> {animal.sex} <span className="mx-1 text-[#c0c9bf]">•</span> {animal.age}
        </p>

        <div className="mt-4 flex min-h-14 flex-wrap content-start gap-2">
          <Tag>Porte {animal.size}</Tag>
          {animal.traits.slice(0, 2).map((trait) => <Tag key={trait}>{trait}</Tag>)}
        </div>

        <div className="mb-4 mt-1 flex items-center gap-2 border-t border-[#d7e6da] pt-3 text-xs font-medium text-[#4d5b53]">
          <Image src="/icons/location.svg" alt="" width={14} height={17} className="shrink-0" />
          <span>A aproximadamente {animal.distance} de você</span>
        </div>

        <Link href={`/adocao/${animal.id}`} className="mt-auto flex w-full items-center justify-center rounded-full border-2 border-[#256441] px-3 py-2.5 text-sm font-semibold tracking-[0.05em] text-[#256441] transition-all duration-200 hover:bg-[#256441] hover:text-white active:scale-[0.98]">
          Ver detalhes
        </Link>
      </div>
    </article>
  );
}

function Tag({ children }: { children: React.ReactNode }) {
  return <span className="h-fit rounded-full bg-[#eefdf1] px-2.5 py-1 text-xs font-medium text-[#256441]">{children}</span>;
}
