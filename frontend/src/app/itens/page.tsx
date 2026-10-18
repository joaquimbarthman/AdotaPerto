"use client";

export type { DonationItem } from "@/data/donation-items";
import { useItemCatalog } from "@/hooks/use-item-catalog";
import { ItemCatalogView } from "@/components/catalog/item-catalog-view";

export default function DonationItemsPage() {
  const model = useItemCatalog();
  return <ItemCatalogView model={model} />;
}
