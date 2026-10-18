import { AuthBlurredContent } from "@/components/auth-blurred-content";
import { PhotoGallery } from "@/components/photo-gallery";
import type { Animal } from "@/data/animals";
import Image from "next/image";
import { sizeName, Stat, Detail, InfoCard } from "./detail-parts";

export function AnimalMainContent({ animal, locked, photos }: { animal: Animal; locked: boolean; photos: string[] }) {
  const description = animal.description?.trim();
  const healthItems = [
    animal.neutered ? `Castrado: ${animal.neutered}` : null,
    animal.vaccination,
    animal.dewormed ? `Vermifugado: ${animal.dewormed}` : null,
    animal.healthCondition,
  ].filter((item): item is string => Boolean(item?.trim()));
  const coexistenceItems = [
    animal.energyLevel ? `Energia: ${animal.energyLevel}` : null,
    animal.livesWithDogs ? `Convive com cães: ${animal.livesWithDogs}` : null,
    animal.livesWithCats ? `Convive com gatos: ${animal.livesWithCats}` : null,
    animal.livesWithChildren
      ? `Convive com crianças: ${animal.livesWithChildren}`
      : null,
  ].filter((item): item is string => Boolean(item?.trim()));
  const adoptionDetails = [
    animal.adoptionReason
      ? { label: "Motivo da adoção", value: animal.adoptionReason }
      : null,
    animal.timeInCare
      ? { label: "Tempo sob os cuidados", value: animal.timeInCare }
      : null,
    animal.currentlyInCare !== undefined
      ? {
          label: "Está sob os cuidados do responsável",
          value: animal.currentlyInCare ? "Sim" : "Não",
        }
      : null,
  ].filter((detail): detail is { label: string; value: string } =>
    Boolean(detail),
  );


 return (
<div className="detail-main-column min-w-0 space-y-3 sm:space-y-6">
        <PhotoGallery
          animalName={animal.name}
          photos={photos}
          locked={locked}
        />

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
              {animal.viewerRequestStatus === "Aprovada" ||
              animal.status === "Adotado"
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
            <Stat icon="/icons/female.svg" label="Sexo" value={animal.sex} />
          </div>
        </section>

        <AuthBlurredContent locked={locked}>
          <div className="space-y-6">
            <section className="rounded-xl bg-white p-6 shadow-[0_4px_6px_rgba(38,51,43,0.05)] sm:p-10 lg:p-12">
              <h2 className="mb-4 text-2xl font-semibold">
                Sobre {animal.sex === "Fêmea" ? "a" : "o"} {animal.name}
              </h2>
              <p className="leading-7 text-[#404942]">{description}</p>
              {animal.personality && (
                <p className="mt-4 leading-7 text-[#404942]">
                  <strong className="text-[#121e17]">Personalidade:</strong>{" "}
                  {animal.personality}
                </p>
              )}
              {animal.behaviorNotes && (
                <p className="mt-3 leading-7 text-[#404942]">
                  <strong className="text-[#121e17]">Comportamento:</strong>{" "}
                  {animal.behaviorNotes}
                </p>
              )}
            </section>

            <div className="detail-info-grid grid min-w-0 grid-cols-2 gap-2 sm:gap-6">
              <InfoCard
                title="Saúde e cuidados"
                icon="/icons/health.svg"
                items={healthItems}
              />
              <InfoCard
                title="Convivência"
                icon="/icons/coexistence.svg"
                items={coexistenceItems}
              />
            </div>
            {adoptionDetails.length > 0 && (
              <section className="rounded-xl bg-white p-6 shadow-[0_4px_6px_rgba(38,51,43,0.05)] sm:p-10 lg:p-12">
                <h2 className="mb-5 text-2xl font-semibold">
                  Contexto da adoção
                </h2>
                <dl className="grid gap-5 sm:grid-cols-2">
                  {adoptionDetails.map((detail) => (
                    <Detail key={detail.label} {...detail} />
                  ))}
                </dl>
              </section>
            )}
          </div>
        </AuthBlurredContent>
      </div>
 );
}
