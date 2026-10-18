"use client";

import { DonationField, DonationFormSection, DonationSelect, donationInputClass } from "@/components/donation-form-ui";
import { SectionIcon } from "./item-form-parts";


import type { Props } from "./item-donation-form";

export function ItemLocationStep(props: Props) {
  const { step, errors, setErrors, today } = props;
  return (
<div
              data-donation-step="3"
              className={step === 3 ? "donation-step-panel" : "hidden"}
            >
              <DonationFormSection
                icon={<SectionIcon src="/icons/location.svg" />}
                title="Entrega"
                description="Defina como e até quando o item estará disponível."
              >
                <div className="grid gap-5 sm:grid-cols-2">
                  <DonationField label="Forma de entrega">
                    <DonationSelect name="deliveryMethod">
                      <option>Retirada</option>
                      <option>Entrega</option>
                      <option>A combinar</option>
                    </DonationSelect>
                  </DonationField>
                  <DonationField
                    label="Disponível até"
                    optional
                    error={errors.availableUntil}
                  >
                    <input
                      name="availableUntil"
                      type="date"
                      min={today}
                      className={donationInputClass}
                      onChange={() =>
                        setErrors((current) => ({
                          ...current,
                          availableUntil: "",
                        }))
                      }
                    />
                  </DonationField>
                </div>
              </DonationFormSection>
            </div>
  );
}
