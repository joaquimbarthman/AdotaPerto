"use client";

type Props = {
  animalName: string;
  photos: string[];
  selectedPhoto: number;
  locked: boolean;
  closeGallery: () => void;
  previousPhoto: () => void;
  nextPhoto: () => void;
};

export function PhotoGalleryDialog({
  animalName,
  photos,
  selectedPhoto,
  locked,
  closeGallery,
  previousPhoto,
  nextPhoto,
}: Props) {
  return (
    <div
      className="fixed inset-0 z-[9999] flex h-dvh max-w-full items-center justify-center overflow-x-hidden bg-[#08150e]/90 p-4 backdrop-blur-sm sm:p-8"
      role="dialog"
      aria-modal="true"
      aria-label={`Galeria de fotos de ${animalName}`}
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) closeGallery();
      }}
    >
      <div className="relative flex h-full w-full max-w-6xl flex-col items-center justify-center">
        <div className="absolute left-0 right-0 top-0 z-10 flex items-center justify-between text-white">
          <span className="rounded-xl bg-black/35 px-3 py-2 text-sm font-semibold backdrop-blur-sm">
            {selectedPhoto + 1} de {photos.length}
          </span>
          <button
            type="button"
            onClick={closeGallery}
            className="grid size-11 place-items-center rounded-xl bg-black/35 transition hover:bg-white/20 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
            aria-label="Fechar galeria"
          >
            <svg
              viewBox="0 0 24 24"
              className="size-6"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              aria-hidden="true"
            >
              <path d="m6 6 12 12M18 6 6 18" strokeLinecap="round" />
            </svg>
          </button>
        </div>

        <div className="flex h-[78dvh] w-full items-center justify-center px-2 sm:px-16">
          {/* A tag nativa preserva as dimensões reais da foto para arredondar exatamente suas bordas. */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={photos[selectedPhoto]}
            alt={`${animalName}, foto ${selectedPhoto + 1} ampliada`}
            className="h-auto max-h-[55dvh] w-full max-w-4xl rounded-xl object-contain shadow-2xl"
          />
        </div>

        {!locked && photos.length > 1 && (
          <>
            <button
              type="button"
              onClick={previousPhoto}
              className="absolute left-1 grid size-11 place-items-center rounded-xl bg-black/45 text-white shadow-lg backdrop-blur-sm transition hover:bg-[#256441] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white sm:left-4 sm:size-12"
              aria-label="Foto anterior"
            >
              <svg
                viewBox="0 0 20 20"
                className="size-5"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.2"
                aria-hidden="true"
              >
                <path
                  d="m12.5 4.5-5 5.5 5 5.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
            <button
              type="button"
              onClick={nextPhoto}
              className="absolute right-1 grid size-11 place-items-center rounded-xl bg-black/45 text-white shadow-lg backdrop-blur-sm transition hover:bg-[#256441] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white sm:right-4 sm:size-12"
              aria-label="Próxima foto"
            >
              <svg
                viewBox="0 0 20 20"
                className="size-5"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.2"
                aria-hidden="true"
              >
                <path
                  d="m7.5 4.5 5 5.5-5 5.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
          </>
        )}
      </div>
    </div>
  );
}
