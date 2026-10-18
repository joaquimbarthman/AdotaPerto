"use client";

import type { Dispatch, RefObject, SetStateAction } from "react";

type Position = { x: number; y: number };
type Drag = { x: number; y: number; left: number; top: number };
type Props = {
  source: string;
  zoom: number;
  setZoom: Dispatch<SetStateAction<number>>;
  position: Position;
  setPosition: Dispatch<SetStateAction<Position>>;
  cropAreaRef: RefObject<HTMLDivElement | null>;
  dragRef: RefObject<Drag | null>;
  onCancel: () => void;
  onConfirm: () => void;
};

export function ProfilePhotoCropDialog({
  source,
  zoom,
  setZoom,
  position,
  setPosition,
  cropAreaRef,
  dragRef,
  onCancel,
  onConfirm,
}: Props) {
  return (
    <div
      className="fixed inset-0 z-[1000] grid h-dvh max-w-full place-items-center overflow-x-hidden overflow-y-auto bg-[#0b110d]/75 p-4 backdrop-blur-md"
      role="dialog"
      aria-modal="true"
      aria-labelledby="crop-title"
    >
      <div className="w-full max-w-115 overflow-hidden rounded-2xl border border-[#d7e6da] bg-white shadow-[0_28px_90px_rgba(0,0,0,.32)]">
        <header className="border-b border-[#e3ece5] px-6 py-5">
          <p className="text-[10px] font-extrabold uppercase tracking-[.14em] text-[#3f7d58]">
            Foto de perfil
          </p>
          <h2
            id="crop-title"
            className="mt-1 text-xl font-extrabold text-[#243129]"
          >
            Posicione sua foto
          </h2>
          <p className="mt-1 text-sm leading-5 text-[#68726b]">
            Arraste e ajuste o zoom. Apenas a área dentro do círculo será usada.
          </p>
        </header>
        <div className="p-5 sm:p-6">
          <div
            ref={cropAreaRef}
            className="relative mx-auto aspect-square w-full max-w-85 touch-none select-none overflow-hidden rounded-xl bg-[#142019] cursor-grab active:cursor-grabbing"
            onPointerDown={(event) => {
              event.currentTarget.setPointerCapture(event.pointerId);
              dragRef.current = {
                x: event.clientX,
                y: event.clientY,
                left: position.x,
                top: position.y,
              };
            }}
            onPointerMove={(event) => {
              const drag = dragRef.current;
              if (drag)
                setPosition({
                  x: drag.left + event.clientX - drag.x,
                  y: drag.top + event.clientY - drag.y,
                });
            }}
            onPointerUp={() => {
              dragRef.current = null;
            }}
            onPointerCancel={() => {
              dragRef.current = null;
            }}
          >
            {/* A imagem local usa uma URL blob para permitir o recorte imediato. */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={source}
              alt="Imagem escolhida para recorte"
              draggable={false}
              className="pointer-events-none size-full object-contain opacity-90 will-change-transform"
              style={{
                transform: `translate(${position.x}px, ${position.y}px) scale(${zoom})`,
              }}
            />
            <div className="pointer-events-none absolute left-1/2 top-1/2 size-[78%] -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white shadow-[0_0_0_999px_rgba(7,14,9,.52),0_0_0_5px_rgba(255,255,255,.14)]" />
          </div>
          <div className="mt-5 flex items-center gap-4">
            <span
              className="text-lg font-bold text-[#708078]"
              aria-hidden="true"
            >
              −
            </span>
            <label className="flex-1">
              <span className="sr-only">Zoom da foto</span>
              <input
                type="range"
                min="1"
                max="2.5"
                step="0.05"
                value={zoom}
                onChange={(event) => setZoom(Number(event.target.value))}
                className="filter-range w-full bg-[#d7e6da]"
              />
            </label>
            <span
              className="text-xl font-bold text-[#526057]"
              aria-hidden="true"
            >
              +
            </span>
          </div>
          <p className="mt-2 text-center text-xs font-semibold text-[#7b8980]">
            {Math.round(zoom * 100)}% · arraste para reposicionar
          </p>
          <div className="mt-6 grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => onCancel()}
              className="min-h-12 rounded-xl border border-[#b7c9bc] px-4 text-sm font-bold text-[#526057] transition hover:border-[#86a590] hover:bg-[#f3f8f4]"
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={onConfirm}
              className="min-h-12 rounded-xl bg-[#256441] px-4 text-sm font-bold text-white shadow-sm transition hover:bg-[#194b30]"
            >
              Usar foto
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
