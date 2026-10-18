"use client";

import { apiBaseUrl } from "@/lib/api-url";
import { useQuery } from "@tanstack/react-query";

type PeopleResponse = {
  organization: { id: string; name: string };
  volunteers: { id: string; name: string; email: string }[];
  externals: { id: string; name: string; kind: string; email: string | null; phone: string | null; notes: string | null }[];
};

export function OrganizationPeople({ organizationId, updatedAt, onClose }: {
  organizationId: string;
  updatedAt: string;
  onClose: () => void;
}) {
  const { data, error, isPending } = useQuery({
    queryKey: ["admin", "organization-people", organizationId, updatedAt],
    queryFn: async (): Promise<PeopleResponse> => {
      const response = await fetch(`${apiBaseUrl()}/api/admin/organizations/${encodeURIComponent(organizationId)}/people`, {
        credentials: "include", cache: "no-store",
      });
      if (!response.ok) throw new Error("Não foi possível carregar as pessoas da ONG.");
      return response.json();
    },
  });

  return <div className="border-t border-[#e1e8e2] px-5 py-5 sm:px-6">
    <div className="flex items-center justify-between gap-3">
      <h3 className="text-sm font-bold">Pessoas da ONG {data?.organization.name || ""}</h3>
      <button type="button" onClick={onClose} className="text-xs font-semibold text-[#256441]">Fechar</button>
    </div>
    {isPending && <p role="status" className="admin-muted mt-3 text-sm">Carregando pessoas...</p>}
    {error && <p role="alert" className="mt-3 text-sm text-red-600">{error.message}</p>}
    {data && <div className="mt-4 grid gap-5 md:grid-cols-2">
      <div>
        <h4 className="text-sm font-bold">Voluntários ({data.volunteers.length})</h4>
        {data.volunteers.length === 0 ? <p className="admin-muted mt-2 text-sm">Nenhum voluntário cadastrado.</p> :
          <ul className="mt-2 space-y-2 text-sm">{data.volunteers.map((person) =>
            <li key={person.id}><strong className="block">{person.name}</strong><span className="admin-muted">{person.email}</span></li>)}</ul>}
      </div>
      <div>
        <h4 className="text-sm font-bold">Externos ({data.externals.length})</h4>
        {data.externals.length === 0 ? <p className="admin-muted mt-2 text-sm">Nenhum contato externo cadastrado.</p> :
          <ul className="mt-2 space-y-2 text-sm">{data.externals.map((person) =>
            <li key={person.id}>
              <strong className="block">{person.name} <span className="admin-muted font-normal">· {person.kind}</span></strong>
              {(person.email || person.phone) && <span className="admin-muted">{[person.email, person.phone].filter(Boolean).join(" · ")}</span>}
              {person.notes && <p className="admin-muted text-xs">{person.notes}</p>}
            </li>)}</ul>}
      </div>
    </div>}
  </div>;
}
