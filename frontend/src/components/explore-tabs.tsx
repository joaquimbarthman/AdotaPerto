"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const options = [{ label: "Animais", href: "/adocao" }, { label: "Itens", href: "/itens" }];

export function ExploreTabs() {
  const pathname = usePathname();
  return <nav className="mb-6 flex flex-wrap items-center gap-2" aria-label="Explorar por categoria">{options.map((option) => {
    const active = pathname === option.href || pathname.startsWith(`${option.href}/`);
    return <Link key={option.href} href={option.href} aria-current={active ? "page" : undefined} className={`group inline-flex min-h-9 items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-semibold transition ${active ? "bg-[#e3f2e6] text-[#256441]" : "text-[#526057] hover:bg-[#e8f7eb] hover:text-[#256441]"}`}>{option.label}<svg viewBox="0 0 20 20" className={`size-3.5 transition-transform group-hover:translate-x-0.5 ${active ? "opacity-100" : "opacity-50"}`} fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><path d="m7.5 4.5 5 5.5-5 5.5" strokeLinecap="round" strokeLinejoin="round" /></svg></Link>;
  })}</nav>;
}
