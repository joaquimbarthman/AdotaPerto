import { and, desc, eq } from "drizzle-orm";
import { Hono } from "hono";
import crypto from "node:crypto";
import { db } from "../../lib/db/index.ts";
import { animal, favorite } from "../../lib/db/schemas/index.ts";
import type { AuthContext } from "./index.ts";

export const favoriteRoutes = new Hono<AuthContext>();

favoriteRoutes.get("/", async (c) => {
  const currentUser = c.get("user");
  if (!currentUser) {
    return c.json({ error: "Não autorizado" }, 401);
  }

  const list = await db
    .select({
      id: favorite.id,
      createdAt: favorite.createdAt,
      animal: animal,
    })
    .from(favorite)
    .innerJoin(animal, eq(favorite.animalId, animal.id))
    .where(eq(favorite.userId, currentUser.id))
    .orderBy(desc(favorite.createdAt));

  return c.json(list);
});

favoriteRoutes.get("/check/:animalId", async (c) => {
  const currentUser = c.get("user");
  if (!currentUser) {
    return c.json({ error: "Não autorizado" }, 401);
  }

  const [item] = await db
    .select({ id: favorite.id })
    .from(favorite)
    .where(
      and(
        eq(favorite.userId, currentUser.id),
        eq(favorite.animalId, c.req.param("animalId")),
      ),
    );

  return c.json({ favorite: Boolean(item) });
});

favoriteRoutes.post("/:animalId", async (c) => {
  const currentUser = c.get("user");
  if (!currentUser) {
    return c.json({ error: "Não autorizado" }, 401);
  }

  const animalId = c.req.param("animalId");

  const [existingAnimal] = await db.select().from(animal).where(eq(animal.id, animalId));
  if (!existingAnimal) {
    return c.json({ error: "Animal não encontrado" }, 404);
  }

  const [existingFavorite] = await db
    .select()
    .from(favorite)
    .where(and(eq(favorite.userId, currentUser.id), eq(favorite.animalId, animalId)));

  if (existingFavorite) {
    return c.json(existingFavorite);
  }

  const [created] = await db
    .insert(favorite)
    .values({
      id: crypto.randomUUID(),
      userId: currentUser.id,
      animalId,
    })
    .returning();

  return c.json(created, 201);
});

favoriteRoutes.delete("/:animalId", async (c) => {
  const currentUser = c.get("user");
  if (!currentUser) {
    return c.json({ error: "Não autorizado" }, 401);
  }

  const animalId = c.req.param("animalId");

  const [removed] = await db
    .delete(favorite)
    .where(and(eq(favorite.userId, currentUser.id), eq(favorite.animalId, animalId)))
    .returning({ id: favorite.id });

  if (!removed) {
    return c.json({ error: "Favorito não encontrado" }, 404);
  }

  return c.json({ success: true, message: "Removido dos favoritos" });
});
