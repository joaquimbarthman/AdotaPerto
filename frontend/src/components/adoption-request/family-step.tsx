"use client";

import type { Props } from "./adoption-request-form";
import {
  FormSection,
  NumberQuestion,
  RadioQuestion,
  SelectQuestion,
} from "./questions";

export function FamilyStep(props: Props) {
  const { step, hasChildren, setHasChildren } = props;
  return (
    <div
      data-request-step="1"
      className={step === 1 ? "donation-step-panel" : "hidden"}
    >
      <FormSection title={"Fam\u00edlia e conviv\u00eancia"}>
        <NumberQuestion
          label={"Quantas pessoas moram com voc\u00ea?"}
          name="householdSize"
          min={1}
          max={30}
        />
        <RadioQuestion
          legend={"Todos est\u00e3o de acordo com a ado\u00e7\u00e3o?"}
          name="householdAgreement"
          options={["Sim", "N\u00e3o"]}
        />
        <RadioQuestion
          legend={"Existem crian\u00e7as na resid\u00eancia?"}
          name="hasChildren"
          options={["Sim", "N\u00e3o"]}
          value={hasChildren}
          onChange={setHasChildren}
        />
        {hasChildren === "Sim" && (
          <SelectQuestion
            label={"Faixa et\u00e1ria das crian\u00e7as"}
            name="childrenAge"
            options={[
              "0 a 3 anos",
              "4 a 7 anos",
              "8 a 12 anos",
              "13 anos ou mais",
              "Mais de uma faixa",
            ]}
          />
        )}
      </FormSection>
    </div>
  );
}
