"use client";

import { FormSection, RadioQuestion, SelectQuestion, TextQuestion } from "./questions";
import type { Props } from "./adoption-request-form";

export function RoutineStep(props: Props) {
  const { step } = props;
  return (
<div
                    data-request-step="3"
                    className={step === 3 ? "donation-step-panel" : "hidden"}
                  >
                    <FormSection title="Rotina e disponibilidade">
                      <SelectQuestion
                        label={
                          "Quanto tempo o animal ficar\u00e1 sozinho por dia?"
                        }
                        name="aloneTime"
                        options={[
                          "At\u00e9 2 horas",
                          "De 2 a 4 horas",
                          "De 4 a 8 horas",
                          "Mais de 8 horas",
                        ]}
                      />
                      <SelectQuestion
                        label="Quanto tempo consegue dedicar diariamente ao animal?"
                        name="dailyTime"
                        options={[
                          "Menos de 1 hora",
                          "De 1 a 2 horas",
                          "De 2 a 4 horas",
                          "Mais de 4 horas",
                        ]}
                      />
                    </FormSection>

                    <FormSection title="Responsabilidade e cuidados">
                      <RadioQuestion
                        legend={
                          "Possui condi\u00e7\u00f5es de arcar com alimenta\u00e7\u00e3o, vacina\u00e7\u00e3o e cuidados veterin\u00e1rios?"
                        }
                        name="financialCondition"
                        options={["Sim", "N\u00e3o"]}
                      />
                      <RadioQuestion
                        legend={
                          "Est\u00e1 disposto a manter vacina\u00e7\u00e3o e cuidados de sa\u00fade em dia?"
                        }
                        name="healthCommitment"
                        options={["Sim", "N\u00e3o"]}
                      />
                      <TextQuestion
                        label={
                          "Como pretende lidar caso o animal necessite de tratamento veterin\u00e1rio?"
                        }
                        name="veterinaryPlan"
                        placeholder={
                          "Conte como voc\u00ea se organizaria para oferecer o tratamento necess\u00e1rio..."
                        }
                        rows={3}
                      />
                    </FormSection>
                  </div>
  );
}
