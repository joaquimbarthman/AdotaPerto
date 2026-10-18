export type DonationItem = {
  id: string; title: string; category: string; itemName: string; quantity: number; unit: string;
  condition: string; description: string; mainImage: string; images?: string[]; deliveryMethod: string;
  availableUntil?: string | null; expirationDate?: string | null; status: string; createdAt?: string; distance?: string;
};
