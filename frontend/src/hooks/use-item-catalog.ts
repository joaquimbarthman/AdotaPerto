"use client";
import { apiBaseUrl } from "@/lib/api-url";










import { useSession } from "@/lib/auth-client";
import { catalogKeys, fetchDonationItems } from "@/lib/catalog";
import { mapApi } from "@/lib/map-api";
import { distanceInKm, type Coordinates } from "@/lib/map-distance";
import { useCatalogFilters } from "@/store/catalog-filters";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useMemo, useState } from "react";

const API_BASE_URL = apiBaseUrl();



export function useItemCatalog() {
  const queryClient = useQueryClient();
  const { data: session, isPending: sessionPending } = useSession();
  const {
    data: items = [],
    isPending: loading,
    error: queryError,
  } = useQuery({
    queryKey: catalogKeys.items,
    queryFn: ({ signal }) => fetchDonationItems(signal),
  });
  const [distances, setDistances] = useState<Record<string, number>>({});
  const [locationReady, setLocationReady] = useState(false);
  const { categories, conditions, distance, sort } = useCatalogFilters(
    (state) => state.items,
  );
  const setItemsFilters = useCatalogFilters((state) => state.setItems);
  const resetItems = useCatalogFilters((state) => state.resetItems);
  const setCategories = (next: string[]) =>
    setItemsFilters({ categories: next });
  const setConditions = (next: string[]) =>
    setItemsFilters({ conditions: next });
  const setDistance = (next: number) => setItemsFilters({ distance: next });
  const setSort = (next: string) => setItemsFilters({ sort: next });
  const [visible, setVisible] = useState(6);

  useEffect(() => {
    if (sessionPending) return;
    let cancelled = false;
    const browserLocation = () =>
      new Promise<Coordinates>((resolve, reject) => {
        if (!navigator.geolocation)
          return reject(new Error("Geolocalização indisponível"));
        navigator.geolocation.getCurrentPosition(
          ({ coords }) =>
            resolve({ lat: coords.latitude, lng: coords.longitude }),
          reject,
          { enableHighAccuracy: false, timeout: 9000, maximumAge: 300000 },
        );
      });

    async function resolveDistances() {
      try {
        let origin: Coordinates | null = null;
        if (session) {
          const response = await fetch(`${API_BASE_URL}/api/users/me`, {
            credentials: "include",
          });
          if (response.ok) {
            const profile = (await response.json()) as {
              zipCode?: string | null;
            };
            if (profile.zipCode) origin = await mapApi.geocode(profile.zipCode);
          }
        }
        if (!origin) origin = await browserLocation();
        const listings = await queryClient.fetchQuery({
          queryKey: ["map", "listings"],
          queryFn: ({ signal }) => mapApi.listings(signal),
        });
        if (cancelled) return;
        setDistances(
          Object.fromEntries(
            listings
              .filter((item) => item.category === "donation")
              .map((item) => [item.id, distanceInKm(origin, item)]),
          ),
        );
      } catch {
        if (!cancelled) setDistances({});
      } finally {
        if (!cancelled) setLocationReady(true);
      }
    }
    void resolveDistances();
    return () => {
      cancelled = true;
    };
  }, [queryClient, session, sessionPending]);

  const activeFilters =
    categories.length + conditions.length + (distance !== 10 ? 1 : 0);
  const filteredItems = useMemo(() => {
    const result = items
      .filter(
        (item) =>
          (!categories.length || categories.includes(item.category)) &&
          (!conditions.length || conditions.includes(item.condition)) &&
          (!locationReady ||
            distances[item.id] == null ||
            distances[item.id] <= distance),
      )
      .map((item) =>
        distances[item.id] == null
          ? item
          : {
              ...item,
              distance: `${distances[item.id].toLocaleString("pt-BR", { minimumFractionDigits: 1, maximumFractionDigits: 1 })} km`,
            },
      );
    return [...result].sort((a, b) =>
      sort === "Maior quantidade"
        ? b.quantity - a.quantity
        : new Date(b.createdAt || 0).getTime() -
          new Date(a.createdAt || 0).getTime(),
    );
  }, [items, categories, conditions, sort, distance, distances, locationReady]);

  const toggle = (
    value: string,
    values: string[],
    setter: (next: string[]) => void,
  ) => {
    setter(
      values.includes(value)
        ? values.filter((item) => item !== value)
        : [...values, value],
    );
    setVisible(6);
  };
  const clear = () => {
    resetItems();
    setVisible(6);
  };

  return { filteredItems, activeFilters, loading, queryError, categories, conditions, distance, sort, setCategories, setConditions, setDistance, setSort, visible, setVisible, clear, toggle };
}
