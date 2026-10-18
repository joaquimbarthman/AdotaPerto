export type Org = {
  id: string;
  name: string;
  slug: string;
  logo: string | null;
  cnpj: string | null;
  phone: string | null;
  website: string | null;
  instagram: string | null;
  description: string | null;
};
export type OrgOption = { organization: Org; role: string };
export type Member = {
  id: string;
  userId: string;
  name: string;
  email: string;
  role: string;
  createdAt: string;
};
export type External = {
  id: string;
  organizationId: string;
  name: string;
  kind: "prestador" | "parceiro" | "outro";
  email: string | null;
  phone: string | null;
  notes: string | null;
  createdAt: string;
};
export type ExternalValues = Pick<External, "name" | "kind" | "email" | "phone" | "notes">;
export type Publication = {
  id: string;
  name?: string;
  title?: string;
  image?: string | null;
  mainImage?: string;
  status: string;
  userId: string;
  createdAt: string;
};
export type Request = {
  id: string;
  status: string;
  quantity?: number;
  createdAt: string;
  animalName?: string;
  itemTitle?: string;
  requesterName: string;
  ownerId: string;
};
export type Invitation = {
  id: string;
  email: string;
  role: string | null;
  expiresAt: string;
};
export type Dashboard = {
  organization: Org;
  role: string;
  members: Member[];
  externals: External[];
  animals: Publication[];
  items: Publication[];
  adoptionRequests: Request[];
  itemRequests: Request[];
  invitations: Invitation[];
};
export type Tab =
  | "visao-geral"
  | "publicacoes"
  | "solicitacoes"
  | "equipe"
  | "dados";
export const organizationTabs: { id: Tab; label: string }[] = [
  { id: "visao-geral", label: "Visão geral" },
  { id: "publicacoes", label: "Publicações" },
  { id: "solicitacoes", label: "Solicitações" },
  { id: "equipe", label: "Equipe" },
  { id: "dados", label: "Dados da ONG" },
];
