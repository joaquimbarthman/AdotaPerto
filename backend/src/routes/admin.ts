import { count, desc, eq, gte } from "drizzle-orm";
import { Hono } from "hono";
import { db } from "../../lib/db/index.ts";
import { adoptionRequest, animal, donationItem, donationItemRequest, organization, session, user } from "../../lib/db/schemas/index.ts";
import { z } from "zod";
import type { AuthContext } from "./index.ts";

export const adminRoutes = new Hono<AuthContext>();

adminRoutes.use("*", async (c, next) => {
  c.header("Cache-Control", "no-store");
  const currentUser = c.get("user");
  if (!currentUser) return c.json({ error: "Entre na sua conta para continuar." }, 401);
  const [account] = await db.select({ role: user.role, banned: user.banned, banExpires: user.banExpires }).from(user).where(eq(user.id, currentUser.id));
  const banned = account?.banned && (!account.banExpires || account.banExpires > new Date());
  if (!account?.role?.split(",").includes("admin") || banned) {
    return c.json({ error: "Esta área é exclusiva para administradores." }, 403);
  }
  await next();
});

adminRoutes.get("/overview", async (c) => {
  try {
    const since = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const [users, organizations, newUsers, activeSessions, animals, items, adoptions, donations, recentUsers] = await Promise.all([
      db.select({ total: count() }).from(user),
      db.select({ total: count() }).from(organization),
      db.select({ total: count() }).from(user).where(gte(user.createdAt, since)),
      db.select({ total: count() }).from(session).where(gte(session.expiresAt, new Date())),
      db.select({ status: animal.status, total: count() }).from(animal).groupBy(animal.status).orderBy(animal.status),
      db.select({ status: donationItem.status, total: count() }).from(donationItem).groupBy(donationItem.status).orderBy(donationItem.status),
      db.select({ status: adoptionRequest.status, total: count() }).from(adoptionRequest).groupBy(adoptionRequest.status).orderBy(adoptionRequest.status),
      db.select({ status: donationItemRequest.status, total: count() }).from(donationItemRequest).groupBy(donationItemRequest.status).orderBy(donationItemRequest.status),
      db.select({ id: user.id, name: user.name, role: user.role, city: user.city, state: user.state, createdAt: user.createdAt }).from(user).orderBy(desc(user.createdAt), desc(user.id)).limit(8),
    ]);
    return c.json({ generatedAt: new Date().toISOString(), users: users[0].total, organizations: organizations[0].total, newUsers: newUsers[0].total, activeSessions: activeSessions[0].total, animals, items, adoptions, donations, recentUsers });
  } catch {
    return c.json({ error: "Não foi possível carregar os dados do painel." }, 503);
  }
});

adminRoutes.get("/organizations", async (c) => c.json(await db.select({ id: organization.id, name: organization.name, slug: organization.slug, type: organization.type, cnpj: organization.cnpj, status: organization.verificationStatus, reason: organization.verificationReason, createdAt: organization.createdAt, creator: { id: user.id, name: user.name, email: user.email } }).from(organization).innerJoin(user, eq(organization.createdBy, user.id)).orderBy(desc(organization.createdAt))));

adminRoutes.patch("/organizations/:id/verification", async (c) => {
  const current = c.get("user")!;
  const parsed = z.object({ status: z.enum(["PENDING", "VERIFIED", "REJECTED", "SUSPENDED"]), reason: z.string().trim().max(1000).nullable().optional() }).safeParse(await c.req.json().catch(() => null));
  if (!parsed.success) return c.json({ error: "Revisão inválida" }, 400);
  if (["REJECTED", "SUSPENDED"].includes(parsed.data.status) && !parsed.data.reason) return c.json({ error: "Informe uma justificativa" }, 400);
  const [updated] = await db.update(organization).set({ verificationStatus: parsed.data.status, verificationReason: parsed.data.reason || null, verificationReviewedBy: current.id, verificationReviewedAt: new Date(), updatedAt: new Date() }).where(eq(organization.id, c.req.param("id"))).returning();
  return updated ? c.json(updated) : c.json({ error: "Organização não encontrada" }, 404);
});
