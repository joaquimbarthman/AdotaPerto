import { and, count, desc, eq, gte, ilike, inArray, isNull } from "drizzle-orm";
import { Hono } from "hono";
import { z } from "zod";
import { db } from "../../lib/db/index.ts";
import { adoptionRequest, animal, donationItem, donationItemRequest, member, organization, organizationExternal, session, user } from "../../lib/db/schemas/index.ts";
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

adminRoutes.get("/organizations", async (c) => {
  const requestedPage = Number(c.req.query("page"));
  const page = Number.isSafeInteger(requestedPage) && requestedPage > 0
    ? Math.min(requestedPage, 100000)
    : 1;
  const pageSize = 20;

  try {
    const [totals, organizations] = await Promise.all([
      db.select({ total: count() }).from(organization),
      db.select({
        id: organization.id,
        name: organization.name,
        cnpj: organization.cnpj,
        phone: organization.phone,
        website: organization.website,
        createdAt: organization.createdAt,
      })
        .from(organization)
        .orderBy(desc(organization.createdAt), desc(organization.id))
        .limit(pageSize)
        .offset((page - 1) * pageSize),
    ]);

    const ids = organizations.map((row) => row.id);
    const [volunteers, externals] = ids.length ? await Promise.all([
      db.select({ organizationId: member.organizationId, total: count() })
        .from(member)
        .where(and(inArray(member.organizationId, ids), eq(member.role, "member")))
        .groupBy(member.organizationId),
      db.select({ organizationId: organizationExternal.organizationId, total: count() })
        .from(organizationExternal)
        .where(inArray(organizationExternal.organizationId, ids))
        .groupBy(organizationExternal.organizationId),
    ]) : [[], []];
    const volunteerCount = new Map(volunteers.map((row) => [row.organizationId, row.total]));
    const externalCount = new Map(externals.map((row) => [row.organizationId, row.total]));
    return c.json({
      organizations: organizations.map((row) => ({
        ...row,
        volunteers: volunteerCount.get(row.id) ?? 0,
        externals: externalCount.get(row.id) ?? 0,
      })),
      total: totals[0]?.total ?? 0, page, pageSize,
    });
  } catch {
    return c.json({ error: "Não foi possível carregar as ONGs." }, 503);
  }
});

adminRoutes.get("/organizations/:id/people", async (c) => {
  const organizationId = c.req.param("id");
  try {
    const [org] = await db.select({ id: organization.id, name: organization.name })
      .from(organization).where(eq(organization.id, organizationId));
    if (!org) return c.json({ error: "ONG não encontrada." }, 404);
    const [volunteers, externals] = await Promise.all([
      db.select({ id: member.id, name: user.name, email: user.email })
        .from(member).innerJoin(user, eq(member.userId, user.id))
        .where(and(eq(member.organizationId, organizationId), eq(member.role, "member")))
        .orderBy(user.name),
      db.select({
        id: organizationExternal.id, name: organizationExternal.name,
        kind: organizationExternal.kind, email: organizationExternal.email,
        phone: organizationExternal.phone, notes: organizationExternal.notes,
      }).from(organizationExternal)
        .where(eq(organizationExternal.organizationId, organizationId))
        .orderBy(organizationExternal.name),
    ]);
    return c.json({ organization: org, volunteers, externals });
  } catch {
    return c.json({ error: "Não foi possível carregar as pessoas da ONG." }, 503);
  }
});

adminRoutes.get("/transfer-options", async (c) => {
  const search = c.req.query("q")?.trim().slice(0, 80);
  try {
    const conditions = and(isNull(animal.organizationId), search ? ilike(animal.name, `%${search}%`) : undefined);
    const [organizations, animals, totals] = await Promise.all([
      db.select({ id: organization.id, name: organization.name }).from(organization).orderBy(organization.name),
      db.select({ id: animal.id, name: animal.name, species: animal.species, status: animal.status, image: animal.image })
        .from(animal).where(conditions).orderBy(desc(animal.createdAt), desc(animal.id)).limit(50),
      db.select({ total: count() }).from(animal).where(conditions),
    ]);
    return c.json({ organizations, animals, total: totals[0]?.total ?? 0 });
  } catch {
    return c.json({ error: "Não foi possível carregar os animais para transferência." }, 503);
  }
});

const transferSchema = z.object({
  organizationId: z.string().min(1),
  animalIds: z.array(z.string().min(1)).min(1).max(50),
});

adminRoutes.post("/animals/transfer", async (c) => {
  const parsed = transferSchema.safeParse(await c.req.json().catch(() => null));
  if (!parsed.success) return c.json({ error: "Selecione uma ONG e até 50 animais." }, 400);
  const { organizationId } = parsed.data;
  const ids = [...new Set(parsed.data.animalIds)];
  try {
    const [org] = await db.select({ id: organization.id, name: organization.name })
      .from(organization).where(eq(organization.id, organizationId));
    if (!org) return c.json({ error: "ONG não encontrada." }, 404);
    const [responsible] = await db.select({ userId: member.userId }).from(member)
      .where(and(eq(member.organizationId, organizationId), eq(member.role, "owner"))).limit(1);
    if (!responsible) return c.json({ error: "A ONG não possui um responsável cadastrado." }, 409);
    const transferred = await db.update(animal)
      .set({ organizationId, userId: responsible.userId, updatedAt: new Date() })
      .where(and(inArray(animal.id, ids), isNull(animal.organizationId)))
      .returning({ id: animal.id });
    if (transferred.length === 0) return c.json({ error: "Os animais selecionados já foram vinculados ou não existem." }, 409);
    return c.json({ organization: org.name, transferred: transferred.length, skipped: ids.length - transferred.length });
  } catch {
    return c.json({ error: "Não foi possível transferir os animais." }, 503);
  }
});

adminRoutes.post("/seed-content", async (c) => {
  const currentUser = c.get("user");
  if (!currentUser) return c.json({ error: "Entre na sua conta para continuar." }, 401);
  const [account] = await db
    .select({ id: user.id, name: user.name })
    .from(user)
    .where(eq(user.id, currentUser.id));
  if (!account) return c.json({ error: "Usuário não encontrado." }, 404);

  try {
    const { seedForUser } = await import("../../lib/db/seed.ts");
    const result = await seedForUser(account);
    return c.json(result);
  } catch (error) {
    console.error("Falha ao carregar conteúdo de exemplo:", error);
    return c.json({ error: "Não foi possível carregar os animais e itens. Verifique o Storage e tente novamente." }, 503);
  }
});
