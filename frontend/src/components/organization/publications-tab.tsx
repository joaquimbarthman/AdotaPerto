"use client";

import type { DashboardProps } from "./dashboard-props";
import Link from "next/link";
import { PublicationList } from "./organization-lists";
import { box, button } from "./styles";

export function PublicationsTab({ dashboard, currentUserId, canManage, busy, claimPublications, deletePublication }: Pick<DashboardProps, "dashboard" | "currentUserId" | "canManage" | "busy" | "claimPublications" | "deletePublication">) {
  return (
        <div className="mt-6 space-y-5">
          <div className="flex flex-wrap gap-2">
            <Link
              className={button}
              href={`/doacoes/animal?organization=${encodeURIComponent(dashboard.organization.id)}`}
            >
              Cadastrar animal
            </Link>
            <Link
              className={button}
              href={`/doacoes/item?organization=${encodeURIComponent(dashboard.organization.id)}`}
            >
              Publicar item
            </Link>
          </div>
          <section className={box}>
            <h2 className="text-sm font-bold">Já publicou pela sua conta?</h2>
            <p className="mt-1 text-sm text-[#68726b]">
              Vincule suas publicações pessoais à ONG para gerenciá-las aqui.
              Publicações de outras pessoas não serão alteradas.
            </p>
            <button
              type="button"
              disabled={busy}
              onClick={claimPublications}
              className="mt-3 text-sm font-bold text-[#256441] underline disabled:opacity-50"
            >
              Vincular minhas publicações
            </button>
          </section>
          <PublicationList
            title="Animais"
            rows={dashboard.animals}
            kind="animal"
            currentUserId={currentUserId}
            canManage={canManage}
            busy={busy}
            onDelete={deletePublication}
          />
          <PublicationList
            title="Itens para doação"
            rows={dashboard.items}
            kind="item"
            currentUserId={currentUserId}
            canManage={canManage}
            busy={busy}
            onDelete={deletePublication}
          />
        </div>
  );
}
