import { asc, eq } from "drizzle-orm";
import { db } from "./index.ts";
import { animal, donationItem, user } from "./schemas/index.ts";
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

async function seed() {
  const [firstUser] = await db
    .select({ id: user.id, name: user.name })
    .from(user)
    .orderBy(asc(user.createdAt), asc(user.id))
    .limit(1);

  if (!firstUser) {
    throw new Error(
      "Nenhum usuário encontrado. Crie um usuário antes de executar o seeder.",
    );
  }

  await uploadSeedImages();
  const animalMedia = ["bento", "amora", "simba", "nina", "melissa", "frajola", "tobias", "olivia"];
  const itemMedia = ["racao", "racao", "caminha", "coleira", "shampoo", "brinquedos", "caixa", "petiscos"];

  await db.transaction(async (tx) => {
    for (const mockAnimal of mockAnimals) {
      const [image, ...images] = seedPhotos(`animals/${animalMedia[mockAnimals.indexOf(mockAnimal)]}`);
      const values = { ...mockAnimal, image, images, userId: firstUser.id };
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

    for (const mockItem of mockDonationItems) {
      const [mainImage, ...images] = seedPhotos(`items/${itemMedia[mockDonationItems.indexOf(mockItem)]}`);
      const values = { ...mockItem, mainImage, images, userId: firstUser.id };
      const [existing] = await tx
        .select({ id: donationItem.id })
        .from(donationItem)
        .where(eq(donationItem.id, mockItem.id));

      if (existing) {
        await tx
          .update(donationItem)
          .set({ ...values, updatedAt: new Date() })
          .where(eq(donationItem.id, mockItem.id));
      } else {
        await tx.insert(donationItem).values(values);
      }
    }
  });

  console.log(
    `${mockAnimals.length} animais e ${mockDonationItems.length} itens associados ao usuário ${firstUser.name}.`,
  );
}

seed()
  .catch((error) => {
    console.error("Falha ao executar o seeder:", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await db.$client.end();
  });
