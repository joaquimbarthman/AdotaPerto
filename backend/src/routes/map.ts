import { eq } from "drizzle-orm";
import { Hono } from "hono";
import { db } from "../../lib/db/index.ts";
import { animal, donationItem, user } from "../../lib/db/schemas/index.ts";
import {
  approximatePoint,
  geocode,
  nearbyPlaces,
  type MapCategory,
} from "../services/map-services.ts";
import type { AuthContext } from "./index.ts";

export const mapRoutes = new Hono<AuthContext>();

mapRoutes.get("/geocode", async (c) => {
  const query = c.req.query("q")?.trim();
  if (!query)
    return c.json({ error: "Informe uma cidade, bairro ou CEP." }, 400);
  try {
    const result = await geocode(query);
    return result
      ? c.json(result)
      : c.json({ error: "Local não encontrado." }, 404);
  } catch {
    return c.json(
      { error: "Serviço de busca indisponível. Tente novamente." },
      503,
    );
  }
});

mapRoutes.get("/listings", async (c) => {
  try {
    const animals = await db
      .select({
        id: animal.id,
        name: animal.name,
        image: animal.image,
        description: animal.description,
        breed: animal.breed,
        age: animal.age,
        zipCode: user.zipCode,
        city: user.city,
        state: user.state,
      })
      .from(animal)
      .innerJoin(user, eq(animal.userId, user.id))
      .where(eq(animal.status, "Disponível"));
    const items = await db
      .select({
        id: donationItem.id,
        name: donationItem.title,
        image: donationItem.mainImage,
        description: donationItem.description,
        itemCategory: donationItem.category,
        zipCode: user.zipCode,
        city: user.city,
        state: user.state,
      })
      .from(donationItem)
      .innerJoin(user, eq(donationItem.userId, user.id))
      .where(eq(donationItem.status, "Disponível"));

    const rows = [
      ...animals.map((entry) => ({
        ...entry,
        category: "adoption" as const,
        href: `/adocao/${entry.id}`,
      })),
      ...items.map((entry) => ({
        ...entry,
        category: "donation" as const,
        href: `/itens/${entry.id}`,
      })),
    ].filter((entry) => entry.zipCode || entry.city || entry.state);
    const regions = new Map<string, Awaited<ReturnType<typeof geocode>>>();
    await Promise.all(
      [
        ...new Set(
          rows.map((entry) =>
            [entry.zipCode, entry.city, entry.state, "Brasil"]
              .filter(Boolean)
              .join(", "),
          ),
        ),
      ].map(async (region) =>
        regions.set(region, await geocode(region).catch(() => null)),
      ),
    );
    return c.json(
      rows.flatMap((entry) => {
        const privateRegionQuery = [
          entry.zipCode,
          entry.city,
          entry.state,
          "Brasil",
        ]
          .filter(Boolean)
          .join(", ");
        const center = regions.get(privateRegionQuery);
        if (!center) return [];
        const point = approximatePoint(center.lat, center.lng, entry.id);
        return [
          {
            ...entry,
            ...point,
            region:
              [entry.city, entry.state].filter(Boolean).join(" - ") ||
              "Região aproximada",
            zipCode: undefined,
            city: undefined,
            state: undefined,
            approximate: true,
          },
        ];
      }),
    );
  } catch (error) {
    const cause = error instanceof Error && error.cause ? error.cause : error;
    const code =
      typeof cause === "object" && cause !== null && "code" in cause
        ? String(cause.code)
        : "UNKNOWN";
    const schemaMissing = code === "42P01" || code === "42703";
    console.error("[map/listings] Falha ao consultar anúncios", {
      code,
      action: schemaMissing
        ? "Confira DATABASE_URL e inicialize/atualize as tabelas do banco."
        : "Confira a conexão e os logs do banco.",
    });
    return c.json(
      {
        error: schemaMissing
          ? "Os anúncios do mapa estão indisponíveis porque o banco ainda não foi configurado."
          : "Não foi possível carregar os anúncios do mapa. Tente novamente mais tarde.",
        code: schemaMissing
          ? "MAP_DATABASE_NOT_READY"
          : "MAP_LISTINGS_UNAVAILABLE",
      },
      503,
    );
  }
});

mapRoutes.get("/places", async (c) => {
  const category = c.req.query("category") as MapCategory;
  const lat = Number(c.req.query("lat"));
  const lng = Number(c.req.query("lng"));
  if (
    !(["veterinary", "pet_shop", "shelter"] as string[]).includes(category) ||
    !Number.isFinite(lat) ||
    !Number.isFinite(lng)
  )
    return c.json({ error: "Consulta inválida." }, 400);
  try {
    return c.json(await nearbyPlaces(category, lat, lng));
  } catch {
    return c.json(
      { error: "Não foi possível consultar estabelecimentos agora." },
      503,
    );
  }
});
