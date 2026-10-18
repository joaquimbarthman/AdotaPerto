"use client";

import Image from "next/image";
import type { FormEvent } from "react";
import { ProfileField } from "./profile-ui";
import { AccountModal } from "./account-access-ui";

type Props = { userEmail: string; loading: boolean; onClose: () => void; onSubmit: (event: FormEvent<HTMLFormElement>) => void };

export function EmailChangeModal({ userEmail, loading, onClose, onSubmit }: Props) {
  return (        <AccountModal
          title="Alterar e-mail"
          icon="/icons/email.svg"
          onClose={() => onClose()}
        >
          <form onSubmit={onSubmit} className="space-y-4">
            <section className="account-email-section overflow-hidden rounded-2xl border border-[#d7e6da]">
              <div className="bg-[#f7fcf8] px-4 py-4 sm:px-5">
                <span className="text-[11px] font-extrabold uppercase tracking-[0.08em] text-[#68726b]">
                  E-mail atual
                </span>
                <div className="mt-2 flex min-w-0 items-center gap-3">
                  <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-[#e3f2e6]">
                    <Image
                      src="/icons/email.svg"
                      alt=""
                      width={17}
                      height={17}
                    />
                  </span>
                  <p className="min-w-0 truncate text-sm font-bold text-[#253129]">
                    {userEmail}
                  </p>
                </div>
              </div>
              <div className="border-t border-[#d7e6da] bg-white px-4 py-4 sm:px-5 sm:py-5">
                <ProfileField
                  label="Novo e-mail"
                  name="novoEmail"
                  type="email"
                  placeholder="novoemail@exemplo.com"
                  autoComplete="email"
                  required
                  autoFocus
                />
              </div>
            </section>
            <footer className="grid grid-cols-[minmax(0,0.75fr)_minmax(0,1.25fr)] gap-2.5 pt-1">
              <button
                type="button"
                onClick={() => onClose()}
                className="min-h-12 w-full rounded-xl border border-[#86a590] px-4 py-2.5 text-sm font-bold text-[#256441] transition hover:bg-[#e8f7eb]"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={loading}
                className="min-h-12 w-full rounded-xl bg-[#256441] px-4 py-2.5 text-sm font-extrabold text-white shadow-md transition hover:-translate-y-0.5 hover:bg-[#194b30] hover:shadow-lg disabled:opacity-60"
              >
                {loading ? "Enviando..." : "Enviar confirmação"}
              </button>
            </footer>
          </form>
        </AccountModal>
  );
}
