"use client";

import { apiBaseUrl } from "@/lib/api-url";
import { notify } from "@/components/notification";
import { useRouter } from "next/navigation";
import { type FormEvent, useEffect, useRef, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { catalogKeys } from "@/lib/catalog";
import { useSession } from "@/lib/auth-client";
import { uploadImages } from "@/lib/uploads";
import { useProfileAddressGuard } from "@/hooks/use-profile-address-guard";

const API_BASE_URL = apiBaseUrl();
export function useAnimalDonation() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { data: session, isPending } = useSession();
  const checkingAddress = useProfileAddressGuard(session?.user.id, isPending, true, true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mainPhoto, setMainPhoto] = useState<File | null>(null);
  const [extraPhotos, setExtraPhotos] = useState<File[]>([]);
  const [mainInputKey, setMainInputKey] = useState(0);
  const [extraInputKey, setExtraInputKey] = useState(0);
  const [editId, setEditId] = useState<string | null>(null);
  const [organizationId, setOrganizationId] = useState<string | null>(null);
  const [editData, setEditData] = useState<Record<string, unknown> | null>(null);
  const [step, setStep] = useState(0);
  const formRef = useRef<HTMLFormElement>(null);
  const returnPath = organizationId ? `/organizacao?id=${encodeURIComponent(organizationId)}&tab=publicacoes` : editId ? "/perfil#publicacoes" : "/doacoes";

  const steps = ["Informações básicas", "Saúde", "Comportamento", "História", "Fotos e confirmação"] as const;

  function goToNextStep() {
    setError(null);
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
    fetch(`${API_BASE_URL}/api/animals/${editId}`, { credentials: "include" })
      .then(async (response) => { if (!response.ok) throw new Error("Anúncio não encontrado."); return response.json(); })
      .then((data) => { setEditData(data); setOrganizationId(data.organizationId || null); })
      .catch((cause: unknown) => setError(cause instanceof Error ? cause.message : "Não foi possível carregar o anúncio."));
  }, [editId]);

  useEffect(() => {
    if (!editData || !formRef.current) return;
    const values: Record<string, unknown> = {
      nome: editData.name, especie: editData.species === "Cachorro" ? "Cão" : editData.species, sexo: editData.sex,
      idade: editData.age, porte: editData.size === "P" ? "Pequeno" : editData.size === "G" ? "Grande" : "Médio", raca: editData.breed,
      castrado: editData.neutered, vacinas: editData.vaccination, vermifugado: editData.dewormed,
      condicao: editData.hasHealthCondition ? "Sim" : "Não", descricaoSaude: editData.healthCondition,
      energia: editData.energyLevel, caes: editData.livesWithDogs, gatos: editData.livesWithCats, criancas: editData.livesWithChildren,
      personalidade: editData.personality, comportamento: editData.behaviorNotes, motivo: editData.adoptionReason,
      tempoCuidados: editData.timeInCare, sobCuidados: editData.currentlyInCare ? "Sim" : "Não", descricao: editData.description,
    };
    Object.entries(values).forEach(([name, value]) => {
      if (value == null) return;
      const controls = formRef.current?.elements.namedItem(name);
      if (controls instanceof RadioNodeList) controls.value = String(value);
      else if (controls instanceof HTMLInputElement || controls instanceof HTMLSelectElement || controls instanceof HTMLTextAreaElement) controls.value = String(value);
    });
  }, [editData]);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    if (!session) {
      setError("Você precisa estar conectado para cadastrar um animal para adoção.");
      router.push("/login");
      return;
    }

    if (!mainPhoto && !editData?.image) {
      setError("Selecione uma foto principal do animal.");
      return;
    }

    const formData = new FormData(event.currentTarget);
    const sizeMap: Record<string, string> = { "Pequeno": "P", "Médio": "M", "Grande": "G" };
    const rawPorte = formData.get("porte") as string;
    const porte = sizeMap[rawPorte] || rawPorte || "M";

    setLoading(true);
    try {
      const files = [mainPhoto, ...extraPhotos].filter((file): file is File => file instanceof File);
      const uploadedUrls = await uploadImages(files);
      const image = mainPhoto ? uploadedUrls[0] : String(editData?.image || "/images/login-cover-v2.png");
      const images = extraPhotos.length ? uploadedUrls.slice(mainPhoto ? 1 : 0) : (Array.isArray(editData?.images) ? editData.images : []);

      const payload = {
      name: formData.get("nome") as string,
      species: (formData.get("especie") as string) === "Cão" ? "Cachorro" : (formData.get("especie") as string) || "Cachorro",
      sex: formData.get("sexo") as string,
      age: formData.get("idade") as string,
      size: porte,
      breed: (formData.get("raca") as string) || "SRD",
      neutered: formData.get("castrado") as string,
      vaccination: formData.get("vacinas") as string,
      dewormed: formData.get("vermifugado") as string,
      hasHealthCondition: formData.get("condicao") === "Sim",
      healthCondition: formData.get("descricaoSaude") as string,
      energyLevel: formData.get("energia") as string,
      livesWithDogs: formData.get("caes") as string,
      livesWithCats: formData.get("gatos") as string,
      livesWithChildren: formData.get("criancas") as string,
      personality: formData.get("personalidade") as string,
      behaviorNotes: formData.get("comportamento") as string,
      adoptionReason: formData.get("motivo") as string,
      timeInCare: formData.get("tempoCuidados") as string,
      currentlyInCare: formData.get("sobCuidados") === "Sim",
      description: formData.get("descricao") as string,
      image,
      images,
      status: String(editData?.status || "Disponível"),
      organizationId,
      };

      const res = await fetch(`${API_BASE_URL}/api/animals${editId ? `/${editId}` : ""}`, {
        method: editId ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Erro ao salvar cadastro do animal.");
      }

      void queryClient.invalidateQueries({ queryKey: catalogKeys.animals });
      void queryClient.invalidateQueries({ queryKey: ["catalog", "animal"] });
      void queryClient.invalidateQueries({ queryKey: ["map", "listings"] });
      notify(editId ? "Animal atualizado com sucesso." : "Animal cadastrado com sucesso.", "success");
      router.push(organizationId ? `/organizacao?id=${encodeURIComponent(organizationId)}&tab=publicacoes` : editId ? "/perfil#publicacoes" : "/adocao");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Erro ao cadastrar animal.");
    } finally {
      setLoading(false);
    }
  }

  return { session, isPending, checkingAddress, loading, error, mainPhoto, setMainPhoto, extraPhotos, setExtraPhotos,
    mainInputKey, setMainInputKey, extraInputKey, setExtraInputKey, editId, organizationId, editData,
    step, setStep, formRef, returnPath, steps, goToNextStep, submit };
}