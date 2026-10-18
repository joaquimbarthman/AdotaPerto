"use client";

import { apiBaseUrl } from "@/lib/api-url";
import { authClient, useSession } from "@/lib/auth-client";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { uploadImages } from "@/lib/uploads";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState, type FormEvent } from "react";

type Org = { id: string; name: string; slug: string; logo: string | null; cnpj: string | null; phone: string | null; website: string | null; instagram: string | null; description: string | null };
type OrgOption = { organization: Org; role: string };
type Member = { id: string; userId: string; name: string; email: string; role: string; createdAt: string };
type Publication = { id: string; name?: string; title?: string; image?: string | null; mainImage?: string; status: string; userId: string; createdAt: string };
type Request = { id: string; status: string; quantity?: number; createdAt: string; animalName?: string; itemTitle?: string; requesterName: string; ownerId: string };
type Invitation = { id: string; email: string; role: string | null; expiresAt: string };
type Dashboard = { organization: Org; role: string; members: Member[]; animals: Publication[]; items: Publication[]; adoptionRequests: Request[]; itemRequests: Request[]; invitations: Invitation[] };
type Tab = "visao-geral" | "publicacoes" | "solicitacoes" | "equipe" | "dados";
const tabs: { id: Tab; label: string }[] = [
  { id: "visao-geral", label: "Visão geral" }, { id: "publicacoes", label: "Publicações" },
  { id: "solicitacoes", label: "Solicitações" }, { id: "equipe", label: "Equipe" }, { id: "dados", label: "Dados da ONG" },
];
const box = "rounded-2xl border border-[#d7e6da] bg-white p-5 shadow-sm sm:p-6";
const input = "min-h-11 w-full rounded-lg border border-[#c8d2ca] bg-white px-3 py-2 text-sm outline-none focus:border-[#256441]";
const button = "min-h-11 rounded-lg bg-[#256441] px-4 py-2 text-sm font-bold text-white disabled:opacity-50";

function roleLabel(role: string) {
  return role === "owner" ? "Responsável" : role === "admin" ? "Gestor" : "Membro";
}

function slugFor(name: string) {
  return `${name.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "ong"}-${crypto.randomUUID().slice(0, 8)}`;
}

