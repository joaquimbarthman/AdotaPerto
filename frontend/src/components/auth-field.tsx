"use client";

import Image from "next/image";
import { useState } from "react";

type AuthFieldProps = React.InputHTMLAttributes<HTMLInputElement> & { label: string; icon: string; };

export function AuthField({ label, icon, type = "text", ...props }: AuthFieldProps) {
  const [visible, setVisible] = useState(false);
  const isPassword = type === "password";
  return (
    <label className="block text-sm font-semibold tracking-[0.01em] text-[#243129]">
      {label}
      <span className="relative mt-1.5 block">
        <Image src={icon} alt="" width={20} height={20} className="pointer-events-none absolute left-3 top-1/2 size-5 -translate-y-1/2 object-contain" />
        <input {...props} type={isPassword && visible ? "text" : type} className="h-[52px] w-full rounded-xl border border-[#c8d2ca] bg-[#fbfdfb] py-3.5 pl-12 pr-12 text-base font-normal outline-none transition placeholder:text-[#7b857e] hover:border-[#91aa99] hover:bg-white focus:border-[#0f5d39] focus:bg-white focus:ring-4 focus:ring-[#0f5d39]/10" />
        {isPassword && <button type="button" onClick={() => setVisible(!visible)} className="absolute right-2 top-1/2 grid size-9 -translate-y-1/2 place-items-center rounded-lg transition hover:bg-[#eefdf1]" aria-label={visible ? "Ocultar senha" : "Mostrar senha"}><Image src="/icons/eye-off.svg" alt="" width={22} height={20} className={visible ? "opacity-50" : ""} /></button>}
      </span>
    </label>
  );
}
