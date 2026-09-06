"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { createPortal } from "react-dom";

type PhotoGalleryProps = {
  animalName: string;
  photos: string[];
  locked?: boolean;
};

export function PhotoGallery({ animalName, photos, locked = false }: PhotoGalleryProps) {
  const router = useRouter();
  const [selectedPhoto, setSelectedPhoto] = useState<number | null>(null);

  const closeGallery = useCallback(() => setSelectedPhoto(null), []);
  const previousPhoto = useCallback(() => {
    if (locked) return;
    setSelectedPhoto((current) => current === null ? null : (current - 1 + photos.length) % photos.length);
  }, [locked, photos.length]);
  const nextPhoto = useCallback(() => {
    if (locked) return;
    setSelectedPhoto((current) => current === null ? null : (current + 1) % photos.length);
  }, [locked, photos.length]);

  useEffect(() => {
    if (selectedPhoto === null) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") closeGallery();
      if (event.key === "ArrowLeft") previousPhoto();
      if (event.key === "ArrowRight") nextPhoto();
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [closeGallery, nextPhoto, previousPhoto, selectedPhoto]);

  return (
    <>
      <section className="detail-photo-gallery grid h-[230px] w-full min-w-0 max-w-full grid-cols-3 grid-rows-2 gap-1.5 overflow-hidden sm:h-[500px] sm:gap-3" aria-label={`Fotos de ${animalName}`}>
        {photos.slice(0, 3).map((photo, index) => (
          <button
            key={`${photo}-${index}`}
            type="button"
            onClick={() => locked && index > 0 ? router.push("/login?reason=unauthenticated") : setSelectedPhoto(index)}
            className={`group relative overflow-hidden rounded-lg shadow-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#256441] sm:rounded-xl ${index === 0 ? "col-span-2 row-span-2" : ""}`}
            aria-label={index === 2 ? `Ver mais fotos de ${animalName}` : `Ampliar foto ${index + 1} de ${animalName}`}
          >
            <Image
              src={photo}
              alt={`${animalName}, foto ${index + 1}`}
              fill
              priority={index === 0}
              className={`rounded-xl object-cover transition duration-500 ${locked && index > 0 ? "scale-105 blur-[9px]" : "group-hover:scale-105"}`}
              sizes={index === 0 ? "(max-width:1024px) 66vw,550px" : "(max-width:1024px) 33vw,250px"}
            />
            {!locked && index === 2 && (
              <span className="absolute inset-0 flex items-center justify-center bg-[#173d29]/45 transition-colors group-hover:bg-[#173d29]/60">
                <span className="inline-flex items-center gap-1 rounded-lg bg-black/35 px-2 py-1.5 text-[10px] font-semibold text-white backdrop-blur-sm sm:gap-2 sm:rounded-xl sm:px-4 sm:py-2.5 sm:text-sm">
                  <Image src="/icons/gallery.svg" alt="" width={16} height={16} className="brightness-0 invert sm:h-5 sm:w-5" />
                  <span className="hidden min-[380px]:inline">Ver mais fotos</span><span className="min-[380px]:hidden">Mais</span>
                </span>
              </span>
            )}
          </button>
        ))}
      </section>

      {selectedPhoto !== null && createPortal(
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
              <button type="button" onClick={closeGallery} className="grid size-11 place-items-center rounded-xl bg-black/35 transition hover:bg-white/20 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white" aria-label="Fechar galeria">
                <svg viewBox="0 0 24 24" className="size-6" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><path d="m6 6 12 12M18 6 6 18" strokeLinecap="round" /></svg>
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
                <button type="button" onClick={previousPhoto} className="absolute left-1 grid size-11 place-items-center rounded-xl bg-black/45 text-white shadow-lg backdrop-blur-sm transition hover:bg-[#256441] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white sm:left-4 sm:size-12" aria-label="Foto anterior">
                  <svg viewBox="0 0 20 20" className="size-5" fill="none" stroke="currentColor" strokeWidth="2.2" aria-hidden="true"><path d="m12.5 4.5-5 5.5 5 5.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
                </button>
                <button type="button" onClick={nextPhoto} className="absolute right-1 grid size-11 place-items-center rounded-xl bg-black/45 text-white shadow-lg backdrop-blur-sm transition hover:bg-[#256441] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white sm:right-4 sm:size-12" aria-label="Próxima foto">
                  <svg viewBox="0 0 20 20" className="size-5" fill="none" stroke="currentColor" strokeWidth="2.2" aria-hidden="true"><path d="m7.5 4.5 5 5.5-5 5.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
                </button>
              </>
            )}
          </div>
        </div>,
        document.body,
      )}
    </>
  );
}
