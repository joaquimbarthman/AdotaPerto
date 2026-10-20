"use client";

import Link from "next/link";
import { useEffect, useState, type FormEvent, type ReactNode } from "react";
import { authClient } from "@/lib/auth-client";
import { uploadImages } from "@/lib/uploads";
import { Notification } from "@/components/notification";
import { API_BASE_URL } from "./config";
import type { UserProfile } from "./types";

type Organization = {
  id: string;
  name: string;
  slug: string;
  cnpj: string | null;
  description: string;
  legalRepresentativeName: string;
  logoUrl: string | null;
  coverUrl: string | null;
  contactEmail: string;
  whatsapp: string;
  postalCode: string | null;
  street: string | null;
  number: string | null;
  neighborhood: string | null;
  city: string;
  state: string;
  instagram: string | null;
  website: string | null;
  verificationStatus: string;
  role: string;
};

const field = "mt-1.5 h-11 w-full rounded-xl border border-[#c6d5ca] bg-white px-3 text-sm text-[#26332b] outline-none transition focus:border-[#256441] focus:ring-2 focus:ring-[#256441]/10";
const label = "text-sm font-semibold text-[#445249]";

type IconName = "building" | "camera" | "check" | "clock" | "map" | "save" | "shield";
function Icon({ name, size = 20, className = "" }: { name: IconName; size?: number; className?: string }) {
  const paths: Record<IconName, ReactNode> = {
    building: <><path d="M4 21V5a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v16"/><path d="M9 21v-4h4v4M8 7h1m3 0h1M8 11h1m3 0h1M3 21h18"/></>,
    camera: <><path d="M14.5 4 16 7h3a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V9a2 2 0 0 1 2-2h3l1.5-3z"/><circle cx="12" cy="13" r="3"/></>,
    check: <><circle cx="12" cy="12" r="9"/><path d="m8 12 2.5 2.5L16 9"/></>,
    clock: <><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></>,
    map: <><path d="M20 10c0 5-8 11-8 11S4 15 4 10a8 8 0 1 1 16 0Z"/><circle cx="12" cy="10" r="2.5"/></>,
    save: <><path d="M5 3h12l3 3v15H4V4a1 1 0 0 1 1-1Z"/><path d="M8 3v6h8V3M8 21v-7h8v7"/></>,
    shield: <><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Z"/><path d="m9 12 2 2 4-4"/></>,
  };
  return <svg aria-hidden="true" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>{paths[name]}</svg>;
}

function optional(value: FormDataEntryValue | null) {
  const text = String(value || "").trim();
  return text || null;
}

