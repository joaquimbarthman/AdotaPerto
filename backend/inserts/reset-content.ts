import "dotenv/config";
import { asc } from "drizzle-orm";
import { db } from "../lib/db/index.ts";
import { animal, donationItem, user } from "../lib/db/schemas/index.ts";

const photos = (mediaKey: string) => [
  `/seed/${mediaKey}/1.jpg`,
  `/seed/${mediaKey}/2.jpg`,
  `/seed/${mediaKey}/3.jpg`,
];


const animals = [
  { id: "pet-bento", name: "Bento", species: "Cachorro", sex: "Macho", age: "2 anos", size: "M", breed: "SRD", weight: "16 kg", mediaKey: "animals/bento", traits: ["Sociável", "Brincalhão"], personality: "Alegre, sociável e apegado às pessoas.", behaviorNotes: "Caminha bem com guia e responde a comandos básicos.", adoptionReason: "Foi resgatado próximo a uma rodovia.", timeInCare: "4 meses", description: "Bento é jovem, carinhoso e procura uma família ativa para dividir passeios e brincadeiras." },
  { id: "pet-amora", name: "Amora", species: "Gato", sex: "Fêmea", age: "1 ano", size: "P", breed: "SRD", weight: "3,8 kg", mediaKey: "animals/amora", traits: ["Castrada", "Dócil"], personality: "Tranquila, curiosa e carinhosa.", behaviorNotes: "Usa caixa de areia e precisa de um lar telado.", adoptionReason: "A antiga responsável mudou para um local que não aceita animais.", timeInCare: "3 meses", description: "Amora adora carinho e observar a casa pela janela. Será entregue somente para um lar seguro." },
  { id: "pet-simba", name: "Simba", species: "Cachorro", sex: "Macho", age: "5 anos", size: "G", breed: "Labrador mestiço", weight: "29 kg", mediaKey: "animals/simba", traits: ["Calmo", "Companheiro"], personality: "Obediente, equilibrado e companheiro.", behaviorNotes: "Prefere passeios tranquilos e não deve conviver com gatos.", adoptionReason: "A família atual não consegue mais oferecer o espaço necessário.", timeInCare: "5 anos", description: "Simba é um cão adulto muito companheiro que procura uma rotina estável e responsável." },
  { id: "pet-nina", name: "Nina", species: "Cachorro", sex: "Fêmea", age: "8 meses", size: "P", breed: "Pinscher mestiça", weight: "5 kg", mediaKey: "animals/nina", traits: ["Esperta", "Ativa"], personality: "Esperta, divertida e cheia de energia.", behaviorNotes: "Está aprendendo a passear com guia e convive bem com cães.", adoptionReason: "Foi encontrada sozinha em uma praça.", timeInCare: "2 meses", description: "Nina é pequena no tamanho e enorme na vontade de brincar e receber carinho." },
  { id: "pet-frajola", name: "Frajola", species: "Gato", sex: "Macho", age: "3 anos", size: "P", breed: "SRD", weight: "4,5 kg", mediaKey: "animals/frajola", traits: ["Castrado", "Sociável"], personality: "Calmo, observador e muito afetuoso.", behaviorNotes: "Usa caixa de areia e convive com outros gatos.", adoptionReason: "Foi resgatado após o falecimento do antigo tutor.", timeInCare: "6 meses", description: "Frajola gosta de ambientes tranquilos, colo e cochilos perto das pessoas." },
  { id: "pet-melissa", name: "Melissa", species: "Cachorro", sex: "Fêmea", age: "4 anos", size: "M", breed: "Beagle mestiça", weight: "14 kg", mediaKey: "animals/melissa", traits: ["Carinhosa", "Curiosa"], personality: "Carinhosa, curiosa e motivada por petiscos.", behaviorNotes: "Convive bem com crianças e precisa de quintal seguro.", adoptionReason: "Foi retirada de uma situação de abandono.", timeInCare: "8 meses", description: "Melissa é uma companheira alegre que ama farejar, passear e ficar perto da família." },
  { id: "pet-tobias", name: "Tobias", species: "Cachorro", sex: "Macho", age: "7 anos", size: "G", breed: "Pastor alemão mestiço", weight: "31 kg", mediaKey: "animals/tobias", traits: ["Obediente", "Protetor"], personality: "Leal, atento e tranquilo.", behaviorNotes: "Conhece comandos e prefere ser o único cão da casa.", adoptionReason: "O tutor ficou impossibilitado de continuar os cuidados.", timeInCare: "7 anos", description: "Tobias busca um lar experiente que valorize sua calma, lealdade e rotina organizada." },
  { id: "pet-cacau", name: "Cacau", species: "Gato", sex: "Fêmea", age: "6 meses", size: "P", breed: "SRD", weight: "2,4 kg", mediaKey: "animals/cacau", traits: ["Brincalhona", "Curiosa"], personality: "Curiosa, brincalhona e delicada.", behaviorNotes: "Usa caixa de areia e está acostumada com outros gatos.", adoptionReason: "Nasceu em uma colônia acompanhada por voluntários.", timeInCare: "6 meses", description: "Cacau é uma filhote saudável que transforma qualquer objeto em brincadeira." },
  { id: "pet-zeus", name: "Zeus", species: "Cachorro", sex: "Macho", age: "1 ano", size: "M", breed: "Border collie mestiço", weight: "18 kg", mediaKey: "animals/zeus", traits: ["Inteligente", "Ativo"], personality: "Inteligente, atento e muito disposto.", behaviorNotes: "Precisa de atividade física, enriquecimento e espaço seguro.", adoptionReason: "Foi entregue por uma família sem disponibilidade para sua energia.", timeInCare: "1 mês", description: "Zeus aprende rápido e será um ótimo parceiro para uma família ativa e presente." },
  { id: "pet-olivia", name: "Olívia", species: "Gato", sex: "Fêmea", age: "5 anos", size: "P", breed: "Siamês mestiço", weight: "4 kg", mediaKey: "animals/olivia", traits: ["Castrada", "Tranquila"], personality: "Serena, independente e carinhosa.", behaviorNotes: "Prefere casas silenciosas e aproximação respeitosa.", adoptionReason: "Foi resgatada durante uma mudança emergencial.", timeInCare: "5 meses", description: "Olívia gosta de rotina, janelas teladas e carinho no seu próprio tempo." },
  { id: "pet-paçoca", name: "Paçoca", species: "Cachorro", sex: "Macho", age: "3 anos", size: "P", breed: "Shih-tzu mestiço", weight: "7 kg", mediaKey: "animals/pacoca", traits: ["Dócil", "Companheiro"], personality: "Dócil, companheiro e tranquilo.", behaviorNotes: "Convive com cães e crianças; precisa de escovação frequente.", adoptionReason: "O responsável passou a trabalhar fora por longos períodos.", timeInCare: "3 anos", description: "Paçoca ama companhia e procura uma família que goste de uma rotina tranquila." },
  { id: "pet-jade", name: "Jade", species: "Gato", sex: "Fêmea", age: "2 anos", size: "P", breed: "SRD", weight: "3,6 kg", mediaKey: "animals/jade", traits: ["Castrada", "Afetuosa"], personality: "Afetuosa, comunicativa e curiosa.", behaviorNotes: "Usa caixa de areia e aceita outros gatos após adaptação.", adoptionReason: "Foi encontrada com filhotes, que já foram adotados.", timeInCare: "7 meses", description: "Jade é uma gata carinhosa que gosta de conversar e acompanhar as pessoas pela casa." },
];

