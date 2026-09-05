"use client";

import { Notification, notify } from "@/components/notification";

import { DirectionalChevron } from "@/components/directional-chevron";
import { DonationField, DonationFormSection, DonationPhotoPreview, DonationSelect, donationInputClass } from "@/components/donation-form-ui";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { useSession } from "@/lib/auth-client";
import { uploadImages } from "@/lib/uploads";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useEffect, useMemo, useRef, useState } from "react";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";
const expiryCategories = new Set(["Ração", "Petiscos", "Produtos de higiene", "Produtos de limpeza"]);
const conditions = ["Novo", "Lacrado", "Aberto em boas condições", "Usado em boas condições"];

export default function ItemDonationPage() {
  const router = useRouter();
  const { data: session } = useSession();
  const [category, setCategory] = useState("");
  const [mainPhoto, setMainPhoto] = useState<File | null>(null);
  const [extraPhotos, setExtraPhotos] = useState<File[]>([]);
  const [mainInputKey, setMainInputKey] = useState(0);
  const [extraInputKey, setExtraInputKey] = useState(0);
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [globalError, setGlobalError] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [editId, setEditId] = useState<string | null>(null);
  const [editData, setEditData] = useState<Record<string, unknown> | null>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const today = useMemo(() => new Date().toISOString().slice(0, 10), []);

  useEffect(() => {
    const id = new URLSearchParams(window.location.search).get("edit");
    if (id) queueMicrotask(() => setEditId(id));
  }, []);

  useEffect(() => {
    if (!editId) return;
    fetch(`${API_BASE_URL}/api/donation-items/${editId}`, { credentials: "include" })
      .then(async (response) => { if (!response.ok) throw new Error("Doação não encontrada."); return response.json(); })
      .then((data) => { setEditData(data); setCategory(String(data.category || "")); })
      .catch((cause: unknown) => setGlobalError(cause instanceof Error ? cause.message : "Não foi possível carregar a doação."));
  }, [editId]);

  useEffect(() => {
    if (!editData || !formRef.current) return;
    const values = { title: editData.title, category: editData.category, itemName: editData.itemName, quantity: editData.quantity, unit: editData.unit, condition: editData.condition, expirationDate: editData.expirationDate, description: editData.description, deliveryMethod: editData.deliveryMethod, availableUntil: editData.availableUntil };
    Object.entries(values).forEach(([name, value]) => {
      if (value == null) return;
      const controls = formRef.current?.elements.namedItem(name);
      if (controls instanceof RadioNodeList) controls.value = String(value);
      else if (controls instanceof HTMLInputElement || controls instanceof HTMLSelectElement || controls instanceof HTMLTextAreaElement) controls.value = String(value);
    });
  }, [editData]);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setGlobalError(null);
    const form = new FormData(event.currentTarget);
    const quantity = Number(form.get("quantity"));
    const availableUntil = String(form.get("availableUntil") || "");
    const fieldErrors: Record<string, string> = {};
    if (quantity <= 0) fieldErrors.quantity = "Informe uma quantidade maior que zero.";
    if (availableUntil && availableUntil < today) fieldErrors.availableUntil = "Escolha a data de hoje ou uma data futura.";
    if (!mainPhoto && !editData?.mainImage) fieldErrors.mainPhoto = "Adicione uma foto principal para publicar a doação.";
    setErrors(fieldErrors);
    if (Object.keys(fieldErrors).length) return;

    if (!session) { router.push("/login?reason=unauthenticated"); return; }
    setLoading(true);
    try {
      const files = [mainPhoto, ...extraPhotos].filter((file): file is File => file instanceof File);
      const urls = await uploadImages(files);
      const mainImage = mainPhoto ? urls[0] : String(editData?.mainImage || "");
      const images = extraPhotos.length ? urls.slice(mainPhoto ? 1 : 0) : (Array.isArray(editData?.images) ? editData.images : []);
      const response = await fetch(`${API_BASE_URL}/api/donation-items${editId ? `/${editId}` : ""}`, {
        method: editId ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          title: String(form.get("title")), category: String(form.get("category")), itemName: String(form.get("itemName")), quantity,
          unit: String(form.get("unit")), condition: String(form.get("condition")), expirationDate: String(form.get("expirationDate") || "") || null,
          description: String(form.get("description")), mainImage, images, deliveryMethod: String(form.get("deliveryMethod")),
          availableUntil: availableUntil || null,
        }),
      });
      const result = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(result.error || "Não foi possível publicar a doação.");
      setSent(true);
      notify("Doação salva com sucesso.", "success");
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (cause: unknown) {
      setGlobalError(cause instanceof Error ? cause.message : "Não foi possível publicar a doação.");
    } finally { setLoading(false); }
  }

  return <div className="min-h-screen bg-[#eefdf1] text-[#121e17]"><SiteHeader /><main className="mx-auto max-w-[1120px] px-5 py-9 sm:px-8 sm:py-12 lg:px-16">
    <Link href={editId ? "/perfil#publicacoes" : "/doacoes"} className="group inline-flex items-center gap-1.5 text-sm font-semibold text-[#404942] transition hover:text-[#256441]"><DirectionalChevron className="transition-transform group-hover:-translate-x-0.5" />{editId ? "Voltar às publicações" : "Voltar às opções"}</Link>
    <header className="mb-10 mt-6"><h1 className="text-3xl font-extrabold tracking-[-0.025em] sm:text-4xl lg:text-5xl">{editId ? "Editar anúncio do item" : "Publicar doação"}</h1><p className="mt-2 text-base leading-7 text-[#4d5b53] sm:text-lg">{editId ? "Revise todas as informações e mantenha o anúncio atualizado." : "Compartilhe itens e recursos que podem ajudar quem precisa."}</p></header>
    {globalError && <Notification text={globalError} />}
    {sent ? <Success editing={Boolean(editId)} /> : <form ref={formRef} onSubmit={submit} className="mx-auto grid max-w-[1120px] items-start gap-8 lg:grid-cols-[minmax(0,1fr)_300px]">
      <div className="flex min-w-0 flex-col gap-7">
      <DonationFormSection icon={<SectionIcon src="/icons/donations-profile.svg" />} title="Informações" description="Identifique o item e informe a quantidade disponível."><div className="grid gap-5 sm:grid-cols-2">
        <DonationField label="Título da doação" className="sm:col-span-2"><input name="title" required minLength={3} placeholder="Ex.: Ração para cães adultos" className={donationInputClass} /></DonationField>
        <DonationField label="Categoria"><DonationSelect name="category" onChange={(event) => setCategory(event.target.value)}><option>Ração</option><option>Petiscos</option><option>Produtos de higiene</option><option>Caminhas e cobertores</option><option>Coleiras e guias</option><option>Caixas de transporte</option><option>Brinquedos</option><option>Utensílios</option><option>Produtos de limpeza</option><option>Outros</option></DonationSelect></DonationField>
        <DonationField label="Nome do item"><input name="itemName" required minLength={2} placeholder="Ex.: Ração Premium 15 kg" className={donationInputClass} /></DonationField>
        <DonationField label="Quantidade" error={errors.quantity}><input name="quantity" type="number" min={1} step={1} required inputMode="numeric" placeholder="Ex.: 2" className={donationInputClass} onChange={() => setErrors((current) => ({ ...current, quantity: "" }))} /></DonationField>
        <DonationField label="Unidade"><DonationSelect name="unit"><option>Unidade</option><option>Kg</option><option>g</option><option>Litros</option><option>mL</option><option>Pacote</option><option>Caixa</option></DonationSelect></DonationField>
      </div></DonationFormSection>

      <DonationFormSection icon={<SectionIcon src="/icons/check-detail.svg" />} title="Detalhes" description="Descreva o estado do item com transparência."><div className="grid gap-5 sm:grid-cols-2">
        <fieldset className="sm:col-span-2"><legend className="mb-2 text-sm font-semibold">Condição do item <span className="text-red-600">*</span></legend><div className="grid gap-2 sm:grid-cols-2">{conditions.map((condition) => <label key={condition} className="flex min-h-12 cursor-pointer items-center gap-3 rounded-lg border border-[#c5cec7] bg-[#f7fcf8] px-4 py-3 text-sm text-[#404942] transition hover:border-[#86a590] has-[:checked]:border-[#256441] has-[:checked]:bg-[#e3f2e6] has-[:checked]:font-semibold has-[:checked]:text-[#194b30]"><input type="radio" name="condition" value={condition} required className="size-4 accent-[#256441]" />{condition}</label>)}</div></fieldset>
        {expiryCategories.has(category) && <DonationField label="Validade"><input name="expirationDate" type="date" min={today} required className={donationInputClass} /></DonationField>}
        <DonationField label="Descrição" className="sm:col-span-2"><textarea name="description" required minLength={10} maxLength={2000} rows={6} placeholder="Descreva o item, marca, tamanho, estado da embalagem e outras informações importantes..." className={`${donationInputClass} resize-y py-3 leading-6`} /></DonationField>
      </div></DonationFormSection>

      <DonationFormSection icon={<SectionIcon src="/icons/gallery.svg" />} title="Fotos" description="Use imagens claras e reais. A foto principal aparecerá em destaque no anúncio."><div className="grid gap-6 sm:grid-cols-2">
        <DonationField label="Foto principal" error={errors.mainPhoto}><input key={mainInputKey} type="file" accept="image/png,image/jpeg,image/webp" onChange={(event) => { setMainPhoto(event.target.files?.[0] || null); setErrors((current) => ({ ...current, mainPhoto: "" })); }} className="block min-h-14 w-full rounded-lg border border-dashed border-[#86a590] bg-[#f7fcf8] p-3 text-sm file:mr-3 file:rounded-lg file:border-0 file:bg-[#256441] file:px-4 file:py-2 file:font-semibold file:text-white" />{mainPhoto && <div className="mt-3 max-w-64"><DonationPhotoPreview featured file={mainPhoto} label="Foto principal" onRemove={() => { setMainPhoto(null); setMainInputKey((value) => value + 1); }} /></div>}{!mainPhoto && typeof editData?.mainImage === "string" && <div className="relative mt-3 h-36 max-w-64 overflow-hidden rounded-xl"><Image src={editData.mainImage} alt="Foto atual" fill className="object-cover" /><span className="absolute bottom-2 left-2 rounded-md bg-black/65 px-2 py-1 text-xs text-white">Foto atual</span></div>}</DonationField>
        <DonationField label="Fotos adicionais" optional><input key={extraInputKey} type="file" accept="image/png,image/jpeg,image/webp" multiple onChange={(event) => setExtraPhotos(Array.from(event.target.files || []).slice(0, 5))} className="block min-h-14 w-full rounded-lg border border-dashed border-[#86a590] bg-[#f7fcf8] p-3 text-sm file:mr-3 file:rounded-lg file:border-0 file:bg-[#e3f2e6] file:px-4 file:py-2 file:font-semibold file:text-[#256441]" /><span className="text-xs font-normal text-[#526057]">Até 5 imagens adicionais.</span></DonationField>
      </div>{extraPhotos.length > 0 && <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-5">{extraPhotos.map((file, index) => <DonationPhotoPreview key={`${file.name}-${file.lastModified}-${index}`} file={file} label={`Foto adicional ${index + 1}`} onRemove={() => { setExtraPhotos((files) => files.filter((_, itemIndex) => itemIndex !== index)); setExtraInputKey((value) => value + 1); }} />)}</div>}</DonationFormSection>

      <DonationFormSection icon={<SectionIcon src="/icons/location.svg" />} title="Entrega" description="Defina como e até quando o item estará disponível."><div className="grid gap-5 sm:grid-cols-2">
        <DonationField label="Forma de entrega"><DonationSelect name="deliveryMethod"><option>Retirada</option><option>Entrega</option><option>A combinar</option></DonationSelect></DonationField>
        <DonationField label="Disponível até" optional error={errors.availableUntil}><input name="availableUntil" type="date" min={today} className={donationInputClass} onChange={() => setErrors((current) => ({ ...current, availableUntil: "" }))} /></DonationField>
      </div></DonationFormSection>

      <div className="grid gap-3 border-t border-[#d7e6da] pt-6 sm:grid-cols-[0.8fr_1.2fr]"><Link href={editId ? "/perfil#publicacoes" : "/doacoes"} className="flex min-h-[54px] items-center justify-center rounded-xl border border-[#256441] bg-white px-6 py-3 text-sm font-semibold text-[#256441] transition hover:bg-[#e8f7eb] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#256441]">Cancelar</Link><button type="submit" disabled={loading} className="flex min-h-[54px] items-center justify-center rounded-xl bg-[#0f5d39] px-6 py-3 text-sm font-semibold text-white shadow-[0_4px_12px_rgba(15,93,57,0.18)] transition hover:-translate-y-0.5 hover:bg-[#194b30] disabled:translate-y-0 disabled:cursor-wait disabled:opacity-60">{loading ? "Salvando..." : editId ? "Salvar alterações" : "Publicar doação"}</button></div>
      </div>

      <aside className="lg:sticky lg:top-28">
        <div className="mb-3 rounded-2xl border border-[#d7e6da] bg-white px-5 py-4 shadow-[0_4px_14px_rgba(38,51,43,0.04)]">
          <h2 className="text-lg font-bold text-[#194b30]">Dicas para uma boa doação</h2>
          <p className="mt-1 text-sm leading-5 text-[#526057]">Informações claras ajudam o item a chegar mais rápido a quem precisa.</p>
        </div>
        <ul className="divide-y divide-[#e6eee8] rounded-2xl border border-[#d7e6da] bg-white px-5 text-sm leading-5 text-[#526057] shadow-[0_4px_14px_rgba(38,51,43,0.04)]">
          <DonationTip icon="/icons/gallery.svg" title="Use fotos reais">Fotografe o item em um ambiente claro e mostre a embalagem e o estado de conservação.</DonationTip>
          <DonationTip icon="/icons/check-detail.svg" title="Descreva com transparência">Informe se o produto está aberto, usado ou possui alguma marca de uso.</DonationTip>
          <DonationTip icon="/icons/date.svg" title="Confira a validade">Para alimentos e produtos de higiene, verifique a data antes de publicar.</DonationTip>
        </ul>
      </aside>
    </form>}
  </main><SiteFooter /></div>;
}

