"use client";

import { EmptyState } from "@/components/empty-state";
import Image from "next/image";
import { useState, type FormEvent, type ReactNode } from "react";

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
      <div className="min-h-0 p-4 sm:min-h-105 sm:p-7">{children}</div>
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
