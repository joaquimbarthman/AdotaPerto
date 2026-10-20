import crypto from "node:crypto";
import { and, desc, eq, inArray, ne } from "drizzle-orm";
import { Hono } from "hono";
import { z } from "zod";
import { db } from "../../lib/db/index.ts";
import { animal, donationItem, organization, organizationInvitation, organizationMember, user } from "../../lib/db/schemas/index.ts";
import { canManageOrganization, getOrganizationMembership } from "../services/organization-access.ts";
import type { AuthContext } from "./index.ts";
import { isValidCnpj, organizationSlug } from "../services/organization-validation.ts";

export const organizationRoutes = new Hono<AuthContext>();
export const organizationInvitationRoutes = new Hono<AuthContext>();
const organizationTypes = ["NGO", "INDEPENDENT_RESCUER"] as const;
const roles = ["ADMIN", "MEMBER"] as const;

async function uniqueSlug(name: string) { const base = organizationSlug(name); let slug = base; for (let i = 1; i < 100; i += 1) { const [found] = await db.select({ id: organization.id }).from(organization).where(eq(organization.slug, slug)); if (!found) return slug; slug = `${base}-${i + 1}`; } return `${base}-${crypto.randomUUID().slice(0, 8)}`; }

const createSchema = z.object({ name: z.string().trim().min(3).max(160), type: z.enum(organizationTypes), cnpj: z.string().optional().transform((v) => v?.replace(/\D/g, "") || null), description: z.string().trim().min(20).max(2000), logoUrl: z.string().nullable().optional(), coverUrl: z.string().nullable().optional(), foundedYear: z.string().regex(/^\d{4}$/).nullable().optional(), contactEmail: z.string().email(), whatsapp: z.string().trim().min(10).max(20), instagram: z.string().max(100).nullable().optional(), website: z.string().url().nullable().optional(), postalCode: z.string().max(20).nullable().optional(), street: z.string().max(200).nullable().optional(), number: z.string().max(30).nullable().optional(), neighborhood: z.string().max(120).nullable().optional(), city: z.string().trim().min(2).max(120), state: z.string().trim().min(2).max(2), authorized: z.literal(true) }).superRefine((data, ctx) => { if (data.type === "NGO" && (!data.cnpj || !isValidCnpj(data.cnpj))) ctx.addIssue({ code: "custom", path: ["cnpj"], message: "CNPJ válido é obrigatório para ONG formalizada" }); });

const updateSchema = z.object({
  name: z.string().trim().min(3).max(160),
  cnpj: z.string().transform((value) => value.replace(/\D/g, "")).refine(isValidCnpj, "Informe um CNPJ válido"),
  description: z.string().trim().min(20).max(2000),
  legalRepresentativeName: z.string().trim().min(3).max(160),
  logoUrl: z.string().url().nullable(),
  coverUrl: z.string().url().nullable(),
  contactEmail: z.string().email(),
  whatsapp: z.string().trim().min(10).max(20),
  instagram: z.string().max(100).nullable(),
  website: z.string().url().nullable(),
  postalCode: z.string().max(20).nullable(),
  street: z.string().max(200).nullable(),
  number: z.string().max(30).nullable(),
  neighborhood: z.string().max(120).nullable(),
  city: z.string().trim().min(2).max(120),
  state: z.string().trim().length(2).transform((value) => value.toUpperCase()),
});

const publicFields = { id: organization.id, name: organization.name, slug: organization.slug, type: organization.type, description: organization.description, logoUrl: organization.logoUrl, coverUrl: organization.coverUrl, foundedYear: organization.foundedYear, contactEmail: organization.contactEmail, whatsapp: organization.whatsapp, instagram: organization.instagram, website: organization.website, city: organization.city, state: organization.state, verificationStatus: organization.verificationStatus, createdAt: organization.createdAt };
const privateFields = { cnpj: organization.cnpj, legalRepresentativeName: organization.legalRepresentativeName, postalCode: organization.postalCode, street: organization.street, number: organization.number, neighborhood: organization.neighborhood };

