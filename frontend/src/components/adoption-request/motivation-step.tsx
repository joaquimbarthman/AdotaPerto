"use client";

import { FormSection, TextQuestion } from "./questions";
import type { Props } from "./adoption-request-form";

export function MotivationStep(props: Props) {
  const { step } = props;
  return (
<div
                    data-request-step="4"
                    className={step === 4 ? "donation-step-panel" : "hidden"}
                  >
                    <FormSection title={"Motiva\u00e7\u00e3o"}>
                      <TextQuestion
                        label="Por que gostaria de adotar este animal?"
                        name="motivation"
                        placeholder={
                          "Conte-nos um pouco sobre suas motiva\u00e7\u00f5es..."
                        }
                        rows={5}
                      />
                      <TextQuestion
                        label="Como seria a rotina do animal em sua casa?"
                        name="petRoutine"
                        placeholder={
                          "Descreva passeios, alimenta\u00e7\u00e3o, companhia e onde ele dormiria..."
                        }
                        rows={4}
                      />
                      <TextQuestion
                        label={
                          "H\u00e1 algo que o respons\u00e1vel deveria saber? (opcional)"
                        }
                        name="additionalInfo"
                        placeholder={
                          "Compartilhe outras informa\u00e7\u00f5es importantes..."
                        }
                        rows={3}
                        required={false}
                      />
                    </FormSection>
                  </div>
  );
}
