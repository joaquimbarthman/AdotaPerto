import crypto from "node:crypto";
import { desc, eq } from "drizzle-orm";
import { Hono } from "hono";
import { z } from "zod";
import { db } from "../../lib/db/index.ts";
import { donationItem } from "../../lib/db/schemas/index.ts";
import type { AuthContext } from "./index.ts";

export const donationItemRoutes = new Hono<AuthContext>();

const categories = ["Ração", "Petiscos", "Produtos de higiene", "Caminhas e cobertores", "Coleiras e guias", "Caixas de transporte", "Brinquedos", "Utensílios", "Produtos de limpeza", "Outros"] as const;
const units = ["Unidade", "Kg", "g", "Litros", "mL", "Pacote", "Caixa"] as const;
const conditions = ["Novo", "Lacrado", "Aberto em boas condições", "Usado em boas condições"] as const;
const deliveryMethods = ["Retirada", "Entrega", "A combinar"] as const;

const itemSchema = z.object({
  title: z.string().trim().min(3).max(120),
  category: z.enum(categories),
  itemName: z.string().trim().min(2).max(120),
  quantity: z.number().int().positive(),
  unit: z.enum(units),
  condition: z.enum(conditions),
  expirationDate: z.string().nullable().optional(),
  description: z.string().trim().min(10).max(2000),
  mainImage: z.string().min(1),
  images: z.array(z.string()).max(5).default([]),
  deliveryMethod: z.enum(deliveryMethods),
  availableUntil: z.string().nullable().optional(),
});

donationItemRoutes.get("/mine", async (c) => {
  const currentUser = c.get("user");
  if (!currentUser) return c.json({ error: "Não autorizado" }, 401);
  return c.json(await db.select().from(donationItem).where(eq(donationItem.userId, currentUser.id)).orderBy(desc(donationItem.createdAt)));
});

donationItemRoutes.post("/", async (c) => {
  const currentUser = c.get("user");
  if (!currentUser) return c.json({ error: "Não autorizado" }, 401);
  const parsed = itemSchema.safeParse(await c.req.json().catch(() => null));
  if (!parsed.success) return c.json({ error: "Revise os campos da doação", details: parsed.error.flatten() }, 400);

  const today = new Date().toISOString().slice(0, 10);
  if (parsed.data.availableUntil && parsed.data.availableUntil < today) return c.json({ error: "A data de disponibilidade não pode estar no passado" }, 400);

  const [created] = await db.insert(donationItem).values({ id: crypto.randomUUID(), userId: currentUser.id, ...parsed.data, status: "Disponível" }).returning();
  return c.json(created, 201);
});
