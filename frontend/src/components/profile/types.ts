import type { Animal } from "@/data/animals";
import { tabs } from "./config";

export type TabId = (typeof tabs)[number]["id"];

export type UserProfile = {
  id: string;
  name: string;
  email: string;
  image?: string | null;
  birthDate?: string | null;
  instagram?: string | null;
  whatsapp?: string | null;
  bio?: string | null;
  zipCode?: string | null;
  street?: string | null;
  city?: string | null;
  state?: string | null;
  createdAt: string;
};

export type AdoptionRequestItem = {
  id: string;
  status: string;
  notes?: string | null;
  answers?: Record<string, string | string[]> | null;
  compatibilityScore?: number | null;
  compatibilityDetails?: string[] | null;
  createdAt: string;
  animal: Animal;
  requester?: {
    id: string;
    name: string;
    image?: string | null;
    city?: string | null;
    state?: string | null;
  };
  ownerContact?: {
    name: string;
    email: string;
    whatsapp?: string | null;
    instagram?: string | null;
  };
};

export type FavoriteItem = {
  id: string;
  createdAt: string;
  animal: Animal;
};

export type FavoriteDonationItem = {
  id: string;
  createdAt: string;
  item: DonationItem;
};

export type DonationItem = {
  id: string;
  title: string;
  itemName: string;
  category: string;
  quantity: number;
  unit: string;
  condition: string;
  description: string;
  mainImage: string;
  deliveryMethod: string;
  status: "Disponível" | "Pausado" | "Doado";
  createdAt: string;
};

export type EditablePublication =
  | { kind: "animal"; data: Animal }
  | { kind: "item"; data: DonationItem };

export type DonationItemRequest = {
  id: string;
  status: string;
  quantity: number;
  message?: string | null;
  createdAt: string;
  item: DonationItem;
  requester?: {
    id: string;
    name: string;
    image?: string | null;
    city?: string | null;
    state?: string | null;
  };
  ownerContact?: AdoptionRequestItem["ownerContact"];
};
