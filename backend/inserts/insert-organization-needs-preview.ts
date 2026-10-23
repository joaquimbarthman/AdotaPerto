import { eq } from "drizzle-orm";
import { db } from "../lib/db/index.ts";
import { organization, organizationNeed } from "../lib/db/schemas/index.ts";

const organizationId = "82107575-20f4-45fc-977f-c9c1362b5a98";
const [target] = await db.select({ id: organization.id, name: organization.name }).from(organization).where(eq(organization.id, organizationId)).limit(1);
if (!target) throw new Error(`A organização ${organizationId} não foi encontrada.`);

const examples = [
  {
    id: "preview-need-dog-food",
    title: "Ração para cães resgatados",
    itemName: "Ração seca para cães adultos",
    category: "Ração",
    quantity: 12,
    unit: "Pacote",
    condition: "Lacrado",
    priority: "Urgente",
    description: "Precisamos repor o estoque de ração dos cães adultos acolhidos pela organização. Aceitamos pacotes de qualquer marca, desde que estejam lacrados e dentro da validade.",
    mainImage: "/images/login-cover-v2.png",
    images: [],
    deliveryMethod: "Entrega na ONG",
    availableUntil: "2026-12-20",
  },
  {
    id: "preview-need-cleaning-supplies",
    title: "Materiais de limpeza para o abrigo",
    itemName: "Desinfetante e detergente",
    category: "Limpeza",
    quantity: 20,
    unit: "Litros",
    condition: "Novo",
    priority: "Alta",
    description: "Os materiais serão utilizados na higienização diária dos espaços dos animais. Produtos neutros ou adequados para ambientes com pets são preferíveis.",
    mainImage: "/images/login-cover.png",
    images: [],
    deliveryMethod: "A combinar",
    availableUntil: "2027-01-15",
  },
  {
    id: "preview-need-blankets",
    title: "Caminhas e cobertores",
    itemName: "Cobertores para cães e gatos",
    category: "Camas e cobertores",
    quantity: 15,
    unit: "Unidade",
    condition: "Usado em boas condições",
    priority: "Média",
    description: "Buscamos cobertores, mantas e caminhas limpas e conservadas para deixar os animais mais confortáveis durante a noite.",
    mainImage: "/images/login-cover-v2.png",
    images: [],
    deliveryMethod: "Retirada pela ONG",
    availableUntil: "2027-02-28",
  },
] as const;

let inserted = 0;
for (const need of examples) {
  const result = await db.insert(organizationNeed).values({ ...need, organizationId, status: "Ativa" }).onConflictDoNothing({ target: organizationNeed.id }).returning({ id: organizationNeed.id });
  inserted += result.length;
}

console.log(`${inserted} necessidade(s) inserida(s) para ${target.name}.`);
await db.$client.end();
