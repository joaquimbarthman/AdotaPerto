"use client";

import { useEffect, useState } from "react";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

type Org = { id: string; name: string };

export function OrganizationContextSelector() {
  const [organizations, setOrganizations] = useState<Org[]>([]);
  const [value, setValue] = useState("");
  const [isInstitutional, setIsInstitutional] = useState(false);

  useEffect(() => {
    Promise.all([
      fetch(`${API}/api/users/me`, { credentials: "include" }).then((response) => response.ok ? response.json() : null),
      fetch(`${API}/api/organizations/mine`, { credentials: "include" }).then((response) => response.ok ? response.json() : []),
    ]).then(([profile, availableOrganizations]: [{ accountType?: string } | null, Org[]]) => {
      const institutional = profile?.accountType === "ORGANIZATION";
      setIsInstitutional(institutional);
      setOrganizations(availableOrganizations);

      if (!institutional || !availableOrganizations.length) {
        localStorage.removeItem("adotaperto-active-organization");
        setValue("");
        return;
      }

      const saved = localStorage.getItem("adotaperto-active-organization");
      const selected = availableOrganizations.some((org) => org.id === saved) ? saved! : availableOrganizations[0].id;
      localStorage.setItem("adotaperto-active-organization", selected);
      setValue(selected);
    }).catch(() => setIsInstitutional(false));
  }, []);

  if (!isInstitutional || !organizations.length) return null;

  return (
    <label className="block border-b border-[#e7eee9] px-3 py-3 text-[10px] font-bold uppercase tracking-wider text-[#68766d]">
      Perfil ativo
      <select
        value={value}
        onChange={(event) => {
          setValue(event.target.value);
          localStorage.setItem("adotaperto-active-organization", event.target.value);
          window.dispatchEvent(new CustomEvent("organization-context-change", { detail: event.target.value }));
        }}
        className="mt-1.5 h-9 w-full rounded-lg border border-[#c6d5ca] bg-white px-2 text-xs font-semibold normal-case tracking-normal text-[#26332b]"
      >
        {organizations.map((org) => <option key={org.id} value={org.id}>{org.name}</option>)}
      </select>
    </label>
  );
}
