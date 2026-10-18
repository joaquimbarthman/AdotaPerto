"use client";

import { useAdoptionCatalog } from "@/hooks/use-adoption-catalog";
import { AdoptionCatalogView } from "@/components/catalog/adoption-catalog-view";

export default function AdoptionPage() {
  const model = useAdoptionCatalog();
  return <AdoptionCatalogView model={model} />;
}
