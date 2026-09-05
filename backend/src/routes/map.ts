import { eq } from "drizzle-orm";
import { Hono } from "hono";
import { db } from "../../lib/db/index.ts";
import { animal, donationItem, user } from "../../lib/db/schemas/index.ts";
import { approximatePoint, geocode, nearbyPlaces, type MapCategory } from "../services/map-services.ts";
import type { AuthContext } from "./index.ts";

export const mapRoutes = new Hono<AuthContext>();

mapRoutes.get("/tiles/:theme/:z/:x/:y", async (c) => {
  const theme = c.req.param("theme");
  const z = c.req.param("z");
  const x = c.req.param("x");
  const y = c.req.param("y").replace(/\.png$/, "");
  if (!(["light", "dark"] as string[]).includes(theme) || !/^\d+$/.test(z) || !/^\d+$/.test(x) || !/^\d+$/.test(y)) return c.json({ error: "Tile inválido." }, 400);

  const apiKey = process.env.CARTO_API_KEY || process.env.NEXT_PUBLIC_CARTO_API_KEY;
  if (!apiKey) return c.json({ error: "CARTO_API_KEY não configurada no backend." }, 503);
  // Keep geographic labels available; the frontend palette still reduces
  // their visual weight so markers remain the main focus.
  const style = theme === "dark" ? "dark_all" : "light_all";
  const upstream = `https://a.basemaps.cartocdn.com/rastertiles/${style}/${z}/${x}/${y}.png?key=${encodeURIComponent(apiKey)}`;
  try {
    const response = await fetch(upstream, { headers: { "User-Agent": "AdotaPerto-TCC/1.0" } });
    if (!response.ok) return c.json({ error: "Tile indisponível." }, response.status === 404 ? 404 : 502);
    return new Response(response.body, {
      status: 200,
      headers: {
        "Content-Type": response.headers.get("content-type") || "image/png",
        "Cache-Control": response.headers.get("cache-control") || "public, max-age=86400",
      },
    });
  } catch {
    return c.json({ error: "Serviço de mapas indisponível." }, 502);
  }
});

mapRoutes.get("/geocode", async (c) => {
  const query = c.req.query("q")?.trim();
  if (!query) return c.json({ error: "Informe uma cidade, bairro ou CEP." }, 400);
  try {
    const result = await geocode(query);
    return result ? c.json(result) : c.json({ error: "Local não encontrado." }, 404);
  } catch {
    return c.json({ error: "Serviço de busca indisponível. Tente novamente." }, 503);
  }
});

mapRoutes.get("/listings", async (c) => {
  const animals = await db.select({ id: animal.id, name: animal.name, image: animal.image, description: animal.description, breed: animal.breed, age: animal.age, zipCode: user.zipCode, city: user.city, state: user.state })
    .from(animal).innerJoin(user, eq(animal.userId, user.id)).where(eq(animal.status, "Disponível"));
  const items = await db.select({ id: donationItem.id, name: donationItem.title, image: donationItem.mainImage, description: donationItem.description, itemCategory: donationItem.category, zipCode: user.zipCode, city: user.city, state: user.state })
    .from(donationItem).innerJoin(user, eq(donationItem.userId, user.id)).where(eq(donationItem.status, "Disponível"));

  const rows = [...animals.map((entry) => ({ ...entry, category: "adoption" as const, href: `/adocao/${entry.id}` })), ...items.map((entry) => ({ ...entry, category: "donation" as const, href: `/itens/${entry.id}` }))]
    .filter((entry) => entry.zipCode || entry.city || entry.state);
  const regions = new Map<string, Awaited<ReturnType<typeof geocode>>>();
  await Promise.all([...new Set(rows.map((entry) => [entry.zipCode, entry.city, entry.state, "Brasil"].filter(Boolean).join(", ")))].map(async (region) => regions.set(region, await geocode(region).catch(() => null))));
  return c.json(rows.flatMap((entry) => {
    const privateRegionQuery = [entry.zipCode, entry.city, entry.state, "Brasil"].filter(Boolean).join(", ");
    const center = regions.get(privateRegionQuery);
    if (!center) return [];
    const point = approximatePoint(center.lat, center.lng, entry.id);
    return [{ ...entry, ...point, region: [entry.city, entry.state].filter(Boolean).join(" - ") || "Região aproximada", zipCode: undefined, city: undefined, state: undefined, approximate: true }];
  }));
});

mapRoutes.get("/places", async (c) => {
  const category = c.req.query("category") as MapCategory;
  const lat = Number(c.req.query("lat"));
  const lng = Number(c.req.query("lng"));
  if (!(["veterinary", "pet_shop", "shelter"] as string[]).includes(category) || !Number.isFinite(lat) || !Number.isFinite(lng)) return c.json({ error: "Consulta inválida." }, 400);
  try { return c.json(await nearbyPlaces(category, lat, lng)); }
  catch { return c.json({ error: "Não foi possível consultar estabelecimentos agora." }, 503); }
});
