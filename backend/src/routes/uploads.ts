import crypto from "node:crypto";
import { Hono } from "hono";
import { ensureImageBucket, imageBucket, publicImageUrl, storage } from "../../lib/storage/index.ts";
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
  const objectName = `${c.req.param("userId")}/${c.req.param("fileName")}`;

  try {
    const [stream, stat] = await Promise.all([
      storage.getObject(imageBucket, objectName),
      storage.statObject(imageBucket, objectName),
    ]);
    const chunks: Buffer[] = [];
    for await (const chunk of stream) {
      chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
    }
    const image = Buffer.concat(chunks);

    return new Response(image, {
      headers: {
        "Content-Type": stat.metaData?.["content-type"] || "application/octet-stream",
        "Cache-Control": "public, max-age=31536000, immutable",
        "Content-Length": String(image.length),
      },
    });
  } catch {
    return c.json({ error: "Imagem não encontrada" }, 404);
  }
});

uploadRoutes.post("/images", async (c) => {
  const currentUser = c.get("user");
  if (!currentUser) {
    return c.json({ error: "Não autorizado" }, 401);
  }

  const formData = await c.req.formData().catch(() => null);
  if (!formData) {
    return c.json({ error: "Formulário de upload inválido" }, 400);
  }

  const files = formData.getAll("files").filter((value): value is File => value instanceof File);
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
      await storage.putObject(imageBucket, objectName, buffer, buffer.length, {
        "Content-Type": file.type,
        "Cache-Control": "public, max-age=31536000, immutable",
      });
      return publicImageUrl(objectName);
    }),
  );

  return c.json({ urls }, 201);
});
