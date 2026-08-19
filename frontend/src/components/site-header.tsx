"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { ThemeToggle } from "@/components/theme-toggle";
import { signOut, useSession } from "@/lib/auth-client";

const links = [
  { label: "Início", href: "/" },
  { label: "Adotar", href: "/adocao" },
  { label: "Doar", href: "/doacoes" },
  { label: "Mapa", href: "#" },
];

export function SiteHeader() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const { data: session, isPending } = useSession();

  async function handleSignOut() {
    await signOut({
      fetchOptions: {
        onSuccess: () => {
          window.location.href = "/";
        },
      },
    });
  }

  return (
    <header className="sticky top-0 z-30 border-b border-black/[0.03] bg-[#eefdf1]/95 shadow-[0_1px_5px_rgba(38,51,43,0.05)] backdrop-blur">
      <div className="relative mx-auto flex h-20 max-w-[1200px] items-center justify-between px-4 sm:px-6 lg:px-20">
        <Link href="/" className="flex items-center gap-2 text-[22px] font-extrabold tracking-[-0.01em] text-[#256441] transition-opacity hover:opacity-80 sm:text-[32px]">
          <Image src="/icons/adocao.svg" alt="" width={30} height={30} className="size-6 sm:size-[30px]" /> AdotaPerto
        </Link>
        <nav className="hidden items-center gap-6 lg:flex" aria-label="Navegação principal">
          {links.map((link) => {
            const active = pathname === link.href || (link.href !== "/" && pathname.startsWith(`${link.href}/`));
            return <Link key={link.label} href={link.href} className={`relative pb-2 text-sm font-semibold tracking-[0.05em] transition-colors duration-200 after:absolute after:bottom-0 after:left-0 after:h-0.5 after:bg-[#256441] after:transition-all after:duration-300 ${active ? "font-bold text-[#256441] after:w-full" : "text-[#404942] after:w-0 hover:text-[#256441] hover:after:w-full"}`}>{link.label}</Link>;
          })}
        </nav>
        <div className="hidden items-center gap-3 lg:flex">
          <button className="grid size-9 place-items-center rounded-full transition hover:bg-[#e1f2e5]" aria-label="Notificações"><Image src="/icons/notificacoes.svg" alt="" width={16} height={20} /></button>
          <ThemeToggle />

          {isPending ? (
            <div className="size-9 animate-pulse rounded-full bg-[#d7e6da]" />
          ) : session ? (
            <div className="flex items-center gap-2">
              <Link href="/perfil" className="flex items-center gap-2 rounded-xl p-1.5 transition hover:bg-[#e1f2e5]" title={session.user.name}>
                <div className="relative size-8 overflow-hidden rounded-full border border-[#86a590] bg-[#e3f2e6]">
                  {session.user.image ? (
                    <Image src={session.user.image} alt={session.user.name} fill className="object-cover" />
                  ) : (
                    <div className="grid size-full place-items-center text-xs font-bold text-[#256441]">
                      {session.user.name?.charAt(0).toUpperCase() || "U"}
                    </div>
                  )}
                </div>
                <span className="max-w-[120px] truncate text-sm font-semibold text-[#256441]">{session.user.name}</span>
              </Link>
              <button
                type="button"
                onClick={handleSignOut}
                className="rounded-lg px-2.5 py-1.5 text-xs font-semibold text-[#707971] transition hover:bg-[#fde8e8] hover:text-red-600"
              >
                Sair
              </button>
            </div>
          ) : (
            <Link href="/login" className="rounded-lg px-4 py-2 text-sm font-semibold tracking-[0.05em] text-[#256441] transition hover:bg-[#e8f7eb]">
              Entrar
            </Link>
          )}
        </div>
        <button type="button" onClick={() => setOpen((value) => !value)} className="flex size-10 flex-col items-center justify-center gap-[5px] rounded-xl bg-[#e8f7eb] shadow-[inset_0_0_0_1px_rgba(37,100,65,0.08)] transition hover:bg-[#d7eeda] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#256441] lg:hidden" aria-expanded={open} aria-label={open ? "Fechar menu principal" : "Abrir menu principal"}>
          <span className={`h-0.5 w-[17px] rounded-full bg-[#256441] transition-transform duration-200 ${open ? "translate-y-[7px] rotate-45" : ""}`} />
          <span className={`h-0.5 w-[17px] rounded-full bg-[#256441] transition-opacity duration-200 ${open ? "opacity-0" : ""}`} />
          <span className={`h-0.5 w-[17px] rounded-full bg-[#256441] transition-transform duration-200 ${open ? "-translate-y-[7px] -rotate-45" : ""}`} />
        </button>
        <div className={`absolute left-4 right-4 top-[72px] origin-top rounded-2xl border border-[#256441]/10 bg-white p-4 shadow-xl transition-all duration-200 sm:left-auto sm:right-6 sm:w-72 lg:hidden ${open ? "visible translate-y-0 scale-100 opacity-100" : "invisible -translate-y-2 scale-95 opacity-0"}`}>
          <nav className="flex flex-col" aria-label="Navegação móvel">
            {links.map((link) => <Link key={link.label} href={link.href} onClick={() => setOpen(false)} className={`rounded-lg px-4 py-3 text-sm font-semibold tracking-[0.05em] transition ${pathname === link.href || (link.href !== "/" && pathname.startsWith(`${link.href}/`)) ? "bg-[#e8f7eb] text-[#256441]" : "text-[#404942] hover:bg-[#eefdf1]"}`}>{link.label}</Link>)}
          </nav>

          {session ? (
            <>
              <Link href="/perfil" onClick={() => setOpen(false)} className="mt-2 flex items-center gap-3 rounded-lg bg-[#f7fcf8] px-4 py-3 text-sm font-semibold text-[#256441]">
                <div className="relative size-6 overflow-hidden rounded-full border border-[#86a590] bg-[#e3f2e6]">
                  {session.user.image ? (
                    <Image src={session.user.image} alt={session.user.name} fill className="object-cover" />
                  ) : (
                    <div className="grid size-full place-items-center text-[10px] font-bold text-[#256441]">
                      {session.user.name?.charAt(0).toUpperCase() || "U"}
                    </div>
                  )}
                </div>
                Meu perfil ({session.user.name})
              </Link>
              <ThemeToggle mobile />
              <div className="mt-3 border-t border-[#d7e6da] pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setOpen(false);
                    handleSignOut();
                  }}
                  className="block w-full rounded-lg border border-red-200 bg-red-50 px-3 py-2.5 text-center text-sm font-semibold text-red-700 transition hover:bg-red-100"
                >
                  Sair da conta
                </button>
              </div>
            </>
          ) : (
            <>
              <ThemeToggle mobile />
              <div className="mt-3 border-t border-[#d7e6da] pt-4">
                <Link href="/login" onClick={() => setOpen(false)} className="block w-full rounded-lg bg-[#256441] px-3 py-2.5 text-center text-sm font-semibold text-white transition hover:bg-[#194b30]">
                  Entrar
                </Link>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
