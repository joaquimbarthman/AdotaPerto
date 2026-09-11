import { and, desc, eq } from "drizzle-orm";
import { Hono } from "hono";
import crypto from "node:crypto";
import { db } from "../../lib/db/index.ts";
import {
  animal,
  donationItem,
  donationItemFavorite,
  favorite,
} from "../../lib/db/schemas/index.ts";
import type { AuthContext } from "./index.ts";

export const favoriteRoutes = new Hono<AuthContext>();

favoriteRoutes.get("/items", async (c) => {
  const currentUser = c.get("user");
  if (!currentUser) return c.json({ error: "Não autorizado" }, 401);
  return c.json(
    await db
      .select({
        id: donationItemFavorite.id,
        createdAt: donationItemFavorite.createdAt,
        item: donationItem,
      })
      .from(donationItemFavorite)
      .innerJoin(donationItem, eq(donationItemFavorite.itemId, donationItem.id))
      .where(eq(donationItemFavorite.userId, currentUser.id))
      .orderBy(desc(donationItemFavorite.createdAt)),
  );
});

favoriteRoutes.get("/items/check/:itemId", async (c) => {
  const currentUser = c.get("user");
  if (!currentUser) return c.json({ error: "Não autorizado" }, 401);
  const [item] = await db
    .select({ id: donationItemFavorite.id })
    .from(donationItemFavorite)
    .where(
      and(
        eq(donationItemFavorite.userId, currentUser.id),
        eq(donationItemFavorite.itemId, c.req.param("itemId")),
      ),
    );
  return c.json({ favorite: Boolean(item) });
});

favoriteRoutes.post("/items/:itemId", async (c) => {
  const currentUser = c.get("user");
  if (!currentUser) return c.json({ error: "Não autorizado" }, 401);
  const itemId = c.req.param("itemId");
  const [existingItem] = await db
    .select({ id: donationItem.id })
    .from(donationItem)
    .where(eq(donationItem.id, itemId));
  if (!existingItem) return c.json({ error: "Item não encontrado" }, 404);
  const [existing] = await db
    .select()
    .from(donationItemFavorite)
    .where(
      and(
        eq(donationItemFavorite.userId, currentUser.id),
        eq(donationItemFavorite.itemId, itemId),
      ),
    );
  if (existing) return c.json(existing);
  const [created] = await db
    .insert(donationItemFavorite)
    .values({ id: crypto.randomUUID(), userId: currentUser.id, itemId })
    .returning();
  return c.json(created, 201);
});

favoriteRoutes.delete("/items/:itemId", async (c) => {
  const currentUser = c.get("user");
  if (!currentUser) return c.json({ error: "Não autorizado" }, 401);
  const [removed] = await db
    .delete(donationItemFavorite)
    .where(
      and(
        eq(donationItemFavorite.userId, currentUser.id),
        eq(donationItemFavorite.itemId, c.req.param("itemId")),
      ),
    )
    .returning({ id: donationItemFavorite.id });
  if (!removed) return c.json({ error: "Favorito não encontrado" }, 404);
  return c.json({ success: true });
});

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

  const [existingAnimal] = await db
    .select()
    .from(animal)
    .where(eq(animal.id, animalId));
  if (!existingAnimal) {
    return c.json({ error: "Animal não encontrado" }, 404);
  }

  const [existingFavorite] = await db
    .select()
    .from(favorite)
    .where(
      and(eq(favorite.userId, currentUser.id), eq(favorite.animalId, animalId)),
    );

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
    .where(
      and(eq(favorite.userId, currentUser.id), eq(favorite.animalId, animalId)),
    )
    .returning({ id: favorite.id });

  if (!removed) {
    return c.json({ error: "Favorito não encontrado" }, 404);
  }

  return c.json({ success: true, message: "Removido dos favoritos" });
});
