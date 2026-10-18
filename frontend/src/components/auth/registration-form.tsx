"use client";

import { RegistrationUserFields } from "./registration-user-fields";
import { RegistrationOrganizationFields } from "./registration-organization-fields";
import { AuthBrand, AuthShell } from "@/components/auth-shell";
import { Notification } from "@/components/notification";
import Link from "next/link";
import type { Dispatch, FormEvent, RefObject, SetStateAction } from "react";

type RegistrationCheck = "loading" | "ready" | "error";
export type Props = {
  userFieldsRef: RefObject<HTMLDivElement | null>;
  handleSubmit: (event: FormEvent<HTMLFormElement>) => void;
  retryOrganizationRegistration: () => void;
  loading: boolean;
  errorMessage: string | null;
  isFirstUser: boolean;
  isOrganization: boolean;
  setIsOrganization: Dispatch<SetStateAction<boolean>>;
  step: "user" | "organization";
  setStep: Dispatch<SetStateAction<"user" | "organization">>;
  pendingOrganization: object | null;
  registrationCheck: RegistrationCheck;
  setRegistrationCheck: Dispatch<SetStateAction<RegistrationCheck>>;
  setCheckAttempt: Dispatch<SetStateAction<number>>;
};

export function RegistrationForm(props: Props) {
  const { handleSubmit, retryOrganizationRegistration, loading, errorMessage, isFirstUser, isOrganization, step, pendingOrganization, registrationCheck, setRegistrationCheck, setCheckAttempt } = props;
  return (
    <AuthShell
      image="/images/login-cover-v2.png"
      imageAlt="Mulher acolhendo um cachorro resgatado"
      register
    >
      <div className="mb-3 sm:mb-6">
        <AuthBrand />
      </div>
      <header className="mb-4 sm:mb-7">
        <h1 className="text-2xl font-extrabold leading-7 tracking-[-0.02em] sm:text-[30px] sm:leading-9">
          Crie sua conta
        </h1>
        <p className="mt-1 text-xs leading-4 text-[#4d5b53] sm:mt-2 sm:text-base sm:leading-6">
          Preencha seus dados para começar.
        </p>
      </header>

      {errorMessage && <Notification text={errorMessage} />}
      {pendingOrganization && (
        <button
          type="button"
          onClick={retryOrganizationRegistration}
          disabled={loading}
          className="mb-4 min-h-11 w-full rounded-lg border border-[#0f5d39] px-4 py-2 text-sm font-semibold text-[#0f5d39] disabled:opacity-60"
        >
          {loading ? "Salvando ONG..." : "Tentar salvar os dados da ONG"}
        </button>
      )}

      {registrationCheck === "loading" && (
        <p role="status" className="mb-4 text-xs text-[#4d5b53]">
          Verificando se esta é a primeira conta…
        </p>
      )}
      {registrationCheck === "error" && (
        <div
          role="status"
          className="mb-4 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900"
        >
          <p>Não foi possível verificar se esta será a conta administrativa.</p>
          <button
            type="button"
            onClick={() => {
              setRegistrationCheck("loading");
              setCheckAttempt((value) => value + 1);
            }}
            className="mt-2 font-semibold underline"
          >
            Tentar novamente
          </button>
        </div>
      )}

      {isFirstUser && (
        <p
          role="status"
          className="mb-4 rounded-lg border border-[#b8d8c2] bg-[#edf7ef] px-4 py-3 text-sm font-semibold text-[#0f5d39]"
        >
          Você está criando a conta administrativa
        </p>
      )}

      <form
        onSubmit={handleSubmit}
        className={`space-y-4 ${pendingOrganization ? "hidden" : ""}`}
        aria-hidden={Boolean(pendingOrganization)}
      >
        {isOrganization && (
          <p className="text-sm font-semibold text-[#0f5d39]">
            Etapa {step === "user" ? "1" : "2"} de 2 ·{" "}
            {step === "user" ? "Seus dados" : "Dados da ONG"}
          </p>
        )}

        <RegistrationUserFields {...props} />

        {isOrganization && (
          <RegistrationOrganizationFields {...props} />
        )}
      </form>
      <p className="mt-4 border-t border-[#e1e8e2] pt-3.5 text-center text-xs text-[#4d5b53] sm:mt-6 sm:pt-5 sm:text-sm">
        Já tem uma conta?{" "}
        <Link
          href="/login"
          className="font-semibold text-[#0f5d39] hover:underline"
        >
          Entrar
        </Link>
      </p>
    </AuthShell>
  );
}
