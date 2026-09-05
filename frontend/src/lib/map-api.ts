import type { Coordinates } from "@/lib/map-distance";
import type { MapCategory, MapResult } from "@/types/map";

const CONFIGURED_API_URL = process.env.NEXT_PUBLIC_API_URL;

export function apiBaseUrl() {
  if (CONFIGURED_API_URL) return CONFIGURED_API_URL;
  if (typeof window !== "undefined") return `${window.location.protocol}//${window.location.hostname}:4000`;
  return "http://localhost:4000";
}

async function getJson<T>(path: string, signal?: AbortSignal): Promise<T> {
  const response = await fetch(`${apiBaseUrl()}${path}`, { signal });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error((data as { error?: string }).error || "Não foi possível carregar os dados.");
  return data as T;
}

export const mapApi = {
  listings: (signal?: AbortSignal) => getJson<MapResult[]>("/api/map/listings", signal),
  geocode: (query: string, signal?: AbortSignal) => getJson<Coordinates & { label: string }>(`/api/map/geocode?q=${encodeURIComponent(query)}`, signal),
  places: (category: Extract<MapCategory, "veterinary" | "pet_shop" | "shelter">, center: Coordinates, signal?: AbortSignal) => getJson<MapResult[]>(`/api/map/places?category=${category}&lat=${center.lat}&lng=${center.lng}`, signal),
};
