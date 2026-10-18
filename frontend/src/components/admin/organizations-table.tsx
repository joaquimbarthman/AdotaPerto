"use client";

import { apiBaseUrl } from "@/lib/api-url";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { OrganizationPeople } from "./organization-people";

type OrganizationRow = {
  id: string;
  name: string;
  cnpj: string | null;
  phone: string | null;
  website: string | null;
  createdAt: string;
  volunteers: number;
  externals: number;
};

type OrganizationsResponse = {
  organizations: OrganizationRow[];
  total: number;
  page: number;
  pageSize: number;
};

export function OrganizationsTable({ updatedAt, onTransfer }: { updatedAt: string; onTransfer: (id: string) => void }) {
  const [page, setPage] = useState(1);
  const [selectedOrgId, setSelectedOrgId] = useState<string | null>(null);
  const { data, error, isPending, isFetching } = useQuery({
    queryKey: ["admin", "organizations", page, updatedAt],
    queryFn: async (): Promise<OrganizationsResponse> => {
      const response = await fetch(`${apiBaseUrl()}/api/admin/organizations?page=${page}`, {
        credentials: "include",
        cache: "no-store",
      });
      if (!response.ok) throw new Error("Não foi possível carregar as ONGs.");
      return response.json();
    },
  });

  const lastPage = data ? Math.max(1, Math.ceil(data.total / data.pageSize)) : 1;

  return (
    <section className="admin-card mt-6 overflow-hidden p-0" aria-labelledby="admin-organizations-title">
      <div className="flex items-center justify-between gap-4 px-5 py-5 sm:px-6">
        <div>
          <p className="admin-section-kicker">Comunidade</p>
          <h2 id="admin-organizations-title" className="admin-card-title mt-1">ONGs cadastradas</h2>
          <p className="admin-muted mt-1 text-xs">
            {data ? `${data.total} organizações cadastradas` : "Organizações registradas na plataforma"}
          </p>
        </div>
      </div>

      {isPending && <p className="admin-muted px-6 pb-6 text-sm" role="status">Carregando ONGs...</p>}
      {error && <p className="px-6 pb-6 text-sm text-red-600" role="alert">{error.message}</p>}
      {data && data.organizations.length === 0 && (
        <p className="admin-muted px-6 pb-6 text-sm">Nenhuma ONG cadastrada.</p>
      )}
      {data && data.organizations.length > 0 && (
        <>
          <div className="admin-table-wrap overflow-x-auto">
            <table className="admin-table w-full text-left text-sm">
              <caption className="sr-only">Lista de ONGs cadastradas</caption>
              <thead><tr>
                {(["ONG", "Pessoas", "Contato", "Cadastro"] as const).map((label) => (
                  <th scope="col" key={label}>{label}</th>
                ))}
              </tr></thead>
              <tbody>
                {data.organizations.map((org) => (
                  <tr key={org.id}>
                    <td data-label="ONG">
                      <span className="admin-avatar">{org.name.charAt(0).toUpperCase()}</span>
                      <span className="min-w-0"><strong className="block">{org.name}</strong>{org.cnpj && <small className="admin-muted block">CNPJ: {org.cnpj}</small>}{org.website && <small className="admin-muted block break-all">{org.website}</small>}<span className="mt-1 flex gap-3"><button type="button" onClick={() => setSelectedOrgId(selectedOrgId === org.id ? null : org.id)} className="text-xs font-semibold text-[#256441]">{selectedOrgId === org.id ? "Ocultar pessoas" : "Ver pessoas"}</button><button type="button" onClick={() => onTransfer(org.id)} className="text-xs font-semibold text-[#256441]">Transferir animais</button></span></span>
                    </td>
                    <td data-label="Pessoas" className="admin-muted">{org.volunteers} voluntários · {org.externals} externos</td>
                    <td data-label="Contato" className="admin-muted">{org.phone || "Não informado"}</td>
                    <td data-label="Cadastro" className="admin-muted whitespace-nowrap">
                      {new Date(org.createdAt).toLocaleDateString("pt-BR")}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {selectedOrgId && <OrganizationPeople organizationId={selectedOrgId} updatedAt={updatedAt} onClose={() => setSelectedOrgId(null)} />}
          {lastPage > 1 && (
            <nav aria-label="Páginas de ONGs" className="flex items-center justify-end gap-3 border-t border-[#e1e8e2] px-5 py-4 sm:px-6">
              <button type="button" className="admin-secondary-link disabled:opacity-50" disabled={page === 1 || isFetching} onClick={() => { setSelectedOrgId(null); setPage((value) => value - 1); }}>Anterior</button>
              <span className="admin-muted text-xs">Página {page} de {lastPage}</span>
              <button type="button" className="admin-secondary-link disabled:opacity-50" disabled={page >= lastPage || isFetching} onClick={() => { setSelectedOrgId(null); setPage((value) => value + 1); }}>Próxima</button>
            </nav>
          )}
        </>
      )}
    </section>
  );
}
