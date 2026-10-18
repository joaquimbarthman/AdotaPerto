"use client";


import { DonationField as Field, donationInputClass as inputClass, DonationFormSection as Section, DonationSelect as Select } from "@/components/donation-form-ui";
import { YesNoUnknown, HealthIcon } from "./animal-form-parts";
import type { Props } from "./animal-donation-form";

export function AnimalHealthStep(props: Props) {
  const { step } = props;
  return (
<div
              data-donation-step="1"
              className={step === 1 ? "donation-step-panel" : "hidden"}
            >
              <Section
                icon={<HealthIcon />}
                title="Saúde e cuidados"
                description="Caso não saiba alguma informação, selecione “Não sei”."
              >
                <div className="grid gap-5 sm:grid-cols-2 sm:items-end">
                  <Field label="Castrado?">
                    <YesNoUnknown name="castrado" />
                  </Field>
                  <Field label="Situação vacinal">
                    <Select name="vacinas">
                      <option>Vacinas em dia</option>
                      <option>Vacinação incompleta</option>
                      <option>Não vacinado</option>
                      <option>Não sei</option>
                    </Select>
                  </Field>
                  <Field label="Vermifugado?">
                    <YesNoUnknown name="vermifugado" />
                  </Field>
                  <Field label="Possui condição de saúde ou necessidade especial?">
                    <YesNoUnknown name="condicao" unknown={false} />
                  </Field>
                  <Field
                    label="Descrição da condição de saúde"
                    optional
                    className="sm:col-span-2"
                  >
                    <textarea
                      name="descricaoSaude"
                      rows={4}
                      placeholder="Medicamentos, alimentação especial, limitações ou cuidados necessários..."
                      className={`${inputClass} resize-y py-3`}
                    />
                  </Field>
                </div>
              </Section>
            </div>
  );
}
