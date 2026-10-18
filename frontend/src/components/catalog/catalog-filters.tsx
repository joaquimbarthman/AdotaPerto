"use client";

import { DirectionalChevron } from "@/components/directional-chevron";
import { useState, type ReactNode } from "react";

export function CatalogFilterPanel({
  activeFilters,
  onClear,
  children,
}: {
  activeFilters: number;
  onClear: () => void;
  children: ReactNode;
}) {
  const [open, setOpen] = useState(true);

  return (
    <aside className="lg:sticky lg:top-28">
      <details
        className="group overflow-hidden rounded-xl border border-[#d7e6da] bg-white shadow-[0_8px_24px_rgba(38,51,43,0.06)] sm:rounded-2xl"
        open={open}
      >
        <summary
          onClick={(event) => {
            event.preventDefault();
            if (window.innerWidth < 1024) setOpen((value) => !value);
          }}
          className="flex cursor-pointer list-none items-center justify-between border-b border-[#e7eee9] bg-[#f7fcf8] px-4 py-2.5 [&::-webkit-details-marker]:hidden sm:px-5 sm:py-4 lg:cursor-default"
        >
          <div className="flex items-center gap-2">
            <h2 className="text-base font-semibold sm:text-xl">Filtros</h2>
            {activeFilters > 0 && (
              <span className="grid size-5 place-items-center rounded-full bg-[#256441] text-[10px] font-bold text-white">
                {activeFilters}
              </span>
            )}
          </div>
          <div className="flex items-center">
            <button
              type="button"
              onClick={(event) => {
                event.preventDefault();
                event.stopPropagation();
                onClear();
              }}
              disabled={activeFilters === 0}
              className="hidden min-h-8 items-center rounded-lg px-2.5 text-xs font-semibold text-[#256441] hover:bg-[#e8f7eb] disabled:pointer-events-none disabled:text-[#9aa69e] lg:inline-flex"
            >
              Limpar
            </button>
            <DirectionalChevron
              direction="down"
              className={`text-[#256441] transition-transform lg:hidden ${open ? "rotate-90" : ""}`}
            />
          </div>
        </summary>
        <div className="flex flex-col px-4 pb-3 sm:px-5 sm:pb-4">
          {children}
          {activeFilters > 0 && (
            <button
              type="button"
              onClick={onClear}
              className="mt-5 rounded-xl border border-[#256441] py-2.5 text-sm font-semibold text-[#256441] hover:bg-[#e8f7eb] lg:hidden"
            >
              Limpar todos os filtros
            </button>
          )}
        </div>
      </details>
    </aside>
  );
}

export function FilterChecks({
  title,
  options,
  selected,
  onToggle,
}: {
  title: string;
  options: string[];
  selected: string[];
  onToggle: (value: string) => void;
}) {
  return (
    <section className="border-b border-[#e7eee9] py-4">
      <h3 className="mb-2 text-[13px] font-semibold tracking-[0.04em] text-[#4d5b53]">
        {title}
      </h3>
      <div className="space-y-2">
        {options.map((option) => (
          <label
            key={option}
            className="flex cursor-pointer items-start gap-2.5 text-sm text-[#26332b]"
          >
            <input
              type="checkbox"
              checked={selected.includes(option)}
              onChange={() => onToggle(option)}
              className="peer sr-only"
            />
            <span className="mt-0.5 grid size-4.5 shrink-0 place-items-center rounded-[5px] border border-[#c6d5ca] text-xs font-bold text-white peer-checked:border-[#256441] peer-checked:bg-[#256441]">
              {selected.includes(option) ? "✓" : ""}
            </span>
            <span>{option}</span>
          </label>
        ))}
      </div>
    </section>
  );
}

export function FilterPills({
  title,
  options,
  selected,
  onSelect,
}: {
  title: string;
  options: string[];
  selected: string;
  onSelect: (value: string) => void;
}) {
  return (
    <section className="border-b border-[#e7eee9] py-4">
      <h3 className="mb-2 text-[13px] font-semibold tracking-[0.04em] text-[#4d5b53]">
        {title}
      </h3>
      <div className="flex flex-wrap gap-1.5">
        {options.map((option) => (
          <button
            type="button"
            key={option}
            onClick={() => onSelect(option)}
            className={`min-w-10 rounded-xl border px-3 py-1 text-xs font-semibold transition-all active:scale-95 ${selected === option ? "border-[#256441] bg-[#256441] text-white shadow-sm" : "border-[#c6d5ca] bg-white text-[#4d5b53] hover:border-[#256441] hover:bg-[#eefdf1] hover:text-[#256441]"}`}
          >
            {option}
          </button>
        ))}
      </div>
    </section>
  );
}

export { DistanceFilter } from "./distance-filter";
