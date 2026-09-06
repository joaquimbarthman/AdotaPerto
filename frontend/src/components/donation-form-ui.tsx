"use client";

import Image from "next/image";
import { ReactNode, useEffect, useMemo } from "react";

export const donationInputClass = "donation-input min-h-11 w-full rounded-lg border border-[#8b958e] bg-white px-3 text-sm text-[#121e17] outline-none transition placeholder:text-[#7d8580] hover:border-[#66746a] focus:border-[#256441] focus:ring-2 focus:ring-[#256441]/15 disabled:cursor-not-allowed disabled:opacity-60 sm:min-h-12 sm:px-3.5 sm:text-base";

export function DonationFormSection({ icon, title, description, children }: { icon: ReactNode; title: string; description?: string; children: ReactNode }) {
  return <section className="donation-form-section rounded-xl border border-[#d7e6da] bg-white p-4 shadow-[0_4px_12px_rgba(38,51,43,0.04)] sm:rounded-2xl sm:p-8 lg:p-10"><div className="mb-4 flex items-start gap-2.5 text-[#0f5d39] sm:mb-6 sm:gap-3"><span className="grid size-6 shrink-0 place-items-center sm:mt-1 sm:size-7">{icon}</span><div className="min-w-0"><h2 className="text-lg font-bold sm:text-2xl">{title}</h2>{description && <p className="mt-0.5 text-xs leading-4 text-[#5a655e] sm:mt-1 sm:text-sm sm:leading-5">{description}</p>}</div></div>{children}</section>;
}

export function DonationField({ label, optional, error, children, className = "" }: { label: string; optional?: boolean; error?: string; children: ReactNode; className?: string }) {
  return <label className={`donation-field flex min-w-0 flex-col gap-1 text-xs font-semibold text-[#121e17] sm:gap-1.5 sm:text-sm ${className}`}><span>{label}{optional ? <span className="font-normal text-[#68726b]"> (opcional)</span> : <span className="ml-1 text-red-600" aria-hidden="true">*</span>}</span>{children}{error && <span role="alert" className="text-[10px] font-medium text-red-700 sm:text-xs">{error}</span>}</label>;
}

export function DonationSelect({ name, children, required = true, onChange }: { name: string; children: ReactNode; required?: boolean; onChange?: React.ChangeEventHandler<HTMLSelectElement> }) {
  return <select name={name} required={required} defaultValue="" onChange={onChange} className={`${donationInputClass} appearance-none bg-[linear-gradient(45deg,transparent_50%,#4d5b53_50%),linear-gradient(135deg,#4d5b53_50%,transparent_50%)] bg-[position:calc(100%-18px)_21px,calc(100%-13px)_21px] bg-[size:5px_5px,5px_5px] bg-no-repeat pr-10`}><option value="" disabled>Selecione...</option>{children}</select>;
}

export function DonationPhotoPreview({ file, label, onRemove, featured = false }: { file: File; label: string; onRemove: () => void; featured?: boolean }) {
  const url = useMemo(() => URL.createObjectURL(file), [file]);
  useEffect(() => () => URL.revokeObjectURL(url), [url]);
  return <div className={`group relative aspect-square overflow-hidden rounded-xl border bg-[#e3f2e6] ${featured ? "border-2 border-[#256441] shadow-[0_6px_18px_rgba(37,100,65,0.15)]" : "border-[#86a590]"}`}><Image src={url} alt={label} fill unoptimized className="object-cover" /><button type="button" onClick={onRemove} className="absolute right-2 top-2 grid size-9 place-items-center rounded-full bg-black/70 text-lg font-bold text-white shadow transition hover:bg-red-600 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white" aria-label={`Remover ${label}`}>×</button>{featured && <span className="absolute left-2 top-2 rounded-full bg-[#256441] px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-white">Principal</span>}<span className="absolute inset-x-0 bottom-0 truncate bg-black/65 px-2 py-1.5 text-xs font-medium text-white">{file.name}</span></div>;
}
