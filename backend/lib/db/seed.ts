import { eq, inArray } from "drizzle-orm";
import { db } from "./index.ts";
import { animal, donationItem } from "./schemas/index.ts";
import { seedPhotos, uploadSeedImages } from "../../inserts/images.ts";

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
    neutered: "Sim",
    vaccination: "Vacinas em dia",
    dewormed: "Sim",
    hasHealthCondition: false,
    healthCondition: "Nenhuma condição de saúde conhecida.",
    energyLevel: "Alto",
    livesWithDogs: "Sim",
    livesWithCats: "Não sei",
    livesWithChildren: "Sim",
    personality: "Brincalhão, sociável e muito apegado às pessoas.",
    behaviorNotes: "Gosta de passeios e brincadeiras com bolinhas.",
    adoptionReason: "Foi resgatado e procura uma família definitiva.",
    timeInCare: "5 meses",
    currentlyInCare: true,
    description: "Bidu é um cão alegre que adora companhia e atividades ao ar livre.",
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
    neutered: "Sim",
    vaccination: "Vacinas em dia",
    dewormed: "Sim",
    hasHealthCondition: false,
    healthCondition: "Nenhuma condição de saúde conhecida.",
    energyLevel: "Moderado",
    livesWithDogs: "Não sei",
    livesWithCats: "Sim",
    livesWithChildren: "Sim",
    personality: "Carinhosa, curiosa e tranquila.",
    behaviorNotes: "Gosta de observar a casa e brincar com objetos leves.",
    adoptionReason: "Foi acolhida temporariamente e busca um lar permanente.",
    timeInCare: "4 meses",
    currentlyInCare: true,
    description: "Mia é uma gata afetuosa que se adapta bem a uma rotina calma.",
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
    neutered: "Sim",
    vaccination: "Vacinas em dia",
    dewormed: "Sim",
    hasHealthCondition: false,
    healthCondition: "Nenhuma condição de saúde conhecida.",
    energyLevel: "Moderado",
    livesWithDogs: "Sim",
    livesWithCats: "Não sei",
    livesWithChildren: "Sim",
    personality: "Companheiro, paciente e obediente.",
    behaviorNotes: "Aprecia caminhadas tranquilas e a presença da família.",
    adoptionReason: "Sua família temporária não pode mantê-lo em definitivo.",
    timeInCare: "3 meses",
    currentlyInCare: true,
    description: "Thor é um cão adulto e companheiro que gosta de estar perto das pessoas.",
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
    neutered: "Não",
    vaccination: "Vacinação incompleta",
    dewormed: "Sim",
    hasHealthCondition: false,
    healthCondition: "Nenhuma condição de saúde conhecida.",
    energyLevel: "Alto",
    livesWithDogs: "Sim",
    livesWithCats: "Não sei",
    livesWithChildren: "Sim",
    personality: "Dócil, curiosa e brincalhona.",
    behaviorNotes: "Por ser filhote, ainda está aprendendo a rotina da casa.",
    adoptionReason: "Nasceu sob cuidados temporários e precisa de uma família.",
    timeInCare: "3 meses",
    currentlyInCare: true,
    description: "Lola é uma filhote cheia de energia, pronta para crescer em um lar cuidadoso.",
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
    weight: "14kg",
    traits: ["Vacinada", "Castrada"],
    status: "Disponível",
    neutered: "Sim",
    vaccination: "Vacinas em dia",
    dewormed: "Sim",
    hasHealthCondition: false,
    healthCondition: "Não possui condição de saúde conhecida.",
    energyLevel: "Alto",
    livesWithDogs: "Sim",
    livesWithCats: "Não sei",
    livesWithChildren: "Sim",
    personality: "Dócil, carinhosa e brincalhona.",
    behaviorNotes:
      "Adora brincar com bolinhas e correr no quintal. Adapta-se melhor com uma rotina ativa.",
    adoptionReason:
      "Foi resgatada das ruas e está pronta para viver com uma família definitiva.",
    timeInCare: "6 meses",
    currentlyInCare: true,
    description:
      "Luna é uma cachorrinha muito dócil e cheia de energia. Gosta de companhia, brincadeiras e não dispensa um bom cafuné.",
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
    weight: "3kg",
    neutered: "Não sei",
    vaccination: "Vacinação incompleta",
    dewormed: "Sim",
    hasHealthCondition: false,
    healthCondition: "Nenhuma condição de saúde conhecida.",
    energyLevel: "Moderado",
    livesWithDogs: "Não sei",
    livesWithCats: "Sim",
    livesWithChildren: "Não sei",
    personality: "Sociável e curioso depois de ganhar confiança.",
    behaviorNotes: "Precisa de um tempo para se acostumar com ambientes novos.",
    adoptionReason: "Foi acolhido temporariamente e aguarda uma família.",
    timeInCare: "2 meses",
    currentlyInCare: true,
    description: "Mingau é um gato jovem que gosta de companhia e brincadeiras leves.",
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
    weight: "27kg",
    neutered: "Sim",
    vaccination: "Vacinas em dia",
    dewormed: "Sim",
    hasHealthCondition: false,
    healthCondition: "Nenhuma condição de saúde conhecida.",
    energyLevel: "Alto",
    livesWithDogs: "Sim",
    livesWithCats: "Não sei",
    livesWithChildren: "Sim",
    personality: "Ativo, atento e leal.",
    behaviorNotes: "Gosta de exercícios diários e de atividades com a família.",
    adoptionReason: "Precisa de uma família com tempo para sua rotina de passeios.",
    timeInCare: "4 meses",
    currentlyInCare: true,
    description: "Thor é um cão ativo que gosta de explorar e brincar ao ar livre.",
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
    weight: "16kg",
    neutered: "Sim",
    vaccination: "Vacinas em dia",
    dewormed: "Sim",
    hasHealthCondition: false,
    healthCondition: "Nenhuma condição de saúde conhecida.",
    energyLevel: "Baixo",
    livesWithDogs: "Sim",
    livesWithCats: "Não sei",
    livesWithChildren: "Sim",
    personality: "Calma, afetuosa e paciente.",
    behaviorNotes: "Prefere passeios curtos e momentos tranquilos ao lado das pessoas.",
    adoptionReason: "Busca uma família definitiva para passar a fase sênior com conforto.",
    timeInCare: "7 meses",
    currentlyInCare: true,
    description: "Mel é uma cadela sênior tranquila que aprecia carinho e uma rotina serena.",
    traits: ["Calma", "Sênior"],
    status: "Disponível",
  },
] satisfies Array<Omit<typeof animal.$inferInsert, "userId">>;

