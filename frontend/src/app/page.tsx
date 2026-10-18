import { apiBaseUrl } from "@/lib/api-url";


import { HomeNearbyAnimals } from "@/components/home-nearby-animals";
import { HomeHero } from "@/components/home/home-hero";
import { HomeFeatures } from "@/components/home/home-features";
import { HomeMapShowcase } from "@/components/home/home-map-showcase";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import type { Animal } from "@/data/animals";
import type { Metadata } from "next";



export const metadata: Metadata = {
  title: { absolute: "Início | AdotaPerto" },
  description:
    "Encontre animais para adoção, doações e serviços para pets perto de você.",
};

const API_BASE_URL = apiBaseUrl();

async function getFeaturedAnimals(): Promise<Animal[]> {
  try {
    const res = await fetch(`${API_BASE_URL}/api/animals`, {
      cache: "no-store",
    });
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data) && data.length > 0) {
        return data;
      }
    }
  } catch {
    // fallback
  }
  return [];
}

export default async function Home() {
  const animals = await getFeaturedAnimals();

  return (
    <div className="min-h-screen bg-[#eefdf1] text-[#121e17]">
      <SiteHeader />
      <main>
        <HomeHero />

        <div className="flex flex-col">
          <HomeFeatures />
          <HomeMapShowcase />
          <HomeNearbyAnimals animals={animals} />
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
