import Image from "next/image";
import type { MapCategory } from "@/types/map";

export const mapCategoryIcons: Record<MapCategory, string> = {
  adoption: "/icons/adocao.svg",
  donation: "/icons/map-box.svg",
  veterinary: "/icons/map-stethoscope.svg",
  pet_shop: "/icons/map-store.svg",
  shelter: "/icons/map-house.svg",
};

export function MapCategoryIcon({ category, size = 18, className = "" }: { category: MapCategory; size?: number; className?: string }) {
  return <span className={`inline-grid shrink-0 place-items-center leading-none ${className}`} style={{ width: size, height: size }} aria-hidden="true"><Image src={mapCategoryIcons[category]} alt="" width={size} height={size} className="block size-full object-contain" /></span>;
}