export function OrganizationProfile({ section, profile, onUpdated }: { section: "profile" | "address"; profile: UserProfile | null; onUpdated: (profile: UserProfile) => void }) {
  const [organization, setOrganization] = useState<Organization | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState<{ type: "success" | "error"; text: string } | null>(null);

  useEffect(() => {
    let active = true;
    fetch(`${API_BASE_URL}/api/organizations/mine`, { credentials: "include" })
      .then(async (response) => {
        if (!response.ok) throw new Error("Não foi possível carregar os dados da ONG.");
        return response.json() as Promise<Organization[]>;
      })
      .then((organizations) => { if (active) setOrganization(organizations[0] || null); })
      .catch((error) => { if (active) setNotice({ type: "error", text: error instanceof Error ? error.message : "Não foi possível carregar os dados da ONG." }); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, []);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!organization) return;
    setSaving(true);
    setNotice(null);

    try {
      const form = new FormData(event.currentTarget);
      const logoFile = section === "profile" && form.get("logo") instanceof File && (form.get("logo") as File).size ? form.get("logo") as File : null;
      const [uploadedLogo] = logoFile ? await uploadImages([logoFile]) : [];
      const logoUrl = uploadedLogo || organization.logoUrl;

      const body = {
        name: section === "profile" ? String(form.get("name") || "").trim() : organization.name,
        cnpj: section === "profile" ? String(form.get("cnpj") || "") : organization.cnpj || "",
        description: section === "profile" ? String(form.get("description") || "").trim() : organization.description,
        legalRepresentativeName: section === "profile" ? String(form.get("legalRepresentativeName") || "").trim() : organization.legalRepresentativeName,
        logoUrl: logoUrl || null,
        coverUrl: null,
        contactEmail: section === "profile" ? String(form.get("contactEmail") || "").trim() : organization.contactEmail,
        whatsapp: section === "profile" ? String(form.get("whatsapp") || "").trim() : organization.whatsapp,
        postalCode: section === "address" ? optional(form.get("postalCode")) : organization.postalCode,
        street: section === "address" ? optional(form.get("street")) : organization.street,
        number: section === "address" ? optional(form.get("number")) : organization.number,
        neighborhood: section === "address" ? optional(form.get("neighborhood")) : organization.neighborhood,
        city: section === "address" ? String(form.get("city") || "").trim() : organization.city,
        state: section === "address" ? String(form.get("state") || "").trim() : organization.state,
        instagram: section === "profile" ? optional(form.get("instagram")) : organization.instagram,
        website: section === "profile" ? optional(form.get("website")) : organization.website,
      };

      const response = await fetch(`${API_BASE_URL}/api/organizations/${organization.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(body),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Não foi possível salvar os dados institucionais.");

      setOrganization((current) => current ? { ...current, ...result } : result);
      await authClient.updateUser({ name: result.name, ...(result.logoUrl ? { image: result.logoUrl } : {}) });
      const profileResponse = await fetch(`${API_BASE_URL}/api/users/me`, { credentials: "include" });
      if (profileResponse.ok) onUpdated(await profileResponse.json());
      setNotice({ type: "success", text: section === "profile" ? "Perfil institucional atualizado com sucesso." : "Endereço da ONG atualizado com sucesso." });
    } catch (error) {
      setNotice({ type: "error", text: error instanceof Error ? error.message : "Não foi possível salvar os dados institucionais." });
    } finally {
      setSaving(false);
    }
  }

  if (profile?.accountType !== "ORGANIZATION") return null;
  if (loading) return <div className="rounded-2xl border border-[#d7e6da] bg-white p-8 text-center text-sm text-[#68766d]">Carregando perfil institucional...</div>;
  if (!organization) return <Notification type="error" text="A conta é institucional, mas a ONG vinculada não foi encontrada." />;

  const verified = organization.verificationStatus === "VERIFIED";
  const draft = organization.verificationStatus === "DRAFT";

  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.14em] text-[#3f7d58]"><Icon name={section === "profile" ? "building" : "map"} size={16} /> {section === "profile" ? "Perfil institucional" : "Localização institucional"}</p>
          <h2 className="mt-2 text-2xl font-extrabold text-[#26332b] sm:text-3xl">{section === "profile" ? "Perfil da sua ONG" : "Endereço da sua ONG"}</h2>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-[#5b675f]">{section === "profile" ? "Gerencie a identidade e os contatos públicos da organização." : "Mantenha separados e atualizados os dados de localização da organização."}</p>
        </div>
        {!draft && <Link href={`/ongs/${organization.slug}`} className="rounded-xl border border-[#86a590] px-4 py-2.5 text-center text-sm font-bold text-[#256441] transition hover:bg-[#f2f8f3]">Ver página pública</Link>}
      </header>

      {notice && <Notification {...notice} />}

      <div className={`flex items-start gap-3 rounded-2xl border p-4 ${verified ? "border-[#b8dbc2] bg-[#edf8f0]" : "border-[#ecd9ac] bg-[#fff9ea]"}`}>
        {verified ? <Icon name="check" className="mt-0.5 shrink-0 text-[#256441]" /> : <Icon name="clock" className="mt-0.5 shrink-0 text-[#9a6a13]" />}
        <div><p className="text-sm font-bold text-[#26332b]">{verified ? "ONG verificada" : draft ? "Complete o perfil institucional" : "Verificação institucional em análise"}</p><p className="mt-1 text-xs leading-5 text-[#5b675f]">{draft ? "Preencha os dados abaixo para enviar a ONG para análise e liberar sua página institucional." : "A confirmação do e-mail não concede automaticamente o selo institucional."}</p></div>
      </div>

      <form key={`${organization.id}-${section}`} onSubmit={submit} className="overflow-hidden rounded-2xl border border-[#d7e6da] bg-white shadow-sm">
        <div className="space-y-7 p-5 sm:p-7">
          {section === "profile" ? <section>
            <h3 className="flex items-center gap-2 text-base font-extrabold text-[#26332b]"><Icon name="shield" size={19} className="text-[#256441]" /> Identidade da instituição</h3>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <div className="flex items-center gap-4 rounded-xl border border-[#e0e9e2] bg-[#f7faf7] p-4 sm:col-span-2">
                <div className="flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-[#256441] text-2xl font-extrabold text-white shadow-sm">
                  {organization.logoUrl ? <span className="h-full w-full bg-cover bg-center" style={{ backgroundImage: `url(${organization.logoUrl})` }} aria-label={`Logotipo de ${organization.name}`} /> : organization.name.slice(0, 2).toUpperCase()}
                </div>
                <label className={`${label} flex-1`}><span className="flex items-center gap-2"><Icon name="camera" size={16} /> Logotipo da ONG</span><input name="logo" type="file" accept="image/*" className={`${field} py-2`} /></label>
              </div>
              <label className={label}>Nome da ONG<input name="name" required minLength={3} defaultValue={organization.name} className={field} /></label>
              <label className={label}>CNPJ<input name="cnpj" required defaultValue={organization.cnpj || ""} placeholder="00.000.000/0000-00" className={field} /></label>
              <label className={`${label} sm:col-span-2`}>Responsável legal<input name="legalRepresentativeName" required defaultValue={organization.legalRepresentativeName} className={field} /></label>
              <label className={`${label} sm:col-span-2`}>Descrição institucional<textarea name="description" required minLength={20} defaultValue={organization.description} rows={5} className="mt-1.5 w-full rounded-xl border border-[#c6d5ca] bg-white p-3 text-sm outline-none focus:border-[#256441] focus:ring-2 focus:ring-[#256441]/10" /></label>
              <label className={label}>E-mail institucional<input name="contactEmail" type="email" required defaultValue={organization.contactEmail} className={field} /></label>
              <label className={label}>WhatsApp<input name="whatsapp" required defaultValue={organization.whatsapp} className={field} /></label>
              <label className={label}>Instagram (opcional)<input name="instagram" defaultValue={organization.instagram || ""} className={field} /></label>
              <label className={label}>Site (opcional)<input name="website" type="url" defaultValue={organization.website || ""} placeholder="https://" className={field} /></label>
            </div>
          </section> : <section>
            <h3 className="flex items-center gap-2 text-base font-extrabold text-[#26332b]"><Icon name="map" size={19} className="text-[#256441]" /> Endereço institucional</h3>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <label className={label}>CEP<input name="postalCode" defaultValue={organization.postalCode || ""} className={field} /></label>
              <label className={label}>Rua<input name="street" defaultValue={organization.street || ""} className={field} /></label>
              <label className={label}>Número<input name="number" defaultValue={organization.number || ""} className={field} /></label>
              <label className={label}>Bairro<input name="neighborhood" defaultValue={organization.neighborhood || ""} className={field} /></label>
              <label className={label}>Cidade<input name="city" required defaultValue={organization.city} className={field} /></label>
              <label className={label}>Estado<input name="state" required maxLength={2} defaultValue={organization.state} className={field} /></label>
            </div>
          </section>}

          <div className="flex flex-col-reverse gap-3 border-t border-[#e7eee9] pt-6 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-xs leading-5 text-[#68766d]">{section === "profile" ? "Os contatos poderão aparecer nos detalhes das publicações da ONG." : "Cidade e estado poderão aparecer no perfil e nas publicações da ONG."}</p>
            <button disabled={saving} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-[#256441] px-6 py-3 text-sm font-bold text-white transition hover:bg-[#1e5235] disabled:cursor-not-allowed disabled:opacity-60"><Icon name="save" size={17} />{saving ? "Salvando..." : "Salvar alterações"}</button>
          </div>
        </div>
      </form>
    </div>
  );
}
