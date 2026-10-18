import Link from "next/link";
import type { Props } from "./animal-donation-form";

export function AnimalDonationActions(props: Props) {
 const { step, steps, returnPath, setStep, goToNextStep, loading, editId } = props;
 return (
<div className="donation-form-actions grid grid-cols-2 gap-2 border-t border-[#d7e6da] pt-4 sm:gap-3 sm:pt-6">
              {step === 0 ? (
                <Link
                  href={returnPath}
                  className="flex min-h-13 w-full items-center justify-center rounded-xl border border-[#256441] bg-white px-6 py-3 text-center text-sm font-semibold text-[#256441] transition hover:bg-[#e8f7eb]"
                >
                  Cancelar
                </Link>
              ) : (
                <button
                  type="button"
                  onClick={() => setStep((current) => current - 1)}
                  className="flex min-h-13 w-full items-center justify-center rounded-xl border border-[#256441] bg-white px-6 py-3 text-sm font-semibold text-[#256441] transition hover:bg-[#e8f7eb]"
                >
                  Voltar
                </button>
              )}
              {step < steps.length - 1 ? (
                <button
                  type="button"
                  onClick={goToNextStep}
                  className="flex min-h-13 w-full items-center justify-center rounded-xl bg-[#0f5d39] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#194b30]"
                >
                  Continuar
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={loading}
                  className="flex min-h-13 w-full items-center justify-center gap-2 rounded-xl bg-[#0f5d39] px-6 py-3 text-sm font-semibold text-white shadow-[0_4px_12px_rgba(15,93,57,0.18)] transition hover:-translate-y-0.5 hover:bg-[#194b30] hover:shadow-[0_7px_16px_rgba(15,93,57,0.22)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#256441] disabled:opacity-60"
                >
                  <svg
                    viewBox="0 0 20 20"
                    className="size-4"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    aria-hidden="true"
                  >
                    <path
                      d="m5 10 3.2 3.2L15 6.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                  {loading
                    ? "Salvando..."
                    : editId
                      ? "Salvar alterações"
                      : "Finalizar cadastro"}
                </button>
              )}
            </div>
 );
}
