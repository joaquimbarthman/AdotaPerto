"use client";
import { apiBaseUrl } from "@/lib/api-url";

import { notify } from "@/components/notification";

import { SiteHeader } from "@/components/site-header";
import { useSession } from "@/lib/auth-client";
import { uploadImages } from "@/lib/uploads";
import { useProfileAddressGuard } from "@/hooks/use-profile-address-guard";
import { useRouter } from "next/navigation";
import { FormEvent, useEffect, useMemo, useRef, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { catalogKeys } from "@/lib/catalog";
import { ItemDonationForm } from "@/components/donation/item-donation-form";

const API_BASE_URL = apiBaseUrl();
export default function ItemDonationPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { data: session, isPending } = useSession();
  const checkingAddress = useProfileAddressGuard(session?.user.id, isPending, true, true);
  const [category, setCategory] = useState("");
  const [mainPhoto, setMainPhoto] = useState<File | null>(null);
  const [extraPhotos, setExtraPhotos] = useState<File[]>([]);
  const [mainInputKey, setMainInputKey] = useState(0);
  const [extraInputKey, setExtraInputKey] = useState(0);
  const [loading, setLoading] = useState(false);
  const [globalError, setGlobalError] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [editId, setEditId] = useState<string | null>(null);
  const [organizationId, setOrganizationId] = useState<string | null>(null);
  const [editData, setEditData] = useState<Record<string, unknown> | null>(null);
  const [step, setStep] = useState(0);
  const formRef = useRef<HTMLFormElement>(null);
  const returnPath = organizationId ? `/organizacao?id=${encodeURIComponent(organizationId)}&tab=publicacoes` : editId ? "/perfil#publicacoes" : "/doacoes";
  const today = useMemo(() => new Date().toISOString().slice(0, 10), []);
  const steps = ["Informações do item", "Estado e descrição", "Fotos", "Entrega"] as const;

  function goToNextStep() {
    if (step === 2 && !mainPhoto && !editData?.mainImage) {
      setErrors((current) => ({ ...current, mainPhoto: "Adicione uma foto principal antes de continuar." }));
      return;
    }
    const container = formRef.current?.querySelector<HTMLElement>(`[data-donation-step="${step}"]`);
    const controls = container?.querySelectorAll<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>("input, select, textarea");
    for (const control of controls || []) {
      if (!control.checkValidity()) { control.reportValidity(); return; }
    }
    setStep((current) => Math.min(current + 1, steps.length - 1));
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  useEffect(() => {
    if (!isPending && !session) router.replace("/login?reason=unauthenticated");
  }, [isPending, router, session]);

  useEffect(() => {
    const id = new URLSearchParams(window.location.search).get("edit");
    if (id) queueMicrotask(() => setEditId(id));
    const organization = new URLSearchParams(window.location.search).get("organization");
    if (organization) queueMicrotask(() => setOrganizationId(organization));
  }, []);

  useEffect(() => {
    if (!editId) return;
    fetch(`${API_BASE_URL}/api/donation-items/${editId}`, { credentials: "include" })
      .then(async (response) => { if (!response.ok) throw new Error("Doação não encontrada."); return response.json(); })
      .then((data) => { setEditData(data); setCategory(String(data.category || "")); setOrganizationId(data.organizationId || null); })
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
          organizationId,
        }),
      });
      const result = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(result.error || "Não foi possível publicar a doação.");
      void queryClient.invalidateQueries({ queryKey: catalogKeys.items });
      void queryClient.invalidateQueries({ queryKey: ["catalog", "item"] });
      void queryClient.invalidateQueries({ queryKey: ["map", "listings"] });
      notify(editId ? "Item atualizado com sucesso." : "Item publicado com sucesso.", "success");
      router.push(organizationId ? `/organizacao?id=${encodeURIComponent(organizationId)}&tab=publicacoes` : editId ? "/perfil#publicacoes" : "/itens");
    } catch (cause: unknown) {
      setGlobalError(cause instanceof Error ? cause.message : "Não foi possível publicar a doação.");
    } finally { setLoading(false); }
  }

  if (isPending || !session || checkingAddress) return <div className="min-h-screen bg-[#eefdf1]"><SiteHeader /><main className="grid min-h-[60vh] place-items-center"><span className="size-6 animate-spin rounded-full border-2 border-[#b8d8c1] border-t-[#256441]" aria-label="Verificando acesso e endereço" /></main></div>;

  return <ItemDonationForm formRef={formRef} submit={submit} returnPath={returnPath} editId={editId} organizationId={organizationId} globalError={globalError} steps={steps} step={step} setStep={setStep} goToNextStep={goToNextStep} loading={loading} category={category} setCategory={setCategory} mainPhoto={mainPhoto} setMainPhoto={setMainPhoto} extraPhotos={extraPhotos} setExtraPhotos={setExtraPhotos} mainInputKey={mainInputKey} setMainInputKey={setMainInputKey} extraInputKey={extraInputKey} setExtraInputKey={setExtraInputKey} errors={errors} setErrors={setErrors} editData={editData} today={today} />;
}
