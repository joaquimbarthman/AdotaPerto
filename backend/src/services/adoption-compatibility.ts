import type { animal } from "../../lib/db/schemas/animal.ts";

export function calculateCompatibility(
  pet: typeof animal.$inferSelect,
  answers: Record<string, string | string[]>,
) {
  let earned = 0;
  let possible = 0;
  const details: string[] = [];
  const add = (
    weight: number,
    matches: boolean,
    positive: string,
    warning: string,
  ) => {
    possible += weight;
    if (matches) earned += weight;
    details.push(matches ? positive : warning);
  };
  const types = Array.isArray(answers.otherAnimalTypes)
    ? answers.otherAnimalTypes
    : [];

  add(
    15,
    answers.householdAgreement === "Sim",
    "Todos na residência concordam com a adoção.",
    "Nem todos na residência concordam com a adoção.",
  );
  add(
    15,
    answers.financialCondition === "Sim" && answers.healthCommitment === "Sim",
    "Há compromisso com os custos e cuidados de saúde.",
    "É necessário confirmar condições financeiras e cuidados de saúde.",
  );

  if (pet.size === "G")
    add(
      15,
      answers.secureOutdoorSpace === "Sim" || answers.animalArea === "Ambos",
      "O ambiente oferece espaço adequado para o porte.",
      "O espaço informado pode exigir adaptação para um animal de grande porte.",
    );
  if (pet.energyLevel === "Alto") {
    add(
      15,
      ["De 2 a 4 horas", "Mais de 4 horas"].includes(String(answers.dailyTime)),
      "O tempo diário combina com o nível alto de energia.",
      "O animal tem energia alta e pode precisar de mais dedicação diária.",
    );
    add(
      10,
      answers.aloneTime !== "Mais de 8 horas",
      "O período sozinho é compatível com uma rotina ativa.",
      "Longos períodos sozinho podem não combinar com o nível de energia.",
    );
  }
  if (pet.livesWithDogs === "Não")
    add(
      10,
      !types.includes("Cães"),
      "Não há cães no novo lar.",
      "O animal não convive bem com cães, mas há cães na residência.",
    );
  if (pet.livesWithCats === "Não")
    add(
      10,
      !types.includes("Gatos"),
      "Não há gatos no novo lar.",
      "O animal não convive bem com gatos, mas há gatos na residência.",
    );
  if (pet.livesWithChildren === "Não")
    add(
      10,
      answers.hasChildren === "Não",
      "Não há crianças na residência.",
      "O animal não convive bem com crianças, mas há crianças na residência.",
    );
  if (pet.hasHealthCondition || pet.healthCondition)
    add(
      10,
      Boolean(String(answers.veterinaryPlan || "").trim()) &&
        answers.healthCommitment === "Sim",
      "O adotante apresentou um plano para necessidades de saúde.",
      "As necessidades especiais de saúde exigem um plano de cuidado mais claro.",
    );

  if (possible < 100)
    add(
      100 - possible,
      answers.previousPets === "Sim" || answers.dailyTime === "Mais de 4 horas",
      "A experiência ou disponibilidade fortalece a compatibilidade.",
      "A adaptação pode exigir acompanhamento e orientação do responsável.",
    );

  return {
    compatibilityScore: Math.round((earned / possible) * 100),
    compatibilityDetails: details,
  };
}
