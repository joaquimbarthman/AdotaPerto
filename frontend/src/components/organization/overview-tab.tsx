"use client";

import Link from "next/link";
import type { Dashboard } from "./types";
import { box, button } from "./styles";

export function OverviewTab({ dashboard }: { dashboard: Dashboard }) {
  return (
        <div className="mt-6 space-y-6">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
            {[
              ["Animais", dashboard.animals.length],
              ["Itens", dashboard.items.length],
              [
                "Solicitações",
                dashboard.adoptionRequests.length +
                  dashboard.itemRequests.length,
              ],
              ["Voluntários", dashboard.members.filter((person) => person.role === "member").length],
              ["Externos", dashboard.externals.length],
            ].map(([label, value]) => (
              <div key={label} className={box}>
                <p className="text-sm text-[#68726b]">{label}</p>
                <strong className="mt-2 block text-3xl text-[#256441]">
                  {value}
                </strong>
              </div>
            ))}
          </div>
          <div
            className={`${box} flex flex-wrap items-center justify-between gap-4`}
          >
            <div>
              <h2 className="text-lg font-bold">Publicações da ONG</h2>
              <p className="text-sm text-[#68726b]">
                Publique usando a organização para aparecer neste painel.
              </p>
            </div>
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
          </div>
        </div>
  );
}
