import { eq } from "drizzle-orm";
import { db } from "../../lib/db/index.ts";
import { user } from "../../lib/db/schemas/index.ts";

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
