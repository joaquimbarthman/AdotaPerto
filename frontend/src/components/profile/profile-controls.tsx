"use client";

import { SiteHeader } from "@/components/site-header";
import { SkeletonLoader } from "@/components/skeleton-loader";
import Image from "next/image";
import { useEffect } from "react";

export function ProfileSearch({
  value,
  onChange,
  placeholder,
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
}) {
  return (
    <label className="relative block w-full sm:max-w-77.5">
      <span className="sr-only">{placeholder}</span>
      <Image
        src="/icons/map-search.svg"
        alt=""
        width={16}
        height={16}
        className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 opacity-75 sm:left-3.5"
      />
      <input
        type="search"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className="h-9 w-full rounded-lg border border-[#c6d5ca] bg-white pl-9 pr-3 text-xs text-[#253129] outline-none transition placeholder:text-[#8a968e] hover:border-[#86a590] focus:border-[#256441] focus:ring-3 focus:ring-[#256441]/10 sm:h-10 sm:pl-10 sm:text-sm"
      />
    </label>
  );
}

export function ProfilePagination({
  page,
  totalPages,
  onChange,
  label,
}: {
  page: number;
  totalPages: number;
  onChange: (page: number) => void;
  label: string;
}) {
  useEffect(() => {
    if (page > totalPages) onChange(totalPages);
  }, [page, totalPages, onChange]);
  if (totalPages <= 1) return null;
  return (
    <nav
      className="flex items-center justify-center gap-2 pt-3"
      aria-label={`Paginação de ${label}`}
    >
      <button
        type="button"
        disabled={page === 1}
        onClick={() => onChange(Math.max(1, page - 1))}
        className="grid size-9 place-items-center rounded-lg border border-[#c6d5ca] bg-white text-lg font-bold text-[#256441] transition hover:border-[#86a590] hover:bg-[#eefdf1] disabled:pointer-events-none disabled:opacity-35"
        aria-label="Página anterior"
      >
        ‹
      </button>
      {Array.from({ length: totalPages }, (_, index) => index + 1).map(
        (number) => (
          <button
            key={number}
            type="button"
            onClick={() => onChange(number)}
            aria-current={page === number ? "page" : undefined}
            className={`grid size-9 place-items-center rounded-lg border text-xs font-bold transition ${page === number ? "border-[#256441] bg-[#256441] text-white" : "border-[#c6d5ca] bg-white text-[#526057] hover:border-[#86a590] hover:text-[#256441]"}`}
          >
            {number}
          </button>
        ),
      )}
      <button
        type="button"
        disabled={page === totalPages}
        onClick={() => onChange(Math.min(totalPages, page + 1))}
        className="grid size-9 place-items-center rounded-lg border border-[#c6d5ca] bg-white text-lg font-bold text-[#256441] transition hover:border-[#86a590] hover:bg-[#eefdf1] disabled:pointer-events-none disabled:opacity-35"
        aria-label="Próxima página"
      >
        ›
      </button>
    </nav>
  );
}

export function ProfileLoading({ label }: { label: string }) {
  return (
    <div className="min-h-screen bg-[#eefdf1] text-[#121e17]">
      <SiteHeader />
      <SkeletonLoader variant="profile" />
      <span className="sr-only">{label}</span>
    </div>
  );
}

