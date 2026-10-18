"use client";
import { apiBaseUrl } from "@/lib/api-url";










import { useSession } from "@/lib/auth-client";
import { catalogKeys, fetchAnimals } from "@/lib/catalog";
import { mapApi } from "@/lib/map-api";
import { distanceInKm, type Coordinates } from "@/lib/map-distance";
import { useCatalogFilters } from "@/store/catalog-filters";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useMemo, useState } from "react";

const API_BASE_URL = apiBaseUrl();

export function useAdoptionCatalog() {
  const queryClient = useQueryClient();
  const { data: session, isPending: sessionPending } = useSession();
  const {
    data: dbAnimals = [],
    isPending: loadingAnimals,
    isError: loadError,
  } = useQuery({
    queryKey: catalogKeys.animals,
    queryFn: ({ signal }) => fetchAnimals(signal),
  });
  const [distances, setDistances] = useState<Record<string, number>>({});
  const [locationReady, setLocationReady] = useState(false);
  const { species, age, sex, size, distance } = useCatalogFilters(
    (state) => state.adoption,
  );
  const setAdoption = useCatalogFilters((state) => state.setAdoption);
  const resetAdoption = useCatalogFilters((state) => state.resetAdoption);
  const setSpecies = (next: string[]) => setAdoption({ species: next });
  const setAge = (next: string[]) => setAdoption({ age: next });
  const setSex = (next: string) => setAdoption({ sex: next });
  const setSize = (next: string) => setAdoption({ size: next });
  const setDistance = (next: number) => setAdoption({ distance: next });
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

    async function resolveOrigin() {
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
              .filter((item) => item.category === "adoption")
              .map((item) => [item.id, distanceInKm(origin, item)]),
          ),
        );
      } catch {
        if (!cancelled) setDistances({});
      } finally {
        if (!cancelled) setLocationReady(true);
      }
    }

    void resolveOrigin();
    return () => {
      cancelled = true;
    };
  }, [queryClient, session, sessionPending]);

  const activeFilters =
    species.length +
    age.length +
    (sex !== "Qualquer" ? 1 : 0) +
    (size ? 1 : 0) +
    (distance !== 10 ? 1 : 0);

  const animals = useMemo(
    () =>
      dbAnimals
        .filter((animal) => {
          const matchesSpecies =
            species.length === 0 || species.includes(animal.species);
          const matchesSex = sex === "Qualquer" || animal.sex === sex;
          const matchesSize = !size || animal.size === size;
          const matchesAge =
            age.length === 0 || age.includes(ageGroup(animal.age));
          const animalDistance = distances[animal.id];
          const matchesDistance =
            !locationReady ||
            animalDistance == null ||
            animalDistance <= distance;
          return (
            matchesSpecies &&
            matchesSex &&
            matchesSize &&
            matchesAge &&
            matchesDistance
          );
        })
        .map((animal) =>
          distances[animal.id] == null
            ? animal
            : {
                ...animal,
                distance: `${distances[animal.id].toLocaleString("pt-BR", { minimumFractionDigits: 1, maximumFractionDigits: 1 })} km`,
              },
        ),
    [dbAnimals, age, sex, size, species, distance, distances, locationReady],
  );

  const clear = () => {
    resetAdoption();
    setVisible(6);
  };
  const toggle = (
    value: string,
    values: string[],
    setter: (values: string[]) => void,
  ) =>
    setter(
      values.includes(value)
        ? values.filter((item) => item !== value)
        : [...values, value],
    );

  return { animals, activeFilters, loadingAnimals, loadError, species, age, sex, size, distance, setSpecies, setAge, setSex, setSize, setDistance, visible, setVisible, clear, toggle };
}

function ageGroup(age: string) {
  if (!age) return "Filhote (0-1 ano)";
  if (age.includes("mes")) return "Filhote (0-1 ano)";
  const years = Number.parseInt(age, 10);
  if (isNaN(years) || years <= 1) return "Filhote (0-1 ano)";
  if (years <= 3) return "Jovem (1-3 anos)";
  if (years <= 8) return "Adulto (3-8 anos)";
  return "Sênior (8+ anos)";
}
