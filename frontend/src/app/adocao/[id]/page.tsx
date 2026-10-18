"use client";
import { apiBaseUrl } from "@/lib/api-url";

import { SkeletonLoader } from "@/components/skeleton-loader";
import { notify } from "@/components/notification";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import type { Animal } from "@/data/animals";
import { useSession } from "@/lib/auth-client";
import { useApproximateDistance } from "@/hooks/use-approximate-distance";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { catalogKeys } from "@/lib/catalog";
import { AnimalDetails } from "@/components/animal-detail/animal-details";

const API_BASE_URL = apiBaseUrl();

export default function PetDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const { data: session, isPending } = useSession();

  const { data: animal, isPending: loading } = useQuery<Animal>({
    queryKey: catalogKeys.animalDetail(id, session?.user.id),
    enabled: Boolean(id) && !isPending,
    queryFn: async ({ signal }) => {
      const response = await fetch(`${API_BASE_URL}/api/animals/${id}`, { credentials: "include", signal });
      if (!response.ok) throw new Error("Animal não encontrado.");
      return response.json() as Promise<Animal>;
    },
  });
  const [favorite, setFavorite] = useState(false);
  const [favoriteLoading, setFavoriteLoading] = useState(false);
  const approximateDistance = useApproximateDistance(id, Boolean(session), isPending);

  useEffect(() => {
    if (!session || !id) return;
    const controller = new AbortController();
    fetch(`${API_BASE_URL}/api/favorites/check/${id}`, { credentials: "include", signal: controller.signal })
      .then((response) => response.ok ? response.json() : null)
      .then((data) => { if (data) setFavorite(Boolean(data.favorite)); })
      .catch(() => {});
    return () => controller.abort();
  }, [id, session]);

  async function toggleFavorite() {
    if (!session) { router.push("/login?reason=unauthenticated"); return; }
    if (!animal || favoriteLoading) return;
    const next = !favorite;
    setFavorite(next); setFavoriteLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/favorites/${animal.id}`, { method: next ? "POST" : "DELETE", credentials: "include" });
      if (!response.ok) throw new Error();
    } catch {
      setFavorite(!next);
      notify("Não foi possível atualizar o favorito.", "error");
    } finally { setFavoriteLoading(false); }
  }

  function handleRequestAdoption() {
    if (isPending) return;
    if (!session) {
      router.push("/login?reason=unauthenticated");
      return;
    }
    if (!animal) return;
    if (animal.userId === session.user.id || animal.owner?.id === session.user.id) {
      notify("Você não pode adotar seu próprio animal.", "warning");
      return;
    }
    if (animal.viewerRequestStatus || animal.status !== "Disponível") {
      notify("Este animal já possui uma solicitação sua ou está indisponível.", "warning");
      return;
    }
    router.push(`/adocao/${animal.id}/solicitacao`);
  }

  if (loading) {
    return <SkeletonLoader fullScreen variant="detail" />;
  }

  if (!animal) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-[#eefdf1] px-4 text-center">
        <h1 className="text-2xl font-bold text-[#121e17]">
          Animal não encontrado
        </h1>
        <p className="mt-2 text-[#526057]">
          O animal que você procura não está mais disponível ou não existe.
        </p>
        <Link
          href="/adocao"
          className="mt-6 rounded-xl bg-[#256441] px-6 py-3 font-semibold text-white"
        >
          Ver todos os animais
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#eefdf1] text-[#121e17]">
      <SiteHeader />
      <main className="detail-page mx-auto w-full min-w-0 max-w-300 overflow-x-hidden px-3 py-4 sm:px-10 sm:py-8 lg:px-20 lg:py-12">
        <Link
          href="/adocao"
          className="mb-3 inline-flex items-center gap-1 rounded-lg px-1 py-1 text-xs font-semibold text-[#256441] transition hover:bg-[#e8f7eb] sm:mb-8 sm:gap-2 sm:px-2 sm:text-sm"
        >
          <svg
            viewBox="0 0 20 20"
            className="size-4"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            aria-hidden="true"
          >
            <path
              d="m12.5 4.5-5 5.5 5 5.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          Voltar
        </Link>

        <AnimalDetails
          animal={animal}
          locked={!isPending && !session}
          sessionPending={isPending}
          approximateDistance={approximateDistance}
          favorite={favorite}
          favoriteLoading={favoriteLoading}
          toggleFavorite={toggleFavorite}
          handleRequestAdoption={handleRequestAdoption}
        />
      </main>
      <div className="mt-20">
        <SiteFooter />
      </div>
    </div>
  );
}
