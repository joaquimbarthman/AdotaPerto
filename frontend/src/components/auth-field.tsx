"use client";

import Image from "next/image";
import { useState } from "react";

type AuthFieldProps = React.InputHTMLAttributes<HTMLInputElement> & { label: string; icon: string; };

export function AuthField({ label, icon, type = "text", ...props }: AuthFieldProps) {
  const [visible, setVisible] = useState(false);
  const isPassword = type === "password";
  return (
    <label className="block text-sm font-semibold tracking-[0.01em] text-[#121e17]">
      {label}
      <span className="relative mt-2 block">
        <Image src={icon} alt="" width={20} height={20} className="pointer-events-none absolute left-3 top-1/2 size-5 -translate-y-1/2 object-contain" />
        <input {...props} type={isPassword && visible ? "text" : type} className="h-[50px] w-full rounded-lg border border-[#bfc9bf] bg-white py-3.5 pl-12 pr-12 text-base font-normal outline-none transition placeholder:text-[#6b7280] hover:border-[#8da497] focus:border-[#0f5d39] focus:ring-2 focus:ring-[#0f5d39]/10" />
        {isPassword && <button type="button" onClick={() => setVisible(!visible)} className="absolute right-2 top-1/2 grid size-9 -translate-y-1/2 place-items-center rounded-lg transition hover:bg-[#eefdf1]" aria-label={visible ? "Ocultar senha" : "Mostrar senha"}><Image src="/icons/eye-off.svg" alt="" width={22} height={20} className={visible ? "opacity-50" : ""} /></button>}
      </span>
    </label>
  );
}
