import { apiBaseUrl } from "@/lib/api-url";
import type { Animal } from "@/data/animals";
import type { DonationItem } from "@/data/donation-items";

export const catalogKeys = {
  animals: ["catalog", "animals"] as const,
  items: ["catalog", "items"] as const,
  animalDetail: (id: string, viewerId?: string) => ["catalog", "animal", id, viewerId || "guest"] as const,
  itemDetail: (id: string, viewerId?: string) => ["catalog", "item", id, viewerId || "guest"] as const,
};

async function getList<T>(path: string, signal?: AbortSignal): Promise<T[]> {
  const response = await fetch(`${apiBaseUrl()}${path}`, { signal });
  if (!response.ok) throw new Error("Não foi possível carregar os dados.");
  const data: unknown = await response.json();
  return Array.isArray(data) ? data as T[] : [];
}

export const fetchAnimals = (signal?: AbortSignal) => getList<Animal>("/api/animals", signal);
export const fetchDonationItems = (signal?: AbortSignal) => getList<DonationItem>("/api/donation-items", signal);
