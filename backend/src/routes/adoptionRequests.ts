import { and, desc, eq, inArray } from "drizzle-orm";
import { Hono } from "hono";
import crypto from "node:crypto";
import { z } from "zod";
import { db } from "../../lib/db/index.ts";
import {
  adoptionRequest,
  animal,
  user as userTable,
} from "../../lib/db/schemas/index.ts";
import type { AuthContext } from "./index.ts";

export const adoptionRequestRoutes = new Hono<AuthContext>();

const createRequestSchema = z.object({
  animalId: z.string().trim().min(1),
  notes: z.string().trim().max(1000).nullable().optional(),
  answers: z
    .record(
      z.string(),
      z.union([z.string().max(2000), z.array(z.string().max(100)).max(10)]),
    )
    .optional(),
});

const updateStatusSchema = z.object({
  status: z.enum(["Em análise", "Aprovada", "Recusada", "Cancelada"]),
});

adoptionRequestRoutes.get("/", async (c) => {
  const currentUser = c.get("user");
  if (!currentUser) {
    return c.json({ error: "Não autorizado" }, 401);
  }

  const list = await db
    .select({
      id: adoptionRequest.id,
      status: adoptionRequest.status,
      notes: adoptionRequest.notes,
      answers: adoptionRequest.answers,
      compatibilityScore: adoptionRequest.compatibilityScore,
      compatibilityDetails: adoptionRequest.compatibilityDetails,
      createdAt: adoptionRequest.createdAt,
      updatedAt: adoptionRequest.updatedAt,
      animal: animal,
      ownerContact: {
        name: userTable.name,
        email: userTable.email,
        whatsapp: userTable.whatsapp,
        instagram: userTable.instagram,
      },
    })
    .from(adoptionRequest)
    .innerJoin(animal, eq(adoptionRequest.animalId, animal.id))
    .innerJoin(userTable, eq(animal.userId, userTable.id))
    .where(eq(adoptionRequest.userId, currentUser.id))
    .orderBy(desc(adoptionRequest.createdAt));

  return c.json(
    list.map((item) => ({
      ...item,
      ownerContact: item.status === "Aprovada" ? item.ownerContact : undefined,
    })),
  );
});

adoptionRequestRoutes.get("/received", async (c) => {
  const currentUser = c.get("user");
  if (!currentUser) {
    return c.json({ error: "Não autorizado" }, 401);
  }

  const list = await db
    .select({
      id: adoptionRequest.id,
      status: adoptionRequest.status,
      notes: adoptionRequest.notes,
      answers: adoptionRequest.answers,
      compatibilityScore: adoptionRequest.compatibilityScore,
      compatibilityDetails: adoptionRequest.compatibilityDetails,
      createdAt: adoptionRequest.createdAt,
      updatedAt: adoptionRequest.updatedAt,
      animal,
      requester: {
        id: userTable.id,
        name: userTable.name,
        image: userTable.image,
        city: userTable.city,
        state: userTable.state,
      },
    })
    .from(adoptionRequest)
    .innerJoin(animal, eq(adoptionRequest.animalId, animal.id))
    .innerJoin(userTable, eq(adoptionRequest.userId, userTable.id))
    .where(eq(animal.userId, currentUser.id))
    .orderBy(desc(adoptionRequest.createdAt));

  return c.json(list);
});

adoptionRequestRoutes.get("/:id", async (c) => {
  const currentUser = c.get("user");
  if (!currentUser) {
    return c.json({ error: "Não autorizado" }, 401);
  }

  const id = c.req.param("id");
  const [request] = await db
    .select({
      id: adoptionRequest.id,
      userId: adoptionRequest.userId,
      status: adoptionRequest.status,
      notes: adoptionRequest.notes,
      answers: adoptionRequest.answers,
      compatibilityScore: adoptionRequest.compatibilityScore,
      compatibilityDetails: adoptionRequest.compatibilityDetails,
      createdAt: adoptionRequest.createdAt,
      updatedAt: adoptionRequest.updatedAt,
      animal: animal,
      requester: {
        id: userTable.id,
        name: userTable.name,
        image: userTable.image,
        city: userTable.city,
        state: userTable.state,
      },
    })
    .from(adoptionRequest)
    .innerJoin(animal, eq(adoptionRequest.animalId, animal.id))
    .innerJoin(userTable, eq(adoptionRequest.userId, userTable.id))
    .where(eq(adoptionRequest.id, id));

  if (!request) {
    return c.json({ error: "Solicitação não encontrada" }, 404);
  }

  if (
    request.userId !== currentUser.id &&
    request.animal.userId !== currentUser.id
  ) {
    return c.json({ error: "Sem permissão" }, 403);
  }

  const { userId: _userId, ...safeRequest } = request;
  return c.json(safeRequest);
});

