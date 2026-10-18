"use client";

import { FormSection, RadioQuestion, CheckboxQuestion } from "./questions";
import type { Props } from "./adoption-request-form";

export function OtherAnimalsStep(props: Props) {
  const { step, hasOtherAnimals, setHasOtherAnimals } = props;
  return (
<div
                    data-request-step="2"
                    className={step === 2 ? "donation-step-panel" : "hidden"}
                  >
                    <FormSection title={"Outros animais e experi\u00eancia"}>
                      <RadioQuestion
                        legend="Possui outros animais atualmente?"
                        name="hasOtherAnimals"
                        options={["Sim", "N\u00e3o"]}
                        value={hasOtherAnimals}
                        onChange={setHasOtherAnimals}
                      />
                      {hasOtherAnimals === "Sim" && (
                        <div className="rounded-xl bg-[#f7fcf8] p-4">
                          <CheckboxQuestion
                            legend="Quais animais?"
                            name="otherAnimalTypes"
                            options={["C\u00e3es", "Gatos", "Outros"]}
                          />
                          <div className="mt-5">
                            <RadioQuestion
                              legend={"Eles s\u00e3o vacinados e castrados?"}
                              name="otherAnimalsCare"
                              options={["Sim", "Parcialmente", "N\u00e3o"]}
                            />
                          </div>
                        </div>
                      )}
                      <RadioQuestion
                        legend={"J\u00e1 teve animais anteriormente?"}
                        name="previousPets"
                        options={["Sim", "N\u00e3o"]}
                      />
                    </FormSection>
                  </div>
  );
}
