"use client";


import { DonationField as Field, donationInputClass as inputClass, DonationFormSection as Section, DonationSelect as Select } from "@/components/donation-form-ui";
import { PawIcon } from "./animal-form-parts";
import type { Props } from "./animal-donation-form";

export function AnimalBasicsStep(props: Props) {
  const { step } = props;
  return (
<div
              data-donation-step="0"
              className={step === 0 ? "donation-step-panel" : "hidden"}
            >
              <Section icon={<PawIcon />} title="Informações básicas">
                <div className="grid gap-5 sm:grid-cols-2">
                  <Field label="Nome">
                    <input
                      name="nome"
                      required
                      placeholder="Ex.: Caramelo"
                      className={inputClass}
                    />
                  </Field>
                  <Field label="Espécie">
                    <Select name="especie">
                      <option>Cão</option>
                      <option>Gato</option>
                      <option>Outro</option>
                    </Select>
                  </Field>
                  <Field label="Sexo">
                    <Select name="sexo">
                      <option>Fêmea</option>
                      <option>Macho</option>
                      <option>Não identificado</option>
                    </Select>
                  </Field>
                  <Field label="Idade aproximada">
                    <input
                      name="idade"
                      required
                      placeholder="Ex.: 2 anos"
                      className={inputClass}
                    />
                  </Field>
                  <Field label="Porte">
                    <Select name="porte">
                      <option>Pequeno</option>
                      <option>Médio</option>
                      <option>Grande</option>
                    </Select>
                  </Field>
                  <Field label="Raça" optional>
                    <input
                      name="raca"
                      placeholder="Ex.: Sem raça definida"
                      className={inputClass}
                    />
                  </Field>
                </div>
              </Section>
            </div>
  );
}
