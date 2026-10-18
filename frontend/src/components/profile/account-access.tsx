"use client";

import { Notification } from "@/components/notification";
import { authClient } from "@/lib/auth-client";
import { authErrorMessage } from "@/lib/auth-error-message";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { FormEvent } from "react";
import { useState } from "react";
import { API_BASE_URL } from "./config";
import { SectionHeading } from "./profile-ui";
import { AccessRow } from "./account-access-ui";
import { AccountDeletion } from "./account-deletion";
import { EmailChangeModal } from "./email-change-modal";
import { PasswordChangeModal } from "./password-change-modal";

export function AccountAccess({ userEmail }: { userEmail: string }) {
  const router = useRouter();
  const [modal, setModal] = useState<"email" | "senha" | null>(null);
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
  const [deleteConfirmation, setDeleteConfirmation] = useState("");
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

  async function handleAccountDeletion() {
    if (deleteConfirmation !== "DELETAR") return;

    setStatusMessage(null);
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/users/me`, {
        method: "DELETE",
        credentials: "include",
      });
      if (!response.ok) {
        const body = await response.json().catch(() => null);
        throw new Error(body?.error || "Não foi possível excluir sua conta.");
      }

      await authClient.signOut();
      router.replace("/");
      router.refresh();
    } catch (error) {
      setStatusMessage({
        type: "error",
        text:
          error instanceof Error
            ? error.message
            : "Não foi possível excluir sua conta.",
      });
    } finally {
      setLoading(false);
    }
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

      <AccountDeletion showDeleteConfirmation={showDeleteConfirmation} setShowDeleteConfirmation={setShowDeleteConfirmation} deleteConfirmation={deleteConfirmation} setDeleteConfirmation={setDeleteConfirmation} loading={loading} handleAccountDeletion={handleAccountDeletion} onClearStatus={() => setStatusMessage(null)} />

      {modal === "email" && <EmailChangeModal userEmail={userEmail} loading={loading} onClose={() => setModal(null)} onSubmit={handleEmailChange} />}

      {modal === "senha" && <PasswordChangeModal loading={loading} onClose={() => setModal(null)} onSubmit={handlePasswordChange} />}
    </section>
  );
}
