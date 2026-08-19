"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useEffect, useState } from "react";
import { AuthField } from "@/components/auth-field";
import { AuthBrand, AuthShell } from "@/components/auth-shell";
import { authClient } from "@/lib/auth-client";

export default function LoginPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    const reason = new URLSearchParams(window.location.search).get("reason");
    if (reason === "unauthenticated") {
      setErrorMessage("Você não está autenticado.");
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

  return (
    <AuthShell image="/images/login-cover-v2.png" imageAlt="Mulher acolhendo um cachorro caramelo em casa">
      <header className="mb-8">
        <AuthBrand />
        <h1 className="mt-7 text-[32px] font-extrabold leading-10 tracking-[-0.02em]">Bem-vindo de volta</h1>
        <p className="mt-2 leading-6 text-[#4d5b53]">Entre para acompanhar seus favoritos e processos de adoção.</p>
      </header>

      {errorMessage && (
        <div className="mb-4 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          {errorMessage}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        <AuthField label="Email" icon="/icons/email.svg" name="email" type="email" placeholder="seu@email.com" autoComplete="email" required />
        <AuthField label="Senha" icon="/icons/password.svg" name="password" type="password" placeholder="••••••••" autoComplete="current-password" required />

        <div className="flex flex-wrap items-center justify-between gap-3 text-sm">
          <label className="flex cursor-pointer items-center gap-2 text-[#404942]">
            <input type="checkbox" name="rememberMe" className="size-4 accent-[#0f5d39]" />
            Lembrar de mim
          </label>
          <Link href="#" className="font-semibold text-[#0f5d39] transition hover:underline">Esqueci minha senha</Link>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-xl bg-[#0f5d39] px-6 py-3.5 text-sm font-semibold text-white shadow-sm transition-all hover:-translate-y-0.5 hover:bg-[#0b482c] hover:shadow-md active:scale-[0.99] disabled:opacity-60"
        >
          {loading ? "Entrando..." : "Entrar"}
        </button>
      </form>
      <p className="mt-7 border-t border-[#e1e8e2] pt-6 text-center text-sm text-[#4d5b53]">
        Ainda não tem uma conta? <Link href="/cadastro" className="font-semibold text-[#0f5d39] hover:underline">Criar conta</Link>
      </p>
    </AuthShell>
  );
}
