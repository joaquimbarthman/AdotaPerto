"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { AnimalCard } from "@/components/animal-card";
import { DirectionalChevron } from "@/components/directional-chevron";
import type { Animal } from "@/data/animals";
import { useSession } from "@/lib/auth-client";
import { distanceInKm, type Coordinates } from "@/lib/map-distance";
import { mapApi } from "@/lib/map-api";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

export function HomeNearbyAnimals({ animals }: { animals: Animal[] }) {
  const { data: session, isPending } = useSession();
  const [distances, setDistances] = useState<Record<string, number>>({});

  useEffect(() => {
    if (isPending) return;
    let cancelled = false;
    const browserLocation = () => new Promise<Coordinates>((resolve, reject) => {
      if (!navigator.geolocation) return reject(new Error("Geolocalização indisponível"));
      navigator.geolocation.getCurrentPosition(
        ({ coords }) => resolve({ lat: coords.latitude, lng: coords.longitude }),
        reject,
        { enableHighAccuracy: false, timeout: 9000, maximumAge: 300000 },
      );
    });

    async function loadDistances() {
      try {
        let origin: Coordinates | null = null;
        if (session) {
          const response = await fetch(`${API_BASE_URL}/api/users/me`, { credentials: "include" });
          if (response.ok) {
            const profile = await response.json() as { zipCode?: string | null };
            if (profile.zipCode) origin = await mapApi.geocode(profile.zipCode);
          }
        }
        if (!origin) origin = await browserLocation();
        const listings = await mapApi.listings();
        if (!cancelled) setDistances(Object.fromEntries(listings.filter((item) => item.category === "adoption").map((item) => [item.id, distanceInKm(origin, item)])));
      } catch {
        if (!cancelled) setDistances({});
      }
    }
    void loadDistances();
    return () => { cancelled = true; };
  }, [isPending, session]);

  const nearby = useMemo(() => animals.map((animal) => {
    const km = distances[animal.id];
    return km == null ? animal : { ...animal, distance: `${km.toLocaleString("pt-BR", { minimumFractionDigits: 1, maximumFractionDigits: 1 })} km` };
  }).sort((a, b) => (distances[a.id] ?? Number.POSITIVE_INFINITY) - (distances[b.id] ?? Number.POSITIVE_INFINITY)).slice(0, 4), [animals, distances]);

  return (
    <section className="order-3 mx-auto w-full max-w-[1200px] px-5 pb-24 pt-20 sm:px-10 lg:px-20">
      <div className="mb-12 flex items-end justify-between gap-4"><div><p className="text-xs font-extrabold uppercase tracking-[0.14em] text-[#2b724a]">Mais perto de você</p><h2 className="mt-2 text-xl font-bold tracking-[-0.01em] min-[420px]:text-2xl sm:text-[32px] sm:leading-10">Animais esperando uma família</h2></div><Link href="/adocao" className="group inline-flex shrink-0 items-center gap-1 text-sm font-semibold tracking-[0.05em] text-[#256441]">Ver todos <DirectionalChevron direction="right" className="transition-transform group-hover:translate-x-1" /></Link></div>
      {nearby.length > 0 ? <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">{nearby.map((animal) => <AnimalCard key={animal.id} animal={animal} />)}</div> : <div className="rounded-xl bg-white p-10 text-center text-[#526057]">Não foi possível carregar os animais agora.</div>}
    </section>
  );
}
