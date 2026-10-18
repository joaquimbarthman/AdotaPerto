import "dotenv/config";
import { readFile } from "node:fs/promises";
import { Client } from "minio";

const supabaseUrl = process.env.SUPABASE_URL?.trim().replace(/\/+$/, "");
const supabaseKey = process.env.SUPABASE_SECRET_KEY?.trim() || process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();
const supabaseStorageUrl = supabaseUrl ? `${supabaseUrl}/storage/v1` : "";

export const imageBucket =
  process.env.SUPABASE_STORAGE_BUCKET ||
  process.env.RUSTFS_BUCKET ||
  process.env.MINIO_BUCKET ||
  "adotaperto-images";

const minioEndpoint = (process.env.RUSTFS_ENDPOINT || process.env.MINIO_ENDPOINT || "")
  .trim();
const minioAccessKey = process.env.RUSTFS_ACCESS_KEY || process.env.MINIO_ROOT_USER;
const minioSecretKey = process.env.RUSTFS_SECRET_KEY || process.env.MINIO_ROOT_PASSWORD;
const minioEndpointLooksLikePlaceholder = /[<>]/.test(minioEndpoint);

let minio: Client | null = null;
if (
  !supabaseUrl && minioEndpoint && minioAccessKey && minioSecretKey &&
  !minioEndpointLooksLikePlaceholder
) {
  try {
    minio = new Client({
      endPoint: minioEndpoint,
      port: Number(process.env.RUSTFS_API_PORT || process.env.MINIO_API_PORT || 9000),
      useSSL: (process.env.RUSTFS_USE_SSL || process.env.MINIO_USE_SSL) === "true",
      accessKey: minioAccessKey,
      secretKey: minioSecretKey,
    });
  } catch {
    console.warn("Endpoint do armazenamento MinIO inválido; uploads indisponíveis.");
  }
}

export const imageStorageConfigured = Boolean(
  (supabaseUrl && supabaseKey) || minio,
);

if (!imageStorageConfigured) {
  console.warn(
    "Configure SUPABASE_URL e SUPABASE_SECRET_KEY (ou SUPABASE_SERVICE_ROLE_KEY legado) para habilitar imagens no deploy.",
  );
}

type SupabaseListEntry = {
  name: string;
  id: string | null;
};

function bucketPath() {
  return encodeURIComponent(imageBucket);
}

function objectPath(objectName: string) {
  return objectName.split("/").map(encodeURIComponent).join("/");
}

function supabaseHeaders(extra?: HeadersInit) {
  if (!supabaseKey) throw new Error("SUPABASE_SECRET_KEY ou SUPABASE_SERVICE_ROLE_KEY não configurada.");
  return new Headers({
    apikey: supabaseKey,
    ...(supabaseKey.startsWith("sb_secret_") ? {} : { Authorization: `Bearer ${supabaseKey}` }),
    ...Object.fromEntries(new Headers(extra).entries()),
  });
}

async function supabaseRequest(path: string, init: RequestInit = {}) {
  if (!supabaseUrl || !supabaseKey) {
    throw new Error("Configure SUPABASE_URL e SUPABASE_SECRET_KEY (ou SUPABASE_SERVICE_ROLE_KEY legado).");
  }
  const response = await fetch(`${supabaseStorageUrl}${path}`, {
    ...init,
    headers: supabaseHeaders(init.headers),
  });
  return response;
}

async function responseError(response: Response, action: string) {
  const detail = (await response.text()).slice(0, 500);
  return new Error(
    `Supabase Storage ${action} falhou (${response.status})${detail ? `: ${detail}` : ""}`,
  );
}

async function ensureSupabaseBucket() {
  const bucketUrl = `/bucket/${bucketPath()}`;
  const existing = await supabaseRequest(bucketUrl);
  if (existing.ok) return;
  if (existing.status !== 404) throw await responseError(existing, "consultar bucket");

  const created = await supabaseRequest("/bucket", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ id: imageBucket, name: imageBucket, public: false }),
  });
  if (!created.ok && created.status !== 409) {
    throw await responseError(created, "criar bucket");
  }
}

let bucketPromise: Promise<void> | null = null;
export function ensureImageBucket() {
  if (!imageStorageConfigured) {
    return Promise.reject(
      new Error("Configure o armazenamento de imagens do Supabase no ambiente da API."),
    );
  }

  bucketPromise ??= (async () => {
    if (supabaseUrl) {
      await ensureSupabaseBucket();
      return;
    }
    if (minio && !(await minio.bucketExists(imageBucket))) {
      try {
        await minio.makeBucket(imageBucket);
      } catch (error) {
        if ((error as { code?: string }).code !== "BucketAlreadyOwnedByYou") throw error;
      }
    }
  })().catch((error) => {
    bucketPromise = null;
    throw error;
  });

  return bucketPromise;
}

