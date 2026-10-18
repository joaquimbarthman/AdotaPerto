import { Hono } from "hono";
import crypto from "node:crypto";
import {
  downloadImage,
  ensureImageBucket,
  imageStorageConfigured,
  publicImageUrl,
  uploadImage,
} from "../../lib/storage/index.ts";
import type { AuthContext } from "./index.ts";

const allowedTypes = new Map([
  ["image/jpeg", "jpg"],
  ["image/png", "png"],
  ["image/webp", "webp"],
]);
const maxFileSize = 5 * 1024 * 1024;
const maxFiles = 6;

export const uploadRoutes = new Hono<AuthContext>();

uploadRoutes.get("/images/:userId/:fileName", async (c) => {
  if (!imageStorageConfigured) {
    return c.json({ error: "Armazenamento de imagens indisponível" }, 503);
  }
  const objectName = `${c.req.param("userId")}/${c.req.param("fileName")}`;

  try {
    const { body: image, contentType } = await downloadImage(objectName);

    return new Response(image, {
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=31536000, immutable",
        "Content-Length": String(image.length),
      },
    });
  } catch {
    return c.json({ error: "Imagem não encontrada" }, 404);
  }
});

uploadRoutes.post("/images", async (c) => {
  if (!imageStorageConfigured) {
    return c.json({ error: "Armazenamento de imagens indisponível" }, 503);
  }
  const currentUser = c.get("user");
  if (!currentUser) {
    return c.json({ error: "Não autorizado" }, 401);
  }

  const formData = await c.req.formData().catch(() => null);
  if (!formData) {
    return c.json({ error: "Formulário de upload inválido" }, 400);
  }

  const files = formData
    .getAll("files")
    .filter((value): value is File => value instanceof File);
  if (files.length === 0 || files.length > maxFiles) {
    return c.json({ error: `Envie entre 1 e ${maxFiles} imagens` }, 400);
  }

  for (const file of files) {
    if (!allowedTypes.has(file.type)) {
      return c.json({ error: "Formato inválido. Use JPG, PNG ou WebP" }, 400);
    }
    if (file.size > maxFileSize) {
      return c.json({ error: "Cada imagem deve ter no máximo 5 MB" }, 400);
    }
  }

  await ensureImageBucket();

  const urls = await Promise.all(
    files.map(async (file) => {
      const extension = allowedTypes.get(file.type)!;
      const objectName = `${currentUser.id}/${crypto.randomUUID()}.${extension}`;
      const buffer = Buffer.from(await file.arrayBuffer());
      await uploadImage(objectName, buffer, file.type);
      return publicImageUrl(objectName);
    }),
  );

  return c.json({ urls }, 201);
});
