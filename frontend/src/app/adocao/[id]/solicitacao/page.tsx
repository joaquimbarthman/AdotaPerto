"use client";
import { apiBaseUrl } from "@/lib/api-url";

import { notify } from "@/components/notification";
import { SkeletonLoader } from "@/components/skeleton-loader";
import type { Animal } from "@/data/animals";
import { useProfileAddressGuard } from "@/hooks/use-profile-address-guard";
import { useSession } from "@/lib/auth-client";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { FormEvent, useEffect, useRef, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { AdoptionRequestForm } from "@/components/adoption-request/adoption-request-form";

const API_BASE_URL = apiBaseUrl();

export default function AdoptionRequestPage() {
  const queryClient = useQueryClient();
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { data: session, isPending } = useSession();
  const checkingAddress = useProfileAddressGuard(session?.user.id, isPending);
  const [animal, setAnimal] = useState<Animal | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [housing, setHousing] = useState("");
  const [hasOtherAnimals, setHasOtherAnimals] = useState("");
  const [hasChildren, setHasChildren] = useState("");
  const [isRented, setIsRented] = useState("");
  const [step, setStep] = useState(0);
  const formRef = useRef<HTMLFormElement>(null);
  const steps = ["Moradia", "Família", "Outros animais", "Rotina e cuidados", "Motivação"] as const;

  function validateStep(stepIndex: number) {
    const container = formRef.current?.querySelector<HTMLElement>(`[data-request-step="${stepIndex}"]`);
    const controls = container?.querySelectorAll<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>("input, select, textarea");
    for (const control of controls || []) {
      if (!control.checkValidity()) {
        control.reportValidity();
        return false;
      }
    }
    return true;
  }

  function goToNextStep() {
    setError(null);
    if (!validateStep(step)) return;
    setStep((current) => Math.min(current + 1, steps.length - 1));
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function goToPreviousStep() {
    setError(null);
    setStep((current) => Math.max(current - 1, 0));
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  useEffect(() => {
    if (!isPending && !session) router.replace(`/login?reason=unauthenticated`);
  }, [isPending, router, session]);

  const ownAnimal = Boolean(session && animal && (animal.userId === session.user.id || animal.owner?.id === session.user.id));
  useEffect(() => {
    if (!session || !animal) return;
    if (ownAnimal || animal.viewerRequestStatus || animal.status !== "Disponível") {
      notify(ownAnimal ? "Você não pode adotar seu próprio animal." : "Este animal já possui uma solicitação sua ou está indisponível.", "warning");
      router.replace(`/adocao/${id}`);
    }
  }, [session, animal, ownAnimal, router, id]);

  useEffect(() => {
    if (!id) return;
    fetch(`${API_BASE_URL}/api/animals/${id}`, { credentials: "include" })
      .then(async (response) => {
        if (!response.ok) throw new Error("Animal n\u00e3o encontrado.");
        setAnimal(await response.json());
      })
      .catch((cause: unknown) => setError(cause instanceof Error ? cause.message : "N\u00e3o foi poss\u00edvel carregar o animal."))
      .finally(() => setLoading(false));
  }, [id]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    if (step < steps.length - 1) {
      goToNextStep();
      return;
    }
    if (!validateStep(step)) return;
    if (!session) { router.replace("/login?reason=unauthenticated"); return; }
    if (!animal || ownAnimal || animal.viewerRequestStatus || animal.status !== "Disponível") return;

    const form = new FormData(event.currentTarget);
    const answers: Record<string, string | string[]> = {};
    for (const [key, value] of form.entries()) {
      if (key === "otherAnimalTypes") continue;
      answers[key] = String(value);
    }
    answers.otherAnimalTypes = form.getAll("otherAnimalTypes").map(String);

    setSubmitting(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/adoption-requests`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ animalId: animal.id, answers, notes: String(form.get("motivation") || "") }),
      });
      const result = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(result.error || "N\u00e3o foi poss\u00edvel enviar a solicita\u00e7\u00e3o.");
      void queryClient.invalidateQueries({ queryKey: ["catalog", "animal", animal.id] });
      notify("Solicitação de adoção enviada com sucesso.", "success");
      router.replace(`/adocao/${animal.id}`);
      router.refresh();
    } catch (cause: unknown) {
      setError(cause instanceof Error ? cause.message : "N\u00e3o foi poss\u00edvel enviar a solicita\u00e7\u00e3o.");
    } finally {
      setSubmitting(false);
    }
  }

  if (loading || isPending || !session || checkingAddress || ownAnimal || (animal && (animal.viewerRequestStatus || animal.status !== "Disponível"))) return <SkeletonLoader fullScreen variant="form" />;

  if (!animal) {
    return <div className="grid min-h-screen place-items-center bg-[#eefdf1] p-6 text-center"><div><h1 className="text-2xl font-bold">Animal n&atilde;o encontrado</h1><Link href="/adocao" className="mt-5 inline-block rounded-xl bg-[#2f7650] px-5 py-3 font-semibold text-white">Voltar para ado&ccedil;&atilde;o</Link></div></div>;
  }

  const unavailable = Boolean(animal.viewerRequestStatus) || animal.status === "Adotado";

  return <AdoptionRequestForm animal={animal} unavailable={unavailable} error={error} formRef={formRef} handleSubmit={handleSubmit} step={step} steps={steps} housing={housing} setHousing={setHousing} hasOtherAnimals={hasOtherAnimals} setHasOtherAnimals={setHasOtherAnimals} hasChildren={hasChildren} setHasChildren={setHasChildren} isRented={isRented} setIsRented={setIsRented} goToNextStep={goToNextStep} goToPreviousStep={goToPreviousStep} submitting={submitting} />;
}