const mockDonationItems = [
  {
    id: "item-racao-caes",
    title: "Ração para cães adultos",
    category: "Ração",
    itemName: "Ração premium sabor carne",
    quantity: 5,
    unit: "Kg",
    condition: "Aberto em boas condições",
    description:
      "Pacote bem armazenado, aberto recentemente e dentro da validade.",
    mainImage: "/images/login-cover-v2.png",
    images: [],
    deliveryMethod: "Retirada",
    status: "Disponível",
  },
  {
    id: "item-racao-gatos",
    title: "Ração para gatos",
    category: "Ração",
    itemName: "Ração seca para gatos castrados",
    quantity: 2,
    unit: "Kg",
    condition: "Lacrado",
    description:
      "Dois quilos de ração em embalagem lacrada e pronta para doação.",
    mainImage: "/images/login-cover-v2.png",
    images: [],
    deliveryMethod: "Entrega",
    status: "Disponível",
  },
  {
    id: "item-caminha",
    title: "Caminha tamanho médio",
    category: "Caminhas e cobertores",
    itemName: "Caminha acolchoada",
    quantity: 1,
    unit: "Unidade",
    condition: "Usado em boas condições",
    description:
      "Caminha higienizada, confortável e sem rasgos, indicada para cães médios.",
    mainImage: "/images/login-cover-v2.png",
    images: [],
    deliveryMethod: "A combinar",
    status: "Disponível",
  },
  {
    id: "item-coleira",
    title: "Coleira e guia",
    category: "Coleiras e guias",
    itemName: "Kit de passeio ajustável",
    quantity: 1,
    unit: "Unidade",
    condition: "Novo",
    description:
      "Kit novo com coleira regulável e guia resistente para cães pequenos.",
    mainImage: "/images/login-cover-v2.png",
    images: [],
    deliveryMethod: "Retirada",
    status: "Disponível",
  },
  {
    id: "item-shampoo",
    title: "Shampoo veterinário",
    category: "Produtos de higiene",
    itemName: "Shampoo neutro para pets",
    quantity: 2,
    unit: "Unidade",
    condition: "Lacrado",
    description:
      "Frascos lacrados de shampoo neutro, próprios para cães e gatos.",
    mainImage: "/images/login-cover-v2.png",
    images: [],
    deliveryMethod: "Entrega",
    status: "Disponível",
  },
  {
    id: "item-brinquedos",
    title: "Kit de brinquedos",
    category: "Brinquedos",
    itemName: "Bolinhas e mordedores",
    quantity: 6,
    unit: "Unidade",
    condition: "Usado em boas condições",
    description:
      "Brinquedos higienizados e conservados para enriquecer a rotina dos animais.",
    mainImage: "/images/login-cover-v2.png",
    images: [],
    deliveryMethod: "A combinar",
    status: "Disponível",
  },
  {
    id: "item-caixa-transporte",
    title: "Caixa de transporte",
    category: "Caixas de transporte",
    itemName: "Caixa para animais pequenos",
    quantity: 1,
    unit: "Unidade",
    condition: "Usado em boas condições",
    description:
      "Caixa firme, higienizada e com trava funcionando corretamente.",
    mainImage: "/images/login-cover-v2.png",
    images: [],
    deliveryMethod: "Retirada",
    status: "Disponível",
  },
  {
    id: "item-petiscos",
    title: "Petiscos para cães",
    category: "Petiscos",
    itemName: "Biscoitos naturais",
    quantity: 3,
    unit: "Pacote",
    condition: "Lacrado",
    description:
      "Pacotes lacrados de biscoitos naturais indicados para cães adultos.",
    mainImage: "/images/login-cover-v2.png",
    images: [],
    deliveryMethod: "Entrega",
    status: "Disponível",
  },
] satisfies Array<Omit<typeof donationItem.$inferInsert, "userId">>;

