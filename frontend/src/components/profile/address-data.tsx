"use client";

import { notify } from "@/components/notification";
import { useEffect, useState } from "react";
import { API_BASE_URL } from "./config";
import { SectionHeading } from "./profile-ui";
import type { UserProfile } from "./types";
import { PostalCodeField } from "./postal-code-field";

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
        <PostalCodeField cep={cep} setCep={setCep} cepStatus={cepStatus} setCepStatus={setCepStatus} inputClass={inputClass} />
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
