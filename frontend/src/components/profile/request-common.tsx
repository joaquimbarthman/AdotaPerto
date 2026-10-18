"use client";

import type { AdoptionRequestItem } from "./types";

export function formatRequestDate(value: string) {
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? "data não informada"
    : date.toLocaleDateString("pt-BR");
}

export function StatusBadge({ status }: { status: string }) {
  const normalized = status === "PENDING" ? "Em análise" : status;
  const tone =
    normalized === "Aprovada"
      ? "bg-green-100 text-green-800"
      : normalized === "Recusada" || normalized === "Cancelada"
        ? "bg-red-50 text-red-700"
        : "bg-[#fff2e5] text-[#764200]";
  return (
    <span
      className={`shrink-0 rounded-md px-3 py-1.5 text-xs font-bold ${tone}`}
    >
      {normalized}
    </span>
  );
}

export function isApproved(status: string) {
  return status === "Aprovada" || status === "APPROVED";
}

export function ApprovedContactLinks({
  contact,
}: {
  contact: NonNullable<AdoptionRequestItem["ownerContact"]>;
}) {
  const phone = contact.whatsapp?.trim();
  const instagram = contact.instagram?.trim();
  if (!phone && !instagram) return null;
  const phoneDigits = phone?.replace(/\D/g, "") || "";
  const whatsappNumber =
    phoneDigits.length === 10 || phoneDigits.length === 11
      ? `55${phoneDigits}`
      : phoneDigits;
  const instagramUser = instagram
    ?.replace(/^https?:\/\/(www\.)?instagram\.com\//i, "")
    .replace(/^@/, "")
    .replace(/\/$/, "");
  return (
    <div
      className="mt-2.5 flex flex-wrap gap-1.5 sm:mt-4 sm:gap-2"
      aria-label="Contatos do responsável"
    >
      {phone && (
        <a
          href={`https://wa.me/${whatsappNumber}`}
          target="_blank"
          rel="noreferrer"
          className="inline-flex min-h-8 min-w-0 items-center gap-1.5 rounded-md bg-[#e3f2e6] px-2 text-[10px] font-bold text-[#256441] transition hover:bg-[#d7eeda] sm:min-h-10 sm:gap-2 sm:rounded-lg sm:px-3.5 sm:text-xs"
          aria-label={`Conversar pelo WhatsApp no número ${phone}`}
        >
          <svg
            viewBox="0 0 24 24"
            className="size-3.5 shrink-0 sm:size-4.25"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <path d="M20 11.5a8 8 0 0 1-11.8 7L4 19.8l1.3-4A8 8 0 1 1 20 11.5Z" />
            <path d="M9 8.5c.4 3 2.1 4.7 5.2 5.3" />
          </svg>
          <span className="truncate">{phone}</span>
        </a>
      )}
      {instagram && instagramUser && (
        <a
          href={`https://instagram.com/${instagramUser}`}
          target="_blank"
          rel="noreferrer"
          className="inline-flex min-h-8 min-w-0 items-center gap-1.5 rounded-md bg-[#e3f2e6] px-2 text-[10px] font-bold text-[#256441] transition hover:bg-[#d7eeda] sm:min-h-10 sm:gap-2 sm:rounded-lg sm:px-3.5 sm:text-xs"
          aria-label={`Abrir Instagram de ${instagram}`}
        >
          <svg
            viewBox="0 0 24 24"
            className="size-3.5 shrink-0 sm:size-4.25"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <rect x="3" y="3" width="18" height="18" rx="5" />
            <circle cx="12" cy="12" r="4" />
            <circle
              cx="17.5"
              cy="6.5"
              r="1"
              fill="currentColor"
              stroke="none"
            />
          </svg>
          <span className="truncate">@{instagramUser}</span>
        </a>
      )}
    </div>
  );
}

