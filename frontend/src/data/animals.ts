export type Animal = {
  id: string;
  name: string;
  image: string;
  species: "Cachorro" | "Gato";
  breed: string;
  size: "P" | "M" | "G";
  sex: "Fêmea" | "Macho";
  age: string;
  weight?: string;
  traits: string[];
  status: "Disponível" | "Em Processo";
  organization: string;
  distance: string;
  neutered?: "Sim" | "Não" | "Não sei";
  vaccination?: string;
  dewormed?: "Sim" | "Não" | "Não sei";
  healthCondition?: string;
  energyLevel?: "Baixo" | "Moderado" | "Alto";
  livesWithDogs?: "Sim" | "Não" | "Não sei";
  livesWithCats?: "Sim" | "Não" | "Não sei";
  livesWithChildren?: "Sim" | "Não" | "Não sei";
  personality?: string;
  behaviorNotes?: string;
  adoptionReason?: string;
  timeInCare?: string;
  currentlyInCare?: boolean;
  description?: string;
};

export const homeAnimals: Animal[] = [
  { id: "bidu", name: "Bidu", image: "/images/bidu.png", species: "Cachorro", breed: "SRD", size: "M", sex: "Macho", age: "2 anos", weight: "15kg", traits: ["Brincalhão", "Vacinado"], status: "Disponível", organization: "Abrigo local", distance: "2,1 km" },
  { id: "mia", name: "Mia", image: "/images/mia.png", species: "Gato", breed: "Sem raça definida", size: "P", sex: "Fêmea", age: "1 ano", weight: "3kg", traits: ["Carinhosa", "Castrada"], status: "Disponível", organization: "Lar temporário", distance: "3 km" },
  { id: "thor-home", name: "Thor", image: "/images/thor.png", species: "Cachorro", breed: "Labrador", size: "G", sex: "Macho", age: "6 anos", weight: "28kg", traits: ["Companheiro", "Energia moderada"], status: "Disponível", organization: "Centro de Zoonoses", distance: "8,2 km" },
  { id: "lola", name: "Lola", image: "/images/lola.png", species: "Cachorro", breed: "Poodle", size: "P", sex: "Fêmea", age: "3 meses", weight: "2kg", traits: ["Dócil", "Brincalhona"], status: "Disponível", organization: "Abrigo Esperança", distance: "1,2 km" },
];

export const adoptionAnimals: Animal[] = [
  { id: "luna", name: "Luna", image: "/images/luna.png", species: "Cachorro", breed: "SRD", size: "M", sex: "Fêmea", age: "2 anos", traits: ["Vacinada", "Castrada"], status: "Disponível", organization: "Abrigo São Francisco", distance: "3,4 km", neutered: "Sim", vaccination: "Vacinas em dia", dewormed: "Sim", healthCondition: "Não possui condição de saúde conhecida.", energyLevel: "Alto", livesWithDogs: "Sim", livesWithCats: "Não sei", livesWithChildren: "Sim", personality: "Dócil, carinhosa e brincalhona.", behaviorNotes: "Adora brincar com bolinhas e correr no quintal. Adapta-se melhor com uma rotina ativa.", adoptionReason: "Foi resgatada das ruas e está pronta para viver com uma família definitiva.", timeInCare: "6 meses", currentlyInCare: true, description: "Luna é uma cachorrinha muito dócil e cheia de energia. Gosta de companhia, brincadeiras e não dispensa um bom cafuné." },
  { id: "mingau", name: "Mingau", image: "/images/mingau.png", species: "Gato", breed: "SRD", size: "P", sex: "Macho", age: "8 meses", traits: ["Sociável"], status: "Em Processo", organization: "Lar Temporário", distance: "5,1 km" },
  { id: "thor", name: "Thor", image: "/images/thor-adocao.png", species: "Cachorro", breed: "Labrador", size: "G", sex: "Macho", age: "4 anos", traits: ["Ativo", "Guarda"], status: "Disponível", organization: "Centro de Zoonoses", distance: "8,2 km" },
  { id: "mel", name: "Mel", image: "/images/mel.png", species: "Cachorro", breed: "SRD", size: "M", sex: "Fêmea", age: "9 anos", traits: ["Calma", "Sênior"], status: "Disponível", organization: "Abrigo Esperança", distance: "1,2 km" },
];
