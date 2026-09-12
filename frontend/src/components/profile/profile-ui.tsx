"use client";

import { EmptyState } from "@/components/empty-state";
import { SiteHeader } from "@/components/site-header";
import { SkeletonLoader } from "@/components/skeleton-loader";
import Image from "next/image";
import type { FormEvent, ReactNode } from "react";
import { useEffect, useState } from "react";
import type { TabId } from "./types";

export function PageHeading({
  title,
  description,
  action,
}: {
  title: string;
  description: string;
  action?: ReactNode;
}) {
  return (
    <header className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between sm:gap-4">
      <div>
        <p className="mb-0.5 text-[10px] font-bold uppercase tracking-[0.12em] text-[#3f7d58] sm:mb-1 sm:text-xs sm:tracking-[0.14em]">
          Área de gestão
        </p>
        <h2 className="text-xl font-extrabold tracking-[-0.02em] sm:text-3xl">
          {title}
        </h2>
        <p className="mt-1 max-w-2xl text-xs leading-4 text-[#5b675f] sm:text-sm sm:leading-6">
          {description}
        </p>
      </div>
      {action}
    </header>
  );
}

export function ProfileNavIcon({ id }: { id: TabId }) {
  const common = {
    viewBox: "0 0 24 24",
    className: "size-4 shrink-0 lg:size-5",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 2,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    "aria-hidden": true,
  };
  if (id === "publicacoes")
    return (
      <svg {...common}>
        <path d="M20.8 4.7a5.2 5.2 0 0 0-7.4 0L12 6.1l-1.4-1.4a5.2 5.2 0 0 0-7.4 7.4L12 21l8.8-8.9a5.2 5.2 0 0 0 0-7.4Z" />
      </svg>
    );
  if (id === "solicitacoes")
    return (
      <svg {...common}>
        <path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9M10 21h4" />
      </svg>
    );
  if (id === "favoritos")
    return (
      <svg {...common}>
        <path d="M6 3h12v18l-6-4-6 4V3Z" />
      </svg>
    );
  if (id === "dados")
    return (
      <svg {...common}>
        <circle cx="12" cy="8" r="4" />
        <path d="M4 21a8 8 0 0 1 16 0" />
      </svg>
    );
  if (id === "endereco")
    return (
      <svg {...common}>
        <path d="M20 10c0 5-8 11-8 11S4 15 4 10a8 8 0 1 1 16 0Z" />
        <circle cx="12" cy="10" r="2.5" />
      </svg>
    );
  return (
    <svg {...common}>
      <rect x="4" y="10" width="16" height="11" rx="2" />
      <path d="M8 10V7a4 4 0 0 1 8 0v3M12 15v2" />
    </svg>
  );
}

export function SegmentedControl({
  value,
  options,
  onChange,
}: {
  value: string;
  options: { id: string; label: string; count: number }[];
  onChange: (id: string) => void;
}) {
  return (
    <div
      className="flex w-fit flex-wrap items-center gap-1.5 sm:gap-2"
      role="tablist"
    >
      {options.map((option) => (
        <button
          key={option.id}
          type="button"
          role="tab"
          aria-selected={value === option.id}
          onClick={() => onChange(option.id)}
          className={`group inline-flex min-h-8 items-center gap-1 rounded-lg px-2.5 py-1 text-xs font-semibold transition sm:min-h-9 sm:gap-1.5 sm:px-3 sm:py-1.5 sm:text-sm ${value === option.id ? "bg-[#e3f2e6] text-[#256441]" : "text-[#526057] hover:bg-[#e8f7eb] hover:text-[#256441]"}`}
        >
          <span>{option.label}</span>
          <span className="rounded-full bg-[#256441]/10 px-1.5 py-0.5 text-[10px] font-bold text-[#256441] sm:text-[11px]">
            {option.count}
          </span>
          <svg
            viewBox="0 0 20 20"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            className={`hidden size-3.5 transition-transform group-hover:translate-x-0.5 sm:block ${value === option.id ? "opacity-100" : "opacity-50"}`}
            aria-hidden="true"
          >
            <path d="m7.5 4.5 5 5.5-5 5.5" />
          </svg>
        </button>
      ))}
    </div>
  );
}

export function RequestDirectionTabs({
  value,
  options,
  onChange,
}: {
  value: string;
  options: { id: string; label: string; count: number }[];
  onChange: (id: string) => void;
}) {
  return (
    <div
      className="flex w-fit flex-wrap items-center gap-1.5 sm:gap-2"
      role="tablist"
      aria-label="Direção da solicitação"
    >
      {options.map((option) => (
        <button
          key={option.id}
          type="button"
          role="tab"
          aria-selected={value === option.id}
          onClick={() => onChange(option.id)}
          className={`group inline-flex min-h-8 items-center gap-1 rounded-lg px-2.5 py-1 text-xs font-semibold transition sm:min-h-9 sm:gap-1.5 sm:px-3 sm:py-1.5 sm:text-sm ${value === option.id ? "bg-[#e3f2e6] text-[#256441]" : "text-[#526057] hover:bg-[#e8f7eb] hover:text-[#256441]"}`}
        >
          <span>{option.label}</span>
          <span className="rounded-full bg-[#256441]/10 px-1.5 py-0.5 text-[10px] font-bold text-[#256441] sm:text-[11px]">
            {option.count}
          </span>
        </button>
      ))}
    </div>
  );
}

