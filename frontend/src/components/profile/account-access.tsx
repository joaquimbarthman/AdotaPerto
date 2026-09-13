"use client";

import { Notification } from "@/components/notification";
import { authClient } from "@/lib/auth-client";
import { authErrorMessage } from "@/lib/auth-error-message";
import Image from "next/image";
import Link from "next/link";
import type { FormEvent, ReactNode } from "react";
import { useState } from "react";
import { createPortal } from "react-dom";
import { ProfileField, SectionHeading } from "./profile-ui";

export function AccountAccess({ userEmail }: { userEmail: string }) {
  const [modal, setModal] = useState<"email" | "senha" | null>(null);
  const [statusMessage, setStatusMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);
  const [loading, setLoading] = useState(false);

  async function handlePasswordChange(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatusMessage(null);
    const form = new FormData(e.currentTarget);
    const currentPassword = form.get("senhaAtual") as string;
    const newPassword = form.get("novaSenha") as string;
    const confirmPassword = form.get("confirmarSenha") as string;

    if (newPassword !== confirmPassword) {
      setStatusMessage({
        type: "error",
        text: "As novas senhas não coincidem.",
      });
      return;
    }

    setLoading(true);
    const { error } = await authClient.changePassword({
      currentPassword,
      newPassword,
      revokeOtherSessions: true,
    });
    setLoading(false);

    if (error) {
      setStatusMessage({
        type: "error",
        text: authErrorMessage(error, "Erro ao alterar a senha."),
      });
      return;
    }

    setStatusMessage({ type: "success", text: "Senha alterada com sucesso!" });
    setModal(null);
  }

  async function handleEmailChange(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatusMessage(null);
    const form = new FormData(e.currentTarget);
    const newEmail = form.get("novoEmail") as string;

    setLoading(true);
    const { error } = await authClient.changeEmail({
      newEmail,
      callbackURL: `${window.location.origin}/verificar-email?email=${encodeURIComponent(newEmail.trim().toLowerCase())}`,
    });
    setLoading(false);

    if (error) {
      setStatusMessage({
        type: "error",
        text: authErrorMessage(error, "Erro ao solicitar alteração de e-mail."),
      });
      return;
    }

    setStatusMessage({
      type: "success",
      text: "Solicitação enviada! Verifique seu e-mail para confirmar.",
    });
    setModal(null);
  }

  return (
    <section id="panel-acesso" role="tabpanel" aria-labelledby="tab-acesso">
      <SectionHeading
        title="Acesso à conta"
        description="Consulte e altere com segurança seus dados de acesso."
      />

      {statusMessage && (
        <Notification text={statusMessage.text} type={statusMessage.type} />
      )}

      <div className="max-w-3xl divide-y divide-[#d7e6da] overflow-hidden rounded-xl border border-[#d7e6da]">
        <AccessRow
          icon="/icons/email.svg"
          title="E-mail"
          value={userEmail}
          onEdit={() => {
            setStatusMessage(null);
            setModal("email");
          }}
        />
        <AccessRow
          icon="/icons/password.svg"
          title="Senha"
          value="••••••••••••"
          onEdit={() => {
            setStatusMessage(null);
            setModal("senha");
          }}
        />
      </div>

      <div className="mt-5 max-w-3xl rounded-xl border border-[#d7e6da] bg-[#f7fcf8] p-5">
        <h3 className="text-sm font-bold text-[#253129]">
          Esqueceu sua senha?
        </h3>
        <p className="mt-1 text-sm leading-6 text-[#5b675f]">
          Receba um c&oacute;digo de 4 d&iacute;gitos no seu e-mail e crie uma
          nova senha com seguran&ccedil;a.
        </p>
        <Link
          href="/esqueci-senha"
          className="mt-4 inline-flex rounded-lg border border-[#256441] px-5 py-2.5 text-sm font-bold text-[#256441] transition hover:bg-[#256441] hover:text-white"
        >
          Redefinir senha
        </Link>
      </div>

      {modal === "email" && (
        <AccountModal
          title="Alterar e-mail"
          icon="/icons/email.svg"
          onClose={() => setModal(null)}
        >
          <form onSubmit={handleEmailChange} className="space-y-4">
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
                onClick={() => setModal(null)}
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
      )}

      {modal === "senha" && (
        <AccountModal
          title="Alterar senha"
          icon="/icons/password.svg"
          onClose={() => setModal(null)}
        >
          <form onSubmit={handlePasswordChange} className="space-y-4">
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
                onClick={() => setModal(null)}
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
      )}
    </section>
  );
}

export function AccessRow({
  icon,
  title,
  value,
  onEdit,
}: {
  icon: string;
  title: string;
  value: string;
  onEdit: () => void;
}) {
  return (
    <div className="flex items-center gap-3 bg-[#f7fcf8] p-3.5 sm:gap-4 sm:p-5">
      <div className="flex min-w-0 flex-1 items-center gap-3 sm:gap-4">
        <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-[#e3f2e6] sm:size-11 sm:rounded-xl">
          <Image src={icon} alt="" width={18} height={18} />
        </span>
        <div className="min-w-0">
          <p className="text-sm font-bold text-[#253129]">{title}</p>
          <p className="mt-1 truncate text-sm text-[#5b675f]">{value}</p>
        </div>
      </div>
      <button
        type="button"
        onClick={onEdit}
        className="shrink-0 rounded-lg border border-[#256441] px-3 py-2 text-xs font-bold text-[#256441] transition hover:bg-[#256441] hover:text-white sm:px-5 sm:py-2.5 sm:text-sm"
      >
        Alterar
      </button>
    </div>
  );
}

export function AccountModal({
  title,
  description,
  icon,
  onClose,
  children,
}: {
  title: string;
  description?: string;
  icon: string;
  onClose: () => void;
  children: ReactNode;
}) {
  return createPortal(
    <div
      className="fixed inset-0 z-50 grid place-items-center overflow-y-auto bg-[#0b1510]/65 p-3 backdrop-blur-sm sm:p-6"
      role="dialog"
      aria-modal="true"
      aria-labelledby="account-modal-title"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div className="account-modal-card my-auto w-full max-w-[520px] overflow-hidden rounded-3xl border border-white/10 bg-white shadow-[0_24px_80px_rgba(5,20,11,0.32)]">
        <header className="account-modal-header flex items-center gap-4 border-b border-[#d7e6da] bg-gradient-to-br from-[#f7fcf8] to-[#eef8f0] px-5 py-5 text-left sm:px-7 sm:py-6">
          <span className="account-modal-icon grid size-11 shrink-0 place-items-center rounded-xl border border-[#cfe3d4] bg-white shadow-sm">
            <Image src={icon} alt="" width={21} height={21} />
          </span>
          <div>
            <h3
              id="account-modal-title"
              className="text-xl font-extrabold leading-7 tracking-[-0.01em] text-[#18271e] sm:text-2xl sm:leading-8"
            >
              {title}
            </h3>
            {description && (
              <p className="mt-1 text-sm leading-5 text-[#5b675f]">
                {description}
              </p>
            )}
          </div>
        </header>
        <div className="max-h-[min(72vh,680px)] overflow-y-auto p-5 sm:p-7">
          {children}
        </div>
      </div>
    </div>,
    document.body,
  );
}