export async function checkImageBucket() {
  if (!imageStorageConfigured) return false;
  if (supabaseUrl) {
    const response = await supabaseRequest(`/bucket/${bucketPath()}`);
    return response.ok;
  }
  return Boolean(minio && await minio.bucketExists(imageBucket));
}

export async function uploadImage(
  objectName: string,
  contents: Buffer,
  contentType: string,
  upsert = false,
) {
  if (supabaseUrl) {
    const response = await supabaseRequest(
      `/object/${bucketPath()}/${objectPath(objectName)}`,
      {
        method: "POST",
        headers: {
          "Content-Type": contentType,
          "Cache-Control": "max-age=31536000",
          "x-upsert": String(upsert),
        },
        body: new Uint8Array(contents),
      },
    );
    if (!response.ok) throw await responseError(response, "enviar imagem");
    return;
  }

  if (!minio) throw new Error("Armazenamento de imagens não configurado.");
  await minio.putObject(imageBucket, objectName, contents, contents.length, {
    "Content-Type": contentType,
    "Cache-Control": "public, max-age=31536000, immutable",
  });
}

export async function uploadImageFile(
  objectName: string,
  filePath: string,
  contentType: string,
  upsert = false,
) {
  await uploadImage(objectName, await readFile(filePath), contentType, upsert);
}

export async function downloadImage(objectName: string) {
  if (supabaseUrl) {
    const response = await supabaseRequest(
      `/object/authenticated/${bucketPath()}/${objectPath(objectName)}`,
    );
    if (!response.ok) throw await responseError(response, "baixar imagem");
    return {
      body: Buffer.from(await response.arrayBuffer()),
      contentType: response.headers.get("content-type") || "application/octet-stream",
    };
  }

  if (!minio) throw new Error("Armazenamento de imagens não configurado.");
  const [stream, stat] = await Promise.all([
    minio.getObject(imageBucket, objectName),
    minio.statObject(imageBucket, objectName),
  ]);
  const chunks: Buffer[] = [];
  for await (const chunk of stream) {
    chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
  }
  return {
    body: Buffer.concat(chunks),
    contentType: stat.metaData?.["content-type"] || "application/octet-stream",
  };
}

async function listSupabaseFiles(directory: string): Promise<string[]> {
  const files: string[] = [];
  const folders: string[] = [];
  const limit = 1000;
  let offset = 0;

  while (true) {
    const response = await supabaseRequest(`/object/list/${bucketPath()}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        prefix: directory,
        limit,
        offset,
        sortBy: { column: "name", order: "asc" },
      }),
    });
    if (!response.ok) throw await responseError(response, "listar imagens");
    const entries = await response.json() as SupabaseListEntry[];

    for (const entry of entries) {
      const name = directory ? `${directory}/${entry.name}` : entry.name;
      if (entry.id === null) folders.push(name);
      else files.push(name);
    }

    if (entries.length < limit) break;
    offset += entries.length;
  }

  for (const folder of folders) files.push(...await listSupabaseFiles(folder));
  return files;
}

export async function removeStorageObjects(prefix?: string) {
  if (!imageStorageConfigured) return;

  if (supabaseUrl) {
    const directory = prefix?.replace(/^\/+|\/+$/g, "") || "";
    const objectNames = await listSupabaseFiles(directory);
    for (let offset = 0; offset < objectNames.length; offset += 100) {
      const response = await supabaseRequest(`/object/${bucketPath()}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prefixes: objectNames.slice(offset, offset + 100) }),
      });
      if (!response.ok) throw await responseError(response, "remover imagens");
    }
    return;
  }

  if (!minio || !(await minio.bucketExists(imageBucket))) return;
  let objectNames: string[] = [];

  async function removeBatch() {
    const responses = await minio!.removeObjects(imageBucket, objectNames);
    const failure = responses.find((response) => response?.Error);
    if (failure?.Error) {
      throw new Error(
        `Falha ao remover objeto do storage: ${failure.Error.Code || "erro desconhecido"}`,
      );
    }
    objectNames = [];
  }

  for await (const object of minio.listObjectsV2(imageBucket, prefix, true)) {
    if (!object.name) continue;
    objectNames.push(object.name);
    if (objectNames.length === 1000) await removeBatch();
  }
  if (objectNames.length > 0) await removeBatch();
}

export function publicImageUrl(objectName: string) {
  const apiBaseUrl =
    process.env.BETTER_AUTH_URL ||
    process.env.RENDER_EXTERNAL_URL ||
    "http://localhost:4000";
  return `${apiBaseUrl}/api/uploads/images/${objectName}`;
}
