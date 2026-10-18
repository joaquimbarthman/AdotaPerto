import Link from "next/link";
import type { Props } from "./item-donation-form";

export function ItemDonationActions(props: Props) {
 const { step, steps, returnPath, setStep, goToNextStep, loading, editId } = props;
 return (
<div className="donation-form-actions grid grid-cols-2 gap-2 border-t border-[#d7e6da] pt-4 sm:gap-3 sm:pt-6">
              {step === 0 ? (
                <Link
                  href={returnPath}
                  className="flex min-h-11 items-center justify-center rounded-lg border border-[#256441] bg-white px-3 py-2 text-xs font-semibold text-[#256441] transition hover:bg-[#e8f7eb] sm:min-h-13.5 sm:rounded-xl sm:text-sm"
                >
                  Cancelar
                </Link>
              ) : (
                <button
                  type="button"
                  onClick={() => setStep((current) => current - 1)}
                  className="flex min-h-11 items-center justify-center rounded-lg border border-[#256441] bg-white px-3 py-2 text-xs font-semibold text-[#256441] transition hover:bg-[#e8f7eb] sm:min-h-13.5 sm:rounded-xl sm:text-sm"
                >
                  Voltar
                </button>
              )}
              {step < steps.length - 1 ? (
                <button
                  type="button"
                  onClick={goToNextStep}
                  className="flex min-h-11 items-center justify-center rounded-lg bg-[#0f5d39] px-3 py-2 text-xs font-semibold text-white transition hover:bg-[#194b30] sm:min-h-13.5 sm:rounded-xl sm:text-sm"
                >
                  Continuar
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={loading}
                  className="flex min-h-11 items-center justify-center rounded-lg bg-[#0f5d39] px-3 py-2 text-xs font-semibold text-white shadow-[0_4px_12px_rgba(15,93,57,0.18)] transition hover:-translate-y-0.5 hover:bg-[#194b30] disabled:opacity-60 sm:min-h-13.5 sm:rounded-xl sm:text-sm"
                >
                  {loading
                    ? "Salvando..."
                    : editId
                      ? "Salvar alterações"
                      : "Publicar doação"}
                </button>
              )}
            </div>
 );
}
