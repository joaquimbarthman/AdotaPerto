import { apiBaseUrl } from "@/lib/api-url";
export const API_BASE_URL = apiBaseUrl();

export const tabs = [
  { id: "publicacoes", label: "Minhas publicações" },
  { id: "solicitacoes", label: "Solicitações" },
  { id: "favoritos", label: "Favoritos" },
  { id: "dados", label: "Dados pessoais" },
  { id: "endereco", label: "Endereço" },
  { id: "acesso", label: "Acesso à conta" },
] as const;