organizationRoutes.get("/", async (c) => c.json(await db.select(publicFields).from(organization).where(inArray(organization.verificationStatus, ["PENDING", "VERIFIED"])).orderBy(desc(organization.createdAt))));
organizationRoutes.get("/mine", async (c) => { const current = c.get("user"); if (!current) return c.json({ error: "Não autorizado" }, 401); return c.json(await db.select({ ...publicFields, ...privateFields, role: organizationMember.role, memberStatus: organizationMember.status }).from(organizationMember).innerJoin(organization, eq(organizationMember.organizationId, organization.id)).where(and(eq(organizationMember.userId, current.id), eq(organizationMember.status, "ACTIVE"))).orderBy(desc(organization.createdAt))); });
organizationRoutes.get("/:slug", async (c) => { const [org] = await db.select(publicFields).from(organization).where(eq(organization.slug, c.req.param("slug"))); if (!org || !["PENDING", "VERIFIED"].includes(org.verificationStatus)) return c.json({ error: "Organização não encontrada" }, 404); const [animals, items] = await Promise.all([db.select().from(animal).where(and(eq(animal.organizationId, org.id), eq(animal.status, "Disponível"))).orderBy(desc(animal.createdAt)), db.select().from(donationItem).where(and(eq(donationItem.organizationId, org.id), eq(donationItem.status, "Disponível"))).orderBy(desc(donationItem.createdAt))]); return c.json({ ...org, animals, items }); });
organizationRoutes.post("/", async (c) => { const current = c.get("user"); if (!current) return c.json({ error: "Não autorizado" }, 401); const parsed = createSchema.safeParse(await c.req.json().catch(() => null)); if (!parsed.success) return c.json({ error: "Revise os dados da organização", details: parsed.error.flatten() }, 400); const { authorized: _authorized, ...data } = parsed.data; try { const result = await db.transaction(async (tx) => { const id = crypto.randomUUID(); const [created] = await tx.insert(organization).values({ id, ...data, legalRepresentativeName: current.name, slug: await uniqueSlug(data.name), createdBy: current.id, verificationStatus: "PENDING" }).returning(); await tx.insert(organizationMember).values({ id: crypto.randomUUID(), organizationId: id, userId: current.id, role: "OWNER", status: "ACTIVE" }); return created; }); return c.json(result, 201); } catch { return c.json({ error: "CNPJ já cadastrado ou dados conflitantes" }, 409); } });

organizationRoutes.post("/bootstrap", async (c) => {
  const current = c.get("user");
  if (!current) return c.json({ error: "Não autorizado" }, 401);
  const [account] = await db.select({ accountType: user.accountType }).from(user).where(eq(user.id, current.id));
  if (account?.accountType !== "ORGANIZATION") return c.json({ error: "A conta não é institucional" }, 403);
  const [ownedOrganization] = await db.select({ id: organization.id }).from(organizationMember).innerJoin(organization, eq(organizationMember.organizationId, organization.id)).where(and(eq(organizationMember.userId, current.id), eq(organizationMember.status, "ACTIVE")));
  if (ownedOrganization) return c.json({ error: "Esta conta já possui uma organização" }, 409);
  const name = "Nova organização";
  const result = await db.transaction(async (tx) => {
    const id = crypto.randomUUID();
    const [created] = await tx.insert(organization).values({ id, name, slug: await uniqueSlug(name), type: "NGO", description: "Complete os dados institucionais para publicar como ONG.", legalRepresentativeName: current.name, contactEmail: current.email, whatsapp: "", city: "", state: "", verificationStatus: "DRAFT", createdBy: current.id }).returning();
    await tx.insert(organizationMember).values({ id: crypto.randomUUID(), organizationId: id, userId: current.id, role: "OWNER", status: "ACTIVE" });
    return created;
  });
  return c.json(result, 201);
});

organizationRoutes.patch("/:id", async (c) => {
  const current = c.get("user");
  if (!current) return c.json({ error: "Não autorizado" }, 401);
  const id = c.req.param("id");
  if (!await canManageOrganization(id, current.id)) return c.json({ error: "Sem permissão" }, 403);
  const parsed = updateSchema.safeParse(await c.req.json().catch(() => null));
  if (!parsed.success) return c.json({ error: "Revise os dados da organização", details: parsed.error.flatten() }, 400);
  try {
    const [existing] = await db.select({ verificationStatus: organization.verificationStatus }).from(organization).where(eq(organization.id, id));
    const [updated] = await db.update(organization).set({ ...parsed.data, ...(existing?.verificationStatus === "DRAFT" ? { verificationStatus: "PENDING" } : {}), updatedAt: new Date() }).where(eq(organization.id, id)).returning();
    return updated ? c.json(updated) : c.json({ error: "Organização não encontrada" }, 404);
  } catch {
    return c.json({ error: "CNPJ já cadastrado ou dados conflitantes" }, 409);
  }
});

