import { count, desc, eq, gte } from "drizzle-orm";
import { Hono } from "hono";
import { db } from "../../lib/db/index.ts";
import { adoptionRequest, animal, donationItem, donationItemRequest, session, user } from "../../lib/db/schemas/index.ts";
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
    const [users, newUsers, activeSessions, animals, items, adoptions, donations, recentUsers] = await Promise.all([
      db.select({ total: count() }).from(user),
      db.select({ total: count() }).from(user).where(gte(user.createdAt, since)),
      db.select({ total: count() }).from(session).where(gte(session.expiresAt, new Date())),
      db.select({ status: animal.status, total: count() }).from(animal).groupBy(animal.status).orderBy(animal.status),
      db.select({ status: donationItem.status, total: count() }).from(donationItem).groupBy(donationItem.status).orderBy(donationItem.status),
      db.select({ status: adoptionRequest.status, total: count() }).from(adoptionRequest).groupBy(adoptionRequest.status).orderBy(adoptionRequest.status),
      db.select({ status: donationItemRequest.status, total: count() }).from(donationItemRequest).groupBy(donationItemRequest.status).orderBy(donationItemRequest.status),
      db.select({ id: user.id, name: user.name, role: user.role, city: user.city, state: user.state, createdAt: user.createdAt }).from(user).orderBy(desc(user.createdAt), desc(user.id)).limit(8),
    ]);
    return c.json({ generatedAt: new Date().toISOString(), users: users[0].total, newUsers: newUsers[0].total, activeSessions: activeSessions[0].total, animals, items, adoptions, donations, recentUsers });
  } catch {
    return c.json({ error: "Não foi possível carregar os dados do painel." }, 503);
  }
});
