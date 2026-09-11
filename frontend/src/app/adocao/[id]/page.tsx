"use client";

import { PhotoGallery } from "@/components/photo-gallery";
import { AuthBlurredContent } from "@/components/auth-blurred-content";
import { SkeletonLoader } from "@/components/skeleton-loader";
import { notify } from "@/components/notification";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import type { Animal } from "@/data/animals";
import { useSession } from "@/lib/auth-client";
import { useApproximateDistance } from "@/hooks/use-approximate-distance";
import Image from "next/image";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

export default function PetDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const { data: session, isPending } = useSession();

  const [animal, setAnimal] = useState<Animal | null>(null);
  const [loading, setLoading] = useState(true);
  const [favorite, setFavorite] = useState(false);
  const [favoriteLoading, setFavoriteLoading] = useState(false);
  const approximateDistance = useApproximateDistance(id, Boolean(session), isPending);

  useEffect(() => {
    async function loadAnimal() {
      try {
        const res = await fetch(`${API_BASE_URL}/api/animals/${id}`, { credentials: "include" });
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

  useEffect(() => {
    if (!session || !id) return;
    const controller = new AbortController();
    fetch(`${API_BASE_URL}/api/favorites/check/${id}`, { credentials: "include", signal: controller.signal })
      .then((response) => response.ok ? response.json() : null)
      .then((data) => { if (data) setFavorite(Boolean(data.favorite)); })
      .catch(() => {});
    return () => controller.abort();
  }, [id, session]);

  async function toggleFavorite() {
    if (!session) { router.push("/login?reason=unauthenticated"); return; }
    if (!animal || favoriteLoading) return;
    const next = !favorite;
    setFavorite(next); setFavoriteLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/favorites/${animal.id}`, { method: next ? "POST" : "DELETE", credentials: "include" });
      if (!response.ok) throw new Error();
    } catch {
      setFavorite(!next);
      notify("Não foi possível atualizar o favorito.", "error");
    } finally { setFavoriteLoading(false); }
  }

  function handleRequestAdoption() {
    if (isPending) return;
    if (!session) {
      router.push("/login?reason=unauthenticated");
      return;
    }
    if (!animal) return;
    if (animal.userId === session.user.id || animal.owner?.id === session.user.id) {
      notify("Você não pode adotar seu próprio animal.", "warning");
      return;
    }
    if (animal.viewerRequestStatus || animal.status !== "Disponível") {
      notify("Este animal já possui uma solicitação sua ou está indisponível.", "warning");
      return;
    }
    router.push(`/adocao/${animal.id}/solicitacao`);
  }

  if (loading) {
    return <SkeletonLoader fullScreen variant="detail" />;
  }

  if (!animal) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-[#eefdf1] px-4 text-center">
        <h1 className="text-2xl font-bold text-[#121e17]">
          Animal não encontrado
        </h1>
        <p className="mt-2 text-[#526057]">
          O animal que você procura não está mais disponível ou não existe.
        </p>
        <Link
          href="/adocao"
          className="mt-6 rounded-xl bg-[#256441] px-6 py-3 font-semibold text-white"
        >
          Ver todos os animais
        </Link>
      </div>
    );
  }

  const photos = animal.images?.length
    ? [animal.image, ...animal.images].filter(
        (photo, index, items) =>
          Boolean(photo) && items.indexOf(photo) === index,
      )
    : [animal.image || "/images/login-cover-v2.png"];

  const description =
    animal.description ??
    `${animal.name} está aguardando uma família responsável e carinhosa. É um animal companheiro, cheio de personalidade e pronto para construir uma nova história em um lar seguro.`;
  const ownerName = animal.owner?.name || "Responsável pelo animal";
  const ownerLocation = [animal.owner?.city, animal.owner?.state]
    .filter(Boolean)
    .join(", ");

  return (
    <div className="min-h-screen bg-[#eefdf1] text-[#121e17]">
      <SiteHeader />
      <main className="detail-page mx-auto w-full min-w-0 max-w-[1200px] overflow-x-hidden px-3 py-4 sm:px-10 sm:py-8 lg:px-20 lg:py-12">
        <Link
          href="/adocao"
          className="mb-3 inline-flex items-center gap-1 rounded-lg px-1 py-1 text-xs font-semibold text-[#256441] transition hover:bg-[#e8f7eb] sm:mb-8 sm:gap-2 sm:px-2 sm:text-sm"
        >
          <svg
            viewBox="0 0 20 20"
            className="size-4"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            aria-hidden="true"
          >
            <path
              d="m12.5 4.5-5 5.5 5 5.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          Voltar
        </Link>

        <div className="grid min-w-0 items-start gap-3 sm:gap-6 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
          <div className="detail-main-column min-w-0 space-y-3 sm:space-y-6">
            <PhotoGallery animalName={animal.name} photos={photos} locked={!isPending && !session} />

            <section className="rounded-xl bg-white p-6 shadow-[0_4px_6px_rgba(38,51,43,0.05)] sm:p-10 lg:p-12">
              <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-center">
                <div>
                  <div className="flex items-center gap-3">
                    <h1 className="text-4xl font-extrabold tracking-[-0.02em] sm:text-[40px]">
                      {animal.name}
                    </h1>
                    {animal.sex === "Fêmea" && (
                      <Image
                        src="/icons/female.svg"
                        alt="Fêmea"
                        width={11}
                        height={17}
                      />
                    )}
                  </div>
                  <p className="mt-1 text-lg text-[#404942]">
                    {animal.breed === "SRD"
                      ? "Vira-lata (SRD)"
                      : animal.breed || "SRD"}{" "}
                    • Porte {sizeName(animal.size)}
                  </p>
                </div>
                <span className="flex w-fit items-center gap-2 rounded-xl border border-[#aff1c4] bg-[#e8f7eb] px-4 py-2 text-sm font-semibold text-[#256441]">
                  <Image
                    src="/icons/available-detail.svg"
                    alt=""
                    width={17}
                    height={17}
                  />
                  {animal.viewerRequestStatus === "Aprovada" || animal.status === "Adotado"
                    ? "Animal adotado"
                    : animal.status === "Disponível" || !animal.status
                      ? "Disponível para Adoção"
                      : animal.status}
                </span>
              </div>
              <div className="detail-stats mt-4 grid grid-cols-3 gap-2 border-t border-[#c0c9bf] pt-4 sm:mt-6 sm:gap-5 sm:pt-6">
                <Stat
                  icon="/icons/age.svg"
                  label="Idade aproximada"
                  value={animal.age}
                />
                <Stat
                  icon="/icons/weight.svg"
                  label="Porte"
                  value={sizeName(animal.size)}
                />
                <Stat
                  icon="/icons/female.svg"
                  label="Sexo"
                  value={animal.sex}
                />
              </div>
            </section>

            <AuthBlurredContent locked={!isPending && !session}><div className="space-y-6"><section className="rounded-xl bg-white p-6 shadow-[0_4px_6px_rgba(38,51,43,0.05)] sm:p-10 lg:p-12">
              <h2 className="mb-4 text-2xl font-semibold">
                Sobre {animal.sex === "Fêmea" ? "a" : "o"} {animal.name}
              </h2>
              <p className="leading-7 text-[#404942]">{description}</p>
              {animal.personality && <p className="mt-4 leading-7 text-[#404942]"><strong className="text-[#121e17]">Personalidade:</strong>{" "}{animal.personality}</p>}
              {animal.behaviorNotes && <p className="mt-3 leading-7 text-[#404942]"><strong className="text-[#121e17]">Comportamento:</strong>{" "}{animal.behaviorNotes}</p>}
            </section>

            <div className="detail-info-grid grid min-w-0 grid-cols-2 gap-2 sm:gap-6">
              <InfoCard
                title="Saúde e cuidados"
                icon="/icons/health.svg"
                items={[
                  `Castrado: ${animal.neutered ?? "Não sei"}`,
                  animal.vaccination ?? "Situação vacinal não informada",
                  `Vermifugado: ${animal.dewormed ?? "Não sei"}`,
                  animal.healthCondition ?? "Condição de saúde não informada",
                ]}
              />
              <InfoCard
                title="Convivência"
                icon="/icons/coexistence.svg"
                items={[
                  `Energia: ${animal.energyLevel ?? "Não informada"}`,
                  `Convive com cães: ${animal.livesWithDogs ?? "Não sei"}`,
                  `Convive com gatos: ${animal.livesWithCats ?? "Não sei"}`,
                  `Convive com crianças: ${animal.livesWithChildren ?? "Não sei"}`,
                ]}
              />
            </div>
            <section className="rounded-xl bg-white p-6 shadow-[0_4px_6px_rgba(38,51,43,0.05)] sm:p-10 lg:p-12">
              <h2 className="mb-5 text-2xl font-semibold">
                Contexto da adoção
              </h2>
              <dl className="grid gap-5 sm:grid-cols-2">
                <Detail
                  label="Motivo da adoção"
                  value={animal.adoptionReason ?? "Não informado"}
                />
                <Detail
                  label="Tempo sob os cuidados"
                  value={animal.timeInCare ?? "Não informado"}
                />
                <Detail
                  label="Está sob os cuidados do responsável"
                  value={
                    animal.currentlyInCare === undefined
                      ? "Não informado"
                      : animal.currentlyInCare
                        ? "Sim"
                        : "Não"
                  }
                />
              </dl>
            </section></div></AuthBlurredContent>
          </div>

          <aside className="detail-sidebar min-w-0">
            <div className="space-y-3 sm:space-y-6 lg:sticky lg:top-28">
            <section className="rounded-xl bg-white p-6 shadow-[0_4px_6px_rgba(38,51,43,0.05)]">
              <h2 className="text-sm font-semibold uppercase tracking-[0.05em] text-[#404942]">
                Aos cuidados de
              </h2>
              <div className="mt-4 flex items-center gap-4">
                <div className="relative grid size-16 shrink-0 place-items-center overflow-hidden rounded-full border border-[#e3f2e6] bg-[#e3f2e6]">
                  {animal.owner?.image ? (
                    <Image
                      src={animal.owner.image}
                      alt={ownerName}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <span className="text-xl font-bold text-[#256441]">
                      {ownerName.charAt(0).toUpperCase()}
                    </span>
                  )}
                </div>
                <div>
                  <h3 className="text-xl font-semibold leading-6">
                    {ownerName}
                  </h3>
                  {ownerLocation && (
                    <p className="mt-1 text-xs text-[#526057]">
                      {ownerLocation}
                    </p>
                  )}
                  <p className="mt-1 text-xs text-[#404942]">
                    {animal.owner?.verified
                      ? "Responsável verificado"
                      : "Responsável cadastrado"}
                  </p>
                  {approximateDistance && (
                    <p className="mt-1.5 flex items-center gap-1 text-xs font-semibold text-[#256441]">
                      <Image src="/icons/location.svg" alt="" width={13} height={13} />
                      Aproximadamente {approximateDistance} de distância
                    </p>
                  )}
                </div>
              </div>
            </section>

            <section className="rounded-xl border border-[#d7e6da] bg-[#f7fcf8] p-6 text-sm leading-6 text-[#404942]">
              <h2 className="mb-2 font-bold text-[#256441]">
                Privacidade e segurança
              </h2>
              <p>
                Os meios de contato do responsável não são exibidos no anúncio.
                Eles serão liberados somente após a aprovação do pedido de adoção.
              </p>
            </section>

            <div className="detail-primary-actions flex gap-2"><button
              type="button"
              disabled={isPending || Boolean(animal.viewerRequestStatus) || animal.status !== "Disponível"}
              onClick={handleRequestAdoption}
              className="min-w-0 flex-1 rounded-xl bg-[#256441] px-6 py-4 text-sm font-semibold tracking-[0.05em] text-white shadow-sm transition-all hover:-translate-y-0.5 hover:bg-[#194b30] hover:shadow-md active:scale-[0.98] disabled:opacity-60"
            >
              {animal.viewerRequestStatus === "Aprovada"
                ? "Você adotou"
                : animal.viewerRequestStatus === "Em análise" || animal.viewerRequestStatus === "PENDING"
                  ? "Solicitação em análise"
                  : animal.viewerRequestStatus === "Recusada"
                    ? "Solicitação recusada"
                    : animal.viewerRequestStatus === "Cancelada"
                      ? "Solicitação cancelada"
                      : animal.status === "Adotado"
                        ? "Animal já adotado"
                        : "Tenho interesse em adotar"}
            </button><button type="button" disabled={favoriteLoading} onClick={toggleFavorite} className={`detail-favorite-button grid size-[52px] shrink-0 place-items-center rounded-xl border transition active:scale-95 disabled:opacity-60 ${favorite ? "border-[#ef9aaa] bg-[#fff0f3] text-[#d33f56]" : "border-[#86a590] bg-white text-[#526057] hover:bg-[#e8f7eb] hover:text-[#256441]"}`} aria-label={favorite ? "Remover dos favoritos" : "Adicionar aos favoritos"} aria-pressed={favorite}><svg viewBox="0 0 24 24" className="size-5" fill={favorite ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2.2" aria-hidden="true"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78L12 21.23l8.84-8.84a5.5 5.5 0 0 0 0-7.78Z" strokeLinecap="round" strokeLinejoin="round" /></svg></button></div>
            </div>
          </aside>
        </div>
      </main>
      <div className="mt-20">
        <SiteFooter />
      </div>
    </div>
  );
}

function sizeName(size?: string) {
  if (!size) return "Médio";
  const sizes: Record<string, string> = { P: "Pequeno", M: "Médio", G: "Grande" };
  return sizes[size] || size;
}
function Stat({
  icon,
  label,
  value,
}: {
  icon: string;
  label: string;
  value?: string;
}) {
  return (
    <div className="flex items-center gap-3">
      <span className="grid size-10 shrink-0 place-items-center rounded-full bg-[#e3f2e6]">
        <Image src={icon} alt="" width={20} height={20} />
      </span>
      <span>
        <small className="block text-xs font-medium text-[#404942]">
          {label}
        </small>
        <strong className="text-sm font-semibold tracking-[0.05em]">
          {value || "Não informado"}
        </strong>
      </span>
    </div>
  );
}
function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-sm font-semibold text-[#121e17]">{label}</dt>
      <dd className="mt-1 leading-6 text-[#404942]">{value}</dd>
    </div>
  );
}
function InfoCard({
  title,
  icon,
  items,
}: {
  title: string;
  icon: string;
  items: string[];
}) {
  return (
    <section className="rounded-xl bg-white p-6 shadow-[0_4px_6px_rgba(38,51,43,0.05)]">
      <h2 className="mb-4 flex items-center gap-2 text-sm font-semibold tracking-[0.05em]">
        <Image src={icon} alt="" width={20} height={20} />
        {title}
      </h2>
      <ul className="space-y-3">
        {items.map((item) => (
          <li
            key={item}
            className="flex items-start gap-3 text-sm text-[#404942]"
          >
            <Image
              src="/icons/check-detail.svg"
              alt=""
              width={17}
              height={13}
              className="mt-1"
            />
            {item}
          </li>
        ))}
      </ul>
    </section>
  );
}
