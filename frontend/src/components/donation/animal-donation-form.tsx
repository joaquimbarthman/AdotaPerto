"use client";
import { AnimalDonationTips } from "./animal-donation-tips";
import { AnimalDonationActions } from "./animal-donation-actions";

import { AnimalBasicsStep } from "./animal-basics-step";
import { AnimalHealthStep } from "./animal-health-step";
import { AnimalBehaviorStep } from "./animal-behavior-step";
import { AnimalStoryStep } from "./animal-story-step";
import { AnimalPhotosStep } from "./animal-photos-step";

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
  error: string | null;
  steps: readonly string[];
  step: number;
  setStep: Setter<number>;
  goToNextStep: () => void;
  loading: boolean;
  mainPhoto: File | null;
  setMainPhoto: Setter<File | null>;
  extraPhotos: File[];
  setExtraPhotos: Setter<File[]>;
  mainInputKey: number;
  setMainInputKey: Setter<number>;
  extraInputKey: number;
  setExtraInputKey: Setter<number>;
  editData: Record<string, unknown> | null;
};
export function AnimalDonationForm(props: Props) {
  const { formRef, submit, returnPath, editId, organizationId, error, steps, step } = props;
  return (
    <div className="min-h-screen bg-[#eefdf1] text-[#121e17]">
      <SiteHeader />
      <main className="donation-form-page mx-auto w-full max-w-280 px-3 pb-24 pt-4 sm:px-8 sm:py-12 lg:px-16">
        <Link
          href={returnPath}
          className="mb-4 inline-flex items-center gap-1.5 rounded-lg px-1 py-1 text-xs font-semibold text-[#256441] transition hover:bg-[#e8f7eb] sm:mb-7 sm:gap-2 sm:px-2 sm:text-sm"
        >
          <span aria-hidden="true">‹</span>{" "}
          {editId || organizationId
            ? "Voltar às publicações"
            : "Voltar às opções"}
        </Link>

        {error && <Notification text={error} />}

        <header className="mb-5 max-w-4xl sm:mb-10">
          <h1 className="text-2xl font-extrabold leading-7 tracking-tight sm:text-4xl lg:text-5xl">
            {editId
              ? "Editar anúncio do animal"
              : "Cadastrar animal para adoção"}
          </h1>
          <p className="mt-1.5 text-xs leading-4 text-[#4d5b53] sm:mt-2 sm:text-lg sm:leading-7">
            Preencha as informações com carinho para ajudar este animal a
            encontrar um novo lar seguro e amoroso.
          </p>
        </header>

        <form
          ref={formRef}
          onSubmit={submit}
          className="donation-form mx-auto grid max-w-280 items-start gap-4 sm:gap-8 lg:grid-cols-[minmax(0,1fr)_300px]"
        >
          <div className="donation-form-fields flex min-w-0 flex-col gap-4 sm:gap-7">
            <DonationStepProgress steps={steps} current={step} />
            <AnimalBasicsStep {...props} />

            <AnimalHealthStep {...props} />

            <AnimalBehaviorStep {...props} />

            <AnimalStoryStep {...props} />

            <AnimalPhotosStep {...props} />

            <AnimalDonationActions {...props} />
          </div>

          <AnimalDonationTips />
        </form>
      </main>
      <SiteFooter />
    </div>
  );
}
