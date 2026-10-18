"use client";

import { Notification } from "@/components/notification";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useEffect, useState } from "react";
import { AuthField } from "@/components/auth-field";
import { AuthBrand, AuthShell } from "@/components/auth-shell";
import { authClient } from "@/lib/auth-client";
import { authErrorMessage } from "@/lib/auth-error-message";

type OrganizationRegistration = {
  name: string;
  slug: string;
  cnpj: string;
  phone: string;
  website: string;
  instagram: string;
  description: string;
};

function organizationSlug(name: string) {
  const base = name.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "ong";
  return `${base}-${crypto.randomUUID().slice(0, 8)}`;
}

export default function RegisterPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isFirstUser, setIsFirstUser] = useState(false);
  const [isOrganization, setIsOrganization] = useState(false);
  const [pendingOrganization, setPendingOrganization] = useState<OrganizationRegistration | null>(null);
  const [registrationCheck, setRegistrationCheck] = useState<"loading" | "ready" | "error">("loading");
  const [checkAttempt, setCheckAttempt] = useState(0);

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
    const name = formData.get("name") as string;
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;
    const confirmPassword = formData.get("confirmPassword") as string;
    const organizationName = (formData.get("organizationName") as string | null)?.trim() ?? "";

    if (password !== confirmPassword) {
      setErrorMessage("As senhas não coincidem.");
      return;
    }

    if (isOrganization && !organizationName) {
      setErrorMessage("Informe o nome da ONG ou organização.");
      return;
    }

    setLoading(true);

    const { error } = await authClient.signUp.email({
      name,
      email,
      password,
    });

    if (error) {
      setLoading(false);
      setErrorMessage(authErrorMessage(error, "Erro ao criar conta. Tente novamente."));
      return;
    }

    if (isOrganization) {
      const organizationData: OrganizationRegistration = {
        name: organizationName,
        slug: organizationSlug(organizationName),
        cnpj: formData.get("organizationDocument") as string,
        phone: formData.get("organizationPhone") as string,
        website: formData.get("organizationWebsite") as string,
        instagram: formData.get("organizationInstagram") as string,
        description: formData.get("organizationDescription") as string,
      };
      setPendingOrganization(organizationData);
      const result = await authClient.organization.create(organizationData);
      if (result.error) {
        setLoading(false);
        setErrorMessage("Sua conta foi criada, mas não conseguimos salvar os dados da ONG. Tente novamente.");
        return;
      }
      setPendingOrganization(null);
    }

    setLoading(false);
    router.replace("/");
    router.refresh();
  }

  async function retryOrganizationRegistration() {
    if (!pendingOrganization) return;
    setLoading(true);
    const { error } = await authClient.organization.create(pendingOrganization);
    setLoading(false);
    if (error) {
      setErrorMessage("Ainda não foi possível salvar os dados da ONG. Tente novamente.");
      return;
    }
    setPendingOrganization(null);
    router.replace("/");
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
      {pendingOrganization && <button type="button" onClick={retryOrganizationRegistration} disabled={loading} className="mb-4 min-h-11 w-full rounded-lg border border-[#0f5d39] px-4 py-2 text-sm font-semibold text-[#0f5d39] disabled:opacity-60">{loading ? "Salvando ONG..." : "Tentar salvar os dados da ONG"}</button>}

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

      <form onSubmit={handleSubmit} className={`space-y-3 sm:space-y-4 ${pendingOrganization ? "hidden" : ""}`} aria-hidden={Boolean(pendingOrganization)}>
        <AuthField label="Nome Completo" icon="/icons/user.svg" name="name" placeholder="Seu nome completo" autoComplete="name" required />
        <AuthField label="E-mail" icon="/icons/email.svg" name="email" type="email" placeholder="exemplo@email.com" autoComplete="email" required />
        <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-[#c8d2ca] bg-[#fbfdfb] p-3 text-sm text-[#243129] sm:p-4">
          <input type="checkbox" name="isOrganization" checked={isOrganization} onChange={(event) => setIsOrganization(event.target.checked)} className="mt-0.5 size-4 shrink-0 accent-[#0f5d39]" />
          <span><strong className="block">Represento uma ONG ou organização</strong><span className="mt-0.5 block text-xs font-normal text-[#647067]">Ative para incluir os dados da organização no cadastro.</span></span>
        </label>

        {isOrganization && <fieldset className="space-y-3 rounded-xl border border-[#d7e6da] bg-[#f7fbf8] p-3 sm:space-y-4 sm:p-4">
          <legend className="px-1 text-sm font-bold text-[#0f5d39]">Informações da ONG</legend>
          <AuthField label="Nome da ONG ou organização" icon="/icons/perfil.svg" name="organizationName" placeholder="Nome público da organização" autoComplete="organization" maxLength={160} required />
          <AuthField label="CNPJ" icon="/icons/user.svg" name="organizationDocument" placeholder="00.000.000/0000-00" maxLength={18} />
          <AuthField label="Telefone ou WhatsApp" icon="/icons/user.svg" name="organizationPhone" type="tel" placeholder="(11) 99999-9999" autoComplete="tel" maxLength={20} />
          <AuthField label="Site" icon="/icons/email.svg" name="organizationWebsite" type="url" placeholder="https://suaong.org.br" autoComplete="url" maxLength={255} />
          <AuthField label="Instagram" icon="/icons/perfil.svg" name="organizationInstagram" placeholder="@suaong" maxLength={50} />
          <label className="block text-xs font-semibold tracking-[0.01em] text-[#243129] sm:text-sm">Sobre a ONG<span className="mt-1 block sm:mt-1.5"><textarea name="organizationDescription" rows={3} maxLength={600} placeholder="Conte brevemente sobre o trabalho da organização" className="w-full rounded-lg border border-[#c8d2ca] bg-[#fbfdfb] px-3 py-2.5 text-sm font-normal outline-none transition placeholder:text-[#7b857e] focus:border-[#0f5d39] focus:ring-2 focus:ring-[#0f5d39]/10 sm:rounded-xl sm:px-4 sm:py-3" /></span></label>
        </fieldset>}

        <AuthField label="Senha" icon="/icons/password.svg" name="password" type="password" placeholder="Mínimo 8 caracteres" autoComplete="new-password" minLength={8} required />
        <AuthField label="Confirmar Senha" icon="/icons/password.svg" name="confirmPassword" type="password" placeholder="Digite a senha novamente" autoComplete="new-password" minLength={8} required />

        <label className="flex cursor-pointer items-start gap-2 py-0.5 text-[11px] leading-4 text-[#4d5b53] sm:gap-3 sm:py-1 sm:text-sm sm:leading-5">
          <input type="checkbox" required className="mt-0.5 size-4 shrink-0 accent-[#0f5d39]" />
          <span>Li e aceito os <Link href="#" className="font-semibold text-[#0f5d39] hover:underline">Termos de Uso</Link> e a <Link href="#" className="font-semibold text-[#0f5d39] hover:underline">Política de Privacidade</Link>.</span>
        </label>

        <button
          type="submit"
          disabled={loading || Boolean(pendingOrganization)}
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