adoptionRequestRoutes.post("/", async (c) => {
  const currentUser = c.get("user");
  if (!currentUser) {
    return c.json({ error: "Não autorizado" }, 401);
  }

  const parsed = createRequestSchema.safeParse(
    await c.req.json().catch(() => null),
  );
  if (!parsed.success) {
    return c.json(
      {
        error: "Dados da solicitação inválidos",
        details: parsed.error.flatten(),
      },
      400,
    );
  }
  const body = parsed.data;

  const [existingAnimal] = await db
    .select()
    .from(animal)
    .where(eq(animal.id, body.animalId));
  if (!existingAnimal) {
    return c.json({ error: "Animal não encontrado" }, 404);
  }

  if (existingAnimal.userId === currentUser.id) {
    return c.json(
      { error: "Você não pode solicitar a adoção do próprio animal" },
      400,
    );
  }

  if (existingAnimal.status !== "Disponível") {
    return c.json(
      { error: "Este animal não está disponível para adoção." },
      409,
    );
  }

  const [existingRequest] = await db
    .select({ id: adoptionRequest.id })
    .from(adoptionRequest)
    .where(
      and(
        eq(adoptionRequest.userId, currentUser.id),
        eq(adoptionRequest.animalId, body.animalId),
      ),
    );

  if (existingRequest) {
    return c.json({ error: "Solicitação de adoção já existente" }, 409);
  }

  const newRequest = {
    id: crypto.randomUUID(),
    userId: currentUser.id,
    animalId: body.animalId,
    notes: body.notes || null,
    answers: body.answers,
    ...calculateCompatibility(existingAnimal, body.answers || {}),
    status: "PENDING",
  };

  const [created] = await db
    .insert(adoptionRequest)
    .values(newRequest)
    .returning();
  return c.json(created, 201);
});

function calculateCompatibility(
  pet: typeof animal.$inferSelect,
  answers: Record<string, string | string[]>,
) {
  let earned = 0;
  let possible = 0;
  const details: string[] = [];
  const add = (
    weight: number,
    matches: boolean,
    positive: string,
    warning: string,
  ) => {
    possible += weight;
    if (matches) earned += weight;
    details.push(matches ? positive : warning);
  };
  const types = Array.isArray(answers.otherAnimalTypes)
    ? answers.otherAnimalTypes
    : [];

  add(
    15,
    answers.householdAgreement === "Sim",
    "Todos na residência concordam com a adoção.",
    "Nem todos na residência concordam com a adoção.",
  );
  add(
    15,
    answers.financialCondition === "Sim" && answers.healthCommitment === "Sim",
    "Há compromisso com os custos e cuidados de saúde.",
    "É necessário confirmar condições financeiras e cuidados de saúde.",
  );

  if (pet.size === "G")
    add(
      15,
      answers.secureOutdoorSpace === "Sim" || answers.animalArea === "Ambos",
      "O ambiente oferece espaço adequado para o porte.",
      "O espaço informado pode exigir adaptação para um animal de grande porte.",
    );
  if (pet.energyLevel === "Alto") {
    add(
      15,
      ["De 2 a 4 horas", "Mais de 4 horas"].includes(String(answers.dailyTime)),
      "O tempo diário combina com o nível alto de energia.",
      "O animal tem energia alta e pode precisar de mais dedicação diária.",
    );
    add(
      10,
      answers.aloneTime !== "Mais de 8 horas",
      "O período sozinho é compatível com uma rotina ativa.",
      "Longos períodos sozinho podem não combinar com o nível de energia.",
    );
  }
  if (pet.livesWithDogs === "Não")
    add(
      10,
      !types.includes("Cães"),
      "Não há cães no novo lar.",
      "O animal não convive bem com cães, mas há cães na residência.",
    );
  if (pet.livesWithCats === "Não")
    add(
      10,
      !types.includes("Gatos"),
      "Não há gatos no novo lar.",
      "O animal não convive bem com gatos, mas há gatos na residência.",
    );
  if (pet.livesWithChildren === "Não")
    add(
      10,
      answers.hasChildren === "Não",
      "Não há crianças na residência.",
      "O animal não convive bem com crianças, mas há crianças na residência.",
    );
  if (pet.hasHealthCondition || pet.healthCondition)
    add(
      10,
      Boolean(String(answers.veterinaryPlan || "").trim()) &&
        answers.healthCommitment === "Sim",
      "O adotante apresentou um plano para necessidades de saúde.",
      "As necessidades especiais de saúde exigem um plano de cuidado mais claro.",
    );

  if (possible < 100)
    add(
      100 - possible,
      answers.previousPets === "Sim" || answers.dailyTime === "Mais de 4 horas",
      "A experiência ou disponibilidade fortalece a compatibilidade.",
      "A adaptação pode exigir acompanhamento e orientação do responsável.",
    );

  return {
    compatibilityScore: Math.round((earned / possible) * 100),
    compatibilityDetails: details,
  };
}

