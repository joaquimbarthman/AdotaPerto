"use client";


import { DonationField as Field, donationInputClass as inputClass, DonationFormSection as Section, DonationSelect as Select } from "@/components/donation-form-ui";
import { YesNoUnknown, HeartIcon } from "./animal-form-parts";
import type { Props } from "./animal-donation-form";

export function AnimalBehaviorStep(props: Props) {
  const { step } = props;
  return (
<div
              data-donation-step="2"
              className={step === 2 ? "donation-step-panel" : "hidden"}
            >
              <Section icon={<HeartIcon />} title="Convivência e comportamento">
                <div className="grid gap-5 sm:grid-cols-2">
                  <Field label="Nível de energia">
                    <Select name="energia">
                      <option>Baixo</option>
                      <option>Moderado</option>
                      <option>Alto</option>
                    </Select>
                  </Field>
                  <Field label="Convive com cães?">
                    <YesNoUnknown name="caes" />
                  </Field>
                  <Field label="Convive com gatos?">
                    <YesNoUnknown name="gatos" />
                  </Field>
                  <Field label="Convive com crianças?">
                    <YesNoUnknown name="criancas" />
                  </Field>
                  <Field label="Personalidade" className="sm:col-span-2">
                    <textarea
                      name="personalidade"
                      required
                      rows={4}
                      placeholder="Conte se ele é carinhoso, tímido, brincalhão, protetor..."
                      className={`${inputClass} resize-y py-3`}
                    />
                  </Field>
                  <Field
                    label="Observações sobre comportamento"
                    optional
                    className="sm:col-span-2"
                  >
                    <textarea
                      name="comportamento"
                      rows={4}
                      placeholder="Medos, hábitos, adaptação, treinamento ou outras informações..."
                      className={`${inputClass} resize-y py-3`}
                    />
                  </Field>
                </div>
              </Section>
            </div>
  );
}
