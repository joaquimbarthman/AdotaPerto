"use client";

import Image from "next/image";
import { useState } from "react";

type AuthFieldProps = React.InputHTMLAttributes<HTMLInputElement> & { label: string; icon: string; };

export function AuthField({ label, icon, type = "text", ...props }: AuthFieldProps) {
  const [visible, setVisible] = useState(false);
  const isPassword = type === "password";
  return (
    <label className="block text-xs font-semibold tracking-[0.01em] text-[#243129] sm:text-sm">
      {label}
      <span className="relative mt-1 block sm:mt-1.5">
        <Image src={icon} alt="" width={18} height={18} className="pointer-events-none absolute left-3 top-1/2 size-[18px] -translate-y-1/2 object-contain sm:size-5" />
        <input {...props} type={isPassword && visible ? "text" : type} className="h-11 w-full rounded-lg border border-[#c8d2ca] bg-[#fbfdfb] py-2.5 pl-10 pr-10 text-sm font-normal outline-none transition placeholder:text-[#7b857e] hover:border-[#91aa99] hover:bg-white focus:border-[#0f5d39] focus:bg-white focus:ring-2 focus:ring-[#0f5d39]/10 sm:h-[52px] sm:rounded-xl sm:py-3.5 sm:pl-12 sm:pr-12 sm:text-base sm:focus:ring-4" />
        {isPassword && <button type="button" onClick={() => setVisible(!visible)} className="absolute right-1.5 top-1/2 grid size-8 -translate-y-1/2 place-items-center rounded-md transition hover:bg-[#eefdf1] sm:right-2 sm:size-9 sm:rounded-lg" aria-label={visible ? "Ocultar senha" : "Mostrar senha"}><Image src="/icons/eye-off.svg" alt="" width={19} height={18} className={visible ? "opacity-50" : ""} /></button>}
      </span>
    </label>
  );
}
