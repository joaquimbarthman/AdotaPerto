export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

export const tabs = [
  { id: "publicacoes", label: "Minhas publicações" },
  { id: "solicitacoes", label: "Solicitações" },
  { id: "favoritos", label: "Favoritos" },
  { id: "dados", label: "Dados pessoais" },
  { id: "endereco", label: "Endereço" },
  { id: "acesso", label: "Acesso à conta" },
] as const;
