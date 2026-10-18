import { AuthField } from "@/components/auth-field";
import Link from "next/link";
import type { Props } from "./registration-form";

export function RegistrationUserFields({ userFieldsRef, step, isOrganization, setIsOrganization, loading, pendingOrganization }: Props) {
 return (
<div
          ref={userFieldsRef}
          className={`space-y-3 sm:space-y-4 ${step === "organization" ? "hidden" : ""}`}
        >
          <AuthField
            label="Nome completo"
            icon="/icons/user.svg"
            name="name"
            placeholder="Seu nome completo"
            autoComplete="name"
            required
          />
          <AuthField
            label="E-mail"
            icon="/icons/email.svg"
            name="email"
            type="email"
            placeholder="exemplo@email.com"
            autoComplete="email"
            required
          />
          <AuthField
            label="Senha"
            icon="/icons/password.svg"
            name="password"
            type="password"
            placeholder="Mínimo 8 caracteres"
            autoComplete="new-password"
            minLength={8}
            required
          />
          <AuthField
            label="Confirmar senha"
            icon="/icons/password.svg"
            name="confirmPassword"
            type="password"
            placeholder="Digite a senha novamente"
            autoComplete="new-password"
            minLength={8}
            required
          />

          <label className="flex cursor-pointer items-start gap-2 py-0.5 text-[11px] leading-4 text-[#4d5b53] sm:gap-3 sm:py-1 sm:text-sm sm:leading-5">
            <input
              type="checkbox"
              required
              className="mt-0.5 size-4 shrink-0 accent-[#0f5d39]"
            />
            <span>
              Li e aceito os{" "}
              <Link
                href="#"
                className="font-semibold text-[#0f5d39] hover:underline"
              >
                Termos de Uso
              </Link>{" "}
              e a{" "}
              <Link
                href="#"
                className="font-semibold text-[#0f5d39] hover:underline"
              >
                Política de Privacidade
              </Link>
              .
            </span>
          </label>

          <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-[#c8d2ca] p-3 text-sm text-[#243129] sm:p-4">
            <input
              type="checkbox"
              name="isOrganization"
              checked={isOrganization}
              onChange={(event) => setIsOrganization(event.target.checked)}
              className="mt-0.5 size-4 shrink-0 accent-[#0f5d39]"
            />
            <span>
              <strong className="block">
                Represento uma ONG ou organização
              </strong>
              <span className="mt-0.5 block text-xs font-normal text-[#647067]">
                Os dados da ONG serão preenchidos na próxima etapa.
              </span>
            </span>
          </label>

          <button
            type="submit"
            disabled={loading || Boolean(pendingOrganization)}
            className="min-h-11 w-full rounded-lg bg-[#0f5d39] px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-all hover:-translate-y-0.5 hover:bg-[#0b482c] hover:shadow-md active:scale-[0.99] disabled:opacity-60 sm:rounded-xl sm:px-6 sm:py-3.5"
          >
            {loading
              ? "Criando conta..."
              : isOrganization
                ? "Continuar para dados da ONG"
                : "Criar minha conta"}
          </button>
        </div>
 );
}
