"use client";

import { useEffect, useMemo } from "react";

export function DonationPhotoPreview({
  file,
  label,
  onRemove,
  featured = false,
}: {
  file: File;
  label: string;
  onRemove: () => void;
  featured?: boolean;
}) {
  const url = useMemo(() => URL.createObjectURL(file), [file]);
  useEffect(() => () => URL.revokeObjectURL(url), [url]);
  return (
    <div
      className={`group relative aspect-square overflow-hidden rounded-xl border bg-[#e3f2e6] ${featured ? "border-2 border-[#256441] shadow-[0_6px_18px_rgba(37,100,65,0.15)]" : "border-[#86a590]"}`}
    >
      {/* URLs blob: são previews locais e devem aparecer imediatamente, sem o pipeline do Next Image. */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={url}
        alt={label}
        className="absolute inset-0 size-full object-cover"
      />
      <button
        type="button"
        onClick={onRemove}
        className="absolute right-2 top-2 grid size-9 place-items-center rounded-full bg-black/70 text-lg font-bold text-white shadow transition hover:bg-red-600 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
        aria-label={`Remover ${label}`}
      >
        ×
      </button>
      {featured && (
        <span className="absolute left-2 top-2 rounded-full bg-[#256441] px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-white">
          Principal
        </span>
      )}
      <span className="absolute inset-x-0 bottom-0 truncate bg-black/65 px-2 py-1.5 text-xs font-medium text-white">
        {file.name}
      </span>
    </div>
  );
}
