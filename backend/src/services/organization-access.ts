import { and, eq } from "drizzle-orm";
import { db } from "../../lib/db/index.ts";
import { member } from "../../lib/db/schemas/index.ts";

export async function organizationMembership(userId: string, organizationId: string) {
  const [membership] = await db
    .select({ role: member.role })
    .from(member)
    .where(and(eq(member.userId, userId), eq(member.organizationId, organizationId)))
    .limit(1);
  return membership ?? null;
}

export function canManageOrganization(role: string) {
  return role.split(",").some((value) => value === "owner" || value === "admin");
}
