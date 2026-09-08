"use client";

import { useEffect, useState } from "react";
import { apiBaseUrl, mapApi } from "@/lib/map-api";
import { distanceInKm, formatDistance, type Coordinates } from "@/lib/map-distance";

export function useApproximateDistance(listingId: string, authenticated: boolean, pending: boolean) {
  const [distance, setDistance] = useState<string | null>(null);

  useEffect(() => {
    if (!listingId || pending) return;
    let cancelled = false;

    const browserLocation = () => new Promise<Coordinates>((resolve, reject) => {
      if (!navigator.geolocation) return reject(new Error("Geolocalização indisponível"));
      navigator.geolocation.getCurrentPosition(
        ({ coords }) => resolve({ lat: coords.latitude, lng: coords.longitude }),
        reject,
        { enableHighAccuracy: false, timeout: 9000, maximumAge: 300000 },
      );
    });

    async function calculate() {
      try {
        let origin: Coordinates | null = null;
        if (authenticated) {
          const response = await fetch(`${apiBaseUrl()}/api/users/me`, { credentials: "include" });
          if (response.ok) {
            const profile = await response.json() as { zipCode?: string | null };
            if (profile.zipCode) origin = await mapApi.geocode(profile.zipCode);
          }
        }
        if (!origin) origin = await browserLocation();
        const listing = (await mapApi.listings()).find((entry) => entry.id === listingId);
        if (!cancelled && listing) setDistance(formatDistance(distanceInKm(origin, listing)));
      } catch {
        if (!cancelled) setDistance(null);
      }
    }

    void calculate();
    return () => { cancelled = true; };
  }, [authenticated, listingId, pending]);

  return distance;
}
