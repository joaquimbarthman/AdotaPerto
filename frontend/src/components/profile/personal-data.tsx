"use client";

import { notify } from "@/components/notification";
import { ProfilePhotoCropper } from "@/components/profile-photo-cropper";
import { useEffect, useState } from "react";
import { API_BASE_URL } from "./config";
import { ProfileField, SectionHeading } from "./profile-ui";
import type { UserProfile } from "./types";

export function PersonalData({
  profile,
  userName,
  userImage,
  userBio,
  photoLoading,
  onPhotoCrop,
}: {
  profile: UserProfile | null;
  userName: string;
  userImage: string;
  userBio: string;
  photoLoading: boolean;
  onPhotoCrop: (file: File, preview: string) => void;
}) {
  const birthDate = profile?.birthDate || "";
  const instagram = profile?.instagram || "";
  const whatsapp = profile?.whatsapp || "";

  return (
    <section id="panel-dados" role="tabpanel" aria-labelledby="tab-dados">
      <SectionHeading
        title="Dados pessoais"
        description="Consulte e atualize suas informações pessoais de perfil."
      />
      <div className="grid gap-5 sm:gap-8 lg:grid-cols-[180px_1fr] lg:gap-12">
        <div>
          <p className="mb-3 text-sm font-bold text-[#253129]">
            Foto de perfil
          </p>
          <div className="flex items-center gap-4 lg:flex-col lg:items-start">
            <ProfilePhotoCropper
              currentImage={userImage}
              name={userName}
              loading={photoLoading}
              onCrop={onPhotoCrop}
            />
          </div>
        </div>
        <div className="grid content-start gap-4 sm:grid-cols-2 sm:gap-5">
          <div className="sm:col-span-2">
            <ProfileField
              label="Nome completo"
              name="nome"
              defaultValue={userName}
              autoComplete="name"
              required
            />
          </div>
          <ProfileField
            label="Data de nascimento"
            name="nascimento"
            type="date"
            defaultValue={birthDate}
            autoComplete="bday"
          />
          <ProfileField
            label="Instagram"
            name="instagram"
            defaultValue={instagram}
            placeholder="@seuusuario"
            autoComplete="off"
          />
          <ProfileField
            label={"WhatsApp / n\u00famero"}
            name="whatsapp"
            type="tel"
            inputMode="tel"
            defaultValue={whatsapp}
            placeholder="(00) 00000-0000"
            autoComplete="tel"
          />
          <label className="sm:col-span-2">
            <span className="mb-2 block text-sm font-bold text-[#253129]">
              Bio
            </span>
            <textarea
              name="bio"
              rows={5}
              maxLength={300}
              defaultValue={userBio}
              placeholder="Conte um pouco sobre você..."
              className="w-full resize-y rounded-xl border border-[#c0c9bf] bg-[#f7fcf8] px-4 py-3 text-sm leading-6 text-[#121e17] outline-none transition placeholder:text-[#879188] focus:border-[#3f7d58] focus:ring-2 focus:ring-[#3f7d58]/15"
            />
            <span className="mt-1.5 block text-right text-xs text-[#7b8980]">
              Até 300 caracteres
            </span>
          </label>
        </div>
      </div>
    </section>
  );
}

