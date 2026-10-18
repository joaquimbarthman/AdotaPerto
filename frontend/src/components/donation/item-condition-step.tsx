"use client";

import { DonationField, DonationFormSection, donationInputClass } from "@/components/donation-form-ui";
import { SectionIcon } from "./item-form-parts";
import { expiryCategories, conditions } from "./item-form-constants";

import type { Props } from "./item-donation-form";

export function ItemConditionStep(props: Props) {
  const { step, category, today } = props;
  return (
<div
              data-donation-step="1"
              className={step === 1 ? "donation-step-panel" : "hidden"}
            >
              <DonationFormSection
                icon={<SectionIcon src="/icons/check-detail.svg" />}
                title="Detalhes"
                description="Descreva o estado do item com transparência."
              >
                <div className="grid gap-5 sm:grid-cols-2">
                  <fieldset className="sm:col-span-2">
                    <legend className="mb-2 text-sm font-semibold">
                      Condição do item <span className="text-red-600">*</span>
                    </legend>
                    <div className="grid gap-2 sm:grid-cols-2">
                      {conditions.map((condition) => (
                        <label
                          key={condition}
                          className="flex min-h-12 cursor-pointer items-center gap-3 rounded-lg border border-[#c5cec7] bg-[#f7fcf8] px-4 py-3 text-sm text-[#404942] transition hover:border-[#86a590] has-[:checked]:border-[#256441] has-[:checked]:bg-[#e3f2e6] has-[:checked]:font-semibold has-[:checked]:text-[#194b30]"
                        >
                          <input
                            type="radio"
                            name="condition"
                            value={condition}
                            required
                            className="size-4 accent-[#256441]"
                          />
                          {condition}
                        </label>
                      ))}
                    </div>
                  </fieldset>
                  {expiryCategories.has(category) && (
                    <DonationField label="Validade">
                      <input
                        name="expirationDate"
                        type="date"
                        min={today}
                        required
                        className={donationInputClass}
                      />
                    </DonationField>
                  )}
                  <DonationField label="Descrição" className="sm:col-span-2">
                    <textarea
                      name="description"
                      required
                      minLength={10}
                      maxLength={2000}
                      rows={6}
                      placeholder="Descreva o item, marca, tamanho, estado da embalagem e outras informações importantes..."
                      className={`${donationInputClass} resize-y py-3 leading-6`}
                    />
                  </DonationField>
                </div>
              </DonationFormSection>
            </div>
  );
}
