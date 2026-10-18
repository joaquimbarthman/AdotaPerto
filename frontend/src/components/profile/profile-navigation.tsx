"use client";

import type { ReactNode } from "react";
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

export { RequestDirectionTabs, RequestTypePicker } from "./profile-request-controls";
