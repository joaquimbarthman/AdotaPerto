"use client";

import Link from "next/link";
import { box } from "./styles";
import type { Request } from "./types";

export function RequestList({
  title,
  rows,
  kind,
  currentUserId,
  canManage,
  busy,
  onStatus,
}: {
  title: string;
  rows: Request[];
  kind: "animal" | "item";
  currentUserId?: string;
  canManage: boolean;
  busy: boolean;
  onStatus: (
    kind: "animal" | "item",
    id: string,
    status: "Aprovada" | "Recusada",
  ) => Promise<void>;
}) {
  return (
    <section className={box}>
      <h2 className="text-lg font-bold">
        {title}{" "}
        <span className="text-sm font-normal text-[#68726b]">
          ({rows.length})
        </span>
      </h2>
      <div className="mt-4 divide-y divide-[#e4eee7]">
        {rows.length === 0 && (
          <p className="py-4 text-sm text-[#68726b]">
            Nenhuma solicitação recebida.
          </p>
        )}
        {rows.map((row) => (
          <div
            key={row.id}
            className="flex flex-wrap items-center justify-between gap-3 py-3"
          >
            <div>
              <strong className="text-sm">
                {row.animalName || row.itemTitle}
              </strong>
              <p className="text-xs text-[#68726b]">
                {row.requesterName} · {row.status} ·{" "}
                {new Date(row.createdAt).toLocaleDateString("pt-BR")}
              </p>
            </div>
            {row.ownerId === currentUserId || canManage ? (
              <div className="flex flex-wrap gap-3">
                {kind === "animal" && (
                  <Link
                    href={`/perfil/solicitacoes/${row.id}`}
                    className="text-sm font-semibold text-[#256441]"
                  >
                    Detalhes
                  </Link>
                )}
                {["PENDING", "Em análise"].includes(row.status) && (
                  <>
                    <button
                      type="button"
                      disabled={busy}
                      onClick={() => void onStatus(kind, row.id, "Aprovada")}
                      className="text-sm font-semibold text-[#256441] disabled:opacity-50"
                    >
                      Aprovar
                    </button>
                    <button
                      type="button"
                      disabled={busy}
                      onClick={() => void onStatus(kind, row.id, "Recusada")}
                      className="text-sm font-semibold text-red-700 disabled:opacity-50"
                    >
                      Recusar
                    </button>
                  </>
                )}
              </div>
            ) : (
              <span className="text-xs text-[#68726b]">Acompanhamento</span>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}
