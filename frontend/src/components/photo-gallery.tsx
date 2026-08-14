"use client";

import Image from "next/image";
import { useCallback, useEffect, useState } from "react";
import { createPortal } from "react-dom";

type PhotoGalleryProps = {
  animalName: string;
  photos: string[];
};

export function PhotoGallery({ animalName, photos }: PhotoGalleryProps) {
  const [selectedPhoto, setSelectedPhoto] = useState<number | null>(null);

  const closeGallery = useCallback(() => setSelectedPhoto(null), []);
  const previousPhoto = useCallback(() => {
    setSelectedPhoto((current) => current === null ? null : (current - 1 + photos.length) % photos.length);
  }, [photos.length]);
  const nextPhoto = useCallback(() => {
    setSelectedPhoto((current) => current === null ? null : (current + 1) % photos.length);
  }, [photos.length]);

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
      <section className="grid h-[360px] grid-cols-3 grid-rows-2 gap-3 sm:h-[500px]" aria-label={`Fotos de ${animalName}`}>
        {photos.slice(0, 3).map((photo, index) => (
          <button
            key={`${photo}-${index}`}
            type="button"
            onClick={() => setSelectedPhoto(index)}
            className={`group relative overflow-hidden rounded-xl shadow-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#256441] ${index === 0 ? "col-span-2 row-span-2" : ""}`}
            aria-label={index === 2 ? `Ver mais fotos de ${animalName}` : `Ampliar foto ${index + 1} de ${animalName}`}
          >
            <Image
              src={photo}
              alt={`${animalName}, foto ${index + 1}`}
              fill
              priority={index === 0}
              className="rounded-xl object-cover transition-transform duration-500 group-hover:scale-105"
              sizes={index === 0 ? "(max-width:1024px) 66vw,550px" : "(max-width:1024px) 33vw,250px"}
            />
            {index === 2 && (
              <span className="absolute inset-0 flex items-center justify-center bg-[#173d29]/45 transition-colors group-hover:bg-[#173d29]/60">
                <span className="inline-flex items-center gap-2 rounded-xl bg-black/35 px-4 py-2.5 text-sm font-semibold text-white backdrop-blur-sm">
                  <Image src="/icons/gallery.svg" alt="" width={20} height={20} className="brightness-0 invert" />
                  Ver mais fotos
                </span>
              </span>
            )}
          </button>
        ))}
      </section>

      {selectedPhoto !== null && createPortal(
        <div
          className="fixed inset-0 z-[9999] flex h-dvh w-screen items-center justify-center bg-[#08150e]/90 p-4 backdrop-blur-sm sm:p-8"
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

            {photos.length > 1 && (
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
