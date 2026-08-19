import { and, desc, eq } from "drizzle-orm";
import { Hono } from "hono";
import crypto from "node:crypto";
import { z } from "zod";
import { db } from "../../lib/db/index.ts";
import { animal, user as userTable } from "../../lib/db/schemas/index.ts";
import type { AuthContext } from "./index.ts";

export const animalRoutes = new Hono<AuthContext>();

const animalPayloadSchema = z.object({
  name: z.string().trim().min(1).optional(),
  nome: z.string().trim().min(1).optional(),
  species: z.string().trim().min(1).optional(),
  especie: z.string().trim().min(1).optional(),
  sex: z.string().trim().min(1).optional(),
  sexo: z.string().trim().min(1).optional(),
  age: z.string().trim().min(1).optional(),
  idade: z.string().trim().min(1).optional(),
  size: z.string().trim().min(1).optional(),
  porte: z.string().trim().min(1).optional(),
  breed: z.string().nullable().optional(),
  raca: z.string().nullable().optional(),
  weight: z.string().nullable().optional(),
  neutered: z.string().nullable().optional(),
  castrado: z.string().nullable().optional(),
  vaccination: z.string().nullable().optional(),
  vacinas: z.string().nullable().optional(),
  dewormed: z.string().nullable().optional(),
  vermifugado: z.string().nullable().optional(),
  hasHealthCondition: z.boolean().nullable().optional(),
  condicao: z.string().optional(),
  healthCondition: z.string().nullable().optional(),
  descricaoSaude: z.string().nullable().optional(),
  energyLevel: z.string().nullable().optional(),
  energia: z.string().nullable().optional(),
  livesWithDogs: z.string().nullable().optional(),
  caes: z.string().nullable().optional(),
  livesWithCats: z.string().nullable().optional(),
  gatos: z.string().nullable().optional(),
  livesWithChildren: z.string().nullable().optional(),
  criancas: z.string().nullable().optional(),
  personality: z.string().nullable().optional(),
  personalidade: z.string().nullable().optional(),
  behaviorNotes: z.string().nullable().optional(),
  comportamento: z.string().nullable().optional(),
  adoptionReason: z.string().nullable().optional(),
  motivo: z.string().nullable().optional(),
  timeInCare: z.string().nullable().optional(),
  tempoCuidados: z.string().nullable().optional(),
  currentlyInCare: z.boolean().nullable().optional(),
  sobCuidados: z.string().optional(),
  description: z.string().nullable().optional(),
  descricao: z.string().nullable().optional(),
  image: z.string().nullable().optional(),
  fotoPrincipal: z.string().nullable().optional(),
  images: z.array(z.string()).optional(),
  fotos: z.array(z.string()).optional(),
  traits: z.array(z.string()).optional(),
  status: z.string().trim().min(1).optional(),
});

type AnimalPayload = z.infer<typeof animalPayloadSchema>;

function animalValues(body: AnimalPayload) {
  return {
    name: body.name ?? body.nome,
    species: body.species ?? body.especie,
    sex: body.sex ?? body.sexo,
    age: body.age ?? body.idade,
    size: body.size ?? body.porte,
    breed: body.breed ?? body.raca,
    weight: body.weight,
    neutered: body.neutered ?? body.castrado,
    vaccination: body.vaccination ?? body.vacinas,
    dewormed: body.dewormed ?? body.vermifugado,
    hasHealthCondition: body.hasHealthCondition ?? (body.condicao ? body.condicao === "Sim" : undefined),
    healthCondition: body.healthCondition ?? body.descricaoSaude,
    energyLevel: body.energyLevel ?? body.energia,
    livesWithDogs: body.livesWithDogs ?? body.caes,
    livesWithCats: body.livesWithCats ?? body.gatos,
    livesWithChildren: body.livesWithChildren ?? body.criancas,
    personality: body.personality ?? body.personalidade,
    behaviorNotes: body.behaviorNotes ?? body.comportamento,
    adoptionReason: body.adoptionReason ?? body.motivo,
    timeInCare: body.timeInCare ?? body.tempoCuidados,
    currentlyInCare: body.currentlyInCare ?? (body.sobCuidados ? body.sobCuidados === "Sim" : undefined),
    description: body.description ?? body.descricao,
    image: body.image ?? body.fotoPrincipal,
    images: body.images ?? body.fotos,
    traits: body.traits,
    status: body.status,
  };
}

