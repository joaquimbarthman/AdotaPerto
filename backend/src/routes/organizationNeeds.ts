import crypto from "node:crypto";
import { and, desc, eq } from "drizzle-orm";
import { Hono } from "hono";
import { z } from "zod";
import { db } from "../../lib/db/index.ts";
import { organization, organizationNeed } from "../../lib/db/schemas/index.ts";
import { canPublishForOrganization } from "../services/organization-access.ts";
import type { AuthContext } from "./index.ts";

export const organizationNeedRoutes = new Hono<AuthContext>();

const needSchema = z.object({
  title: z.string().trim().min(3).max(120),
  category: z.enum(["Ração", "Medicamentos", "Higiene", "Camas e cobertores", "Transporte", "Brinquedos", "Limpeza", "Serviços", "Outros"]),
  quantity: z.number().int().positive().max(100000),
  unit: z.enum(["Unidade", "Kg", "g", "Litros", "mL", "Pacote", "Caixa", "Serviço"]),
  priority: z.enum(["Baixa", "Média", "Alta", "Urgente"]),
  description: z.string().trim().min(10).max(2000),
});

const selection = {
  id: organizationNeed.id, title: organizationNeed.title, category: organizationNeed.category,
  quantity: organizationNeed.quantity, unit: organizationNeed.unit, priority: organizationNeed.priority,
  description: organizationNeed.description, status: organizationNeed.status, createdAt: organizationNeed.createdAt,
  organization: { id: organization.id, name: organization.name, image: organization.logoUrl, city: organization.city, state: organization.state,
    description: organization.description, phone: organization.whatsapp, whatsapp: organization.whatsapp,
    instagram: organization.instagram, website: organization.website, verifiedAt: organization.verificationReviewedAt },
};

organizationNeedRoutes.get("/", async (c) => c.json(await db.select(selection).from(organizationNeed)
  .innerJoin(organization, eq(organizationNeed.organizationId, organization.id))
  .where(and(eq(organizationNeed.status, "Ativa"), eq(organization.verificationStatus, "VERIFIED")))
  .orderBy(desc(organizationNeed.createdAt))));

organizationNeedRoutes.get("/mine", async (c) => {
  const current = c.get("user");
  if (!current) return c.json({ error: "Não autorizado" }, 401);
  return c.json(await db.select().from(organizationNeed).where(eq(organizationNeed.organizationId, current.id)).orderBy(desc(organizationNeed.createdAt)));
});

organizationNeedRoutes.get("/:id", async (c) => {
  const [need] = await db.select(selection).from(organizationNeed).innerJoin(organization, eq(organizationNeed.organizationId, organization.id)).where(eq(organizationNeed.id, c.req.param("id")));
  return need ? c.json(need) : c.json({ error: "Necessidade não encontrada" }, 404);
});

organizationNeedRoutes.post("/", async (c) => {
  const current = c.get("user");
  if (!current) return c.json({ error: "Não autorizado" }, 401);
  const body = await c.req.json().catch(() => null) as Record<string, unknown> | null;
  const organizationId = typeof body?.organizationId === "string" ? body.organizationId : "";
  if (!organizationId || !await canPublishForOrganization(organizationId, current.id)) return c.json({ error: "Sem permissão para publicar por esta organização" }, 403);
  const parsed = needSchema.safeParse(body);
  if (!parsed.success) return c.json({ error: "Revise os dados da necessidade", details: parsed.error.flatten() }, 400);
  const [created] = await db.insert(organizationNeed).values({ id: crypto.randomUUID(), organizationId, ...parsed.data }).returning();
  return c.json(created, 201);
});

organizationNeedRoutes.delete("/:id", async (c) => {
  const current = c.get("user");
  if (!current) return c.json({ error: "Não autorizado" }, 401);
  const [removed] = await db.delete(organizationNeed).where(and(eq(organizationNeed.id, c.req.param("id")), eq(organizationNeed.organizationId, current.id))).returning();
  return removed ? c.json({ success: true }) : c.json({ error: "Necessidade não encontrada" }, 404);
});
