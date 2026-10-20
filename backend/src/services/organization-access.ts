import { and, eq } from "drizzle-orm";
import { db } from "../../lib/db/index.ts";
import { organizationMember } from "../../lib/db/schemas/index.ts";

export type OrganizationRole = "OWNER" | "ADMIN" | "MEMBER";
export async function getOrganizationMembership(organizationId: string, userId: string) {
  const [membership] = await db.select().from(organizationMember).where(and(eq(organizationMember.organizationId, organizationId), eq(organizationMember.userId, userId), eq(organizationMember.status, "ACTIVE")));
  return membership ?? null;
}
export async function canPublishForOrganization(organizationId: string, userId: string) {
  return Boolean(await getOrganizationMembership(organizationId, userId));
}
export async function canManageOrganization(organizationId: string, userId: string) {
  const membership = await getOrganizationMembership(organizationId, userId);
  return membership && ["OWNER", "ADMIN"].includes(membership.role) ? membership : null;
}
export async function canDecideForOrganization(organizationId: string, userId: string) {
  return canManageOrganization(organizationId, userId);
}
