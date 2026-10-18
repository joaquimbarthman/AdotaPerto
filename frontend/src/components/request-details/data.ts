import type { Animal } from "@/data/animals";

export type RequestDetails = {
  id: string;
  status: string;
  answers: Record<string, string | string[]> | null;
  compatibilityScore: number | null;
  compatibilityDetails: string[] | null;
  animal: Animal;
  requester: {
    name: string;
    image?: string | null;
    city?: string | null;
    state?: string | null;
  };
};

export const groups = [
  {
    title: "Moradia e ambiente",
    fields: [
      ["housing", "Onde mora"],
      ["secureOutdoorSpace", "Espaço externo seguro"],
      ["isRented", "Imóvel alugado"],
      ["animalsAllowed", "Animais permitidos"],
      ["animalArea", "Onde o animal ficará"],
    ],
  },
  {
    title: "Família e convivência",
    fields: [
      ["householdSize", "Pessoas na residência"],
      ["householdAgreement", "Todos concordam"],
      ["hasChildren", "Existem crianças"],
      ["childrenAge", "Faixa etária"],
    ],
  },
  {
    title: "Outros animais e experiência",
    fields: [
      ["hasOtherAnimals", "Possui outros animais"],
      ["otherAnimalTypes", "Tipos de animais"],
      ["otherAnimalsCare", "Vacinados e castrados"],
      ["previousPets", "Já teve animais"],
    ],
  },
  {
    title: "Rotina e disponibilidade",
    fields: [
      ["aloneTime", "Tempo sozinho por dia"],
      ["dailyTime", "Dedicação diária"],
      ["petRoutine", "Rotina planejada"],
    ],
  },
  {
    title: "Responsabilidade e cuidados",
    fields: [
      ["financialCondition", "Condições financeiras"],
      ["healthCommitment", "Cuidados de saúde em dia"],
      ["veterinaryPlan", "Plano para tratamento veterinário"],
    ],
  },
  {
    title: "Motivação",
    fields: [
      ["motivation", "Por que deseja adotar"],
      ["additionalInfo", "Informações adicionais"],
    ],
  },
] as const;

export function valueExists(value: string | string[] | undefined) {
  return Array.isArray(value) ? value.length > 0 : Boolean(value);
}
export function formatValue(value: string | string[] | undefined) {
  return Array.isArray(value) ? value.join(", ") : value || "Não informado";
}
