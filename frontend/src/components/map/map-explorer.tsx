"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { MapCanvas } from "@/components/map/map-canvas";
import { MapSidebar } from "@/components/map/map-sidebar";
import { notify } from "@/components/notification";
import { distanceInKm, type Coordinates } from "@/lib/map-distance";
import { mapApi } from "@/lib/map-api";
import type { MapCategory, MapResult } from "@/types/map";

const DEFAULT_CENTER = { lat: -23.5505, lng: -46.6333 };

export function MapExplorer() {
  const [center, setCenter] = useState<Coordinates>(DEFAULT_CENTER);
  const [userLocation, setUserLocation] = useState<Coordinates | null>(null);
  const [category, setCategory] = useState<MapCategory>("adoption");
  const { data: listings = [], isPending: listingsPending, error: listingsError } = useQuery({
    queryKey: ["map", "listings"],
    queryFn: ({ signal }) => mapApi.listings(signal),
  });
  const externalCategory = category === "veterinary" || category === "pet_shop" || category === "shelter";
  const nearbyCenter = { lat: Math.round(center.lat * 100) / 100, lng: Math.round(center.lng * 100) / 100 };
  const { data: external = [], isPending: externalPending, error: externalError } = useQuery({
    queryKey: ["map", "places", category, nearbyCenter.lat, nearbyCenter.lng],
    queryFn: ({ signal }) => mapApi.places(category as "veterinary" | "pet_shop" | "shelter", nearbyCenter, signal),
    enabled: externalCategory,
    staleTime: 10 * 60_000,
    retry: 0,
  });
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const displayError = error ?? listingsError?.message ?? externalError?.message ?? null;
  const searchRequestRef = useRef<AbortController | null>(null);
  const locationIntentRef = useRef(0);
  const loadingOwnerRef = useRef(0);

  const beginLoading = useCallback(() => {
    const owner = ++loadingOwnerRef.current;
    queueMicrotask(() => {
      if (loadingOwnerRef.current === owner) setLoading(true);
    });
    return owner;
  }, []);

  const finishLoading = useCallback((owner: number) => {
    if (loadingOwnerRef.current === owner) {
      loadingOwnerRef.current += 1;
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (displayError && !/abort|signal/i.test(displayError)) {
      notify("Não foi possível atualizar os resultados.", "error");
    }
  }, [displayError]);

  const locate = useCallback(() => {
    if (!navigator.geolocation) { setError("A geolocalização não está disponível neste navegador."); return; }
    const intent = ++locationIntentRef.current;
    const loadingOwner = beginLoading();
    setError(null);
    navigator.geolocation.getCurrentPosition(({ coords }) => { if (intent !== locationIntentRef.current) return; const point = { lat: coords.latitude, lng: coords.longitude }; setUserLocation(point); setCenter(point); finishLoading(loadingOwner); }, () => { if (intent !== locationIntentRef.current) return; setError("Não foi possível acessar sua localização. Pesquise uma cidade ou CEP."); finishLoading(loadingOwner); }, { enableHighAccuracy: false, timeout: 9000, maximumAge: 300000 });
  }, [beginLoading, finishLoading]);

  useEffect(() => { queueMicrotask(locate); }, [locate]);

  const results = useMemo(() => {
    const source = category === "adoption" || category === "donation" ? listings.filter((item) => item.category === category) : external;
    return source.map((item) => ({ ...item, distanceKm: distanceInKm(center, item) })).filter((item) => item.distanceKm <= 100).sort((a, b) => a.distanceKm - b.distanceKm);
  }, [category, center, external, listings]);

  const select = useCallback((result: MapResult) => { setSelectedId(result.id); document.getElementById(`map-result-${result.id}`)?.scrollIntoView({ behavior: "smooth", block: "nearest" }); }, []);

  async function runSearch() {
    const query = search.trim(); if (!query) { setError("Digite uma cidade, bairro ou CEP para buscar."); return; }
    locationIntentRef.current += 1;
    searchRequestRef.current?.abort(); const controller = new AbortController(); searchRequestRef.current = controller; const loadingOwner = beginLoading(); setError(null); setSelectedId(null);
    try { const location = await mapApi.geocode(query, controller.signal); setCenter(location); }
    catch (cause: unknown) { if (!controller.signal.aborted && (cause as Error)?.name !== "AbortError") setError(cause instanceof Error ? cause.message : "Não foi possível realizar a busca."); }
    finally { if (!controller.signal.aborted) finishLoading(loadingOwner); }
  }

  return <div className="flex h-[calc(100dvh-68px)] min-h-0 flex-col overflow-hidden lg:h-[calc(100dvh-80px)] lg:flex-row"><MapSidebar category={category} results={results} selectedId={selectedId} loading={loading || listingsPending || (externalCategory && externalPending)} search={search} onSearchChange={setSearch} onSearch={runSearch} onCategory={(value) => { setCategory(value); setSelectedId(null); setError(null); }} onSelect={select} /><MapCanvas center={center} results={results} selectedId={selectedId} userLocation={userLocation} onSelect={select} onLocate={locate} /></div>;
}