animalRoutes.get("/", async (c) => {
  const { species, sex, size, status } = c.req.query();
  const conditions = [];

  if (species) conditions.push(eq(animal.species, species));
  if (sex) conditions.push(eq(animal.sex, sex));
  if (size) conditions.push(eq(animal.size, size));
  if (status) conditions.push(eq(animal.status, status));

  const list = await db
    .select()
    .from(animal)
    .where(conditions.length ? and(...conditions) : undefined)
    .orderBy(desc(animal.createdAt));

  return c.json(list);
});

animalRoutes.get("/:id", async (c) => {
  const id = c.req.param("id");
  const [result] = await db
    .select({
      animal,
      owner: {
        id: userTable.id,
        name: userTable.name,
        image: userTable.image,
        city: userTable.city,
        state: userTable.state,
        verified: userTable.emailVerified,
      },
    })
    .from(animal)
    .innerJoin(userTable, eq(animal.userId, userTable.id))
    .where(eq(animal.id, id));

  if (!result) {
    return c.json({ error: "Animal não encontrado" }, 404);
  }

  return c.json({ ...result.animal, owner: result.owner });
});

animalRoutes.post("/", async (c) => {
  const user = c.get("user");
  if (!user) {
    return c.json({ error: "Não autorizado" }, 401);
  }

  const parsed = animalPayloadSchema.safeParse(await c.req.json().catch(() => null));
  if (!parsed.success) {
    return c.json({ error: "Dados do animal inválidos", details: parsed.error.flatten() }, 400);
  }

  const values = animalValues(parsed.data);
  if (!values.name || !values.species || !values.sex || !values.age || !values.size) {
    return c.json({ error: "Nome, espécie, sexo, idade e porte são obrigatórios" }, 400);
  }

  const newAnimal = {
    id: crypto.randomUUID(),
    userId: user.id,
    ...values,
    name: values.name,
    species: values.species,
    sex: values.sex,
    age: values.age,
    size: values.size,
    images: values.images ?? [],
    traits: values.traits ?? [],
    status: values.status ?? "Disponível",
  };

  const [created] = await db.insert(animal).values(newAnimal).returning();
  return c.json(created, 201);
});

animalRoutes.put("/:id", async (c) => {
  const user = c.get("user");
  if (!user) {
    return c.json({ error: "Não autorizado" }, 401);
  }

  const id = c.req.param("id");
  const [existing] = await db.select().from(animal).where(eq(animal.id, id));

  if (!existing) {
    return c.json({ error: "Animal não encontrado" }, 404);
  }

  if (existing.userId !== user.id) {
    return c.json({ error: "Sem permissão" }, 403);
  }

  const parsed = animalPayloadSchema.safeParse(await c.req.json().catch(() => null));
  if (!parsed.success) {
    return c.json({ error: "Dados do animal inválidos", details: parsed.error.flatten() }, 400);
  }

  const values = animalValues(parsed.data);
  if (!Object.values(values).some((value) => value !== undefined)) {
    return c.json({ error: "Nenhum campo válido para atualizar" }, 400);
  }

  const [updated] = await db
    .update(animal)
    .set({
      ...values,
      updatedAt: new Date(),
    })
    .where(eq(animal.id, id))
    .returning();

  return c.json(updated);
});

animalRoutes.delete("/:id", async (c) => {
  const user = c.get("user");
  if (!user) {
    return c.json({ error: "Não autorizado" }, 401);
  }

  const id = c.req.param("id");
  const [existing] = await db.select().from(animal).where(eq(animal.id, id));

  if (!existing) {
    return c.json({ error: "Animal não encontrado" }, 404);
  }

  if (existing.userId !== user.id) {
    return c.json({ error: "Sem permissão" }, 403);
  }

  await db.delete(animal).where(eq(animal.id, id));
  return c.json({ success: true, message: "Animal excluído com sucesso" });
});