function SectionIcon({ src }: { src: string }) { return <Image src={src} alt="" width={24} height={24} className="size-6 object-contain" />; }
function DonationTip({ icon, title, children }: { icon: string; title: string; children: React.ReactNode }) { return <li className="flex items-start gap-3 py-4"><span className="mt-0.5 grid size-6 shrink-0 place-items-center text-[#256441]"><Image src={icon} alt="" width={22} height={22} className="max-h-[22px] max-w-[22px] object-contain" /></span><span><strong className="mb-0.5 block text-[#253129]">{title}</strong>{children}</span></li>; }
function Success({ editing = false }: { editing?: boolean }) { return <section role="status" className="mx-auto max-w-[960px] rounded-2xl border border-[#86c99c] bg-white p-8 text-center shadow-sm sm:p-12"><div className="mx-auto grid size-16 place-items-center rounded-2xl bg-[#e3f2e6]"><Image src="/icons/available-detail.svg" alt="Doação salva" width={32} height={32} /></div><h2 className="mt-5 text-2xl font-bold">Doação {editing ? "atualizada" : "publicada"} com sucesso!</h2><p className="mx-auto mt-2 max-w-xl leading-7 text-[#526057]">O item foi salvo e já faz parte das suas publicações.</p><Link href={editing ? "/perfil#publicacoes" : "/doacoes"} className="mt-7 inline-flex min-h-12 items-center justify-center rounded-xl bg-[#256441] px-6 py-3 font-semibold text-white transition hover:bg-[#194b30]">{editing ? "Voltar às publicações" : "Voltar para doações"}</Link></section>; }