export async function seedForUser(firstUser: { id: string; name: string }) {
  const animalMedia = ["bento", "amora", "simba", "nina", "melissa", "frajola", "tobias", "olivia"];
  const itemMedia = ["racao", "racao", "caminha", "coleira", "shampoo", "brinquedos", "caixa", "petiscos"];
  const detailFields = [
    "weight", "neutered", "vaccination", "dewormed", "hasHealthCondition",
    "healthCondition", "energyLevel", "livesWithDogs", "livesWithCats",
    "livesWithChildren", "personality", "behaviorNotes", "adoptionReason",
    "timeInCare", "currentlyInCare", "description",
  ] as const;

  const [existingAnimals, existingItems] = await Promise.all([
    db.select().from(animal).where(inArray(animal.id, mockAnimals.map(({ id }) => id))),
    db.select({ id: donationItem.id }).from(donationItem).where(inArray(donationItem.id, mockDonationItems.map(({ id }) => id))),
  ]);
  const animalIds = new Set(existingAnimals.map(({ id }) => id));
  const itemIds = new Set(existingItems.map(({ id }) => id));
  const missingAnimals = mockAnimals.filter(({ id }) => !animalIds.has(id));
  const missingItems = mockDonationItems.filter(({ id }) => !itemIds.has(id));
  const existingAnimalById = new Map(existingAnimals.map((record) => [record.id, record]));
  const animalUpdates = mockAnimals.flatMap((sample) => {
    const record = existingAnimalById.get(sample.id);
    if (!record) return [];
    const changes: Partial<typeof animal.$inferInsert> = {};
    for (const field of detailFields) {
      if (record[field] === null || record[field] === "") {
        Object.assign(changes, { [field]: sample[field] });
      }
    }
    return Object.keys(changes).length ? [{ id: sample.id, changes }] : [];
  });
  if (missingAnimals.length === 0 && missingItems.length === 0 && animalUpdates.length === 0) {
    return { animalsCreated: 0, animalsUpdated: 0, itemsCreated: 0 };
  }

  if (missingAnimals.length > 0 || missingItems.length > 0) await uploadSeedImages();
  let animalsCreated = 0;
  let itemsCreated = 0;

  await db.transaction(async (tx) => {
    for (const { id, changes } of animalUpdates) {
      await tx.update(animal).set({ ...changes, updatedAt: new Date() }).where(eq(animal.id, id));
    }
    for (const mockAnimal of missingAnimals) {
      const [image, ...images] = seedPhotos(`animals/${animalMedia[mockAnimals.indexOf(mockAnimal)]}`);
      const values = { ...mockAnimal, image, images, userId: firstUser.id };
      const inserted = await tx.insert(animal).values(values).onConflictDoNothing().returning({ id: animal.id });
      animalsCreated += inserted.length;
    }

    for (const mockItem of missingItems) {
      const [mainImage, ...images] = seedPhotos(`items/${itemMedia[mockDonationItems.indexOf(mockItem)]}`);
      const values = { ...mockItem, mainImage, images, userId: firstUser.id };
      const inserted = await tx.insert(donationItem).values(values).onConflictDoNothing().returning({ id: donationItem.id });
      itemsCreated += inserted.length;
    }
  });

  console.log(
    `${animalsCreated} animais criados, ${animalUpdates.length} completados e ${itemsCreated} itens associados ao usuário ${firstUser.name}.`,
  );
  return { animalsCreated, animalsUpdated: animalUpdates.length, itemsCreated };
}