organizationRoutes.get("/:id/members", async (c) => { const current = c.get("user"); if (!current) return c.json({ error: "Não autorizado" }, 401); if (!await getOrganizationMembership(c.req.param("id"), current.id)) return c.json({ error: "Sem permissão" }, 403); return c.json(await db.select({ id: organizationMember.id, userId: user.id, name: user.name, email: user.email, image: user.image, role: organizationMember.role, status: organizationMember.status, createdAt: organizationMember.createdAt }).from(organizationMember).innerJoin(user, eq(organizationMember.userId, user.id)).where(eq(organizationMember.organizationId, c.req.param("id")))); });
organizationRoutes.post("/:id/invitations", async (c) => { const current = c.get("user"); if (!current) return c.json({ error: "Não autorizado" }, 401); const id = c.req.param("id"); if (!await canManageOrganization(id, current.id)) return c.json({ error: "Sem permissão" }, 403); const parsed = z.object({ email: z.string().email(), role: z.enum(roles).default("MEMBER") }).safeParse(await c.req.json().catch(() => null)); if (!parsed.success) return c.json({ error: "Convite inválido" }, 400); const [target] = await db.select({ id: user.id }).from(user).where(eq(user.email, parsed.data.email)); if (!target) return c.json({ error: "Usuário ainda não possui conta no AdotaPerto" }, 404); if (await getOrganizationMembership(id, target.id)) return c.json({ error: "Usuário já faz parte da organização" }, 409); try { const [invite] = await db.insert(organizationInvitation).values({ id: crypto.randomUUID(), organizationId: id, invitedUserId: target.id, invitedBy: current.id, role: parsed.data.role }).returning(); return c.json(invite, 201); } catch { return c.json({ error: "Já existe um convite pendente" }, 409); } });
organizationRoutes.patch("/:id/members/:userId", async (c) => { const current = c.get("user"); if (!current) return c.json({ error: "Não autorizado" }, 401); const id = c.req.param("id"); const manager = await canManageOrganization(id, current.id); if (!manager || manager.role !== "OWNER") return c.json({ error: "Apenas o proprietário pode alterar permissões" }, 403); const parsed = z.object({ role: z.enum(roles) }).safeParse(await c.req.json().catch(() => null)); if (!parsed.success) return c.json({ error: "Papel inválido" }, 400); const [updated] = await db.update(organizationMember).set({ role: parsed.data.role, updatedAt: new Date() }).where(and(eq(organizationMember.organizationId, id), eq(organizationMember.userId, c.req.param("userId")), ne(organizationMember.role, "OWNER"))).returning(); return updated ? c.json(updated) : c.json({ error: "Membro não encontrado ou protegido" }, 404); });
organizationRoutes.delete("/:id/members/:userId", async (c) => { const current = c.get("user"); if (!current) return c.json({ error: "Não autorizado" }, 401); const id = c.req.param("id"); if (!await canManageOrganization(id, current.id)) return c.json({ error: "Sem permissão" }, 403); const [removed] = await db.update(organizationMember).set({ status: "REMOVED", updatedAt: new Date() }).where(and(eq(organizationMember.organizationId, id), eq(organizationMember.userId, c.req.param("userId")), ne(organizationMember.role, "OWNER"))).returning(); return removed ? c.json({ success: true }) : c.json({ error: "Proprietário não pode ser removido" }, 409); });

async function answerInvitation(c: any, status: "ACTIVE" | "REMOVED") { const current = c.get("user"); if (!current) return c.json({ error: "Não autorizado" }, 401); const id = c.req.param("id"); return db.transaction(async (tx) => { const [invite] = await tx.select().from(organizationInvitation).where(and(eq(organizationInvitation.id, id), eq(organizationInvitation.invitedUserId, current.id), eq(organizationInvitation.status, "PENDING"))); if (!invite) return c.json({ error: "Convite não encontrado" }, 404); await tx.update(organizationInvitation).set({ status: status === "ACTIVE" ? "ACCEPTED" : "DECLINED", updatedAt: new Date() }).where(eq(organizationInvitation.id, id)); if (status === "ACTIVE") await tx.insert(organizationMember).values({ id: crypto.randomUUID(), organizationId: invite.organizationId, userId: current.id, role: invite.role, status: "ACTIVE" }).onConflictDoUpdate({ target: [organizationMember.organizationId, organizationMember.userId], set: { role: invite.role, status: "ACTIVE", updatedAt: new Date() } }); return c.json({ success: true }); }); }
organizationInvitationRoutes.post("/:id/accept", (c) => answerInvitation(c, "ACTIVE"));
organizationInvitationRoutes.post("/:id/decline", (c) => answerInvitation(c, "REMOVED"));
