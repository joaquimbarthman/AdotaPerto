"use client";

import { authClient, useSession } from "@/lib/auth-client";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useSyncExternalStore } from "react";

const subscribeToUrl = (onChange: () => void) => {
  window.addEventListener("popstate", onChange);
  return () => window.removeEventListener("popstate", onChange);
};
const invitationFromUrl = () => new URLSearchParams(window.location.search).get("id");

export default function OrganizationInvitationPage() {
  const router = useRouter();
  const { data: session, isPending } = useSession();
  const invitationId = useSyncExternalStore(subscribeToUrl, invitationFromUrl, () => null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  async function accept() {
    if (!invitationId) return;
    setBusy(true); setError(null);
    const result = await authClient.organization.acceptInvitation({ invitationId });
    setBusy(false);
    if (result.error) { setError(result.error.message || "Não foi possível aceitar o convite."); return; }
    router.replace("/organizacao");
  }

  async function sendVerification() {
    if (!session || !invitationId) return;
    setBusy(true); setError(null); setMessage(null);
    const result = await authClient.sendVerificationEmail({
      email: session.user.email,
      callbackURL: `/organizacao/convite?id=${encodeURIComponent(invitationId)}`,
    });
    setBusy(false);
    if (result.error) { setError(result.error.message || "Não foi possível enviar a verificação."); return; }
    setMessage("Enviamos um link de verificação para seu e-mail.");
  }

  return <div className="min-h-screen bg-[#eefdf1] text-[#253129]"><SiteHeader /><main className="mx-auto max-w-xl px-4 pb-28 pt-16 lg:pb-16"><section className="rounded-2xl border border-[#d7e6da] bg-white p-6 shadow-sm sm:p-8"><p className="text-xs font-bold uppercase tracking-widest text-[#43805a]">AdotaPerto</p><h1 className="mt-3 text-2xl font-extrabold">Convite para organização</h1>{!invitationId ? <p className="mt-4 text-sm text-red-700">Este link de convite é inválido.</p> : isPending ? <p className="mt-4 text-sm">Verificando sua conta...</p> : !session ? <p className="mt-4 text-sm">Entre ou crie uma conta com o e-mail convidado e volte a este link para aceitar.</p> : <><p className="mt-4 text-sm">Você está conectado como <strong>{session.user.email}</strong>.</p>{!session.user.emailVerified && <div className="mt-4 rounded-lg bg-amber-50 p-4 text-sm text-amber-900"><p>Confirme seu e-mail antes de aceitar o convite.</p><button type="button" disabled={busy} onClick={sendVerification} className="mt-2 font-bold underline disabled:opacity-50">Enviar verificação</button></div>}<button type="button" disabled={busy || !session.user.emailVerified} onClick={accept} className="mt-5 min-h-11 rounded-lg bg-[#256441] px-5 py-2 text-sm font-bold text-white disabled:opacity-50">{busy ? "Aceitando..." : "Aceitar convite"}</button></>}{message && <p role="status" className="mt-4 text-sm text-[#256441]">{message}</p>}{error && <p role="alert" className="mt-4 text-sm text-red-700">{error}</p>}<div className="mt-5 flex gap-4 text-sm font-semibold text-[#256441]"><Link href="/login">Entrar</Link><Link href="/cadastro">Criar conta</Link></div></section></main><SiteFooter /></div>;
}