const items = [
  { id: "item-racao", title: "Ração para cães adultos", category: "Ração", itemName: "Ração seca premium", quantity: 10, unit: "Kg", condition: "Lacrado", mediaKey: "items/racao", deliveryMethod: "Retirada", description: "Pacote lacrado, armazenado em local seco e indicado para cães adultos de porte médio e grande." },
  { id: "item-caminha", title: "Caminha acolchoada", category: "Caminhas e cobertores", itemName: "Caminha lavável tamanho M", quantity: 1, unit: "Unidade", condition: "Usado em boas condições", mediaKey: "items/caminha", deliveryMethod: "A combinar", description: "Caminha higienizada, sem rasgos e com enchimento preservado, medindo aproximadamente 70 por 55 cm." },
  { id: "item-brinquedos", title: "Kit de brinquedos", category: "Brinquedos", itemName: "Bolinhas, corda e mordedores", quantity: 6, unit: "Unidade", condition: "Usado em boas condições", mediaKey: "items/brinquedos", deliveryMethod: "Entrega", description: "Brinquedos higienizados e íntegros para cães de porte pequeno e médio." },
  { id: "item-coleira", title: "Coleira e guia ajustáveis", category: "Coleiras e guias", itemName: "Kit de passeio tamanho M", quantity: 1, unit: "Unidade", condition: "Novo", mediaKey: "items/coleira", deliveryMethod: "Retirada", description: "Coleira regulável e guia resistente nunca utilizadas, indicadas para cães de porte médio." },
  { id: "item-caixa", title: "Caixa de transporte", category: "Caixas de transporte", itemName: "Caixa para animais pequenos", quantity: 1, unit: "Unidade", condition: "Usado em boas condições", mediaKey: "items/caixa", deliveryMethod: "A combinar", description: "Caixa rígida higienizada, ventilada e com porta e travas funcionando corretamente." },
  { id: "item-shampoo", title: "Shampoo neutro para pets", category: "Produtos de higiene", itemName: "Shampoo para cães e gatos", quantity: 3, unit: "Unidade", condition: "Lacrado", mediaKey: "items/shampoo", deliveryMethod: "Entrega", description: "Três frascos lacrados de shampoo neutro para higiene regular de cães e gatos." },
  { id: "item-potes", title: "Conjunto de potes", category: "Utensílios", itemName: "Potes de inox para água e ração", quantity: 2, unit: "Unidade", condition: "Usado em boas condições", mediaKey: "items/potes", deliveryMethod: "Retirada", description: "Dois potes de aço inox higienizados, sem ferrugem ou amassados." },
  { id: "item-manta", title: "Mantas quentes", category: "Caminhas e cobertores", itemName: "Mantas de microfibra", quantity: 4, unit: "Unidade", condition: "Usado em boas condições", mediaKey: "items/manta", deliveryMethod: "Entrega", description: "Quatro mantas lavadas e conservadas para aquecer animais em lares temporários ou abrigos." },
  { id: "item-areia", title: "Areia higiênica para gatos", category: "Produtos de higiene", itemName: "Areia biodegradável", quantity: 8, unit: "Kg", condition: "Lacrado", mediaKey: "items/areia", deliveryMethod: "Retirada", description: "Dois pacotes lacrados de areia biodegradável, com quatro quilos cada." },
  { id: "item-petiscos", title: "Petiscos naturais", category: "Petiscos", itemName: "Biscoitos para cães adultos", quantity: 3, unit: "Pacote", condition: "Lacrado", mediaKey: "items/petiscos", deliveryMethod: "Entrega", description: "Três pacotes lacrados de biscoitos naturais dentro da validade." },
  { id: "item-roupinhas", title: "Roupinhas de inverno", category: "Outros", itemName: "Casacos tamanhos P e M", quantity: 5, unit: "Unidade", condition: "Usado em boas condições", mediaKey: "items/roupinhas", deliveryMethod: "A combinar", description: "Cinco casacos lavados, sem rasgos e adequados para cães pequenos e médios." },
  { id: "item-tapetes", title: "Tapetes higiênicos", category: "Produtos de higiene", itemName: "Pacote com tapetes absorventes", quantity: 30, unit: "Unidade", condition: "Lacrado", mediaKey: "items/tapetes", deliveryMethod: "Retirada", description: "Pacote lacrado com trinta tapetes absorventes para cães filhotes, idosos ou em recuperação." },
];

