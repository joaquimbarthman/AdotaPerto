"use client";


import { DonationField as Field, donationInputClass as inputClass, DonationFormSection as Section } from "@/components/donation-form-ui";
import { YesNoUnknown, PawIcon } from "./animal-form-parts";
import type { Props } from "./animal-donation-form";

export function AnimalStoryStep(props: Props) {
  const { step } = props;
  return (
<div
              data-donation-step="3"
              className={step === 3 ? "donation-step-panel" : "hidden"}
            >
              <Section icon={<PawIcon />} title="História e contexto da adoção">
                <div className="grid gap-5 sm:grid-cols-2">
                  <Field label="Motivo da adoção" className="sm:col-span-2">
                    <textarea
                      name="motivo"
                      required
                      rows={3}
                      placeholder="Explique por que está buscando um novo lar para o animal."
                      className={`${inputClass} resize-y py-3`}
                    />
                  </Field>
                  <Field label="Tempo sob os cuidados do responsável">
                    <input
                      name="tempoCuidados"
                      required
                      placeholder="Ex.: 8 meses"
                      className={inputClass}
                    />
                  </Field>
                  <Field label="Está atualmente sob seus cuidados?">
                    <YesNoUnknown name="sobCuidados" unknown={false} />
                  </Field>
                  <Field label="Descrição do animal" className="sm:col-span-2">
                    <textarea
                      name="descricao"
                      required
                      rows={5}
                      placeholder="Conte a história, rotina e tudo que ajudará o futuro adotante a conhecê-lo."
                      className={`${inputClass} resize-y py-3`}
                    />
                  </Field>
                </div>
              </Section>
            </div>
  );
}
