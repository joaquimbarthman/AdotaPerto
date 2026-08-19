import { and, desc, eq } from "drizzle-orm";
import { Hono } from "hono";
import crypto from "node:crypto";
import { z } from "zod";
import { db } from "../../lib/db/index.ts";
import { adoptionRequest, animal, user as userTable } from "../../lib/db/schemas/index.ts";
import type { AuthContext } from "./index.ts";

export const adoptionRequestRoutes = new Hono<AuthContext>();

const createRequestSchema = z.object({
  animalId: z.string().trim().min(1),
  notes: z.string().trim().max(1000).nullable().optional(),
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
      createdAt: adoptionRequest.createdAt,
      updatedAt: adoptionRequest.updatedAt,
      animal: animal,
    })
    .from(adoptionRequest)
    .innerJoin(animal, eq(adoptionRequest.animalId, animal.id))
    .where(eq(adoptionRequest.userId, currentUser.id))
    .orderBy(desc(adoptionRequest.createdAt));

  return c.json(list);
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
      createdAt: adoptionRequest.createdAt,
      updatedAt: adoptionRequest.updatedAt,
      animal: animal,
    })
    .from(adoptionRequest)
    .innerJoin(animal, eq(adoptionRequest.animalId, animal.id))
    .where(eq(adoptionRequest.id, id));

  if (!request) {
    return c.json({ error: "Solicitação não encontrada" }, 404);
  }

  if (request.userId !== currentUser.id && request.animal.userId !== currentUser.id) {
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

  const parsed = createRequestSchema.safeParse(await c.req.json().catch(() => null));
  if (!parsed.success) {
    return c.json({ error: "Dados da solicitação inválidos", details: parsed.error.flatten() }, 400);
  }
  const body = parsed.data;

  const [existingAnimal] = await db.select().from(animal).where(eq(animal.id, body.animalId));
  if (!existingAnimal) {
    return c.json({ error: "Animal não encontrado" }, 404);
  }

  if (existingAnimal.userId === currentUser.id) {
    return c.json({ error: "Você não pode solicitar a adoção do próprio animal" }, 400);
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
    status: "Em análise",
  };

  const [created] = await db.insert(adoptionRequest).values(newRequest).returning();
  return c.json(created, 201);
});

adoptionRequestRoutes.patch("/:id/status", async (c) => {
  const currentUser = c.get("user");
  if (!currentUser) {
    return c.json({ error: "Não autorizado" }, 401);
  }

  const id = c.req.param("id");
  const parsed = updateStatusSchema.safeParse(await c.req.json().catch(() => null));
  if (!parsed.success) {
    return c.json({ error: "Status inválido", details: parsed.error.flatten() }, 400);
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
            eq(adoptionRequest.status, "Em análise"),
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
  return c.json({ success: true, message: "Solicitação cancelada com sucesso" });
});