export default function OrganizationPage() {
  const router = useRouter();
  const { data: session, isPending } = useSession();
  const [organizations, setOrganizations] = useState<OrgOption[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [dashboard, setDashboard] = useState<Dashboard | null>(null);
  const [tab, setTab] = useState<Tab>("visao-geral");
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
    if (!session) { router.replace("/login?reason=unauthenticated"); return; }
    const params = new URLSearchParams(window.location.search);
    const initialTab = params.get("tab") as Tab;
    if (tabs.some((item) => item.id === initialTab)) setTab(initialTab);
    void load(params.get("id"));
  }, [isPending, session?.user.id, router, load]);

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

  async function updateRequest(kind: "animal" | "item", id: string, status: "Aprovada" | "Recusada") {
    if (!selectedId) return;
    setBusy(true); setError(null);
    try {
      const route = kind === "animal" ? "adoption-requests" : "donation-item-requests";
      const response = await fetch(`${apiBaseUrl()}/api/${route}/${encodeURIComponent(id)}/status`, { method: "PATCH", credentials: "include", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ status }) });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Não foi possível atualizar a solicitação.");
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
  const date = (value: string) => new Date(value).toLocaleDateString("pt-BR");

  return <div className="min-h-screen bg-[#eefdf1] text-[#253129]"><SiteHeader /><main className="mx-auto max-w-[1200px] px-4 pb-28 pt-8 sm:px-6 lg:px-12 lg:pb-16">
    <Link href="/perfil" className="text-sm font-semibold text-[#256441]">← Meu perfil</Link>
    <header className="mt-5 flex flex-wrap items-end justify-between gap-4"><div className="flex items-center gap-4">{dashboard?.organization.logo && <img src={dashboard.organization.logo} alt="" className="size-16 rounded-xl border border-[#d7e6da] bg-white object-cover" />}<div><p className="text-xs font-bold uppercase tracking-widest text-[#43805a]">Área da organização</p><h1 className="mt-2 text-3xl font-extrabold sm:text-4xl">{dashboard?.organization.name || "Painel da ONG"}</h1><p className="mt-2 text-sm text-[#68726b]">Gerencie a equipe, os anúncios e as solicitações da sua organização.</p></div></div>
    {organizations.length > 1 && <label className="text-xs font-semibold">Organização<select className={`${input} mt-1`} value={selectedId || ""} onChange={(event) => selectOrganization(event.target.value)}>{organizations.map(({ organization }) => <option key={organization.id} value={organization.id}>{organization.name}</option>)}</select></label>}</header>
    {error && <p role="alert" className="mt-5 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800">{error}</p>}
    {message && <p role="status" className="mt-5 rounded-xl border border-green-200 bg-green-50 p-4 text-sm text-green-800">{message}</p>}
    {loading || isPending ? <p role="status" className={`${box} mt-6`}>Carregando painel...</p> : !dashboard ? <section className={`${box} mt-6 max-w-xl`}><h2 className="text-lg font-bold">Você ainda não faz parte de uma ONG</h2><p className="mt-2 text-sm text-[#68726b]">Crie uma organização ou peça um convite a um gestor.</p><form onSubmit={createOrganization} className="mt-5 flex flex-wrap gap-3"><input name="name" required minLength={2} maxLength={160} placeholder="Nome da ONG" className={`${input} flex-1`} /><button disabled={busy} className={button}>Criar ONG</button></form></section> : <>
      <nav className="mt-8 flex gap-2 overflow-x-auto border-b border-[#cbded0] pb-2" aria-label="Seções da organização">{tabs.map(({ id, label }) => <button key={id} type="button" onClick={() => selectTab(id)} className={`shrink-0 rounded-lg px-4 py-2 text-sm font-semibold ${tab === id ? "bg-[#256441] text-white" : "text-[#526057] hover:bg-white"}`}>{label}</button>)}</nav>
      {tab === "visao-geral" && <div className="mt-6 space-y-6"><div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">{[["Animais", dashboard.animals.length], ["Itens", dashboard.items.length], ["Solicitações", dashboard.adoptionRequests.length + dashboard.itemRequests.length], ["Membros", dashboard.members.length]].map(([label, value]) => <div key={label} className={box}><p className="text-sm text-[#68726b]">{label}</p><strong className="mt-2 block text-3xl text-[#256441]">{value}</strong></div>)}</div><div className={`${box} flex flex-wrap items-center justify-between gap-4`}><div><h2 className="text-lg font-bold">Publicações da ONG</h2><p className="text-sm text-[#68726b]">Publique usando a organização para aparecer neste painel.</p></div><div className="flex flex-wrap gap-2"><Link className={button} href={`/doacoes/animal?organization=${encodeURIComponent(dashboard.organization.id)}`}>Cadastrar animal</Link><Link className={button} href={`/doacoes/item?organization=${encodeURIComponent(dashboard.organization.id)}`}>Publicar item</Link></div></div></div>}
      {tab === "publicacoes" && <div className="mt-6 space-y-5"><div className="flex flex-wrap gap-2"><Link className={button} href={`/doacoes/animal?organization=${encodeURIComponent(dashboard.organization.id)}`}>Cadastrar animal</Link><Link className={button} href={`/doacoes/item?organization=${encodeURIComponent(dashboard.organization.id)}`}>Publicar item</Link></div><section className={box}><h2 className="text-sm font-bold">Já publicou pela sua conta?</h2><p className="mt-1 text-sm text-[#68726b]">Vincule suas publicações pessoais à ONG para gerenciá-las aqui. Publicações de outras pessoas não serão alteradas.</p><button type="button" disabled={busy} onClick={claimPublications} className="mt-3 text-sm font-bold text-[#256441] underline disabled:opacity-50">Vincular minhas publicações</button></section><PublicationList title="Animais" rows={dashboard.animals} kind="animal" currentUserId={session?.user.id} canManage={canManage} busy={busy} onDelete={deletePublication} /><PublicationList title="Itens para doação" rows={dashboard.items} kind="item" currentUserId={session?.user.id} canManage={canManage} busy={busy} onDelete={deletePublication} /></div>}
      {tab === "solicitacoes" && <div className="mt-6 space-y-5"><RequestList title="Pedidos de adoção" rows={dashboard.adoptionRequests} kind="animal" currentUserId={session?.user.id} canManage={canManage} busy={busy} onStatus={updateRequest} /><RequestList title="Pedidos de itens" rows={dashboard.itemRequests} kind="item" currentUserId={session?.user.id} canManage={canManage} busy={busy} onStatus={updateRequest} /></div>}
      {tab === "equipe" && <div className="mt-6 grid gap-5 lg:grid-cols-2"><section className={box}><h2 className="text-lg font-bold">Membros</h2><div className="mt-4 divide-y divide-[#e4eee7]">{dashboard.members.map((person) => <div key={person.id} className="flex flex-wrap items-center justify-between gap-3 py-3"><div><strong className="text-sm">{person.name}</strong><p className="text-xs text-[#68726b]">{person.email} · {roleLabel(person.role)}</p></div>{canManage && person.role !== "owner" && <div className="flex gap-2"><select aria-label={`Função de ${person.name}`} value={person.role} disabled={busy} onChange={(event) => void changeRole(person.id, event.target.value as "admin" | "member")} className={input}><option value="member">Membro</option><option value="admin">Gestor</option></select><button type="button" disabled={busy} onClick={() => void removeMember(person.id)} className="text-xs font-semibold text-red-700">Remover</button></div>}</div>)}</div></section><section className={box}><h2 className="text-lg font-bold">Convites</h2>{canManage ? <><form onSubmit={invite} className="mt-4 space-y-3"><input type="email" required value={inviteEmail} onChange={(event) => setInviteEmail(event.target.value)} placeholder="E-mail do convidado" className={input} /><div className="flex gap-2"><select value={inviteRole} onChange={(event) => setInviteRole(event.target.value as "member" | "admin")} className={input}><option value="member">Membro</option><option value="admin">Gestor</option></select><button disabled={busy} className={`${button} shrink-0`}>Convidar</button></div></form><div className="mt-5 divide-y divide-[#e4eee7]">{dashboard.invitations.map((row) => <div key={row.id} className="py-3"><p className="text-sm font-semibold">{row.email}</p><p className="text-xs text-[#68726b]">{roleLabel(row.role || "member")} · expira em {date(row.expiresAt)}</p><div className="mt-2 flex gap-3"><button type="button" onClick={() => void navigator.clipboard.writeText(`${window.location.origin}/organizacao/convite?id=${encodeURIComponent(row.id)}`).then(() => setMessage("Link copiado."))} className="text-xs font-semibold text-[#256441]">Copiar link</button><button type="button" disabled={busy} onClick={() => void cancelInvitation(row.id)} className="text-xs font-semibold text-red-700">Cancelar</button></div></div>)}{dashboard.invitations.length === 0 && <p className="py-4 text-sm text-[#68726b]">Nenhum convite pendente.</p>}</div></> : <p className="mt-4 text-sm text-[#68726b]">Convites e funções são gerenciados por responsáveis e gestores.</p>}</section></div>}
      {tab === "dados" && <section className={`${box} mt-6 max-w-3xl`}><h2 className="text-lg font-bold">Dados da organização</h2><form key={JSON.stringify(dashboard.organization)} onSubmit={saveOrganization} className="mt-5 grid gap-4 sm:grid-cols-2"><Field label="Nome" name="name" value={dashboard.organization.name} required disabled={!canManage} /><Field label="CNPJ" name="cnpj" value={dashboard.organization.cnpj} disabled={!canManage} /><Field label="Telefone" name="phone" value={dashboard.organization.phone} disabled={!canManage} /><Field label="Site" name="website" value={dashboard.organization.website} type="url" disabled={!canManage} /><Field label="Instagram" name="instagram" value={dashboard.organization.instagram} disabled={!canManage} /><label className="sm:col-span-2 text-sm font-semibold">Descrição<textarea name="description" defaultValue={dashboard.organization.description || ""} disabled={!canManage} rows={5} maxLength={2000} className={`${input} mt-1 resize-y`} /></label><label className="sm:col-span-2 text-sm font-semibold">Logo<input type="file" accept="image/png,image/jpeg,image/webp" disabled={!canManage} onChange={(event) => setLogoFile(event.target.files?.[0] || null)} className={`${input} mt-1`} /></label>{canManage && <button disabled={busy} className={`${button} sm:col-span-2 sm:justify-self-start`}>{busy ? "Salvando..." : "Salvar dados"}</button>}</form>{!canManage && <p className="mt-4 text-sm text-[#68726b]">Somente responsáveis e gestores podem editar esses dados.</p>}</section>}
    </>}
  </main><SiteFooter /></div>;
}

function Field({ label, name, value, required, disabled, type = "text" }: { label: string; name: string; value: string | null; required?: boolean; disabled?: boolean; type?: string }) {
  return <label className="text-sm font-semibold">{label}<input name={name} type={type} defaultValue={value || ""} required={required} disabled={disabled} maxLength={name === "name" ? 160 : 255} className={`${input} mt-1`} /></label>;
}

function PublicationList({ title, rows, kind, currentUserId, canManage, busy, onDelete }: { title: string; rows: Publication[]; kind: "animal" | "item"; currentUserId?: string; canManage: boolean; busy: boolean; onDelete: (kind: "animal" | "item", id: string) => Promise<void> }) {
  return <section className={box}><h2 className="text-lg font-bold">{title} <span className="text-sm font-normal text-[#68726b]">({rows.length})</span></h2><div className="mt-4 divide-y divide-[#e4eee7]">{rows.length === 0 && <p className="py-4 text-sm text-[#68726b]">Nenhuma publicação da ONG.</p>}{rows.map((row) => <div key={row.id} className="flex flex-wrap items-center justify-between gap-3 py-3"><div><strong className="text-sm">{row.name || row.title}</strong><p className="text-xs text-[#68726b]">{row.status} · {new Date(row.createdAt).toLocaleDateString("pt-BR")}</p></div><div className="flex gap-3"><Link href={kind === "animal" ? `/adocao/${row.id}` : `/itens/${row.id}`} className="text-sm font-semibold text-[#256441]">Ver</Link>{(row.userId === currentUserId || canManage) && <><Link href={kind === "animal" ? `/doacoes/animal?edit=${row.id}` : `/doacoes/item?edit=${row.id}`} className="text-sm font-semibold text-[#256441]">Editar</Link><button type="button" disabled={busy} onClick={() => void onDelete(kind, row.id)} className="text-sm font-semibold text-red-700 disabled:opacity-50">Excluir</button></>}</div></div>)}</div></section>;
}

function RequestList({ title, rows, kind, currentUserId, canManage, busy, onStatus }: { title: string; rows: Request[]; kind: "animal" | "item"; currentUserId?: string; canManage: boolean; busy: boolean; onStatus: (kind: "animal" | "item", id: string, status: "Aprovada" | "Recusada") => Promise<void> }) {
  return <section className={box}><h2 className="text-lg font-bold">{title} <span className="text-sm font-normal text-[#68726b]">({rows.length})</span></h2><div className="mt-4 divide-y divide-[#e4eee7]">{rows.length === 0 && <p className="py-4 text-sm text-[#68726b]">Nenhuma solicitação recebida.</p>}{rows.map((row) => <div key={row.id} className="flex flex-wrap items-center justify-between gap-3 py-3"><div><strong className="text-sm">{row.animalName || row.itemTitle}</strong><p className="text-xs text-[#68726b]">{row.requesterName} · {row.status} · {new Date(row.createdAt).toLocaleDateString("pt-BR")}</p></div>{(row.ownerId === currentUserId || canManage) ? <div className="flex flex-wrap gap-3">{kind === "animal" && <Link href={`/perfil/solicitacoes/${row.id}`} className="text-sm font-semibold text-[#256441]">Detalhes</Link>}{["PENDING", "Em análise"].includes(row.status) && <><button type="button" disabled={busy} onClick={() => void onStatus(kind, row.id, "Aprovada")} className="text-sm font-semibold text-[#256441] disabled:opacity-50">Aprovar</button><button type="button" disabled={busy} onClick={() => void onStatus(kind, row.id, "Recusada")} className="text-sm font-semibold text-red-700 disabled:opacity-50">Recusar</button></>}</div> : <span className="text-xs text-[#68726b]">Acompanhamento</span>}</div>)}</div></section>;
}
