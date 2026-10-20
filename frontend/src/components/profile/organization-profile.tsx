"use client";

import Link from "next/link";
import { useEffect, useState, type FormEvent } from "react";
import { authClient } from "@/lib/auth-client";
import { uploadImages } from "@/lib/uploads";
import { Notification } from "@/components/notification";
import { API_BASE_URL } from "./config";
import { ProfileField, SectionHeading } from "./profile-ui";
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

function optional(value: FormDataEntryValue | null) {
  const text = String(value || "").trim();
  return text || null;
}

function formatCnpj(value: string) {
  const digits = value.replace(/\D/g, "").slice(0, 14);
  return digits
    .replace(/^(\d{2})(\d)/, "$1.$2")
    .replace(/^(\d{2})\.(\d{3})(\d)/, "$1.$2.$3")
    .replace(/\.(\d{3})(\d)/, ".$1/$2")
    .replace(/(\/\d{4})(\d)/, "$1-$2");
}

function formatPhone(value: string) {
  const digits = value.replace(/\D/g, "").slice(0, 11);
  if (digits.length <= 2) return digits ? `(${digits}` : "";
  if (digits.length <= 6) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
  if (digits.length <= 10) return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`;
  return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
}

export function OrganizationProfile({ section, profile, onUpdated }: { section: "profile" | "address"; profile: UserProfile | null; onUpdated: (profile: UserProfile) => void }) {
  const [organization, setOrganization] = useState<Organization | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [cnpj, setCnpj] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [notice, setNotice] = useState<{ type: "success" | "error"; text: string } | null>(null);

  useEffect(() => {
    let active = true;
    fetch(`${API_BASE_URL}/api/organizations/mine`, { credentials: "include" })
      .then(async (response) => {
        if (!response.ok) throw new Error("Não foi possível carregar os dados da ONG.");
        return response.json() as Promise<Organization[]>;
      })
      .then((organizations) => {
        if (!active) return;
        const current = organizations[0] || null;
        setOrganization(current);
        setCnpj(formatCnpj(current?.cnpj || ""));
        setWhatsapp(formatPhone(current?.whatsapp || ""));
      })
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

      const body = section === "profile"
        ? {
            name: String(form.get("name") || "").trim(),
            cnpj: String(form.get("cnpj") || ""),
            description: String(form.get("description") || "").trim(),
            legalRepresentativeName: String(form.get("legalRepresentativeName") || "").trim(),
            logoUrl: logoUrl || null,
            contactEmail: String(form.get("contactEmail") || "").trim(),
            whatsapp: String(form.get("whatsapp") || "").trim(),
            instagram: optional(form.get("instagram")),
            website: optional(form.get("website")),
          }
        : {
            postalCode: optional(form.get("postalCode")),
            street: optional(form.get("street")),
            number: optional(form.get("number")),
            neighborhood: optional(form.get("neighborhood")),
            city: String(form.get("city") || "").trim(),
            state: String(form.get("state") || "").trim(),
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
    <div className="space-y-4 sm:space-y-6">
      {notice && <Notification {...notice} />}

      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <SectionHeading
          flush
          eyebrow={section === "profile" ? "Perfil institucional" : "Localização institucional"}
          title={section === "profile" ? "Perfil da sua ONG" : "Endereço"}
          description={section === "profile" ? "Consulte e atualize as informações públicas da organização." : "Essas informações ajudam as pessoas a encontrar sua organização e suas iniciativas."}
        />
        {!draft && <Link href={`/ongs/${organization.slug}`} className="shrink-0 rounded-lg border border-[#86a590] px-4 py-2.5 text-center text-sm font-bold text-[#256441] transition hover:bg-[#e8f7eb]">Ver página pública</Link>}
      </div>

      <form key={`${organization.id}-${section}`} onSubmit={submit} className="overflow-hidden rounded-xl bg-white shadow-[0_4px_12px_rgba(38,51,43,0.05)]">
        <div className="min-h-0 p-4 sm:min-h-[420px] sm:p-7">
          <div className={`mb-6 rounded-xl border px-4 py-3 text-sm ${verified ? "border-[#b8dbc2] bg-[#edf8f0] text-[#256441]" : "border-[#ecd9ac] bg-[#fff9ea] text-[#765315]"}`}>
            <strong>{verified ? "ONG verificada" : draft ? "Complete o perfil institucional" : "Verificação institucional em análise"}</strong>
            <p className="mt-1 text-xs leading-5 text-[#5b675f]">{draft ? "Preencha os dados para enviar a organização para análise." : "A confirmação do e-mail não concede automaticamente o selo institucional."}</p>
          </div>

          {section === "profile" ? (
            <div className="grid gap-5 sm:gap-8 lg:grid-cols-[180px_1fr] lg:gap-12">
              <div>
                <p className="mb-3 text-sm font-bold text-[#253129]">Foto de perfil</p>
                <div className="flex items-center gap-4 lg:flex-col lg:items-start">
                  <div className="flex size-28 items-center justify-center overflow-hidden rounded-full border-4 border-[#d7e6da] bg-[#256441] text-3xl font-extrabold text-white sm:size-36">
                    {organization.logoUrl ? <span className="size-full bg-cover bg-center" style={{ backgroundImage: `url(${organization.logoUrl})` }} aria-label={`Logotipo de ${organization.name}`} /> : organization.name.slice(0, 2).toUpperCase()}
                  </div>
                  <label className="cursor-pointer rounded-lg border border-[#86a590] px-3 py-2 text-xs font-bold text-[#256441] transition hover:bg-[#e8f7eb]">
                    Alterar foto
                    <input name="logo" type="file" accept="image/*" className="sr-only" />
                  </label>
                </div>
              </div>
              <div className="grid content-start gap-4 sm:grid-cols-2 sm:gap-5">
                <div className="sm:col-span-2"><ProfileField label="Nome da ONG" name="name" defaultValue={organization.name} minLength={3} required /></div>
                <ProfileField label="CNPJ" name="cnpj" value={cnpj} onChange={(event) => setCnpj(formatCnpj(event.target.value))} maxLength={18} inputMode="numeric" placeholder="00.000.000/0000-00" required />
                <ProfileField label="Responsável legal" name="legalRepresentativeName" defaultValue={organization.legalRepresentativeName} required />
                <ProfileField label="E-mail institucional" name="contactEmail" type="email" defaultValue={organization.contactEmail} required />
                <ProfileField label="WhatsApp / número" name="whatsapp" type="tel" value={whatsapp} onChange={(event) => setWhatsapp(formatPhone(event.target.value))} maxLength={15} inputMode="tel" placeholder="(00) 00000-0000" required />
                <ProfileField label="Instagram" name="instagram" defaultValue={organization.instagram || ""} placeholder="@suaong" />
                <ProfileField label="Site" name="website" type="url" defaultValue={organization.website || ""} placeholder="https://" />
                <label className="sm:col-span-2">
                  <span className="mb-2 block text-sm font-bold text-[#253129]">Descrição institucional</span>
                  <textarea name="description" required minLength={20} maxLength={2000} defaultValue={organization.description} rows={5} className="w-full resize-y rounded-xl border border-[#c0c9bf] bg-[#f7fcf8] px-4 py-3 text-sm leading-6 text-[#121e17] outline-none transition placeholder:text-[#879188] focus:border-[#3f7d58] focus:ring-2 focus:ring-[#3f7d58]/15" />
                </label>
              </div>
            </div>
          ) : (
            <div className="grid max-w-3xl gap-5 sm:grid-cols-2">
              <div className="sm:max-w-[240px]"><ProfileField label="CEP" name="postalCode" defaultValue={organization.postalCode || ""} placeholder="00000-000" /></div>
              <div className="hidden sm:block" />
              <div className="sm:col-span-2"><ProfileField label="Rua" name="street" defaultValue={organization.street || ""} placeholder="Digite o nome da rua" /></div>
              <ProfileField label="Número" name="number" defaultValue={organization.number || ""} />
              <ProfileField label="Bairro" name="neighborhood" defaultValue={organization.neighborhood || ""} />
              <ProfileField label="Cidade" name="city" defaultValue={organization.city} required />
              <ProfileField label="UF" name="state" defaultValue={organization.state} minLength={2} required />
            </div>
          )}
        </div>

        <footer className="grid w-full grid-cols-[minmax(0,0.75fr)_minmax(0,1.25fr)] gap-2.5 border-t border-[#d7e6da] bg-[#f7fcf8] px-4 py-3 sm:gap-3 sm:px-7 sm:py-4">
          <button type="reset" className="min-h-12 w-full rounded-xl border border-[#86a590] bg-white px-3 py-2.5 text-xs font-bold text-[#256441] transition hover:bg-[#e8f7eb] active:scale-[0.98] sm:px-6 sm:text-sm">Cancelar</button>
          <button type="submit" disabled={saving} className="min-h-12 w-full rounded-xl bg-[#256441] px-3 py-2.5 text-xs font-extrabold text-white shadow-md transition hover:-translate-y-0.5 hover:bg-[#194b30] hover:shadow-lg active:scale-[0.98] disabled:opacity-60 sm:px-7 sm:text-sm">{saving ? "Salvando..." : "Salvar alterações"}</button>
        </footer>
      </form>
    </div>
  );
}
