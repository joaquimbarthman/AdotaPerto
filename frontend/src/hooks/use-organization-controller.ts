"use client";

import { apiBaseUrl } from "@/lib/api-url";
import { authClient, useSession } from "@/lib/auth-client";
import { uploadImages } from "@/lib/uploads";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState, type FormEvent } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { catalogKeys } from "@/lib/catalog";
import { organizationTabs, type Dashboard, type ExternalValues, type OrgOption, type Tab } from "@/components/organization/types";
function slugFor(name: string) {
  return `${name.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "ong"}-${crypto.randomUUID().slice(0, 8)}`;
}

export function useOrganizationController() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { data: session, isPending } = useSession();
  const userId = session?.user.id;
  const [organizations, setOrganizations] = useState<OrgOption[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [dashboard, setDashboard] = useState<Dashboard | null>(null);
  const [tab, setTab] = useState<Tab>(() => {
    if (typeof window === "undefined") return "visao-geral";
    const requested = new URLSearchParams(window.location.search).get("tab");
    return organizationTabs.find((item) => item.id === requested)?.id ?? "visao-geral";
  });
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState<"member" | "admin">("member");
  const [logoFile, setLogoFile] = useState<File | null>(null);

  const load = useCallback(async (requestedId?: string | null) => {
    setLoading(true);
    setError(null);
    setDashboard(null);
    try {
      const response = await fetch(`${apiBaseUrl()}/api/organizations/mine`, { credentials: "include", cache: "no-store" });
      if (!response.ok) throw new Error("Não foi possível carregar suas organizações.");
      const list = await response.json() as OrgOption[];
      setOrganizations(list);
      const id = requestedId && list.some((row) => row.organization.id === requestedId) ? requestedId : list[0]?.organization.id;
      setSelectedId(id || null);
      if (!id) { setDashboard(null); return; }
      const result = await fetch(`${apiBaseUrl()}/api/organizations/${encodeURIComponent(id)}/dashboard`, { credentials: "include", cache: "no-store" });
      if (!result.ok) throw new Error("Não foi possível carregar o painel da ONG.");
      setDashboard(await result.json() as Dashboard);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Não foi possível conectar ao servidor.");
    } finally { setLoading(false); }
  }, []);

  useEffect(() => {
    if (isPending) return;
    if (!userId) { router.replace("/login?reason=unauthenticated"); return; }
    const params = new URLSearchParams(window.location.search);
    let active = true;
    queueMicrotask(() => { if (active) void load(params.get("id")); });
    return () => { active = false; };
  }, [isPending, userId, router, load]);

  function selectOrganization(id: string) {
    window.history.replaceState(null, "", `/organizacao?id=${encodeURIComponent(id)}&tab=${tab}`);
    void load(id);
  }

  function selectTab(next: Tab) {
    setTab(next);
    window.history.replaceState(null, "", `/organizacao${selectedId ? `?id=${encodeURIComponent(selectedId)}&tab=${next}` : `?tab=${next}`}`);
  }

  async function createOrganization(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const name = String(form.get("name") || "").trim();
    if (!name) return;
    setBusy(true); setError(null);
    const result = await authClient.organization.create({ name, slug: slugFor(name) });
    setBusy(false);
    if (result.error) { setError(result.error.message || "Não foi possível criar a ONG."); return; }
    setMessage("Organização criada.");
    await load(result.data?.id);
  }

  async function saveOrganization(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!selectedId) return;
    const form = new FormData(event.currentTarget);
    const body = Object.fromEntries(["name", "cnpj", "phone", "website", "instagram", "description"].map((key) => [key, String(form.get(key) || "").trim() || null]));
    setBusy(true); setError(null); setMessage(null);
    try {
      const logo = logoFile ? (await uploadImages([logoFile]))[0] : dashboard?.organization.logo || null;
      Object.assign(body, { logo });
      const result = await fetch(`${apiBaseUrl()}/api/organizations/${encodeURIComponent(selectedId)}`, { method: "PATCH", credentials: "include", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
      const data = await result.json();
      if (!result.ok) throw new Error(data.error || "Não foi possível salvar os dados.");
      setMessage("Dados da ONG atualizados.");
      setLogoFile(null);
      await load(selectedId);
    } catch (cause) { setError(cause instanceof Error ? cause.message : "Erro ao salvar."); }
    finally { setBusy(false); }
  }

  async function invite(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!selectedId) return;
    setBusy(true); setError(null); setMessage(null);
    const result = await authClient.organization.inviteMember({ email: inviteEmail.trim(), role: inviteRole, organizationId: selectedId });
    setBusy(false);
    if (result.error) { setError(result.error.message || "Não foi possível enviar o convite."); return; }
    setInviteEmail(""); setMessage("Convite criado. Envie o link abaixo se o e-mail não estiver configurado.");
    await load(selectedId);
  }

  async function changeRole(memberId: string, role: "admin" | "member") {
    if (!selectedId) return;
    setBusy(true); setError(null);
    const result = await authClient.organization.updateMemberRole({ memberId, role, organizationId: selectedId });
    setBusy(false);
    if (result.error) { setError(result.error.message || "Não foi possível alterar a função."); return; }
    await load(selectedId);
  }

  async function removeMember(memberId: string) {
    if (!selectedId || !window.confirm("Remover esta pessoa da organização?")) return;
    setBusy(true); setError(null);
    const result = await authClient.organization.removeMember({ memberIdOrEmail: memberId, organizationId: selectedId });
    setBusy(false);
    if (result.error) { setError(result.error.message || "Não foi possível remover o membro."); return; }
    await load(selectedId);
  }

  async function cancelInvitation(invitationId: string) {
    if (!selectedId) return;
    setBusy(true); setError(null);
    const result = await authClient.organization.cancelInvitation({ invitationId });
    setBusy(false);
    if (result.error) { setError(result.error.message || "Não foi possível cancelar o convite."); return; }
    await load(selectedId);
  }

  async function saveExternal(id: string | null, values: ExternalValues) {
    if (!selectedId) return false;
    setBusy(true); setError(null); setMessage(null);
    try {
      const url = `${apiBaseUrl()}/api/organizations/${encodeURIComponent(selectedId)}/externals${id ? `/${encodeURIComponent(id)}` : ""}`;
      const response = await fetch(url, {
        method: id ? "PATCH" : "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Não foi possível salvar o contato externo.");
      setMessage(id ? "Contato externo atualizado." : "Contato externo cadastrado.");
      await load(selectedId);
      return true;
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Erro ao salvar o contato externo.");
      return false;
    } finally { setBusy(false); }
  }

  async function removeExternal(id: string) {
    if (!selectedId || !window.confirm("Remover este contato externo da ONG?")) return;
    setBusy(true); setError(null); setMessage(null);
    try {
      const response = await fetch(`${apiBaseUrl()}/api/organizations/${encodeURIComponent(selectedId)}/externals/${encodeURIComponent(id)}`, {
        method: "DELETE", credentials: "include",
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Não foi possível remover o contato externo.");
      setMessage("Contato externo removido.");
      await load(selectedId);
    } catch (cause) { setError(cause instanceof Error ? cause.message : "Erro ao remover o contato externo."); }
    finally { setBusy(false); }
  }

  async function updateRequest(kind: "animal" | "item", id: string, status: "Aprovada" | "Recusada") {
    if (!selectedId) return;
    setBusy(true); setError(null);
    try {
      const route = kind === "animal" ? "adoption-requests" : "donation-item-requests";
      const response = await fetch(`${apiBaseUrl()}/api/${route}/${encodeURIComponent(id)}/status`, { method: "PATCH", credentials: "include", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ status }) });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Não foi possível atualizar a solicitação.");
      void queryClient.invalidateQueries({ queryKey: kind === "animal" ? catalogKeys.animals : catalogKeys.items });
      void queryClient.invalidateQueries({ queryKey: ["catalog", kind] });
      void queryClient.invalidateQueries({ queryKey: ["map", "listings"] });
      setMessage(`Solicitação ${status.toLowerCase()}.`);
      await load(selectedId);
    } catch (cause) { setError(cause instanceof Error ? cause.message : "Erro ao atualizar solicitação."); }
    finally { setBusy(false); }
  }

  async function deletePublication(kind: "animal" | "item", id: string) {
    if (!selectedId || !window.confirm("Excluir esta publicação? As solicitações relacionadas também serão removidas.")) return;
    setBusy(true); setError(null);
    try {
      const route = kind === "animal" ? "animals" : "donation-items";
      const response = await fetch(`${apiBaseUrl()}/api/${route}/${encodeURIComponent(id)}`, { method: "DELETE", credentials: "include" });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Não foi possível excluir a publicação.");
      void queryClient.invalidateQueries({ queryKey: kind === "animal" ? catalogKeys.animals : catalogKeys.items });
      void queryClient.invalidateQueries({ queryKey: ["catalog", kind] });
      void queryClient.invalidateQueries({ queryKey: ["map", "listings"] });
      setMessage("Publicação excluída.");
      await load(selectedId);
    } catch (cause) { setError(cause instanceof Error ? cause.message : "Erro ao excluir publicação."); }
    finally { setBusy(false); }
  }

  async function claimPublications() {
    if (!selectedId || !window.confirm("Vincular todas as suas publicações pessoais à organização?")) return;
    setBusy(true); setError(null);
    try {
      const response = await fetch(`${apiBaseUrl()}/api/organizations/${encodeURIComponent(selectedId)}/claim-publications`, { method: "POST", credentials: "include" });
      const result: { animalsClaimed?: number; itemsClaimed?: number; error?: string } = await response.json();
      if (!response.ok) throw new Error(result.error || "Não foi possível vincular as publicações.");
      setMessage(`${result.animalsClaimed || 0} animais e ${result.itemsClaimed || 0} itens vinculados à ONG.`);
      await load(selectedId);
    } catch (cause) { setError(cause instanceof Error ? cause.message : "Erro ao vincular publicações."); }
    finally { setBusy(false); }
  }

  const canManage = dashboard?.role.split(",").some((role) => role === "owner" || role === "admin") ?? false;

  return {
    session, isPending, organizations, selectedId, dashboard, tab, loading, busy, error, message,
    inviteEmail, setInviteEmail, inviteRole, setInviteRole, selectOrganization, selectTab,
    createOrganization, saveOrganization, invite, changeRole, removeMember, cancelInvitation,
    saveExternal, removeExternal,
    updateRequest, deletePublication, claimPublications, canManage, setMessage, setLogoFile,
  };
}