export function AddressData({ profile }: { profile: UserProfile | null }) {
  const [cep, setCep] = useState(profile?.zipCode || "");
  const [rua, setRua] = useState(profile?.street || "");
  const [cidade, setCidade] = useState(profile?.city || "");
  const [estado, setEstado] = useState(profile?.state || "");
  const [cepStatus, setCepStatus] = useState<
    "idle" | "loading" | "success" | "error"
  >("idle");

  useEffect(() => {
    const digits = cep.replace(/\D/g, "");
    if (digits.length !== 8) {
      return;
    }
    const controller = new AbortController();
    const timer = window.setTimeout(async () => {
      setCepStatus("loading");
      try {
        const response = await fetch(
          `${API_BASE_URL}/api/users/cep/${digits}`,
          { credentials: "include", signal: controller.signal },
        );
        const address = await response.json();
        if (controller.signal.aborted) return;
        if (!response.ok) throw new Error("CEP não encontrado");
        setRua(address.street || "");
        setCidade(address.city || "");
        setEstado(address.state || "");
        setCepStatus("success");
      } catch (error) {
        if ((error as Error).name !== "AbortError") {
          setCepStatus("error");
          notify("CEP não encontrado. Preencha manualmente.", "error");
        }
      }
    }, 350);
    return () => {
      window.clearTimeout(timer);
      controller.abort();
    };
  }, [cep]);

  const inputClass =
    "w-full rounded-xl border border-[#c0c9bf] bg-[#f7fcf8] px-4 py-3 text-sm text-[#121e17] outline-none transition placeholder:text-[#879188] focus:border-[#3f7d58] focus:ring-2 focus:ring-[#3f7d58]/15";
  const states = [
    "AC",
    "AL",
    "AP",
    "AM",
    "BA",
    "CE",
    "DF",
    "ES",
    "GO",
    "MA",
    "MT",
    "MS",
    "MG",
    "PA",
    "PB",
    "PR",
    "PE",
    "PI",
    "RJ",
    "RN",
    "RS",
    "RO",
    "RR",
    "SC",
    "SP",
    "SE",
    "TO",
  ];

  return (
    <section id="panel-endereco" role="tabpanel" aria-labelledby="tab-endereco">
      <SectionHeading
        title="Endereço"
        description="Essas informações ajudam a encontrar animais e iniciativas perto de você."
      />
      <div className="grid max-w-3xl gap-5 sm:grid-cols-2">
        <label className="sm:max-w-[240px]">
          <span className="mb-2 block text-sm font-bold text-[#253129]">
            CEP
          </span>
          <div className="relative">
            <input
              name="cep"
              required
              minLength={9}
              inputMode="numeric"
              value={cep}
              maxLength={9}
              aria-invalid={cepStatus === "error"}
              onChange={(event) => {
                const digits = event.target.value
                  .replace(/\D/g, "")
                  .slice(0, 8);
                const formatted =
                  digits.length > 5
                    ? `${digits.slice(0, 5)}-${digits.slice(5)}`
                    : digits;
                if (formatted !== cep) {
                  setCep(formatted);
                  setCepStatus("idle");
                }
              }}
              placeholder="00000-000"
              autoComplete="postal-code"
              className={`${inputClass} pr-10 ${cepStatus === "error" ? "border-red-300" : ""}`}
            />
            {cepStatus === "loading" && (
              <span
                className="absolute right-3 top-1/2 size-4 -translate-y-1/2 animate-spin rounded-full border-2 border-[#b8d8c1] border-t-[#256441]"
                aria-label="Buscando CEP"
              />
            )}
            {cepStatus === "success" && (
              <svg
                viewBox="0 0 24 24"
                className="absolute right-3 top-1/2 size-5 -translate-y-1/2 text-[#256441]"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.4"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-label="CEP encontrado"
              >
                <circle cx="12" cy="12" r="9" />
                <path d="m8 12 2.6 2.6L16.5 9" />
              </svg>
            )}
          </div>
        </label>
        <div className="hidden sm:block" />
        <label className="sm:col-span-2">
          <span className="mb-2 block text-sm font-bold text-[#253129]">
            Rua
          </span>
          <input
            name="rua"
            required
            value={rua}
            onChange={(event) => setRua(event.target.value)}
            placeholder="Digite o nome da rua"
            autoComplete="street-address"
            className={inputClass}
          />
        </label>
        <label>
          <span className="mb-2 block text-sm font-bold text-[#253129]">
            Cidade
          </span>
          <input
            name="cidade"
            required
            value={cidade}
            onChange={(event) => setCidade(event.target.value)}
            placeholder="Sua cidade"
            autoComplete="address-level2"
            className={inputClass}
          />
        </label>
        <label>
          <span className="mb-2 block text-sm font-bold text-[#253129]">
            UF
          </span>
          <span className="relative block">
            <select
              name="estado"
              required
              value={estado}
              onChange={(event) => setEstado(event.target.value)}
              autoComplete="address-level1"
              className={`${inputClass} appearance-none pr-12`}
            >
              <option value="">Selecione</option>
              {states.map((uf) => (
                <option key={uf} value={uf}>
                  {uf}
                </option>
              ))}
            </select>
            <svg
              viewBox="0 0 20 20"
              className="pointer-events-none absolute right-4 top-1/2 size-4 -translate-y-1/2 text-[#526057]"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="m5 7.5 5 5 5-5" />
            </svg>
          </span>
        </label>
      </div>
    </section>
  );
}
