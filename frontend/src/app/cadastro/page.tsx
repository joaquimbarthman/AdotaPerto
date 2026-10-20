"use client";

import { Notification } from "@/components/notification";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useEffect, useState } from "react";
import { AuthField } from "@/components/auth-field";
import { AuthBrand, AuthShell } from "@/components/auth-shell";
import { authClient } from "@/lib/auth-client";
import { authErrorMessage } from "@/lib/auth-error-message";

export default function RegisterPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isFirstUser, setIsFirstUser] = useState(false);
  const [registrationCheck, setRegistrationCheck] = useState<"loading" | "ready" | "error">("loading");
  const [checkAttempt, setCheckAttempt] = useState(0);
  const [accountType, setAccountType] = useState<"PERSON" | "ORGANIZATION">("PERSON");

  useEffect(() => {
    let controller: AbortController;
    async function checkRegistration() {
      controller?.abort();
      controller = new AbortController();
      const { signal } = controller;
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";
        const response = await fetch(`${apiUrl}/api/registration/status`, {
          cache: "no-store",
          signal,
        });
        if (!response.ok) throw new Error("Registration status unavailable");
        const data = await response.json();
        if (typeof data.isFirstUser !== "boolean") throw new Error("Invalid registration status");
        if (!signal.aborted) {
          setIsFirstUser(data.isFirstUser);
          setRegistrationCheck("ready");
        }
      } catch {
        if (!signal.aborted) {
          setIsFirstUser(false);
          setRegistrationCheck("error");
        }
      }
    }
    void checkRegistration();
    window.addEventListener("focus", checkRegistration);
    return () => {
      controller?.abort();
      window.removeEventListener("focus", checkRegistration);
    };
  }, [checkAttempt]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErrorMessage(null);

    const formData = new FormData(event.currentTarget);
    const responsibleName = formData.get("name") as string;
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;
    const confirmPassword = formData.get("confirmPassword") as string;

    if (password !== confirmPassword) {
      setErrorMessage("As senhas não coincidem.");
      return;
    }

    setLoading(true);

    const { error } = await authClient.signUp.email({
      name: responsibleName,
      email,
      password,
      accountType,
    } as Parameters<typeof authClient.signUp.email>[0] & { accountType: "PERSON" | "ORGANIZATION" });

    if (error) {
      setErrorMessage(authErrorMessage(error, "Erro ao criar conta. Tente novamente."));
      return;
    }

    if (accountType === "ORGANIZATION") {
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";
        const response = await fetch(`${apiUrl}/api/organizations/bootstrap`, { method: "POST", credentials: "include" });
        const result = await response.json();
        if (!response.ok) throw new Error(result.error || "Não foi possível criar o perfil institucional.");
        localStorage.setItem("adotaperto-active-organization", result.id);
      } catch (cause) {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";
        await fetch(`${apiUrl}/api/users/me`, { method: "DELETE", credentials: "include" }).catch(() => undefined);
        setLoading(false); setErrorMessage(cause instanceof Error ? `${cause.message} A conta incompleta foi desfeita; revise os dados e tente novamente.` : "Não foi possível concluir o cadastro institucional."); return;
      }
    }

    setLoading(false);

    router.replace(accountType === "ORGANIZATION" ? "/perfil" : "/");
    router.refresh();
  }

  return (
    <AuthShell image="/images/login-cover-v2.png" imageAlt="Mulher acolhendo um cachorro resgatado" register>
      <div className="mb-3 sm:mb-6"><AuthBrand /></div>
      <header className="mb-4 sm:mb-7">
        <h1 className="text-2xl font-extrabold leading-7 tracking-[-0.02em] sm:text-[30px] sm:leading-9">Crie sua conta</h1>
        <p className="mt-1 text-xs leading-4 text-[#4d5b53] sm:mt-2 sm:text-base sm:leading-6">Leva menos de um minuto para começar.</p>
      </header>

      {errorMessage && <Notification text={errorMessage} />}

      {registrationCheck === "loading" && <p role="status" className="mb-4 text-xs text-[#4d5b53]">Verificando se esta é a primeira conta…</p>}
      {registrationCheck === "error" && (
        <div role="status" className="mb-4 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          <p>Não foi possível verificar se esta será a conta administrativa.</p>
          <button type="button" onClick={() => { setRegistrationCheck("loading"); setCheckAttempt((value) => value + 1); }} className="mt-2 font-semibold underline">Tentar novamente</button>
        </div>
      )}

      {isFirstUser && (
        <p role="status" className="mb-4 rounded-lg border border-[#b8d8c2] bg-[#edf7ef] px-4 py-3 text-sm font-semibold text-[#0f5d39]">
          Você está criando a conta administrativa
        </p>
      )}

      <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4">
        <AuthField label={accountType === "ORGANIZATION" ? "Responsável legal" : "Nome Completo"} icon="/icons/user.svg" name="name" placeholder={accountType === "ORGANIZATION" ? "Nome do responsável legal" : "Seu nome completo"} autoComplete="name" required />
        <AuthField label="E-mail" icon="/icons/email.svg" name="email" type="email" placeholder="exemplo@email.com" autoComplete="email" required />
        <AuthField label="Senha" icon="/icons/password.svg" name="password" type="password" placeholder="Mínimo 8 caracteres" autoComplete="new-password" minLength={8} required />
        <AuthField label="Confirmar Senha" icon="/icons/password.svg" name="confirmPassword" type="password" placeholder="Digite a senha novamente" autoComplete="new-password" minLength={8} required />

        <fieldset>
          <legend className="mb-2 text-xs font-bold text-[#253129] sm:text-sm">Como pretende utilizar o AdotaPerto?</legend>
          <div className="grid grid-cols-2 gap-2.5 sm:gap-3">
            <label className="group relative cursor-pointer">
              <input type="radio" name="usageIntent" value="person" checked={accountType === "PERSON"} onChange={() => setAccountType("PERSON")} className="peer sr-only" />
              <span className="registration-account-card flex h-full min-h-32 flex-col rounded-xl border-2 border-[#d7e6da] bg-white p-3 text-left transition hover:border-[#86a590] hover:bg-[#f7fcf8] peer-focus-visible:ring-2 peer-focus-visible:ring-[#0f5d39] peer-focus-visible:ring-offset-2 peer-checked:border-[#0f5d39] peer-checked:bg-[#edf7ef] peer-checked:shadow-[0_0_0_3px_rgba(15,93,57,0.08)] sm:min-h-36 sm:p-4">
                <span className="registration-account-icon mb-3 grid size-9 place-items-center rounded-lg bg-[#e8f7eb] text-[#256441] transition group-has-[:checked]:bg-[#0f5d39] group-has-[:checked]:text-white sm:size-10">
                  <svg viewBox="0 0 24 24" className="size-5" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><circle cx="12" cy="8" r="4" /><path d="M4 21a8 8 0 0 1 16 0" /></svg>
                </span>
                <strong className="text-xs leading-4 text-[#253129] sm:text-sm">Pessoa física</strong>
                <span className="mt-1 text-[10px] leading-4 text-[#68766d] sm:text-xs sm:leading-5">Quero adotar, doar ou publicar animais.</span>
              </span>
            </label>
            <label className="group relative cursor-pointer">
              <input type="radio" name="usageIntent" value="organization" checked={accountType === "ORGANIZATION"} onChange={() => setAccountType("ORGANIZATION")} className="peer sr-only" />
              <span className="registration-account-card flex h-full min-h-32 flex-col rounded-xl border-2 border-[#d7e6da] bg-white p-3 text-left transition hover:border-[#86a590] hover:bg-[#f7fcf8] peer-focus-visible:ring-2 peer-focus-visible:ring-[#0f5d39] peer-focus-visible:ring-offset-2 peer-checked:border-[#0f5d39] peer-checked:bg-[#edf7ef] peer-checked:shadow-[0_0_0_3px_rgba(15,93,57,0.08)] sm:min-h-36 sm:p-4">
                <span className="registration-account-icon mb-3 grid size-9 place-items-center rounded-lg bg-[#e8f7eb] text-[#256441] transition group-has-[:checked]:bg-[#0f5d39] group-has-[:checked]:text-white sm:size-10">
                  <svg viewBox="0 0 24 24" className="size-5" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M4 21V9l8-5 8 5v12M8 21v-6h8v6" /><path d="M8 10h.01M12 10h.01M16 10h.01" /></svg>
                </span>
                <strong className="text-xs leading-4 text-[#253129] sm:text-sm">ONG ou protetor</strong>
                <span className="mt-1 text-[10px] leading-4 text-[#68766d] sm:text-xs sm:leading-5">Quero representar um projeto de proteção animal.</span>
              </span>
            </label>
          </div>
        </fieldset>

        <label className="flex cursor-pointer items-start gap-2 py-0.5 text-[11px] leading-4 text-[#4d5b53] sm:gap-3 sm:py-1 sm:text-sm sm:leading-5">
          <input type="checkbox" required className="mt-0.5 size-4 shrink-0 accent-[#0f5d39]" />
          <span>Li e aceito os <Link href="#" className="font-semibold text-[#0f5d39] hover:underline">Termos de Uso</Link> e a <Link href="#" className="font-semibold text-[#0f5d39] hover:underline">Política de Privacidade</Link>.</span>
        </label>

        <button
          type="submit"
          disabled={loading}
          className="min-h-11 w-full rounded-lg bg-[#0f5d39] px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-all hover:-translate-y-0.5 hover:bg-[#0b482c] hover:shadow-md active:scale-[0.99] disabled:opacity-60 sm:rounded-xl sm:px-6 sm:py-3.5"
        >
          {loading ? "Criando conta..." : "Criar minha conta"}
        </button>
      </form>
      <p className="mt-4 border-t border-[#e1e8e2] pt-3.5 text-center text-xs text-[#4d5b53] sm:mt-6 sm:pt-5 sm:text-sm">
        Já tem uma conta? <Link href="/login" className="font-semibold text-[#0f5d39] hover:underline">Entrar</Link>
      </p>
    </AuthShell>
  );
}
