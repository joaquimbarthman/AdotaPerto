"use client";

import { DonationField, DonationFormSection, DonationSelect, donationInputClass } from "@/components/donation-form-ui";
import { SectionIcon } from "./item-form-parts";


import type { Props } from "./item-donation-form";

export function ItemBasicsStep(props: Props) {
  const { step, setCategory, errors, setErrors } = props;
  return (
<div
              data-donation-step="0"
              className={step === 0 ? "donation-step-panel" : "hidden"}
            >
              <DonationFormSection
                icon={<SectionIcon src="/icons/donations-profile.svg" />}
                title="Informações"
                description="Identifique o item e informe a quantidade disponível."
              >
                <div className="grid gap-5 sm:grid-cols-2">
                  <DonationField
                    label="Título da doação"
                    className="sm:col-span-2"
                  >
                    <input
                      name="title"
                      required
                      minLength={3}
                      placeholder="Ex.: Ração para cães adultos"
                      className={donationInputClass}
                    />
                  </DonationField>
                  <DonationField label="Categoria">
                    <DonationSelect
                      name="category"
                      onChange={(event) => setCategory(event.target.value)}
                    >
                      <option>Ração</option>
                      <option>Petiscos</option>
                      <option>Produtos de higiene</option>
                      <option>Caminhas e cobertores</option>
                      <option>Coleiras e guias</option>
                      <option>Caixas de transporte</option>
                      <option>Brinquedos</option>
                      <option>Utensílios</option>
                      <option>Produtos de limpeza</option>
                      <option>Outros</option>
                    </DonationSelect>
                  </DonationField>
                  <DonationField label="Nome do item">
                    <input
                      name="itemName"
                      required
                      minLength={2}
                      placeholder="Ex.: Ração Premium 15 kg"
                      className={donationInputClass}
                    />
                  </DonationField>
                  <DonationField label="Quantidade" error={errors.quantity}>
                    <input
                      name="quantity"
                      type="number"
                      min={1}
                      step={1}
                      required
                      inputMode="numeric"
                      placeholder="Ex.: 2"
                      className={donationInputClass}
                      onChange={() =>
                        setErrors((current) => ({ ...current, quantity: "" }))
                      }
                    />
                  </DonationField>
                  <DonationField label="Unidade">
                    <DonationSelect name="unit">
                      <option>Unidade</option>
                      <option>Kg</option>
                      <option>g</option>
                      <option>Litros</option>
                      <option>mL</option>
                      <option>Pacote</option>
                      <option>Caixa</option>
                    </DonationSelect>
                  </DonationField>
                </div>
              </DonationFormSection>
            </div>
  );
}
