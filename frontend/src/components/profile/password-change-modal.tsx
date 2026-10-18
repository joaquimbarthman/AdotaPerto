"use client";

import type { FormEvent } from "react";
import { ProfileField } from "./profile-ui";
import { AccountModal } from "./account-access-ui";

type Props = { loading: boolean; onClose: () => void; onSubmit: (event: FormEvent<HTMLFormElement>) => void };

export function PasswordChangeModal({ loading, onClose, onSubmit }: Props) {
  return (        <AccountModal
          title="Alterar senha"
          icon="/icons/password.svg"
          onClose={() => onClose()}
        >
          <form onSubmit={onSubmit} className="space-y-4">
            <section className="account-password-section rounded-2xl border border-[#d7e6da] bg-[#f7fcf8] p-4 sm:p-5">
              <div className="mb-4 flex items-center gap-3">
                <span className="grid size-7 shrink-0 place-items-center rounded-full bg-[#256441] text-xs font-extrabold text-white">
                  1
                </span>
                <h4 className="text-sm font-extrabold text-[#253129]">
                  Confirme sua identidade
                </h4>
              </div>
              <ProfileField
                label="Senha atual"
                name="senhaAtual"
                type="password"
                placeholder="Digite sua senha atual"
                autoComplete="current-password"
                required
              />
            </section>
            <section className="account-password-section rounded-2xl border border-[#d7e6da] p-4 sm:p-5">
              <div className="mb-4 flex items-center gap-3">
                <span className="grid size-7 shrink-0 place-items-center rounded-full bg-[#256441] text-xs font-extrabold text-white">
                  2
                </span>
                <h4 className="text-sm font-extrabold text-[#253129]">
                  Defina a nova senha
                </h4>
              </div>
              <div className="space-y-3.5">
                <ProfileField
                  label="Nova senha"
                  name="novaSenha"
                  type="password"
                  placeholder="Mínimo de 8 caracteres"
                  autoComplete="new-password"
                  minLength={8}
                  required
                />
                <ProfileField
                  label="Confirmar nova senha"
                  name="confirmarSenha"
                  type="password"
                  placeholder="Digite novamente"
                  autoComplete="new-password"
                  minLength={8}
                  required
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
                {loading ? "Salvando..." : "Salvar nova senha"}
              </button>
            </footer>
          </form>
        </AccountModal>
  );
}
