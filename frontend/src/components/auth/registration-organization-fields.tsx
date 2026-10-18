import { AuthField } from "@/components/auth-field";
import type { Props } from "./registration-form";

export function RegistrationOrganizationFields({ step, setStep, userFieldsRef, loading, pendingOrganization }: Props) {
 return (
<div
            className={`space-y-3 sm:space-y-4 ${step === "user" ? "hidden" : ""}`}
          >
            <p className="text-sm text-[#4d5b53]">
              Agora preencha os dados da organização que você representa.
            </p>
            <AuthField
              label="Nome da ONG ou organização"
              icon="/icons/perfil.svg"
              name="organizationName"
              placeholder="Nome público da organização"
              autoComplete="organization"
              maxLength={160}
              required
              disabled={step === "user"}
            />
            <AuthField
              label="CNPJ"
              icon="/icons/user.svg"
              name="organizationDocument"
              placeholder="00.000.000/0000-00"
              maxLength={18}
              disabled={step === "user"}
            />
            <AuthField
              label="Telefone ou WhatsApp"
              icon="/icons/user.svg"
              name="organizationPhone"
              type="tel"
              placeholder="(11) 99999-9999"
              autoComplete="tel"
              maxLength={20}
              disabled={step === "user"}
            />
            <AuthField
              label="Site"
              icon="/icons/email.svg"
              name="organizationWebsite"
              type="url"
              placeholder="https://suaong.org.br"
              autoComplete="url"
              maxLength={255}
              disabled={step === "user"}
            />
            <AuthField
              label="Instagram"
              icon="/icons/perfil.svg"
              name="organizationInstagram"
              placeholder="@suaong"
              maxLength={50}
              disabled={step === "user"}
            />
            <label className="block text-xs font-semibold tracking-[0.01em] text-[#243129] sm:text-sm">
              Sobre a ONG
              <span className="mt-1 block sm:mt-1.5">
                <textarea
                  name="organizationDescription"
                  rows={3}
                  maxLength={600}
                  disabled={step === "user"}
                  placeholder="Conte brevemente sobre o trabalho da organização"
                  className="w-full rounded-lg border border-[#c8d2ca] bg-[#fbfdfb] px-3 py-2.5 text-sm font-normal outline-none transition placeholder:text-[#7b857e] focus:border-[#0f5d39] focus:ring-2 focus:ring-[#0f5d39]/10 sm:rounded-xl sm:px-4 sm:py-3"
                />
              </span>
            </label>
            <div className="flex flex-col gap-3 sm:flex-row">
              <button
                type="button"
                onClick={() => {
                  setStep("user");
                  userFieldsRef.current?.parentElement?.scrollIntoView({
                    behavior: "smooth",
                    block: "start",
                  });
                }}
                disabled={loading}
                className="min-h-11 rounded-lg border border-[#c8d2ca] px-5 py-2.5 text-sm font-semibold text-[#0f5d39] disabled:opacity-60"
              >
                Voltar aos meus dados
              </button>
              <button
                type="submit"
                disabled={loading || Boolean(pendingOrganization)}
                className="min-h-11 flex-1 rounded-lg bg-[#0f5d39] px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-all hover:bg-[#0b482c] disabled:opacity-60"
              >
                {loading ? "Criando conta..." : "Criar conta e ONG"}
              </button>
            </div>
          </div>
 );
}
