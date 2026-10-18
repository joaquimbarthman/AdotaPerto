"use client";
import { ItemDonationTips } from "./item-donation-tips";
import { ItemDonationActions } from "./item-donation-actions";

import { ItemBasicsStep } from "./item-basics-step";
import { ItemConditionStep } from "./item-condition-step";
import { ItemLocationStep } from "./item-location-step";
import { ItemPhotosStep } from "./item-photos-step";

import { DirectionalChevron } from "@/components/directional-chevron";
import { DonationStepProgress } from "@/components/donation-form-ui";
import { Notification } from "@/components/notification";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import Link from "next/link";
import type { Dispatch, FormEvent, RefObject, SetStateAction } from "react";


type Setter<T> = Dispatch<SetStateAction<T>>;
export type Props = {
  formRef: RefObject<HTMLFormElement | null>;
  submit: (event: FormEvent<HTMLFormElement>) => void;
  returnPath: string;
  editId: string | null;
  organizationId: string | null;
  globalError: string | null;
  steps: readonly string[];
  step: number;
  setStep: Setter<number>;
  goToNextStep: () => void;
  loading: boolean;
  category: string;
  setCategory: Setter<string>;
  mainPhoto: File | null;
  setMainPhoto: Setter<File | null>;
  extraPhotos: File[];
  setExtraPhotos: Setter<File[]>;
  mainInputKey: number;
  setMainInputKey: Setter<number>;
  extraInputKey: number;
  setExtraInputKey: Setter<number>;
  errors: Record<string, string>;
  setErrors: Setter<Record<string, string>>;
  editData: Record<string, unknown> | null;
  today: string;
};
export function ItemDonationForm(props: Props) {
  const { formRef, submit, returnPath, editId, organizationId, globalError, steps, step } = props;
  return (
    <div className="min-h-screen bg-[#eefdf1] text-[#121e17]">
      <SiteHeader />
      <main className="donation-form-page mx-auto w-full max-w-280 px-3 pb-24 pt-4 sm:px-8 sm:py-12 lg:px-16">
        <Link
          href={returnPath}
          className="group inline-flex items-center gap-1.5 text-sm font-semibold text-[#404942] transition hover:text-[#256441]"
        >
          <DirectionalChevron className="transition-transform group-hover:-translate-x-0.5" />
          {editId || organizationId
            ? "Voltar às publicações"
            : "Voltar às opções"}
        </Link>
        <header className="mb-5 mt-4 sm:mb-10 sm:mt-6">
          <h1 className="text-2xl font-extrabold leading-7 tracking-tight sm:text-4xl lg:text-5xl">
            {editId ? "Editar anúncio do item" : "Publicar doação"}
          </h1>
          <p className="mt-1.5 text-xs leading-4 text-[#4d5b53] sm:mt-2 sm:text-lg sm:leading-7">
            {editId
              ? "Revise todas as informações e mantenha o anúncio atualizado."
              : "Compartilhe itens e recursos que podem ajudar quem precisa."}
          </p>
        </header>
        {globalError && <Notification text={globalError} />}
        <form
          ref={formRef}
          onSubmit={submit}
          className="donation-form mx-auto grid max-w-280 items-start gap-4 sm:gap-8 lg:grid-cols-[minmax(0,1fr)_300px]"
        >
          <div className="donation-form-fields flex min-w-0 flex-col gap-4 sm:gap-7">
            <DonationStepProgress steps={steps} current={step} />
            <ItemBasicsStep {...props} />

            <ItemConditionStep {...props} />

            <ItemPhotosStep {...props} />

            <ItemLocationStep {...props} />

            <ItemDonationActions {...props} />
          </div>

          <ItemDonationTips />
        </form>
      </main>
      <SiteFooter />
    </div>
  );
}
