import { eq } from "drizzle-orm";
import { db } from "../lib/db/index.ts";
import { organization, organizationMember, user } from "../lib/db/schemas/index.ts";

const slug = "instituto-patas-do-bem-teste";
const [existing] = await db.select({ id: organization.id }).from(organization).where(eq(organization.slug, slug)).limit(1);

if (existing) {
  console.log(`Organização de teste já existe: ${existing.id}`);
  process.exit(0);
}

const [creator] = await db.select({ id: user.id, name: user.name, email: user.email }).from(user).limit(1);
if (!creator) throw new Error("Cadastre pelo menos um usuário antes de criar a organização de teste.");

const organizationId = crypto.randomUUID();
await db.transaction(async (tx) => {
  await tx.insert(organization).values({
    id: organizationId,
    name: "Instituto Patas do Bem (Teste)",
    slug,
    type: "NGO",
    cnpj: "12.345.678/0001-90",
    description: "Organização de teste criada para visualizar o fluxo de moderação.",
    legalRepresentativeName: creator.name,
    contactEmail: creator.email,
    whatsapp: "(11) 99999-0000",
    postalCode: "01001-000",
    street: "Praça da Sé",
    number: "100",
    neighborhood: "Sé",
    city: "São Paulo",
    state: "SP",
    verificationStatus: "PENDING",
    createdBy: creator.id,
  });
  await tx.insert(organizationMember).values({
    id: crypto.randomUUID(),
    organizationId,
    userId: creator.id,
    role: "OWNER",
    status: "ACTIVE",
  });
});

console.log(`Organização de teste criada: ${organizationId}`);
process.exit(0);
