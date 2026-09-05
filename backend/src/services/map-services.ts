import crypto from "node:crypto";

export type MapCategory = "veterinary" | "pet_shop" | "shelter";

const cache = new Map<string, { expiresAt: number; value: unknown }>();

async function fetchJson<T>(url: string, init?: RequestInit, timeout = 9000): Promise<T> {
  const cached = cache.get(url);
  if (cached && cached.expiresAt > Date.now()) return cached.value as T;
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeout);
  try {
    const response = await fetch(url, { ...init, signal: controller.signal, headers: { "User-Agent": "AdotaPerto-TCC/1.0 contato@adotaperto.local", ...init?.headers } });
    if (!response.ok) throw new Error(`Serviço de localização respondeu ${response.status}`);
    const value = await response.json() as T;
    cache.set(url, { expiresAt: Date.now() + 10 * 60_000, value });
    return value;
  } finally {
    clearTimeout(timer);
  }
}

export async function geocode(query: string) {
  const candidates = [query];
  const cep = query.replace(/\D/g, "");
  if (cep.length === 8) {
    try {
      const address = await fetchJson<{ erro?: boolean; logradouro?: string; bairro?: string; localidade?: string; uf?: string }>(`https://viacep.com.br/ws/${cep}/json/`);
      if (!address.erro) {
        candidates.unshift(
          [address.logradouro, address.bairro, address.localidade, address.uf, cep, "Brasil"].filter(Boolean).join(", "),
          [address.logradouro, address.localidade, address.uf, "Brasil"].filter(Boolean).join(", "),
          [address.localidade, address.uf, "Brasil"].filter(Boolean).join(", "),
        );
      }
    } catch {
      // Nominatim can still resolve many CEPs directly, so keep the original query as fallback.
    }
  }
  for (const candidate of [...new Set(candidates)]) {
    const url = `https://nominatim.openstreetmap.org/search?format=jsonv2&limit=1&countrycodes=br&addressdetails=1&q=${encodeURIComponent(candidate)}`;
    const data = await fetchJson<Array<{ lat: string; lon: string; display_name: string }>>(url);
    if (data[0]) return { lat: Number(data[0].lat), lng: Number(data[0].lon), label: data[0].display_name };
  }
  return null;
}

export function approximatePoint(lat: number, lng: number, stableId: string) {
  const digest = crypto.createHash("sha256").update(stableId).digest();
  const angle = (digest.readUInt16BE(0) / 65535) * Math.PI * 2;
  const radiusKm = 0.45 + (digest.readUInt16BE(2) / 65535) * 1.5;
  const latOffset = (radiusKm / 111.32) * Math.sin(angle);
  const lngOffset = (radiusKm / (111.32 * Math.cos(lat * Math.PI / 180))) * Math.cos(angle);
  return { lat: lat + latOffset, lng: lng + lngOffset };
}

const overpassTags: Record<MapCategory, string> = {
  veterinary: '["amenity"="veterinary"]',
  pet_shop: '["shop"="pet"]',
  shelter: '["amenity"="animal_shelter"]',
};

export async function nearbyPlaces(category: MapCategory, lat: number, lng: number) {
  const tag = overpassTags[category];
  const query = `[out:json][timeout:12];(node${tag}(around:12000,${lat},${lng});way${tag}(around:12000,${lat},${lng});relation${tag}(around:12000,${lat},${lng}););out center tags 40;`;
  const url = `https://overpass-api.de/api/interpreter?data=${encodeURIComponent(query)}`;
  const data = await fetchJson<{ elements: Array<{ id: number; lat?: number; lon?: number; center?: { lat: number; lon: number }; tags?: Record<string, string> }> }>(url, undefined, 15000);
  return data.elements.flatMap((element) => {
    const point = element.lat != null && element.lon != null ? { lat: element.lat, lng: element.lon } : element.center ? { lat: element.center.lat, lng: element.center.lon } : null;
    if (!point || !element.tags?.name) return [];
    const tags = element.tags;
    const address = [tags["addr:street"], tags["addr:housenumber"], tags["addr:suburb"], tags["addr:city"]].filter(Boolean).join(", ");
    const image = tags.image || (tags.wikimedia_commons?.startsWith("File:") ? `https://commons.wikimedia.org/wiki/Special:Redirect/file/${encodeURIComponent(tags.wikimedia_commons.slice(5))}` : null);
    return [{
      id: `osm-${element.id}`, category, name: tags.name, ...point,
      address: address || null,
      phone: tags["contact:phone"] || tags.phone || null,
      email: tags["contact:email"] || tags.email || null,
      website: tags["contact:website"] || tags.website || null,
      description: tags.description || tags["description:pt"] || null,
      image,
      mapsUrl: `https://www.google.com/maps/search/?api=1&query=${point.lat},${point.lng}`,
    }];
  });
}
