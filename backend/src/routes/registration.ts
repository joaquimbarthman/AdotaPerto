import { Hono } from "hono";
import { db } from "../../lib/db/index.ts";
import { user } from "../../lib/db/schemas/user.ts";

export const registrationRoutes = new Hono();

registrationRoutes.get("/status", async (c) => {
  c.header("Cache-Control", "no-store");
  try {
    const [existingUser] = await db.select({ id: user.id }).from(user).limit(1);
    return c.json({ isFirstUser: !existingUser });
  } catch {
    return c.json({ error: "Não foi possível verificar o cadastro." }, 503);
  }
});
