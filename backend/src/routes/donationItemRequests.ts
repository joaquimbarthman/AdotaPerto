import { and, desc, eq } from "drizzle-orm";
import { Hono } from "hono";
import crypto from "node:crypto";
import { z } from "zod";
import { db } from "../../lib/db/index.ts";
import {
  donationItem,
  donationItemRequest,
  user as userTable,
} from "../../lib/db/schemas/index.ts";
import type { AuthContext } from "./index.ts";

export const donationItemRequestRoutes = new Hono<AuthContext>();
const createSchema = z.object({
  itemId: z.string().min(1),
  quantity: z.number().int().positive().default(1),
  message: z.string().trim().max(1000).nullable().optional(),
});
const statusSchema = z.object({
  status: z.enum(["Em análise", "Aprovada", "Recusada", "Cancelada"]),
});

donationItemRequestRoutes.get("/", async (c) => {
  const user = c.get("user");
  if (!user) return c.json({ error: "Não autorizado" }, 401);
  const rows = await db
    .select({
      id: donationItemRequest.id,
      status: donationItemRequest.status,
      quantity: donationItemRequest.quantity,
      message: donationItemRequest.message,
      createdAt: donationItemRequest.createdAt,
      item: donationItem,
      ownerContact: {
        name: userTable.name,
        email: userTable.email,
        whatsapp: userTable.whatsapp,
        instagram: userTable.instagram,
      },
    })
    .from(donationItemRequest)
    .innerJoin(donationItem, eq(donationItemRequest.itemId, donationItem.id))
    .innerJoin(userTable, eq(donationItem.userId, userTable.id))
    .where(eq(donationItemRequest.userId, user.id))
    .orderBy(desc(donationItemRequest.createdAt));
  return c.json(
    rows.map((row) => ({
      ...row,
      ownerContact: row.status === "Aprovada" ? row.ownerContact : undefined,
    })),
  );
});

donationItemRequestRoutes.get("/received", async (c) => {
  const user = c.get("user");
  if (!user) return c.json({ error: "Não autorizado" }, 401);
  return c.json(
    await db
      .select({
        id: donationItemRequest.id,
        status: donationItemRequest.status,
        quantity: donationItemRequest.quantity,
        message: donationItemRequest.message,
        createdAt: donationItemRequest.createdAt,
        item: donationItem,
        requester: {
          id: userTable.id,
          name: userTable.name,
          image: userTable.image,
          city: userTable.city,
          state: userTable.state,
        },
      })
      .from(donationItemRequest)
      .innerJoin(donationItem, eq(donationItemRequest.itemId, donationItem.id))
      .innerJoin(userTable, eq(donationItemRequest.userId, userTable.id))
      .where(eq(donationItem.userId, user.id))
      .orderBy(desc(donationItemRequest.createdAt)),
  );
});

donationItemRequestRoutes.post("/", async (c) => {
  const user = c.get("user");
  if (!user) return c.json({ error: "Não autorizado" }, 401);
  const parsed = createSchema.safeParse(await c.req.json().catch(() => null));
  if (!parsed.success)
    return c.json({ error: "Revise os dados da solicitação" }, 400);
  const [item] = await db
    .select()
    .from(donationItem)
    .where(eq(donationItem.id, parsed.data.itemId));
  if (!item) return c.json({ error: "Item não encontrado" }, 404);
  if (item.userId === user.id)
    return c.json({ error: "Você não pode solicitar seu próprio item" }, 400);
  if (item.status !== "Disponível")
    return c.json({ error: "Este item não está disponível" }, 409);
  if (parsed.data.quantity > item.quantity)
    return c.json(
      { error: "Quantidade solicitada maior que a disponível" },
      400,
    );
  const [existing] = await db
    .select({ id: donationItemRequest.id })
    .from(donationItemRequest)
    .where(
      and(
        eq(donationItemRequest.userId, user.id),
        eq(donationItemRequest.itemId, item.id),
      ),
    );
  if (existing) return c.json({ error: "Você já solicitou este item" }, 409);
  const [created] = await db
    .insert(donationItemRequest)
    .values({ id: crypto.randomUUID(), userId: user.id, ...parsed.data })
    .returning();
  return c.json(created, 201);
});

donationItemRequestRoutes.patch("/:id/status", async (c) => {
  const user = c.get("user");
  if (!user) return c.json({ error: "Não autorizado" }, 401);
  const parsed = statusSchema.safeParse(await c.req.json().catch(() => null));
  if (!parsed.success) return c.json({ error: "Status inválido" }, 400);
  const result = await db.transaction(async (tx) => {
    const id = c.req.param("id");
    const [reference] = await tx.select({ itemId: donationItemRequest.itemId })
      .from(donationItemRequest).where(eq(donationItemRequest.id, id));
    if (!reference) return { error: "Solicitação não encontrada", status: 404 as const };

    // Always lock the item first: requests for the same stock must serialize.
    const [item] = await tx.select().from(donationItem)
      .where(eq(donationItem.id, reference.itemId)).for("update");
    if (!item) return { error: "Item não encontrado", status: 404 as const };
    if (item.userId !== user.id) return { error: "Sem permissão", status: 403 as const };
    const [request] = await tx.select().from(donationItemRequest)
      .where(eq(donationItemRequest.id, id)).for("update");
    if (!request) return { error: "Solicitação não encontrada", status: 404 as const };

    const nextStatus = parsed.data.status;
    if (request.status === nextStatus) return { request };
    if (!["Em análise", "PENDING"].includes(request.status) || nextStatus === "Em análise") {
      return { error: "Esta mudança de status não é permitida", status: 409 as const };
    }
    if (nextStatus === "Aprovada") {
      if (item.status !== "Disponível") {
        return { error: "Este item não está disponível", status: 409 as const };
      }
      if (request.quantity <= 0 || request.quantity > item.quantity) {
        return { error: "Quantidade solicitada maior que a disponível ou inválida", status: 409 as const };
      }
      const remaining = item.quantity - request.quantity;
      await tx.update(donationItem)
        .set({ quantity: remaining, status: remaining === 0 ? "Doado" : "Disponível", updatedAt: new Date() })
        .where(eq(donationItem.id, item.id));
    }
    const [updated] = await tx.update(donationItemRequest)
      .set({ status: nextStatus, updatedAt: new Date() })
      .where(eq(donationItemRequest.id, id)).returning();
    return { request: updated };
  });
  if ("error" in result) return c.json({ error: result.error }, result.status);
  return c.json(result.request);
});