adoptionRequestRoutes.patch("/:id/status", async (c) => {
  const currentUser = c.get("user");
  if (!currentUser) {
    return c.json({ error: "Não autorizado" }, 401);
  }

  const id = c.req.param("id");
  const parsed = updateStatusSchema.safeParse(
    await c.req.json().catch(() => null),
  );
  if (!parsed.success) {
    return c.json(
      { error: "Status inválido", details: parsed.error.flatten() },
      400,
    );
  }

  const [existing] = await db
    .select({
      ownerId: animal.userId,
      animalId: adoptionRequest.animalId,
      currentStatus: adoptionRequest.status,
    })
    .from(adoptionRequest)
    .innerJoin(animal, eq(adoptionRequest.animalId, animal.id))
    .where(eq(adoptionRequest.id, id));

  if (!existing) {
    return c.json({ error: "Solicitação não encontrada" }, 404);
  }

  if (existing.ownerId !== currentUser.id) {
    return c.json({ error: "Sem permissão" }, 403);
  }

  const updated = await db.transaction(async (tx) => {
    const [request] = await tx
      .update(adoptionRequest)
      .set({
        status: parsed.data.status,
        updatedAt: new Date(),
      })
      .where(eq(adoptionRequest.id, id))
      .returning();

    if (parsed.data.status === "Aprovada") {
      await tx
        .update(animal)
        .set({ status: "Adotado", updatedAt: new Date() })
        .where(eq(animal.id, existing.animalId));

      await tx
        .update(adoptionRequest)
        .set({ status: "Recusada", updatedAt: new Date() })
        .where(
          and(
            eq(adoptionRequest.animalId, existing.animalId),
            inArray(adoptionRequest.status, ["PENDING", "Em análise"]),
          ),
        );
    } else if (existing.currentStatus === "Aprovada") {
      await tx
        .update(animal)
        .set({ status: "Disponível", updatedAt: new Date() })
        .where(eq(animal.id, existing.animalId));
    }

    return request;
  });

  if (!updated) {
    return c.json({ error: "Solicitação não encontrada" }, 404);
  }

  return c.json(updated);
});

adoptionRequestRoutes.delete("/:id", async (c) => {
  const currentUser = c.get("user");
  if (!currentUser) {
    return c.json({ error: "Não autorizado" }, 401);
  }

  const id = c.req.param("id");
  const [existing] = await db
    .select()
    .from(adoptionRequest)
    .where(eq(adoptionRequest.id, id));

  if (!existing) {
    return c.json({ error: "Solicitação não encontrada" }, 404);
  }

  if (existing.userId !== currentUser.id) {
    return c.json({ error: "Sem permissão" }, 403);
  }

  await db.delete(adoptionRequest).where(eq(adoptionRequest.id, id));
  return c.json({
    success: true,
    message: "Solicitação cancelada com sucesso",
  });
});
