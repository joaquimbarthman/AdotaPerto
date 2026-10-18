"use client";
import { apiBaseUrl } from "@/lib/api-url";




import { SkeletonLoader } from "@/components/skeleton-loader";
import { RequestDetailsContent } from "@/components/request-details/content";
import { StatePage } from "@/components/request-details/state-page";
import type { RequestDetails } from "@/components/request-details/data";



import { useParams } from "next/navigation";
import { useEffect, useState } from "react";

const API_BASE_URL = apiBaseUrl();

export default function RequestDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const [request, setRequest] = useState<RequestDetails | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch(`${API_BASE_URL}/api/adoption-requests/${id}`, {
      credentials: "include",
    })
      .then(async (response) => {
        const result = await response.json().catch(() => ({}));
        if (!response.ok)
          throw new Error(
            result.error || "Não foi possível carregar a solicitação.",
          );
        setRequest(result);
      })
      .catch((cause: unknown) =>
        setError(
          cause instanceof Error
            ? cause.message
            : "Não foi possível carregar a solicitação.",
        ),
      );
  }, [id]);

  if (error)
    return (
      <StatePage title="Não foi possível abrir os detalhes" message={error} />
    );
  if (!request) return <SkeletonLoader fullScreen variant="detail" />;

  return <RequestDetailsContent request={request} />;
}
