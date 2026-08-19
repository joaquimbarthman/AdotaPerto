import { asc, eq } from "drizzle-orm";
import { db } from "./index.ts";
import { animal, user } from "./schemas/index.ts";

const mockAnimals = [
  {
    id: "bidu",
    name: "Bidu",
    image: "/images/bidu.png",
    images: [],
    species: "Cachorro",
    breed: "SRD",
    size: "M",
    sex: "Macho",
    age: "2 anos",
    weight: "15kg",
    traits: ["Brincalhão", "Vacinado"],
    status: "Disponível",
  },
  {
    id: "mia",
    name: "Mia",
    image: "/images/mia.png",
    images: [],
    species: "Gato",
    breed: "Sem raça definida",
    size: "P",
    sex: "Fêmea",
    age: "1 ano",
    weight: "3kg",
    traits: ["Carinhosa", "Castrada"],
    status: "Disponível",
  },
  {
    id: "thor-home",
    name: "Thor",
    image: "/images/thor.png",
    images: [],
    species: "Cachorro",
    breed: "Labrador",
    size: "G",
    sex: "Macho",
    age: "6 anos",
    weight: "28kg",
    traits: ["Companheiro", "Energia moderada"],
    status: "Disponível",
  },
  {
    id: "lola",
    name: "Lola",
    image: "/images/lola.png",
    images: [],
    species: "Cachorro",
    breed: "Poodle",
    size: "P",
    sex: "Fêmea",
    age: "3 meses",
    weight: "2kg",
    traits: ["Dócil", "Brincalhona"],
    status: "Disponível",
  },
  {
    id: "luna",
    name: "Luna",
    image: "/images/luna-detail-1.png",
    images: ["/images/luna-detail-2.png", "/images/luna-detail-3.png"],
    species: "Cachorro",
    breed: "SRD",
    size: "M",
    sex: "Fêmea",
    age: "2 anos",
    traits: ["Vacinada", "Castrada"],
    status: "Disponível",
    neutered: "Sim",
    vaccination: "Vacinas em dia",
    dewormed: "Sim",
    healthCondition: "Não possui condição de saúde conhecida.",
    energyLevel: "Alto",
    livesWithDogs: "Sim",
    livesWithCats: "Não sei",
    livesWithChildren: "Sim",
    personality: "Dócil, carinhosa e brincalhona.",
    behaviorNotes: "Adora brincar com bolinhas e correr no quintal. Adapta-se melhor com uma rotina ativa.",
    adoptionReason: "Foi resgatada das ruas e está pronta para viver com uma família definitiva.",
    timeInCare: "6 meses",
    currentlyInCare: true,
    description: "Luna é uma cachorrinha muito dócil e cheia de energia. Gosta de companhia, brincadeiras e não dispensa um bom cafuné.",
  },
  {
    id: "mingau",
    name: "Mingau",
    image: "/images/mingau.png",
    images: [],
    species: "Gato",
    breed: "SRD",
    size: "P",
    sex: "Macho",
    age: "8 meses",
    traits: ["Sociável"],
    status: "Em Processo",
  },
  {
    id: "thor",
    name: "Thor",
    image: "/images/thor-adocao.png",
    images: [],
    species: "Cachorro",
    breed: "Labrador",
    size: "G",
    sex: "Macho",
    age: "4 anos",
    traits: ["Ativo", "Guarda"],
    status: "Disponível",
  },
  {
    id: "mel",
    name: "Mel",
    image: "/images/mel.png",
    images: [],
    species: "Cachorro",
    breed: "SRD",
    size: "M",
    sex: "Fêmea",
    age: "9 anos",
    traits: ["Calma", "Sênior"],
    status: "Disponível",
  },
] satisfies Array<Omit<typeof animal.$inferInsert, "userId">>;

async function seed() {
  const [firstUser] = await db
    .select({ id: user.id, name: user.name })
    .from(user)
    .orderBy(asc(user.createdAt), asc(user.id))
    .limit(1);

  if (!firstUser) {
    throw new Error("Nenhum usuário encontrado. Crie um usuário antes de executar o seeder.");
  }

  await db.transaction(async (tx) => {
    for (const mockAnimal of mockAnimals) {
      const values = { ...mockAnimal, userId: firstUser.id };
      const [existing] = await tx
        .select({ id: animal.id })
        .from(animal)
        .where(eq(animal.id, mockAnimal.id));

      if (existing) {
        await tx
          .update(animal)
          .set({ ...values, updatedAt: new Date() })
          .where(eq(animal.id, mockAnimal.id));
      } else {
        await tx.insert(animal).values(values);
      }
    }
  });

  console.log(`${mockAnimals.length} animais associados ao usuário ${firstUser.name}.`);
}

seed()
  .catch((error) => {
    console.error("Falha ao executar o seeder:", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await db.$client.end();
  });
