"use client";

import { FormSection, RadioQuestion } from "./questions";
import type { Props } from "./adoption-request-form";

export function HousingStep(props: Props) {
  const { step, housing, setHousing, isRented, setIsRented } = props;
  return (
<div
                    data-request-step="0"
                    className={step === 0 ? "donation-step-panel" : "hidden"}
                  >
                    <FormSection title="Moradia e ambiente">
                      <RadioQuestion
                        legend={"Onde voc\u00ea mora?"}
                        name="housing"
                        options={["Casa", "Apartamento", "Outro"]}
                        value={housing}
                        onChange={setHousing}
                      />
                      <RadioQuestion
                        legend={
                          "Sua resid\u00eancia possui espa\u00e7o externo seguro?"
                        }
                        name="secureOutdoorSpace"
                        options={["Sim", "N\u00e3o"]}
                      />
                      <RadioQuestion
                        legend={"O im\u00f3vel \u00e9 alugado?"}
                        name="isRented"
                        options={["Sim", "N\u00e3o"]}
                        value={isRented}
                        onChange={setIsRented}
                      />
                      {(isRented === "Sim" || housing === "Apartamento") && (
                        <RadioQuestion
                          legend={"Animais s\u00e3o permitidos no im\u00f3vel?"}
                          name="animalsAllowed"
                          options={["Sim", "N\u00e3o", "N\u00e3o se aplica"]}
                        />
                      )}
                      <RadioQuestion
                        legend={"Onde o animal ficar\u00e1?"}
                        name="animalArea"
                        options={[
                          "Dentro de casa",
                          "\u00c1rea externa",
                          "Ambos",
                        ]}
                      />
                    </FormSection>
                  </div>
  );
}
