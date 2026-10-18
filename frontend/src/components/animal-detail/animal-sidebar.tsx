import type { AnimalDetailsProps } from "./animal-details";
import Image from "next/image";

export function AnimalSidebar({ animal, sessionPending, approximateDistance, favorite, favoriteLoading, toggleFavorite, handleRequestAdoption }: AnimalDetailsProps) {
  const ownerName = animal.owner?.name || "Responsável pelo animal";
  const ownerLocation = [animal.owner?.city, animal.owner?.state]
    .filter(Boolean)
    .join(", ");

 return (
<aside className="detail-sidebar min-w-0">
        <div className="space-y-3 sm:space-y-6 lg:sticky lg:top-28">
          <section className="rounded-xl bg-white p-6 shadow-[0_4px_6px_rgba(38,51,43,0.05)]">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-[#404942]">
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
                <h3 className="text-xl font-semibold leading-6">{ownerName}</h3>
                {ownerLocation && (
                  <p className="mt-1 text-xs text-[#526057]">{ownerLocation}</p>
                )}
                <p className="mt-1 text-xs text-[#404942]">
                  {animal.owner?.verified
                    ? "Responsável verificado"
                    : "Responsável cadastrado"}
                </p>
                {approximateDistance && (
                  <p className="mt-1.5 flex items-center gap-1 text-xs font-semibold text-[#256441]">
                    <Image
                      src="/icons/location.svg"
                      alt=""
                      width={13}
                      height={13}
                    />
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

          <div className="detail-primary-actions flex gap-2">
            <button
              type="button"
              disabled={
                sessionPending ||
                Boolean(animal.viewerRequestStatus) ||
                animal.status !== "Disponível"
              }
              onClick={handleRequestAdoption}
              className="min-w-0 flex-1 rounded-xl bg-[#256441] px-6 py-4 text-sm font-semibold tracking-wider text-white shadow-sm transition-all hover:-translate-y-0.5 hover:bg-[#194b30] hover:shadow-md active:scale-[0.98] disabled:opacity-60"
            >
              {animal.viewerRequestStatus === "Aprovada"
                ? "Você adotou"
                : animal.viewerRequestStatus === "Em análise" ||
                    animal.viewerRequestStatus === "PENDING"
                  ? "Solicitação em análise"
                  : animal.viewerRequestStatus === "Recusada"
                    ? "Solicitação recusada"
                    : animal.viewerRequestStatus === "Cancelada"
                      ? "Solicitação cancelada"
                      : animal.status === "Adotado"
                        ? "Animal já adotado"
                        : "Tenho interesse em adotar"}
            </button>
            <button
              type="button"
              disabled={favoriteLoading}
              onClick={toggleFavorite}
              className={`detail-favorite-button grid size-13 shrink-0 place-items-center rounded-xl border transition active:scale-95 disabled:opacity-60 ${favorite ? "border-[#ef9aaa] bg-[#fff0f3] text-[#d33f56]" : "border-[#86a590] bg-white text-[#526057] hover:bg-[#e8f7eb] hover:text-[#256441]"}`}
              aria-label={
                favorite ? "Remover dos favoritos" : "Adicionar aos favoritos"
              }
              aria-pressed={favorite}
            >
              <svg
                viewBox="0 0 24 24"
                className="size-5"
                fill={favorite ? "currentColor" : "none"}
                stroke="currentColor"
                strokeWidth="2.2"
                aria-hidden="true"
              >
                <path
                  d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78L12 21.23l8.84-8.84a5.5 5.5 0 0 0 0-7.78Z"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
          </div>
        </div>
      </aside>
 );
}
