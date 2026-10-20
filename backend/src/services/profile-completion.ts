import { eq } from "drizzle-orm";
import { db } from "../../lib/db/index.ts";
import { organization, organizationMember, user } from "../../lib/db/schemas/index.ts";

export const PROFILE_ADDRESS_REQUIRED = "PROFILE_ADDRESS_REQUIRED";

export async function hasCompleteAddress(userId: string) {
  const [profile] = await db
    .select({
      zipCode: user.zipCode,
      street: user.street,
      city: user.city,
      state: user.state,
    })
    .from(user)
    .where(eq(user.id, userId))
    .limit(1);

  if (!profile) return false;
  return [profile.zipCode, profile.street, profile.city, profile.state].every(
    (value) => Boolean(value?.trim()),
  );
}

export async function hasCompleteAccountAddress(userId: string) {
  const [account] = await db.select({ accountType: user.accountType }).from(user).where(eq(user.id, userId)).limit(1);
  if (account?.accountType !== "ORGANIZATION") return hasCompleteAddress(userId);
  const [institution] = await db.select({ postalCode: organization.postalCode, street: organization.street, city: organization.city, state: organization.state }).from(organizationMember).innerJoin(organization, eq(organizationMember.organizationId, organization.id)).where(eq(organizationMember.userId, userId)).limit(1);
  return Boolean(institution && [institution.postalCode, institution.street, institution.city, institution.state].every((value) => Boolean(value?.trim())));
}
