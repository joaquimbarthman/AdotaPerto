"use client";

import { useSession } from "@/lib/auth-client";
import { apiBaseUrl } from "@/lib/api-url";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

type Props = {
  id: string;
  kind: "animal" | "item";
  initiallyFavorite: boolean;
  onChange?: (favorite: boolean) => void;
};

export function useCardFavorite({ id, kind, initiallyFavorite, onChange }: Props) {
  const router = useRouter();
  const { data: session } = useSession();
  const [favorite, setFavorite] = useState(initiallyFavorite);
  const [loading, setLoading] = useState(false);
  const base = `${apiBaseUrl()}/api/favorites${kind === "item" ? "/items" : ""}`;

  useEffect(() => {
    if (!session || (kind === "item" && initiallyFavorite)) return;
    const controller = new AbortController();
    fetch(`${base}/check/${id}`, {
      credentials: "include",
      signal: controller.signal,
    })
      .then((response) => (response.ok ? response.json() : null))
      .then((data) => {
        if (data) setFavorite(Boolean(data.favorite));
      })
      .catch(() => {});
    return () => controller.abort();
  }, [base, id, initiallyFavorite, kind, session]);

  async function toggleFavorite(event: React.MouseEvent) {
    event.preventDefault();
    event.stopPropagation();
    if (!session) {
      router.push(kind === "item" ? "/login?reason=unauthenticated" : "/login");
      return;
    }
    const next = !(kind === "animal" ? Boolean(session && favorite) : favorite);
    setFavorite(next);
    setLoading(true);
    try {
      const response = await fetch(`${base}/${id}`, {
        method: next ? "POST" : "DELETE",
        credentials: "include",
      });
      if (!response.ok) throw new Error("Falha ao atualizar favorito");
      onChange?.(next);
    } catch {
      setFavorite(!next);
    } finally {
      setLoading(false);
    }
  }

  return { favorite, loading, toggleFavorite, session };
}
