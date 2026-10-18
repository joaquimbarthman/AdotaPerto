"use client";

import Link from "next/link";
import { box } from "./styles";
import type { Publication } from "./types";

export function PublicationList({
  title,
  rows,
  kind,
  currentUserId,
  canManage,
  busy,
  onDelete,
}: {
  title: string;
  rows: Publication[];
  kind: "animal" | "item";
  currentUserId?: string;
  canManage: boolean;
  busy: boolean;
  onDelete: (kind: "animal" | "item", id: string) => Promise<void>;
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
            Nenhuma publicação da ONG.
          </p>
        )}
        {rows.map((row) => (
          <div
            key={row.id}
            className="flex flex-wrap items-center justify-between gap-3 py-3"
          >
            <div>
              <strong className="text-sm">{row.name || row.title}</strong>
              <p className="text-xs text-[#68726b]">
                {row.status} ·{" "}
                {new Date(row.createdAt).toLocaleDateString("pt-BR")}
              </p>
            </div>
            <div className="flex gap-3">
              <Link
                href={
                  kind === "animal" ? `/adocao/${row.id}` : `/itens/${row.id}`
                }
                className="text-sm font-semibold text-[#256441]"
              >
                Ver
              </Link>
              {(row.userId === currentUserId || canManage) && (
                <>
                  <Link
                    href={
                      kind === "animal"
                        ? `/doacoes/animal?edit=${row.id}`
                        : `/doacoes/item?edit=${row.id}`
                    }
                    className="text-sm font-semibold text-[#256441]"
                  >
                    Editar
                  </Link>
                  <button
                    type="button"
                    disabled={busy}
                    onClick={() => void onDelete(kind, row.id)}
                    className="text-sm font-semibold text-red-700 disabled:opacity-50"
                  >
                    Excluir
                  </button>
                </>
              )}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

