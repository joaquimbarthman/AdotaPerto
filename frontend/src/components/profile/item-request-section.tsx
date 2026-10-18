"use client";

import { EmptyState } from "@/components/empty-state";
import Image from "next/image";
import Link from "next/link";
import type { DonationItemRequest } from "./types";
import { formatRequestDate, StatusBadge, isApproved, ApprovedContactLinks } from "./request-common";

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
        <EmptyState
          message={empty}
          description="As solicitações aparecerão aqui assim que forem enviadas ou recebidas."
        />
      ) : (
        <div className="space-y-3 sm:space-y-4">
          {requests.map((request) => (
            <article
              key={request.id}
              className="profile-request-card group grid grid-cols-[92px_1fr] overflow-hidden rounded-xl border border-[#e1e8e2] bg-white shadow-[0_4px_14px_rgba(38,51,43,0.05)] transition-all duration-300 ease-out hover:border-[#9fc5aa] hover:shadow-[0_18px_38px_rgba(31,91,57,0.14)] motion-reduce:transition-none sm:grid-cols-[140px_1fr] sm:rounded-2xl sm:hover:-translate-y-1.5 sm:hover:scale-[1.005]"
            >
              <div className="relative h-full min-h-39 overflow-hidden bg-[#e3f2e6] sm:min-h-46">
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

