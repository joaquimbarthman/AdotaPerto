"use client";

import { FamilyStep } from "./family-step";
import { HousingStep } from "./housing-step";
import { MotivationStep } from "./motivation-step";
import { OtherAnimalsStep } from "./other-animals-step";
import { RoutineStep } from "./routine-step";

import { DirectionalChevron } from "@/components/directional-chevron";
import { DonationStepProgress } from "@/components/donation-form-ui";
import { Notification } from "@/components/notification";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import type { Animal } from "@/data/animals";
import Link from "next/link";
import type { FormEvent, RefObject } from "react";
import { AnimalSummary, NextSteps } from "./animal-summary";

export type Props = {
  animal: Animal;
  unavailable: boolean;
  error: string | null;
  formRef: RefObject<HTMLFormElement | null>;
  handleSubmit: (event: FormEvent<HTMLFormElement>) => void;
  step: number;
  steps: readonly string[];
  housing: string;
  setHousing: (value: string) => void;
  hasOtherAnimals: string;
  setHasOtherAnimals: (value: string) => void;
  hasChildren: string;
  setHasChildren: (value: string) => void;
  isRented: string;
  setIsRented: (value: string) => void;
  goToNextStep: () => void;
  goToPreviousStep: () => void;
  submitting: boolean;
};

export function AdoptionRequestForm(props: Props) {
  const { animal, unavailable, error, formRef, handleSubmit, step, steps, goToNextStep, goToPreviousStep, submitting } = props;
  return (
    <div className="min-h-screen bg-[#eefdf1] text-[#121e17]">
      <SiteHeader />
      <main className="adoption-request-page mx-auto w-full max-w-300 overflow-x-hidden px-3 pb-24 pt-4 sm:px-10 sm:pb-20 sm:pt-8 lg:px-20 lg:pt-12">
        <Link
          href={`/adocao/${animal.id}`}
          className="group inline-flex items-center gap-1.5 text-sm font-semibold text-[#404942] transition hover:text-[#2f7650]"
        >
          <DirectionalChevron className="transition-transform group-hover:-translate-x-0.5" />
          Voltar para o perfil de {animal.name}
        </Link>
        <header className="mb-5 mt-4 sm:mb-10 sm:mt-5">
          <h1 className="text-2xl font-extrabold leading-7 tracking-[-0.02em] sm:text-5xl">
            Solicita&ccedil;&atilde;o de Ado&ccedil;&atilde;o
          </h1>
          <p className="mt-1.5 text-xs leading-4 text-[#404942] sm:mt-2 sm:text-lg sm:leading-7">
            Preencha o formul&aacute;rio abaixo para demonstrar seu interesse.
          </p>
        </header>

        <form
          ref={formRef}
          onSubmit={handleSubmit}
          noValidate
          className="grid min-w-0 items-start gap-4 sm:gap-8 lg:grid-cols-[minmax(0,2fr)_minmax(280px,1fr)] lg:gap-12"
        >
          <div className="min-w-0 space-y-4 sm:space-y-8">
            <AnimalSummary animal={animal} />

            {error && <Notification text={error} />}

            {unavailable ? (
              <div className="rounded-xl border border-[#d7e6da] bg-white p-8 text-center shadow-sm">
                <h2 className="text-xl font-bold">
                  Solicita&ccedil;&atilde;o indispon&iacute;vel
                </h2>
                <p className="mt-2 text-sm text-[#526057]">
                  Voc&ecirc; j&aacute; possui uma solicita&ccedil;&atilde;o para
                  este animal ou ele n&atilde;o est&aacute; mais
                  dispon&iacute;vel.
                </p>
              </div>
            ) : (
              <>
                <DonationStepProgress steps={steps} current={step} />
                <section className="request-form-card overflow-hidden rounded-xl border border-[#bfc9bf]/30 bg-white p-4 shadow-[0_4px_10px_rgba(38,51,43,0.04)] sm:p-8 lg:p-10">
                  <HousingStep {...props} />

                  <FamilyStep {...props} />

                  <OtherAnimalsStep {...props} />

                  <RoutineStep {...props} />

                  <MotivationStep {...props} />
                </section>
                <div className="donation-form-actions grid grid-cols-2 gap-2 border-t border-[#d7e6da] pt-4 sm:gap-3 sm:pt-6">
                  {step === 0 ? (
                    <Link
                      href={`/adocao/${animal.id}`}
                      className="flex min-h-13 items-center justify-center rounded-xl border border-[#256441] bg-white px-5 py-3 text-sm font-semibold text-[#256441] transition hover:bg-[#e8f7eb]"
                    >
                      Cancelar
                    </Link>
                  ) : (
                    <button
                      type="button"
                      onClick={goToPreviousStep}
                      className="flex min-h-13 items-center justify-center rounded-xl border border-[#256441] bg-white px-5 py-3 text-sm font-semibold text-[#256441] transition hover:bg-[#e8f7eb]"
                    >
                      Voltar
                    </button>
                  )}
                  {step < steps.length - 1 ? (
                    <button
                      type="button"
                      onClick={goToNextStep}
                      className="flex min-h-13 items-center justify-center rounded-xl bg-[#0f5d39] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#194b30]"
                    >
                      Continuar
                    </button>
                  ) : (
                    <button
                      type="submit"
                      disabled={submitting}
                      className="flex min-h-13 items-center justify-center rounded-xl bg-[#0f5d39] px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:-translate-y-0.5 hover:bg-[#194b30] disabled:translate-y-0 disabled:opacity-50"
                    >
                      {submitting ? "Enviando..." : "Enviar solicitação"}
                    </button>
                  )}
                </div>
              </>
            )}
          </div>

          <NextSteps animal={animal} />
        </form>
      </main>
      <SiteFooter />
    </div>
  );
}
