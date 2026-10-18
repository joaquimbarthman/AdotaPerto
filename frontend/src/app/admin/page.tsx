"use client";
import { apiBaseUrl } from "@/lib/api-url";

import {
  AdminDashboard,
  type Overview,
} from "@/components/admin/admin-dashboard";
import { catalogKeys } from "@/lib/catalog";
import { useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";

const number = new Intl.NumberFormat("pt-BR");

export default function AdminPage() {
  const queryClient = useQueryClient();
  const [data, setData] = useState<Overview | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [access, setAccess] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [version, setVersion] = useState(0);
  const [seeding, setSeeding] = useState(false);
  const [seedMessage, setSeedMessage] = useState<string | null>(null);
  const [seedError, setSeedError] = useState(false);

  useEffect(() => {
    const controller = new AbortController();
    async function load() {
      try {
        const base = apiBaseUrl();
        const response = await fetch(`${base}/api/admin/overview`, {
          credentials: "include",
          cache: "no-store",
          signal: controller.signal,
        });
        if (!response.ok) {
          setAccess(response.status);
          throw new Error(
            response.status === 401
              ? "Entre na sua conta para acessar o painel."
              : response.status === 403
                ? "Esta área é exclusiva para administradores."
                : "Não foi possível carregar o painel. Tente novamente.",
          );
        }
        const overview: Overview = await response.json();
        if (!controller.signal.aborted) {
          setData(overview);
          setError(null);
          setAccess(null);
        }
      } catch (cause) {
        if (!controller.signal.aborted) {
          setData(null);
          setError(
            cause instanceof Error
              ? cause.message
              : "Não foi possível conectar ao servidor.",
          );
        }
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    }
    void load();
    return () => controller.abort();
  }, [version]);

  function refresh() {
    setLoading(true);
    setData(null);
    setError(null);
    setVersion((value) => value + 1);
  }

  async function seedContent() {
    setSeeding(true);
    setSeedMessage(null);
    try {
      const response = await fetch(`${apiBaseUrl()}/api/admin/seed-content`, {
        method: "POST",
        credentials: "include",
      });
      const result: {
        animalsCreated?: number;
        animalsUpdated?: number;
        itemsCreated?: number;
        error?: string;
      } = await response.json();
      if (!response.ok)
        throw new Error(
          result.error || "Não foi possível carregar o conteúdo de exemplo.",
        );
      void queryClient.invalidateQueries({ queryKey: catalogKeys.animals });
      void queryClient.invalidateQueries({ queryKey: catalogKeys.items });
      void queryClient.invalidateQueries({ queryKey: ["map", "listings"] });
      const animalsCreated = result.animalsCreated ?? 0;
      const animalsUpdated = result.animalsUpdated ?? 0;
      const itemsCreated = result.itemsCreated ?? 0;
      setSeedMessage(
        animalsCreated + animalsUpdated + itemsCreated === 0
          ? "Os animais e itens de exemplo já estão completos."
          : `${number.format(animalsCreated)} animais criados, ${number.format(animalsUpdated)} animais completados e ${number.format(itemsCreated)} itens adicionados.`,
      );
      setSeedError(false);
      refresh();
    } catch (cause) {
      setSeedMessage(
        cause instanceof Error
          ? cause.message
          : "Não foi possível conectar ao servidor.",
      );
      setSeedError(true);
    } finally {
      setSeeding(false);
    }
  }

  return (
    <AdminDashboard
      data={data}
      error={error}
      access={access}
      loading={loading}
      refresh={refresh}
      seedContent={seedContent}
      seeding={seeding}
      seedMessage={seedMessage}
      seedError={seedError}
    />
  );
}