async function resetContent() {
  const [owner] = await db.select({ id: user.id, name: user.name }).from(user).orderBy(asc(user.createdAt), asc(user.id)).limit(1);
  if (!owner) throw new Error("Crie pelo menos um usuário antes de executar os inserts.");

  await db.transaction(async (tx) => {
    await tx.delete(animal);
    await tx.delete(donationItem);
    await tx.insert(animal).values(animals.map((entry, index) => {
      const [image, ...images] = photos(entry.mediaKey);
      return { ...entry, mediaKey: undefined, image, images, userId: owner.id, neutered: "Sim", vaccination: "Vacinas em dia", dewormed: "Sim", hasHealthCondition: false, healthCondition: "Nenhuma condição de saúde conhecida.", energyLevel: index % 3 === 0 ? "Alto" : "Moderado", livesWithDogs: "Sim", livesWithCats: entry.species === "Gato" ? "Sim" : "Não sei", livesWithChildren: "Sim", currentlyInCare: true, status: "Disponível" };
    }));
    await tx.insert(donationItem).values(items.map((entry, index) => {
      const [mainImage, ...images] = photos(entry.mediaKey);
      return { ...entry, mediaKey: undefined, mainImage, images, userId: owner.id, status: "Disponível", expirationDate: ["Ração", "Petiscos", "Produtos de higiene"].includes(entry.category) ? "2027-12-31" : null, availableUntil: "2027-12-31" };
    }));
  });
  console.log(`Conteúdo reiniciado: ${animals.length} animais, ${items.length} itens e ${(animals.length + items.length) * 3} imagens.`);
  await db.$client.end();
}

resetContent().catch(async (error) => { console.error(error); await db.$client.end(); process.exitCode = 1; });