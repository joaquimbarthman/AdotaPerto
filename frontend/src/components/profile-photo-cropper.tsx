"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

export function ProfilePhotoCropper({ currentImage, name, loading, onCrop }: { currentImage: string; name: string; loading: boolean; onCrop: (file: File, preview: string) => void }) {
  const inputRef = useRef<HTMLInputElement>(null);
  const cropAreaRef = useRef<HTMLDivElement>(null);
  const dragRef = useRef<{ x: number; y: number; left: number; top: number } | null>(null);
  const [source, setSource] = useState<string | null>(null);
  const [fileName, setFileName] = useState("perfil.jpg");
  const [zoom, setZoom] = useState(1);
  const [error, setError] = useState("");
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);
  useEffect(() => () => { if (source) URL.revokeObjectURL(source); }, [source]);

  function choose(file?: File) {
    setError("");
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) return setError("A imagem deve ter no máximo 5 MB.");
    if (!file.type.startsWith("image/")) return setError("Escolha uma imagem JPG, PNG ou WebP.");
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
    const previewSize = cropAreaRef.current?.clientWidth || Math.min(window.innerWidth - 88, 340);
    const cropDiameter = previewSize * .78;
    const outputRatio = size / cropDiameter;
    // Start from the complete image shown with object-contain. The user then
    // chooses how much to zoom instead of receiving a pre-cropped preview.
    const previewScale = Math.min(previewSize / image.naturalWidth, previewSize / image.naturalHeight);
    const scale = previewScale * zoom * outputRatio;
    const width = image.naturalWidth * scale;
    const height = image.naturalHeight * scale;
    context.fillStyle = "#d7e6da";
    context.fillRect(0, 0, size, size);
    context.drawImage(image, (size - width) / 2 + position.x * outputRatio, (size - height) / 2 + position.y * outputRatio, width, height);
    const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/jpeg", .9));
    if (!blob) return setError("Não foi possível recortar a imagem.");
    const cropped = new File([blob], `${fileName}-perfil.jpg`, { type: "image/jpeg" });
    onCrop(cropped, URL.createObjectURL(blob));
    setSource(null);
    if (inputRef.current) inputRef.current.value = "";
  }

  return <>
    <div className="relative size-24 shrink-0 overflow-hidden rounded-full border-4 border-[#e3f2e6] bg-[#e3f2e6] shadow-sm lg:size-32">
      {currentImage ? <Image src={currentImage} alt={name} fill priority unoptimized={currentImage.startsWith("blob:")} className="object-cover" /> : <div className="grid size-full place-items-center text-3xl font-bold text-[#256441]">{name.charAt(0).toUpperCase()}</div>}
      {loading && <div className="absolute inset-0 grid place-items-center bg-[#153d27]/65 text-white backdrop-blur-[2px]" role="status" aria-label="Enviando foto"><span className="profile-loader relative size-7 rounded-full"><span className="sr-only">Enviando foto</span></span></div>}
    </div>
    <div>
      <button type="button" disabled={loading} onClick={() => inputRef.current?.click()} className="inline-flex items-center gap-2 rounded-lg border border-[#86a590] px-4 py-2.5 text-sm font-bold text-[#256441] transition hover:bg-[#e8f7eb] disabled:cursor-wait disabled:opacity-60"><Image src="/icons/edit.svg" alt="" width={14} height={14} />Alterar foto</button>
      <input ref={inputRef} type="file" accept="image/png,image/jpeg,image/webp" className="sr-only" onChange={(event) => choose(event.target.files?.[0])} />
      <p className="mt-2 text-xs leading-5 text-[#7b8980]">JPG, PNG ou WebP. Máx. 5 MB.</p>
      {error && <p className="mt-1 text-xs font-semibold text-red-700" role="alert">{error}</p>}
    </div>
    {mounted && source ? createPortal(<div className="fixed inset-0 z-[1000] grid h-dvh max-w-full place-items-center overflow-x-hidden overflow-y-auto bg-[#0b110d]/75 p-4 backdrop-blur-md" role="dialog" aria-modal="true" aria-labelledby="crop-title">
      <div className="w-full max-w-[460px] overflow-hidden rounded-2xl border border-[#d7e6da] bg-white shadow-[0_28px_90px_rgba(0,0,0,.32)]">
        <header className="border-b border-[#e3ece5] px-6 py-5"><p className="text-[10px] font-extrabold uppercase tracking-[.14em] text-[#3f7d58]">Foto de perfil</p><h2 id="crop-title" className="mt-1 text-xl font-extrabold text-[#243129]">Posicione sua foto</h2><p className="mt-1 text-sm leading-5 text-[#68726b]">Arraste e ajuste o zoom. Apenas a área dentro do círculo será usada.</p></header>
        <div className="p-5 sm:p-6">
        <div
          ref={cropAreaRef}
          className="relative mx-auto aspect-square w-full max-w-[340px] touch-none select-none overflow-hidden rounded-xl bg-[#142019] cursor-grab active:cursor-grabbing"
          onPointerDown={(event) => { event.currentTarget.setPointerCapture(event.pointerId); dragRef.current = { x: event.clientX, y: event.clientY, left: position.x, top: position.y }; }}
          onPointerMove={(event) => { const drag = dragRef.current; if (drag) setPosition({ x: drag.left + event.clientX - drag.x, y: drag.top + event.clientY - drag.y }); }}
          onPointerUp={() => { dragRef.current = null; }}
          onPointerCancel={() => { dragRef.current = null; }}
        ><img src={source} alt="Imagem escolhida para recorte" draggable={false} className="pointer-events-none size-full object-contain opacity-90 will-change-transform" style={{ transform: `translate(${position.x}px, ${position.y}px) scale(${zoom})` }} /><div className="pointer-events-none absolute left-1/2 top-1/2 size-[78%] -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white shadow-[0_0_0_999px_rgba(7,14,9,.52),0_0_0_5px_rgba(255,255,255,.14)]" /></div>
        <div className="mt-5 flex items-center gap-4"><span className="text-lg font-bold text-[#708078]" aria-hidden="true">−</span><label className="flex-1"><span className="sr-only">Zoom da foto</span><input type="range" min="1" max="2.5" step="0.05" value={zoom} onChange={(event) => setZoom(Number(event.target.value))} className="filter-range w-full bg-[#d7e6da]" /></label><span className="text-xl font-bold text-[#526057]" aria-hidden="true">+</span></div>
        <p className="mt-2 text-center text-xs font-semibold text-[#7b8980]">{Math.round(zoom * 100)}% · arraste para reposicionar</p>
        <div className="mt-6 grid grid-cols-2 gap-3"><button type="button" onClick={() => setSource(null)} className="min-h-12 rounded-xl border border-[#b7c9bc] px-4 text-sm font-bold text-[#526057] transition hover:border-[#86a590] hover:bg-[#f3f8f4]">Cancelar</button><button type="button" onClick={confirmCrop} className="min-h-12 rounded-xl bg-[#256441] px-4 text-sm font-bold text-white shadow-sm transition hover:bg-[#194b30]">Usar foto</button></div>
        </div>
      </div>
    </div>, document.body) : null}
  </>;
}
