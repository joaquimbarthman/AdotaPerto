"use client";

import { EmptyState } from "@/components/empty-state";
import Image from "next/image";
import Link from "next/link";
import type { AdoptionRequestItem, DonationItemRequest } from "./types";

export function ItemRequestSection({
  empty,
  requests,
  received = false,
  onUpdate,
}: {
  empty: string;
  requests: DonationItemRequest[];
  received?: boolean;
  onUpdate?: (id: string, status: "Aprovada" | "Recusada") => void;
}) {
  return (
    <section className="space-y-4">
      {requests.length === 0 ? (
        <EmptyState message={empty} />
      ) : (
        <div className="space-y-3 sm:space-y-4">
          {requests.map((request) => (
            <article
              key={request.id}
              className="profile-request-card group grid grid-cols-[92px_1fr] overflow-hidden rounded-xl border border-[#e1e8e2] bg-white shadow-[0_4px_14px_rgba(38,51,43,0.05)] transition-all duration-300 ease-out hover:border-[#9fc5aa] hover:shadow-[0_18px_38px_rgba(31,91,57,0.14)] motion-reduce:transition-none sm:grid-cols-[140px_1fr] sm:rounded-2xl sm:hover:-translate-y-1.5 sm:hover:scale-[1.005]"
            >
              <div className="relative h-full min-h-[156px] overflow-hidden bg-[#e3f2e6] sm:min-h-[184px]">
                <Image
                  src={request.item.mainImage || "/images/login-cover-v2.png"}
                  alt={request.item.title}
                  fill
                  sizes="(max-width:639px) 92px,140px"
                  className="object-cover transition-transform duration-500 ease-out group-hover:scale-[1.07] motion-reduce:transform-none"
                />
              </div>
              <div className="profile-request-body flex min-w-0 flex-col p-3 sm:p-5">
                <div className="flex items-start justify-between gap-2 sm:gap-3">
                  <div className="min-w-0">
                    <p className="text-[9px] font-bold uppercase tracking-wider text-[#708078] sm:text-xs">
                      Solicitação de item
                    </p>
                    <h4 className="mt-0.5 truncate text-sm font-extrabold sm:mt-1 sm:text-xl">
                      {request.item.title}
                    </h4>
                    {received && request.requester && (
                      <p className="mt-0.5 truncate text-[10px] text-[#526057] sm:mt-1 sm:text-sm">
                        Solicitado por <strong>{request.requester.name}</strong>
                      </p>
                    )}
                  </div>
                  <StatusBadge status={request.status} />
                </div>
                <div className="mt-3 flex flex-wrap gap-2">
                  <span className="rounded-md bg-[#e3f2e6] px-3 py-1.5 text-xs font-semibold text-[#404942]">
                    {request.item.category}
                  </span>
                  <span className="rounded-md bg-[#e3f2e6] px-3 py-1.5 text-xs font-semibold text-[#404942]">
                    {request.quantity} {request.item.unit}
                  </span>
                  <span className="rounded-md bg-[#e3f2e6] px-3 py-1.5 text-xs font-semibold text-[#404942]">
                    {request.item.deliveryMethod}
                  </span>
                </div>
                <p className="mt-3 text-xs font-medium text-[#68726b]">
                  Solicitação enviada em {formatRequestDate(request.createdAt)}
                </p>
                {!received &&
                  isApproved(request.status) &&
                  request.ownerContact && (
                    <ApprovedContactLinks contact={request.ownerContact} />
                  )}
                <div className="profile-request-actions mt-auto flex flex-wrap gap-1.5 pt-2 sm:flex-row sm:items-center sm:justify-between sm:gap-3 sm:pt-4">
                  <Link
                    href={`/itens/${request.item.id}`}
                    className="profile-action inline-flex min-h-11 items-center justify-center rounded-xl border border-[#86a590] bg-white px-4 text-sm font-semibold text-[#256441] transition hover:bg-[#f0faf3]"
                  >
                    Ver item
                  </Link>
                  {received &&
                    (request.status === "Em análise" ||
                      request.status === "PENDING") &&
                    onUpdate && (
                      <div className="grid flex-1 grid-cols-2 gap-1.5 sm:gap-2">
                        <button
                          type="button"
                          onClick={() => onUpdate(request.id, "Recusada")}
                          className="profile-action min-h-11 rounded-xl border border-red-200 px-4 text-sm font-semibold text-red-700 hover:bg-red-50"
                        >
                          Recusar
                        </button>
                        <button
                          type="button"
                          onClick={() => onUpdate(request.id, "Aprovada")}
                          className="profile-action min-h-11 rounded-xl bg-[#256441] px-5 text-sm font-semibold text-white hover:bg-[#194b30]"
                        >
                          Aprovar
                        </button>
                      </div>
                    )}
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}

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
            className="size-3.5 shrink-0 sm:size-[17px]"
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
            className="size-3.5 shrink-0 sm:size-[17px]"
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

export function RequestSection({
  empty,
  requests,
  received = false,
  onUpdate,
}: {
  empty: string;
  requests: AdoptionRequestItem[];
  received?: boolean;
  onUpdate?: (id: string, status: "Aprovada" | "Recusada") => void;
}) {
  return (
    <section className="space-y-4">
      {requests.length === 0 ? (
        <EmptyState message={empty} />
      ) : (
        requests.map((request) => (
          <article
            key={request.id}
            className="profile-request-card group grid grid-cols-[92px_1fr] overflow-hidden rounded-xl border border-[#e1e8e2] bg-white shadow-[0_4px_14px_rgba(38,51,43,0.05)] transition-all duration-300 ease-out hover:border-[#9fc5aa] hover:shadow-[0_18px_38px_rgba(31,91,57,0.14)] motion-reduce:transition-none sm:grid-cols-[148px_1fr] sm:rounded-2xl sm:hover:-translate-y-1.5 sm:hover:scale-[1.005]"
          >
            <div className="relative h-full min-h-[156px] overflow-hidden sm:min-h-[180px]">
              <Image
                src={request.animal?.image || "/images/login-cover-v2.png"}
                alt={request.animal?.name || "Animal"}
                fill
                sizes="(max-width:639px) 92px,148px"
                className="object-cover transition-transform duration-500 ease-out group-hover:scale-[1.07] motion-reduce:transform-none"
              />
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-transparent to-[#194b30]/10 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
            </div>
            <div className="profile-request-body flex min-w-0 flex-col p-3 sm:p-6">
              <div className="flex items-start justify-between gap-2 sm:gap-3">
                <div className="min-w-0">
                  <p className="text-[9px] font-bold uppercase tracking-wider text-[#708078] sm:text-xs">
                    Solicitação de adoção
                  </p>
                  <h4 className="mt-0.5 truncate text-sm font-extrabold sm:mt-1 sm:text-xl">
                    {request.animal?.name}
                  </h4>
                  {received && request.requester && (
                    <p className="mt-0.5 truncate text-[10px] text-[#526057] sm:mt-1 sm:text-sm">
                      Solicitado por <strong>{request.requester.name}</strong>
                    </p>
                  )}
                </div>
                <StatusBadge status={request.status} />
              </div>
              <div className="mt-3 flex flex-wrap gap-2">
                <span className="rounded-md bg-[#e3f2e6] px-3 py-1.5 text-xs font-semibold text-[#404942]">
                  {request.animal?.species}
                </span>
                <span className="rounded-md bg-[#e3f2e6] px-3 py-1.5 text-xs font-semibold text-[#404942]">
                  {request.animal?.sex}
                </span>
              </div>
              <p className="mt-3 text-xs font-medium text-[#68726b]">
                Solicitação enviada em {formatRequestDate(request.createdAt)}
              </p>
              {!received &&
                isApproved(request.status) &&
                request.ownerContact && (
                  <ApprovedContactLinks contact={request.ownerContact} />
                )}
              <div className="profile-request-actions mt-auto flex flex-wrap gap-1.5 pt-2 sm:flex-row sm:items-center sm:justify-between sm:gap-3 sm:pt-4">
                <div className="flex flex-wrap gap-1.5 sm:gap-2">
                  <Link
                    href={`/adocao/${request.animal?.id}`}
                    className="profile-action inline-flex min-h-11 items-center justify-center rounded-xl border border-[#86a590] bg-white px-4 text-sm font-semibold text-[#256441] transition hover:bg-[#f0faf3]"
                  >
                    Ver animal
                  </Link>
                  {received && request.answers && (
                    <Link
                      href={`/perfil/solicitacoes/${request.id}`}
                      className="profile-action inline-flex min-h-11 items-center justify-center rounded-xl bg-[#e3f2e6] px-4 text-sm font-semibold text-[#194b30] transition hover:bg-[#d7eeda]"
                    >
                      Informações
                    </Link>
                  )}
                </div>
                {received &&
                  (request.status === "Em análise" ||
                    request.status === "PENDING") &&
                  onUpdate && (
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => onUpdate(request.id, "Recusada")}
                        className="profile-action min-h-11 rounded-xl border border-red-200 bg-white px-4 text-sm font-semibold text-red-700 transition hover:bg-red-50"
                      >
                        Recusar
                      </button>
                      <button
                        type="button"
                        onClick={() => onUpdate(request.id, "Aprovada")}
                        className="profile-action min-h-11 rounded-xl bg-[#256441] px-5 text-sm font-semibold text-white shadow-sm transition hover:bg-[#194b30]"
                      >
                        Aprovar
                      </button>
                    </div>
                  )}
              </div>
            </div>
          </article>
        ))
      )}
    </section>
  );
}
