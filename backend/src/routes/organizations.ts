import { and, desc, eq, isNull } from "drizzle-orm";
import { Hono } from "hono";
import { z } from "zod";
import { db } from "../../lib/db/index.ts";
import { adoptionRequest, animal, donationItem, donationItemRequest, invitation, member, organization, user } from "../../lib/db/schemas/index.ts";
import { canManageOrganization, organizationMembership } from "../services/organization-access.ts";
import type { AuthContext } from "./index.ts";

export const organizationRoutes = new Hono<AuthContext>();

organizationRoutes.use("*", async (c, next) => {
  c.header("Cache-Control", "no-store");
  if (!c.get("user")) return c.json({ error: "Entre na sua conta para continuar." }, 401);
  await next();
});

organizationRoutes.get("/mine", async (c) => {
  const currentUser = c.get("user")!;
  const rows = await db
    .select({ organization, role: member.role })
    .from(member)
    .innerJoin(organization, eq(member.organizationId, organization.id))
    .where(eq(member.userId, currentUser.id))
    .orderBy(organization.name);
  return c.json(rows);
});

organizationRoutes.get("/:id/dashboard", async (c) => {
  const currentUser = c.get("user")!;
  const organizationId = c.req.param("id");
  const membership = await organizationMembership(currentUser.id, organizationId);
  if (!membership) return c.json({ error: "Você não faz parte desta organização." }, 403);

  const [org] = await db.select().from(organization).where(eq(organization.id, organizationId));
  if (!org) return c.json({ error: "Organização não encontrada." }, 404);

  const [members, animals, items, adoptionRequests, itemRequests, invitations] = await Promise.all([
    db.select({ id: member.id, userId: user.id, name: user.name, email: user.email, role: member.role, createdAt: member.createdAt })
      .from(member).innerJoin(user, eq(member.userId, user.id))
      .where(eq(member.organizationId, organizationId)).orderBy(member.createdAt),
    db.select({ id: animal.id, name: animal.name, image: animal.image, status: animal.status, userId: animal.userId, createdAt: animal.createdAt })
      .from(animal).where(eq(animal.organizationId, organizationId)).orderBy(desc(animal.createdAt)),
    db.select({ id: donationItem.id, title: donationItem.title, mainImage: donationItem.mainImage, status: donationItem.status, userId: donationItem.userId, createdAt: donationItem.createdAt })
      .from(donationItem).where(eq(donationItem.organizationId, organizationId)).orderBy(desc(donationItem.createdAt)),
    db.select({ id: adoptionRequest.id, status: adoptionRequest.status, createdAt: adoptionRequest.createdAt, animalId: animal.id, animalName: animal.name, requesterName: user.name, ownerId: animal.userId })
      .from(adoptionRequest).innerJoin(animal, eq(adoptionRequest.animalId, animal.id))
      .innerJoin(user, eq(adoptionRequest.userId, user.id))
      .where(eq(animal.organizationId, organizationId)).orderBy(desc(adoptionRequest.createdAt)),
    db.select({ id: donationItemRequest.id, status: donationItemRequest.status, quantity: donationItemRequest.quantity, createdAt: donationItemRequest.createdAt, itemId: donationItem.id, itemTitle: donationItem.title, requesterName: user.name, ownerId: donationItem.userId })
      .from(donationItemRequest).innerJoin(donationItem, eq(donationItemRequest.itemId, donationItem.id))
      .innerJoin(user, eq(donationItemRequest.userId, user.id))
      .where(eq(donationItem.organizationId, organizationId)).orderBy(desc(donationItemRequest.createdAt)),
    canManageOrganization(membership.role)
      ? db.select({ id: invitation.id, email: invitation.email, role: invitation.role, status: invitation.status, expiresAt: invitation.expiresAt })
        .from(invitation).where(and(eq(invitation.organizationId, organizationId), eq(invitation.status, "pending")))
        .orderBy(desc(invitation.createdAt))
      : Promise.resolve([]),
  ]);

  return c.json({ organization: org, role: membership.role, members, animals, items, adoptionRequests, itemRequests, invitations });
});

const updateOrganizationSchema = z.object({
  name: z.string().trim().min(2).max(160),
  logo: z.url().max(1000).nullable(),
  cnpj: z.string().trim().max(18).nullable(),
  phone: z.string().trim().max(30).nullable(),
  website: z.union([z.literal(""), z.url().max(255)]).nullable(),
  instagram: z.string().trim().max(80).nullable(),
  description: z.string().trim().max(2000).nullable(),
});

organizationRoutes.patch("/:id", async (c) => {
  const currentUser = c.get("user")!;
  const organizationId = c.req.param("id");
  const membership = await organizationMembership(currentUser.id, organizationId);
  if (!membership) return c.json({ error: "Você não faz parte desta organização." }, 403);
  if (!canManageOrganization(membership.role)) return c.json({ error: "Apenas gestores podem editar a ONG." }, 403);

  const parsed = updateOrganizationSchema.safeParse(await c.req.json().catch(() => null));
  if (!parsed.success) return c.json({ error: "Revise os dados da organização." }, 400);
  const [updated] = await db.update(organization).set(parsed.data).where(eq(organization.id, organizationId)).returning();
  if (!updated) return c.json({ error: "Organização não encontrada." }, 404);
  return c.json(updated);
});

organizationRoutes.post("/:id/claim-publications", async (c) => {
  const currentUser = c.get("user")!;
  const organizationId = c.req.param("id");
  const membership = await organizationMembership(currentUser.id, organizationId);
  if (!membership) return c.json({ error: "Você não faz parte desta organização." }, 403);

  const result = await db.transaction(async (tx) => {
    const animals = await tx.update(animal).set({ organizationId })
      .where(and(eq(animal.userId, currentUser.id), isNull(animal.organizationId)))
      .returning({ id: animal.id });
    const items = await tx.update(donationItem).set({ organizationId })
      .where(and(eq(donationItem.userId, currentUser.id), isNull(donationItem.organizationId)))
      .returning({ id: donationItem.id });
    return { animalsClaimed: animals.length, itemsClaimed: items.length };
  });
  return c.json(result);
});
