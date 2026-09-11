"use client";

import { Notification } from "@/components/notification";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useEffect, useRef, useState } from "react";
import { AuthField } from "@/components/auth-field";
import { AuthBrand, AuthShell } from "@/components/auth-shell";
import { authClient } from "@/lib/auth-client";

export default function LoginPage() {
  const router = useRouter();
  const formRef = useRef<HTMLFormElement>(null);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    const reason = new URLSearchParams(window.location.search).get("reason");
    if (reason === "unauthenticated") {
      queueMicrotask(() => setErrorMessage("Você não está autenticado."));
    } else if (reason === "recovery-email-required") {
      queueMicrotask(() => setErrorMessage("Informe o e-mail da sua conta e clique em Esqueci minha senha."));
    }
  }, []);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErrorMessage(null);

    const formData = new FormData(event.currentTarget);
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;
    const rememberMe = formData.get("rememberMe") === "on";

    setLoading(true);

    const { error } = await authClient.signIn.email({
      email,
      password,
      rememberMe,
      callbackURL: "/adocao",
    });

    setLoading(false);

    if (error) {
      setErrorMessage(error.message || "E-mail ou senha incorretos.");
      return;
    }

    router.push("/adocao");
  }

  function beginPasswordRecovery() {
    const emailInput = formRef.current?.elements.namedItem("email") as HTMLInputElement | null;
    if (!emailInput?.value.trim() || !emailInput.checkValidity()) {
      setErrorMessage("Informe o e-mail da sua conta para recuperar a senha.");
      emailInput?.focus();
      emailInput?.reportValidity();
      return;
    }
    sessionStorage.setItem("password-recovery-email", emailInput.value.trim().toLowerCase());
    router.push("/esqueci-senha");
  }

  return (
    <AuthShell image="/images/login-cover-v2.png" imageAlt="Mulher acolhendo um cachorro caramelo em casa">
      <header className="mb-5 sm:mb-8">
        <AuthBrand />
        <h1 className="mt-4 text-2xl font-extrabold leading-7 tracking-[-0.02em] sm:mt-7 sm:text-[32px] sm:leading-10">Bem-vindo de volta</h1>
        <p className="mt-1.5 text-sm leading-5 text-[#4d5b53] sm:mt-2 sm:text-base sm:leading-6">Entre para acompanhar seus favoritos e processos de adoção.</p>
      </header>

      {errorMessage && <Notification text={errorMessage} />}

      <form ref={formRef} onSubmit={handleSubmit} className="space-y-3.5 sm:space-y-5">
        <AuthField label="Email" icon="/icons/email.svg" name="email" type="email" placeholder="seu@email.com" autoComplete="email" required />
        <AuthField label="Senha" icon="/icons/password.svg" name="password" type="password" placeholder="••••••••" autoComplete="current-password" required />

        <div className="flex flex-wrap items-center justify-between gap-2 text-xs sm:gap-3 sm:text-sm">
          <label className="flex cursor-pointer items-center gap-2 text-[#404942]">
            <input type="checkbox" name="rememberMe" className="size-4 accent-[#0f5d39]" />
            Lembrar de mim
          </label>
          <button type="button" onClick={beginPasswordRecovery} className="font-semibold text-[#0f5d39] transition hover:underline">Esqueci minha senha</button>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="min-h-11 w-full rounded-lg bg-[#0f5d39] px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-all hover:-translate-y-0.5 hover:bg-[#0b482c] hover:shadow-md active:scale-[0.99] disabled:opacity-60 sm:rounded-xl sm:px-6 sm:py-3.5"
        >
          {loading ? "Entrando..." : "Entrar"}
        </button>
      </form>
      <p className="mt-5 border-t border-[#e1e8e2] pt-4 text-center text-xs text-[#4d5b53] sm:mt-7 sm:pt-6 sm:text-sm">
        Ainda não tem uma conta? <Link href="/cadastro" className="font-semibold text-[#0f5d39] hover:underline">Criar conta</Link>
      </p>
    </AuthShell>
  );
}
