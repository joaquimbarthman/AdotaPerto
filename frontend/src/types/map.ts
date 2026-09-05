export type MapCategory = "adoption" | "donation" | "veterinary" | "pet_shop" | "shelter";

export type MapResult = {
  id: string;
  category: MapCategory;
  name: string;
  lat: number;
  lng: number;
  image?: string | null;
  description?: string | null;
  breed?: string | null;
  age?: string | null;
  itemCategory?: string | null;
  region?: string | null;
  address?: string | null;
  phone?: string | null;
  email?: string | null;
  website?: string | null;
  mapsUrl?: string | null;
  href?: string;
  approximate?: boolean;
  distanceKm?: number;
};
