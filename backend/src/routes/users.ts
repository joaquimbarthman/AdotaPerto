import { eq } from "drizzle-orm";
import { Hono } from "hono";
import { z } from "zod";
import { db } from "../../lib/db/index.ts";
import { user } from "../../lib/db/schemas/index.ts";
import type { AuthContext } from "./index.ts";

export const userRoutes = new Hono<AuthContext>();

const updateUserSchema = z.object({
  name: z.string().trim().min(1).max(120).optional(),
  nome: z.string().trim().min(1).max(120).optional(),
  image: z.string().trim().nullable().optional(),
  foto: z.string().trim().nullable().optional(),
  birthDate: z.string().trim().nullable().optional(),
  nascimento: z.string().trim().nullable().optional(),
  bio: z.string().max(300).nullable().optional(),
  zipCode: z.string().trim().max(20).nullable().optional(),
  cep: z.string().trim().max(20).nullable().optional(),
  street: z.string().trim().max(200).nullable().optional(),
  rua: z.string().trim().max(200).nullable().optional(),
  city: z.string().trim().max(120).nullable().optional(),
  cidade: z.string().trim().max(120).nullable().optional(),
  state: z.string().trim().max(120).nullable().optional(),
  estado: z.string().trim().max(120).nullable().optional(),
});

userRoutes.get("/me", async (c) => {
  const currentUser = c.get("user");
  if (!currentUser) {
    return c.json({ error: "Não autorizado" }, 401);
  }

  const [userData] = await db.select().from(user).where(eq(user.id, currentUser.id));
  if (!userData) {
    return c.json({ error: "Usuário não encontrado" }, 404);
  }

  return c.json(userData);
});

userRoutes.get("/:id", async (c) => {
  const id = c.req.param("id");
  const [userData] = await db
    .select({
      id: user.id,
      name: user.name,
      image: user.image,
      bio: user.bio,
      city: user.city,
      state: user.state,
      createdAt: user.createdAt,
    })
    .from(user)
    .where(eq(user.id, id));

  if (!userData) {
    return c.json({ error: "Usuário não encontrado" }, 404);
  }

  return c.json(userData);
});

userRoutes.put("/me", async (c) => {
  const currentUser = c.get("user");
  if (!currentUser) {
    return c.json({ error: "Não autorizado" }, 401);
  }

  const parsed = updateUserSchema.safeParse(await c.req.json().catch(() => null));
  if (!parsed.success) {
    return c.json({ error: "Dados do usuário inválidos", details: parsed.error.flatten() }, 400);
  }

  const body = parsed.data;
  const values = {
    name: body.name ?? body.nome,
    image: body.image ?? body.foto,
    birthDate: body.birthDate ?? body.nascimento,
    bio: body.bio,
    zipCode: body.zipCode ?? body.cep,
    street: body.street ?? body.rua,
    city: body.city ?? body.cidade,
    state: body.state ?? body.estado,
  };

  if (!Object.values(values).some((value) => value !== undefined)) {
    return c.json({ error: "Nenhum campo válido para atualizar" }, 400);
  }

  const [updated] = await db
    .update(user)
    .set({
      ...values,
      updatedAt: new Date(),
    })
    .where(eq(user.id, currentUser.id))
    .returning();

  return c.json(updated);
});

userRoutes.delete("/me", async (c) => {
  const currentUser = c.get("user");
  if (!currentUser) {
    return c.json({ error: "Não autorizado" }, 401);
  }

  const [removed] = await db
    .delete(user)
    .where(eq(user.id, currentUser.id))
    .returning({ id: user.id });

  if (!removed) {
    return c.json({ error: "Usuário não encontrado" }, 404);
  }
  return c.json({ success: true, message: "Conta excluída com sucesso" });
});
