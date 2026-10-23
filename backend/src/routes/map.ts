import { and, eq, inArray } from "drizzle-orm";
import { Hono } from "hono";
import { db } from "../../lib/db/index.ts";
import { animal, donationItem, organization, organizationNeed, user } from "../../lib/db/schemas/index.ts";
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
  } catch (error) {
    console.warn("[map/geocode] Serviço externo indisponível", error instanceof Error ? error.message : "erro desconhecido");
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
    const needs = await db.select({
      id: organizationNeed.id, name: organizationNeed.title, image: organizationNeed.mainImage,
      description: organizationNeed.description, itemCategory: organizationNeed.category,
      zipCode: organization.postalCode, city: organization.city, state: organization.state,
    }).from(organizationNeed).innerJoin(organization, eq(organizationNeed.organizationId, organization.id))
      .where(and(eq(organizationNeed.status, "Ativa"), eq(organization.verificationStatus, "VERIFIED")));
    const organizations = await db
      .select({
        id: organization.id,
        name: organization.name,
        image: organization.logoUrl,
        description: organization.description,
        postalCode: organization.postalCode,
        street: organization.street,
        number: organization.number,
        neighborhood: organization.neighborhood,
        city: organization.city,
        state: organization.state,
        phone: organization.whatsapp,
        email: organization.contactEmail,
        website: organization.website,
      })
      .from(organization)
      .where(inArray(organization.verificationStatus, ["PENDING", "VERIFIED"]));

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
      ...needs.map((entry) => ({
        ...entry,
        category: "donation" as const,
        href: `/necessidades/${entry.id}`,
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
    const listingPoints = rows.flatMap((entry) => {
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
      });
    const organizationPoints = await Promise.all(organizations.filter((org) => org.city && org.state).map(async (org) => {
      const address = [org.street, org.number, org.neighborhood, org.city, org.state].filter(Boolean).join(", ");
      const cityQuery = [org.city, org.state, "Brasil"].join(", ");
      const precise = Boolean(org.street && org.number);
      const point = precise ? await geocode(`${address}, Brasil`).catch(() => null) : null;
      const location = point || (org.postalCode ? await geocode(org.postalCode).catch(() => null) : null) || await geocode(cityQuery).catch(() => null);
      if (!location) return null;
      const coordinates = point ? { lat: point.lat, lng: point.lng } : approximatePoint(location.lat, location.lng, org.id);
      return {
        id: `organization-${org.id}`,
        category: "shelter" as const,
        name: org.name,
        image: org.image,
        description: org.description,
        ...coordinates,
        address: point ? address : null,
        region: [org.city, org.state].join(" - "),
        approximate: !point,
        phone: org.phone || null,
        email: org.email,
        website: org.website,
        mapsUrl: point ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${address}, Brasil`)}` : null,
      };
    }));
    return c.json([...listingPoints, ...organizationPoints.filter((point) => point !== null)]);
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
  } catch (error) {
    console.warn("[map/places] Provedores externos indisponíveis", error instanceof Error ? error.message : "erro desconhecido");
    return c.json(
      { error: "Não foi possível consultar estabelecimentos agora." },
      503,
    );
  }
});
