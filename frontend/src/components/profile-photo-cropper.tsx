"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { ProfilePhotoCropDialog } from "./profile-photo-crop-dialog";

export function ProfilePhotoCropper({
  currentImage,
  name,
  loading,
  onCrop,
}: {
  currentImage: string;
  name: string;
  loading: boolean;
  onCrop: (file: File, preview: string) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const cropAreaRef = useRef<HTMLDivElement>(null);
  const dragRef = useRef<{
    x: number;
    y: number;
    left: number;
    top: number;
  } | null>(null);
  const [source, setSource] = useState<string | null>(null);
  const [fileName, setFileName] = useState("perfil.jpg");
  const [zoom, setZoom] = useState(1);
  const [error, setError] = useState("");
  const [position, setPosition] = useState({ x: 0, y: 0 });
  useEffect(
    () => () => {
      if (source) URL.revokeObjectURL(source);
    },
    [source],
  );

  function choose(file?: File) {
    setError("");
    if (!file) return;
    if (file.size > 5 * 1024 * 1024)
      return setError("A imagem deve ter no máximo 5 MB.");
    if (!file.type.startsWith("image/"))
      return setError("Escolha uma imagem JPG, PNG ou WebP.");
    if (source) URL.revokeObjectURL(source);
    setSource(URL.createObjectURL(file));
    setFileName(file.name.replace(/\.[^.]+$/, "") || "perfil");
    setZoom(1);
    setPosition({ x: 0, y: 0 });
  }

  async function confirmCrop() {
    if (!source) return;
    const image = new window.Image();
    image.src = source;
    await image.decode();
    const size = 512;
    const canvas = document.createElement("canvas");
    canvas.width = size;
    canvas.height = size;
    const context = canvas.getContext("2d");
    if (!context) return;
    const previewSize =
      cropAreaRef.current?.clientWidth || Math.min(window.innerWidth - 88, 340);
    const cropDiameter = previewSize * 0.78;
    const outputRatio = size / cropDiameter;
    // Start from the complete image shown with object-contain. The user then
    // chooses how much to zoom instead of receiving a pre-cropped preview.
    const previewScale = Math.min(
      previewSize / image.naturalWidth,
      previewSize / image.naturalHeight,
    );
    const scale = previewScale * zoom * outputRatio;
    const width = image.naturalWidth * scale;
    const height = image.naturalHeight * scale;
    context.fillStyle = "#d7e6da";
    context.fillRect(0, 0, size, size);
    context.drawImage(
      image,
      (size - width) / 2 + position.x * outputRatio,
      (size - height) / 2 + position.y * outputRatio,
      width,
      height,
    );
    const blob = await new Promise<Blob | null>((resolve) =>
      canvas.toBlob(resolve, "image/jpeg", 0.9),
    );
    if (!blob) return setError("Não foi possível recortar a imagem.");
    const cropped = new File([blob], `${fileName}-perfil.jpg`, {
      type: "image/jpeg",
    });
    onCrop(cropped, URL.createObjectURL(blob));
    setSource(null);
    if (inputRef.current) inputRef.current.value = "";
  }

  return (
    <>
      <div className="relative size-24 shrink-0 overflow-hidden rounded-full border-4 border-[#e3f2e6] bg-[#e3f2e6] shadow-sm lg:size-32">
        {currentImage ? (
          <Image
            src={currentImage}
            alt={name}
            fill
            priority
            unoptimized={currentImage.startsWith("blob:")}
            className="object-cover"
          />
        ) : (
          <div className="grid size-full place-items-center text-3xl font-bold text-[#256441]">
            {name.charAt(0).toUpperCase()}
          </div>
        )}
        {loading && (
          <div
            className="absolute inset-0 grid place-items-center bg-[#153d27]/65 text-white backdrop-blur-[2px]"
            role="status"
            aria-label="Enviando foto"
          >
            <span className="profile-loader relative size-7 rounded-full">
              <span className="sr-only">Enviando foto</span>
            </span>
          </div>
        )}
      </div>
      <div>
        <button
          type="button"
          disabled={loading}
          onClick={() => inputRef.current?.click()}
          className="inline-flex items-center gap-2 rounded-lg border border-[#86a590] px-4 py-2.5 text-sm font-bold text-[#256441] transition hover:bg-[#e8f7eb] disabled:cursor-wait disabled:opacity-60"
        >
          <Image src="/icons/edit.svg" alt="" width={14} height={14} />
          Alterar foto
        </button>
        <input
          ref={inputRef}
          type="file"
          accept="image/png,image/jpeg,image/webp"
          className="sr-only"
          onChange={(event) => choose(event.target.files?.[0])}
        />
        <p className="mt-2 text-xs leading-5 text-[#7b8980]">
          JPG, PNG ou WebP. Máx. 5 MB.
        </p>
        {error && (
          <p className="mt-1 text-xs font-semibold text-red-700" role="alert">
            {error}
          </p>
        )}
      </div>
      {source
        ? createPortal(
            <ProfilePhotoCropDialog source={source} zoom={zoom} setZoom={setZoom} position={position} setPosition={setPosition} cropAreaRef={cropAreaRef} dragRef={dragRef} onCancel={() => setSource(null)} onConfirm={confirmCrop} />,
            document.body,
          )
        : null}
    </>
  );
}