export function RequestTypePicker({
  value,
  onChange,
  animalCount,
  itemCount,
}: {
  value: "animais" | "itens";
  onChange: (value: "animais" | "itens") => void;
  animalCount: number;
  itemCount: number;
}) {
  const options = [
    { id: "animais" as const, title: "Animais", count: animalCount },
    { id: "itens" as const, title: "Itens", count: itemCount },
  ];
  return (
    <div
      className="flex flex-wrap items-center gap-1.5 sm:gap-2"
      role="tablist"
      aria-label="Tipo de solicitação"
    >
      {options.map((option) => (
        <button
          key={option.id}
          type="button"
          role="tab"
          aria-selected={value === option.id}
          onClick={() => onChange(option.id)}
          className={`group inline-flex min-h-8 items-center gap-1 rounded-lg px-2.5 py-1 text-xs font-semibold transition sm:min-h-9 sm:gap-1.5 sm:px-3 sm:py-1.5 sm:text-sm ${value === option.id ? "bg-[#e3f2e6] text-[#256441]" : "text-[#526057] hover:bg-[#e8f7eb] hover:text-[#256441]"}`}
        >
          <span>{option.title}</span>
          <span className="rounded-full bg-[#256441]/10 px-1.5 py-0.5 text-[10px] font-bold text-[#256441] sm:text-[11px]">
            {option.count}
          </span>
        </button>
      ))}
    </div>
  );
}

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
    <label className="relative block w-full sm:max-w-[310px]">
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

export function ProfileForm({
  children,
  showActions = true,
  onSubmit,
  loading,
}: {
  children: ReactNode;
  showActions?: boolean;
  onSubmit?: (event: FormEvent<HTMLFormElement>) => void;
  loading?: boolean;
}) {
  return (
    <form
      onSubmit={onSubmit || ((event) => event.preventDefault())}
      className="overflow-hidden rounded-xl bg-white shadow-[0_4px_12px_rgba(38,51,43,0.05)]"
    >
      <div className="min-h-0 p-4 sm:min-h-[420px] sm:p-7">{children}</div>
      {showActions && (
        <footer className="grid w-full grid-cols-[minmax(0,0.75fr)_minmax(0,1.25fr)] gap-2.5 border-t border-[#d7e6da] bg-[#f7fcf8] px-4 py-3 sm:gap-3 sm:px-7 sm:py-4">
          <button
            type="reset"
            className="min-h-12 w-full rounded-xl border border-[#86a590] bg-white px-3 py-2.5 text-xs font-bold text-[#256441] transition hover:bg-[#e8f7eb] active:scale-[0.98] sm:px-6 sm:text-sm"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={loading}
            className="min-h-12 w-full rounded-xl bg-[#256441] px-3 py-2.5 text-xs font-extrabold text-white shadow-md transition hover:-translate-y-0.5 hover:bg-[#194b30] hover:shadow-lg active:scale-[0.98] disabled:opacity-60 sm:px-7 sm:text-sm"
          >
            {loading ? "Salvando..." : "Salvar alterações"}
          </button>
        </footer>
      )}
    </form>
  );
}

export function EmptyTab({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return <EmptyState message={title} description={description} />;
}

export function SectionHeading({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <header className="mb-5 sm:mb-7">
      <h2 className="text-xl font-bold tracking-[-0.01em] sm:text-2xl">
        {title}
      </h2>
      <p className="mt-1 text-xs leading-4 text-[#5b675f] sm:text-sm sm:leading-6">
        {description}
      </p>
    </header>
  );
}

export type ProfileFieldProps = {
  label: string;
  name: string;
  type?: string;
  defaultValue?: string;
  placeholder?: string;
  autoComplete?: string;
  inputMode?: "numeric" | "text" | "tel" | "email" | "url";
  minLength?: number;
  required?: boolean;
  autoFocus?: boolean;
};

export function ProfileField({
  label,
  type = "text",
  ...props
}: ProfileFieldProps) {
  const [passwordVisible, setPasswordVisible] = useState(false);
  const isPassword = type === "password";
  return (
    <label>
      <span className="mb-2 block text-sm font-bold text-[#253129]">
        {label}
      </span>
      <span className="relative block">
        <input
          {...props}
          type={isPassword && passwordVisible ? "text" : type}
          className={`h-10 w-full rounded-lg border border-[#c0c9bf] bg-[#f7fcf8] px-3 text-sm text-[#121e17] outline-none transition placeholder:text-[#879188] focus:border-[#3f7d58] focus:ring-2 focus:ring-[#3f7d58]/15 sm:h-12 sm:rounded-xl sm:px-4 ${isPassword ? "pr-11 sm:pr-12" : ""}`}
        />
        {isPassword && (
          <button
            type="button"
            onClick={() => setPasswordVisible((visible) => !visible)}
            className="absolute right-1.5 top-1/2 grid size-8 -translate-y-1/2 place-items-center rounded-lg transition hover:bg-[#e3f2e6] sm:right-2"
            aria-label={passwordVisible ? "Ocultar senha" : "Mostrar senha"}
          >
            <Image
              src="/icons/eye-off.svg"
              alt=""
              width={18}
              height={18}
              className={passwordVisible ? "opacity-50" : ""}
            />
          </button>
        )}
      </span>
    </label>
  );
}
