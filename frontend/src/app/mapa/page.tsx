import type { Metadata } from "next";
import { MapExplorer } from "@/components/map/map-explorer";
import { SiteHeader } from "@/components/site-header";

export const metadata: Metadata = { title: "Mapa", description: "Encontre animais, doações e serviços para pets perto de você." };

export default function MapPage() { return <div className="min-h-screen bg-[#eefdf1]"><SiteHeader /><main><MapExplorer /></main></div>; }
