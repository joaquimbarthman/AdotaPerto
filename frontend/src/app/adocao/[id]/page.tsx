"use client";

import Image from "next/image";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { PhotoGallery } from "@/components/photo-gallery";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import type { Animal } from "@/data/animals";
import { useSession } from "@/lib/auth-client";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

export default function PetDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const { data: session } = useSession();

  const [animal, setAnimal] = useState<Animal | null>(null);
  const [loading, setLoading] = useState(true);
  const [requesting, setRequesting] = useState(false);
  const [requestSuccess, setRequestSuccess] = useState(false);
  const [requestError, setRequestError] = useState<string | null>(null);

  useEffect(() => {
    async function loadAnimal() {
      try {
        const res = await fetch(`${API_BASE_URL}/api/animals/${id}`);
        if (res.ok) {
          const data = await res.json();
          setAnimal(data);
          return;
        }
      } catch {}
    }

    if (id) {
      loadAnimal().finally(() => setLoading(false));
    }
  }, [id]);

  async function handleRequestAdoption() {
    setRequestError(null);

    if (!session) {
      router.push("/login");
      return;
    }

    if (!animal) return;

    setRequesting(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/adoption-requests`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ animalId: animal.id }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Erro ao solicitar adoção.");
      }

      setRequestSuccess(true);
    } catch (err: any) {
      setRequestError(err.message || "Não foi possível enviar a solicitação.");
    } finally {
      setRequesting(false);
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#eefdf1] text-[#256441]">
        <div className="size-10 animate-spin rounded-full border-4 border-[#256441] border-t-transparent" />
      </div>
    );
  }

  if (!animal) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-[#eefdf1] px-4 text-center">
        <h1 className="text-2xl font-bold text-[#121e17]">Animal não encontrado</h1>
        <p className="mt-2 text-[#526057]">O animal que você procura não está mais disponível ou não existe.</p>
        <Link href="/adocao" className="mt-6 rounded-xl bg-[#256441] px-6 py-3 font-semibold text-white">
          Ver todos os animais
        </Link>
      </div>
    );
  }

  const photos = animal.images?.length
    ? [animal.image, ...animal.images].filter((photo, index, items) => Boolean(photo) && items.indexOf(photo) === index)
    : [animal.image || "/images/login-cover-v2.png"];
  
  const description =
    animal.description ??
    `${animal.name} está aguardando uma família responsável e carinhosa. É um animal companheiro, cheio de personalidade e pronto para construir uma nova história em um lar seguro.`;
  const ownerName = animal.owner?.name || "Responsável pelo animal";
  const ownerLocation = [animal.owner?.city, animal.owner?.state].filter(Boolean).join(", ");

  return (
    <div className="min-h-screen bg-[#eefdf1] text-[#121e17]">
      <SiteHeader />
      <main className="mx-auto max-w-[1200px] px-5 py-8 sm:px-10 lg:px-20 lg:py-12">
        <Link href="/adocao" className="mb-8 inline-flex items-center gap-2 rounded-lg px-2 py-1 text-sm font-semibold text-[#256441] transition hover:bg-[#e8f7eb]">
          <svg viewBox="0 0 20 20" className="size-4" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
            <path d="m12.5 4.5-5 5.5 5 5.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          Voltar
        </Link>

        {requestSuccess && (
          <div role="status" className="mb-8 rounded-2xl border border-[#86c99c] bg-[#e8f7eb] p-6 text-[#194b30]">
            <strong className="text-lg">Solicitação de adoção enviada com sucesso!</strong>
            <p className="mt-1 text-sm">O responsável receberá seu interesse e você poderá acompanhar o status na sua página de perfil.</p>
            <div className="mt-4 flex gap-3">
              <Link href="/perfil" className="rounded-xl bg-[#256441] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#194b30]">
                Acompanhar no Perfil
              </Link>
            </div>
          </div>
        )}

        {requestError && (
          <div role="alert" className="mb-8 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm font-semibold text-red-800">
            {requestError}
          </div>
        )}

        <div className="grid items-start gap-6 lg:grid-cols-[2fr_1fr]">
          <div className="space-y-6">
            <PhotoGallery animalName={animal.name} photos={photos} />

            <section className="rounded-xl bg-white p-6 shadow-[0_4px_6px_rgba(38,51,43,0.05)] sm:p-10 lg:p-12">
              <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-center">
                <div>
                  <div className="flex items-center gap-3">
                    <h1 className="text-4xl font-extrabold tracking-[-0.02em] sm:text-[40px]">{animal.name}</h1>
                    {animal.sex === "Fêmea" && <Image src="/icons/female.svg" alt="Fêmea" width={11} height={17} />}
                  </div>
                  <p className="mt-1 text-lg text-[#404942]">{animal.breed === "SRD" ? "Vira-lata (SRD)" : animal.breed || "SRD"} • Porte {sizeName(animal.size as any)}</p>
                </div>
                <span className="flex w-fit items-center gap-2 rounded-xl border border-[#aff1c4] bg-[#e8f7eb] px-4 py-2 text-sm font-semibold text-[#256441]">
                  <Image src="/icons/available-detail.svg" alt="" width={17} height={17} />
                  {animal.status === "Disponível" || !animal.status ? "Disponível para Adoção" : animal.status}
                </span>
              </div>
              <div className="mt-6 grid gap-5 border-t border-[#c0c9bf] pt-6 min-[460px]:grid-cols-3">
                <Stat icon="/icons/age.svg" label="Idade aproximada" value={animal.age} />
                <Stat icon="/icons/weight.svg" label="Porte" value={sizeName(animal.size as any)} />
                <Stat icon="/icons/female.svg" label="Sexo" value={animal.sex} />
              </div>
            </section>

            <section className="rounded-xl bg-white p-6 shadow-[0_4px_6px_rgba(38,51,43,0.05)] sm:p-10 lg:p-12">
              <h2 className="mb-4 text-2xl font-semibold">Sobre {animal.sex === "Fêmea" ? "a" : "o"} {animal.name}</h2>
              <p className="leading-7 text-[#404942]">{description}</p>
              {animal.personality && <p className="mt-4 leading-7 text-[#404942]"><strong className="text-[#121e17]">Personalidade:</strong> {animal.personality}</p>}
              {animal.behaviorNotes && <p className="mt-3 leading-7 text-[#404942]"><strong className="text-[#121e17]">Comportamento:</strong> {animal.behaviorNotes}</p>}
            </section>

            <div className="grid gap-6 sm:grid-cols-2">
              <InfoCard title="Saúde e cuidados" icon="/icons/health.svg" items={[`Castrado: ${animal.neutered ?? "Não sei"}`, animal.vaccination ?? "Situação vacinal não informada", `Vermifugado: ${animal.dewormed ?? "Não sei"}`, animal.healthCondition ?? "Condição de saúde não informada"]} />
              <InfoCard title="Convivência" icon="/icons/coexistence.svg" items={[`Energia: ${animal.energyLevel ?? "Não informada"}`, `Convive com cães: ${animal.livesWithDogs ?? "Não sei"}`, `Convive com gatos: ${animal.livesWithCats ?? "Não sei"}`, `Convive com crianças: ${animal.livesWithChildren ?? "Não sei"}`]} />
            </div>
            <section className="rounded-xl bg-white p-6 shadow-[0_4px_6px_rgba(38,51,43,0.05)] sm:p-10 lg:p-12">
              <h2 className="mb-5 text-2xl font-semibold">Contexto da adoção</h2>
              <dl className="grid gap-5 sm:grid-cols-2">
                <Detail label="Motivo da adoção" value={animal.adoptionReason ?? "Não informado"} />
                <Detail label="Tempo sob os cuidados" value={animal.timeInCare ?? "Não informado"} />
                <Detail label="Está sob os cuidados do responsável" value={animal.currentlyInCare === undefined ? "Não informado" : animal.currentlyInCare ? "Sim" : "Não"} />
              </dl>
            </section>
          </div>

          <aside className="space-y-6 lg:sticky lg:top-28">
            <section className="rounded-xl bg-white p-6 shadow-[0_4px_6px_rgba(38,51,43,0.05)]">
              <h2 className="text-sm font-semibold uppercase tracking-[0.05em] text-[#404942]">Aos cuidados de</h2>
              <div className="mt-4 flex items-center gap-4">
                <div className="relative grid size-16 shrink-0 place-items-center overflow-hidden rounded-full border border-[#e3f2e6] bg-[#e3f2e6]">
                  {animal.owner?.image ? (
                    <Image src={animal.owner.image} alt={ownerName} fill className="object-cover" />
                  ) : (
                    <span className="text-xl font-bold text-[#256441]">{ownerName.charAt(0).toUpperCase()}</span>
                  )}
                </div>
                <div>
                  <h3 className="text-xl font-semibold leading-6">{ownerName}</h3>
                  {ownerLocation && <p className="mt-1 text-xs text-[#526057]">{ownerLocation}</p>}
                  <p className="mt-1 text-xs text-[#404942]">{animal.owner?.verified ? "Responsável verificado" : "Responsável cadastrado"}</p>
                </div>
              </div>
            </section>
            
            <section className="rounded-xl border border-[#d7e6da] bg-[#f7fcf8] p-6 text-sm leading-6 text-[#404942]">
              <h2 className="mb-2 font-bold text-[#256441]">Privacidade e segurança</h2>
              <p>Telefone, e-mail e endereço do responsável não aparecem no anúncio. O contato será liberado somente depois que o pedido de adoção for aprovado.</p>
            </section>

            <button
              type="button"
              disabled={requesting || requestSuccess}
              onClick={handleRequestAdoption}
              className="w-full rounded-xl bg-[#256441] px-6 py-4 text-sm font-semibold tracking-[0.05em] text-white shadow-sm transition-all hover:-translate-y-0.5 hover:bg-[#194b30] hover:shadow-md active:scale-[0.98] disabled:opacity-60"
            >
              {requestSuccess ? "Solicitação enviada ✓" : requesting ? "Enviando solicitação..." : "Solicitar adoção"}
            </button>
          </aside>
        </div>
      </main>
      <div className="mt-20"><SiteFooter /></div>
    </div>
  );
}

function sizeName(size?: "P" | "M" | "G" | string) {
  if (!size) return "Médio";
  return ({ P: "Pequeno", M: "Médio", G: "Grande" } as any)[size] || size;
}
function Stat({ icon, label, value }: { icon: string; label: string; value?: string }) {
  return <div className="flex items-center gap-3"><span className="grid size-10 shrink-0 place-items-center rounded-full bg-[#e3f2e6]"><Image src={icon} alt="" width={20} height={20} /></span><span><small className="block text-xs font-medium text-[#404942]">{label}</small><strong className="text-sm font-semibold tracking-[0.05em]">{value || "Não informado"}</strong></span></div>;
}
function Detail({ label, value }: { label: string; value: string }) {
  return <div><dt className="text-sm font-semibold text-[#121e17]">{label}</dt><dd className="mt-1 leading-6 text-[#404942]">{value}</dd></div>;
}
function InfoCard({ title, icon, items }: { title: string; icon: string; items: string[] }) {
  return <section className="rounded-xl bg-white p-6 shadow-[0_4px_6px_rgba(38,51,43,0.05)]"><h2 className="mb-4 flex items-center gap-2 text-sm font-semibold tracking-[0.05em]"><Image src={icon} alt="" width={20} height={20} />{title}</h2><ul className="space-y-3">{items.map((item) => <li key={item} className="flex items-start gap-3 text-sm text-[#404942]"><Image src="/icons/check-detail.svg" alt="" width={17} height={13} className="mt-1" />{item}</li>)}</ul></section>;
}
