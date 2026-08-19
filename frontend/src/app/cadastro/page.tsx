"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { AuthField } from "@/components/auth-field";
import { AuthBrand, AuthShell } from "@/components/auth-shell";
import { authClient } from "@/lib/auth-client";

export default function RegisterPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErrorMessage(null);

    const formData = new FormData(event.currentTarget);
    const name = formData.get("name") as string;
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;
    const confirmPassword = formData.get("confirmPassword") as string;

    if (password !== confirmPassword) {
      setErrorMessage("As senhas não coincidem.");
      return;
    }

    setLoading(true);

    const { error } = await authClient.signUp.email({
      name,
      email,
      password,
      callbackURL: "/perfil",
    });

    setLoading(false);

    if (error) {
      setErrorMessage(error.message || "Erro ao criar conta. Tente novamente.");
      return;
    }

    router.push("/perfil");
  }

  return (
    <AuthShell image="/images/register-cover-v2.png" imageAlt="Mulher acolhendo um pequeno cachorro resgatado" register>
      <div className="mb-6"><AuthBrand /></div>
      <header className="mb-7">
        <h1 className="text-[30px] font-extrabold leading-9 tracking-[-0.02em]">Crie sua conta</h1>
        <p className="mt-2 text-sm leading-6 text-[#4d5b53] sm:text-base">Leva menos de um minuto para começar.</p>
      </header>

      {errorMessage && (
        <div className="mb-4 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          {errorMessage}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <AuthField label="Nome Completo" icon="/icons/user.svg" name="name" placeholder="Seu nome completo" autoComplete="name" required />
        <AuthField label="E-mail" icon="/icons/email.svg" name="email" type="email" placeholder="exemplo@email.com" autoComplete="email" required />
        <AuthField label="Senha" icon="/icons/password.svg" name="password" type="password" placeholder="Mínimo 8 caracteres" autoComplete="new-password" minLength={8} required />
        <AuthField label="Confirmar Senha" icon="/icons/password.svg" name="confirmPassword" type="password" placeholder="Digite a senha novamente" autoComplete="new-password" minLength={8} required />

        <label className="flex cursor-pointer items-start gap-3 py-1 text-sm leading-5 text-[#4d5b53]">
          <input type="checkbox" required className="mt-0.5 size-4 shrink-0 accent-[#0f5d39]" />
          <span>Li e aceito os <Link href="#" className="font-semibold text-[#0f5d39] hover:underline">Termos de Uso</Link> e a <Link href="#" className="font-semibold text-[#0f5d39] hover:underline">Política de Privacidade</Link>.</span>
        </label>

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-xl bg-[#0f5d39] px-6 py-3.5 text-sm font-semibold text-white shadow-sm transition-all hover:-translate-y-0.5 hover:bg-[#0b482c] hover:shadow-md active:scale-[0.99] disabled:opacity-60"
        >
          {loading ? "Criando conta..." : "Criar minha conta"}
        </button>
      </form>
      <p className="mt-6 border-t border-[#e1e8e2] pt-5 text-center text-sm text-[#4d5b53]">
        Já tem uma conta? <Link href="/login" className="font-semibold text-[#0f5d39] hover:underline">Entrar</Link>
      </p>
    </AuthShell>
  );
}
