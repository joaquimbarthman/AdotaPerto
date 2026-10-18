"use client";

import { apiBaseUrl } from "@/lib/api-url";
import { catalogKeys } from "@/lib/catalog";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";

type TransferOptions = {
  organizations: { id: string; name: string }[];
  animals: { id: string; name: string; species: string; status: string; image: string | null }[];
  total: number;
};

export function AnimalTransferPanel({ initialOrgId, updatedAt }: { initialOrgId: string | null; updatedAt: string }) {
  const queryClient = useQueryClient();
  const [organizationId, setOrganizationId] = useState(initialOrgId || "");
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<string[]>([]);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const { data, error, isPending } = useQuery({
    queryKey: ["admin", "transfer-options", search, updatedAt],
    queryFn: async (): Promise<TransferOptions> => {
      const response = await fetch(`${apiBaseUrl()}/api/admin/transfer-options?q=${encodeURIComponent(search)}`, {
        credentials: "include", cache: "no-store",
      });
      if (!response.ok) throw new Error("Não foi possível carregar as opções de transferência.");
      return response.json();
    },
  });

  async function transfer() {
    if (!organizationId || selected.length === 0 || busy) return;
    const destination = data?.organizations.find((org) => org.id === organizationId)?.name || "a ONG";
    if (!window.confirm(`Transferir ${selected.length} animais para ${destination}? O responsável da ONG passará a gerenciá-los.`)) return;
    setBusy(true); setMessage(null); setErrorMessage(null);
    try {
      const response = await fetch(`${apiBaseUrl()}/api/admin/animals/transfer`, {
        method: "POST", credentials: "include", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ organizationId, animalIds: selected }),
      });
      const result: { organization?: string; transferred?: number; skipped?: number; error?: string } = await response.json();
      if (!response.ok) throw new Error(result.error || "Não foi possível transferir os animais.");
      setMessage(`${result.transferred} animais vinculados à ${result.organization}.${result.skipped ? ` ${result.skipped} não foram alterados.` : ""}`);
      setSelected([]);
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["admin", "transfer-options"] }),
        queryClient.invalidateQueries({ queryKey: catalogKeys.animals }),
        queryClient.invalidateQueries({ queryKey: ["catalog", "animal"] }),
        queryClient.invalidateQueries({ queryKey: ["map", "listings"] }),
      ]);
    } catch (cause) {
      setErrorMessage(cause instanceof Error ? cause.message : "Erro ao transferir animais.");
    } finally { setBusy(false); }
  }

  return <section id="admin-animal-transfer" className="admin-card mt-6 scroll-mt-6">
    <h2 className="admin-card-title">Transferir animais para uma ONG</h2>
    <p className="admin-muted mt-1 text-xs">Selecione animais sem ONG. O responsável da ONG receberá as publicações, que aparecerão no painel dela e no catálogo de adoção.</p>
    <div className="mt-4 grid gap-3 sm:grid-cols-2">
      <label className="text-xs font-semibold">ONG de destino
        <select value={organizationId} onChange={(event) => setOrganizationId(event.target.value)} className="mt-1 min-h-11 w-full rounded-lg border border-[#c8d2ca] bg-white px-3 text-sm">
          <option value="">Selecione uma ONG</option>
          {data?.organizations.map((org) => <option key={org.id} value={org.id}>{org.name}</option>)}
        </select>
      </label>
      <label className="text-xs font-semibold">Buscar animal pelo nome
        <input value={search} onChange={(event) => { setSearch(event.target.value); setSelected([]); }} placeholder="Nome do animal" className="mt-1 min-h-11 w-full rounded-lg border border-[#c8d2ca] bg-white px-3 text-sm" />
      </label>
    </div>
    {isPending && <p role="status" className="admin-muted mt-4 text-sm">Carregando animais...</p>}
    {error && <p role="alert" className="mt-4 text-sm text-red-600">{error.message}</p>}
    {data && <>
      <div className="mt-4 flex flex-wrap items-center justify-between gap-2">
        <p className="admin-muted text-xs">{data.total} animais sem ONG{data.total > data.animals.length ? ` · exibindo ${data.animals.length}; refine a busca` : ""}</p>
        {data.animals.length > 0 && <button type="button" onClick={() => setSelected(data.animals.map((animal) => animal.id))} className="text-xs font-semibold text-[#256441]">Selecionar exibidos</button>}
      </div>
      <div className="mt-3 max-h-80 space-y-2 overflow-y-auto">
        {data.animals.map((animal) => <label key={animal.id} className="flex cursor-pointer items-center gap-3 rounded-lg border border-[#e1e8e2] p-3 text-sm">
          <input type="checkbox" checked={selected.includes(animal.id)} onChange={(event) => setSelected((current) => event.target.checked ? [...current, animal.id] : current.filter((id) => id !== animal.id))} className="size-4 accent-[#256441]" />
          <span className="min-w-0"><strong className="block truncate">{animal.name}</strong><small className="admin-muted">{animal.species} · {animal.status}</small></span>
        </label>)}
        {data.animals.length === 0 && <p className="admin-muted text-sm">Nenhum animal sem ONG encontrado.</p>}
      </div>
    </>}
    {message && <p role="status" className="mt-4 text-sm text-green-700">{message}</p>}
    {errorMessage && <p role="alert" className="mt-4 text-sm text-red-600">{errorMessage}</p>}
    <button type="button" disabled={busy || !organizationId || selected.length === 0} onClick={() => void transfer()} className="admin-primary-link mt-4 disabled:cursor-not-allowed disabled:opacity-50">{busy ? "Transferindo..." : `Transferir ${selected.length} animais`}</button>
  </section>;
}
