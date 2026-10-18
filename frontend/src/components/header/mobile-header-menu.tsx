"use client";

import { ThemeToggle } from "@/components/theme-toggle";
import type { useSession } from "@/lib/auth-client";
import Image from "next/image";
import Link from "next/link";
import type { Dispatch, SetStateAction } from "react";
import { links } from "./header-links";

type Session = NonNullable<ReturnType<typeof useSession>["data"]>;
type Props = {
  open: boolean;
  setOpen: Dispatch<SetStateAction<boolean>>;
  session: Session | null;
  pathname: string;
  firstName: string;
  isAdmin: boolean;
  handleSignOut: () => void;
};

export function MobileHeaderMenu({
  open,
  setOpen,
  session,
  pathname,
  firstName,
  isAdmin,
  handleSignOut,
}: Props) {
  return (
    <div
      className={`absolute left-4 right-4 top-18 origin-top rounded-2xl border border-[#256441]/10 bg-white p-4 shadow-xl transition-all duration-200 sm:left-auto sm:right-6 sm:w-72 lg:hidden ${open ? "visible translate-y-0 scale-100 opacity-100" : "invisible -translate-y-2 scale-95 opacity-0"}`}
    >
      <nav className="flex flex-col" aria-label="Navegação móvel">
        {links.map((link) => (
          <Link
            key={link.label}
            href={link.href}
            onClick={() => setOpen(false)}
            className={`rounded-lg px-4 py-3 text-sm font-semibold tracking-wider transition ${pathname === link.href || (link.href !== "/" && pathname.startsWith(`${link.href}/`)) || (link.label === "Explorar" && pathname.startsWith("/itens")) ? "bg-[#e8f7eb] text-[#256441]" : "text-[#404942] hover:bg-[#eefdf1]"}`}
          >
            {link.label}
          </Link>
        ))}
      </nav>

      {session ? (
        <>
          <Link
            href="/perfil"
            onClick={() => setOpen(false)}
            className="mt-2 flex items-center gap-3 rounded-lg bg-[#f7fcf8] px-4 py-3 text-sm font-semibold text-[#256441]"
          >
            <div className="relative size-6 overflow-hidden rounded-full border border-[#86a590] bg-[#e3f2e6]">
              {session.user.image ? (
                <Image
                  src={session.user.image}
                  alt={session.user.name}
                  fill
                  className="object-cover"
                />
              ) : (
                <div className="grid size-full place-items-center text-[10px] font-bold text-[#256441]">
                  {session.user.name?.charAt(0).toUpperCase() || "U"}
                </div>
              )}
            </div>
            Meu perfil ({firstName})
          </Link>
          {isAdmin && (
            <Link
              href="/admin"
              onClick={() => setOpen(false)}
              className="mt-2 block rounded-lg bg-[#eef7f0] px-4 py-3 text-sm font-bold text-[#256441]"
            >
              Painel administrativo
            </Link>
          )}
          <Link
            href="/organizacao"
            onClick={() => setOpen(false)}
            className="mt-2 block rounded-lg bg-[#eef7f0] px-4 py-3 text-sm font-bold text-[#256441]"
          >
            Organização
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
            <Link
              href="/login"
              onClick={() => setOpen(false)}
              className="block w-full rounded-lg bg-[#256441] px-3 py-2.5 text-center text-sm font-semibold text-white transition hover:bg-[#194b30]"
            >
              Entrar
            </Link>
          </div>
        </>
      )}
    </div>
  );
}
