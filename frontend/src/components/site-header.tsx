"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { ThemeToggle } from "@/components/theme-toggle";
import { BrandLogo } from "@/components/brand-logo";
import { NotificationCenter } from "@/components/notification-center";
import { signOut, useSession } from "@/lib/auth-client";

const links = [
  { label: "Início", href: "/" },
  { label: "Explorar", href: "/adocao" },
  { label: "Ajudar", href: "/doacoes" },
  { label: "Mapa", href: "/mapa" },
] as const;

const profileLinks = [
  { label: "Minhas publicações", href: "/perfil#publicacoes", icon: "heart" },
  { label: "Solicitações", href: "/perfil#solicitacoes", icon: "bell" },
  { label: "Favoritos", href: "/perfil#favoritos", icon: "bookmark" },
  { label: "Dados pessoais", href: "/perfil#dados", icon: "user" },
  { label: "Endereço", href: "/perfil#endereco", icon: "pin" },
  { label: "Acesso à conta", href: "/perfil#acesso", icon: "lock" },
] as const;

export function SiteHeader() {
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const profileMenuRef = useRef<HTMLDivElement>(null);
  const { data: session, isPending } = useSession();
  const firstName = session?.user.name?.trim().split(/\s+/)[0] || "Usuário";

  useEffect(() => {
    function closeMenu(event: MouseEvent) {
      if (!profileMenuRef.current?.contains(event.target as Node)) setProfileOpen(false);
    }
    function closeOnEscape(event: KeyboardEvent) {
      if (event.key === "Escape") setProfileOpen(false);
    }
    document.addEventListener("mousedown", closeMenu);
    document.addEventListener("keydown", closeOnEscape);
    return () => { document.removeEventListener("mousedown", closeMenu); document.removeEventListener("keydown", closeOnEscape); };
  }, []);

  async function handleSignOut() {
    await signOut({
      fetchOptions: {
        onSuccess: () => {
          router.replace("/");
          router.refresh();
        },
      },
    });
  }

  return (
    <header className="sticky top-0 z-30 border-b border-black/[0.03] bg-[#eefdf1]/95 shadow-[0_1px_5px_rgba(38,51,43,0.05)] backdrop-blur">
      <div className="relative mx-auto flex h-20 max-w-[1200px] items-center justify-between px-4 sm:px-6 lg:px-20">
        <Link href="/" className="transition-opacity hover:opacity-80" aria-label="AdotaPerto — início">
          <BrandLogo priority className="h-auto w-[168px] sm:w-[205px]" />
        </Link>
        <nav className="hidden items-center gap-6 lg:flex" aria-label="Navegação principal">
          {links.map((link) => {
            const active = pathname === link.href || (link.href !== "/" && pathname.startsWith(`${link.href}/`)) || (link.label === "Explorar" && pathname.startsWith("/itens"));
            return <Link key={link.label} href={link.href} className={`relative pb-2 text-sm font-semibold tracking-[0.05em] transition-colors duration-200 after:absolute after:bottom-0 after:left-0 after:h-0.5 after:bg-[#256441] after:transition-all after:duration-300 ${active ? "font-bold text-[#256441] after:w-full" : "text-[#404942] after:w-0 hover:text-[#256441] hover:after:w-full"}`}>{link.label}</Link>;
          })}
        </nav>
        <div className="hidden items-center gap-3 lg:flex">
          <NotificationCenter userId={session?.user.id} />
          <ThemeToggle />

          {isPending ? (
            <div className="skeleton-shimmer size-9 overflow-hidden rounded-full" aria-label="Carregando sessão" />
          ) : session ? (
            <div ref={profileMenuRef} className="relative">
              <button type="button" onClick={() => setProfileOpen((value) => !value)} aria-expanded={profileOpen} aria-haspopup="menu" className={`flex items-center gap-2 rounded-xl border px-2 py-1.5 transition ${profileOpen ? "border-[#86a590] bg-white shadow-sm" : "border-transparent hover:bg-[#e1f2e5]"}`} title={session.user.name}>
                <div className="relative size-8 overflow-hidden rounded-full border border-[#86a590] bg-[#e3f2e6]">
                  {session.user.image ? (
                    <Image src={session.user.image} alt={session.user.name} fill className="object-cover" />
                  ) : (
                    <div className="grid size-full place-items-center text-xs font-bold text-[#256441]">
                      {session.user.name?.charAt(0).toUpperCase() || "U"}
                    </div>
                  )}
                </div>
                <span className="max-w-[120px] truncate text-sm font-semibold text-[#256441]">{firstName}</span>
                <svg viewBox="0 0 20 20" className={`size-4 text-[#68726b] transition-transform ${profileOpen ? "rotate-180" : ""}`} fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><path d="m5 7.5 5 5 5-5" strokeLinecap="round" strokeLinejoin="round" /></svg>
              </button>
              <div role="menu" className={`absolute right-0 top-[calc(100%+10px)] w-72 origin-top-right overflow-hidden rounded-2xl border border-[#d7e6da] bg-white shadow-[0_18px_45px_rgba(27,49,35,0.16)] transition-all duration-150 ${profileOpen ? "visible translate-y-0 scale-100 opacity-100" : "invisible -translate-y-2 scale-95 opacity-0"}`}>
                <div className="border-b border-[#e7eee9] bg-[#f7fcf8] px-4 py-3"><p className="truncate text-sm font-extrabold text-[#253129]">{session.user.name}</p><p className="mt-0.5 truncate text-xs text-[#68726b]">{session.user.email}</p></div>
                <nav className="p-2" aria-label="Áreas do perfil">{profileLinks.map((item) => <Link key={item.href} href={item.href} role="menuitem" onClick={() => setProfileOpen(false)} className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold text-[#404942] transition hover:bg-[#eefdf1] hover:text-[#256441]"><HeaderMenuIcon name={item.icon} />{item.label}</Link>)}</nav>
                <div className="border-t border-[#e7eee9] p-2"><button type="button" role="menuitem" onClick={() => { setProfileOpen(false); handleSignOut(); }} className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-bold text-red-700 transition hover:bg-red-50"><HeaderMenuIcon name="logout" />Sair da conta</button></div>
              </div>
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
            {links.map((link) => <Link key={link.label} href={link.href} onClick={() => setOpen(false)} className={`rounded-lg px-4 py-3 text-sm font-semibold tracking-[0.05em] transition ${pathname === link.href || (link.href !== "/" && pathname.startsWith(`${link.href}/`)) || (link.label === "Explorar" && pathname.startsWith("/itens")) ? "bg-[#e8f7eb] text-[#256441]" : "text-[#404942] hover:bg-[#eefdf1]"}`}>{link.label}</Link>)}
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
                Meu perfil ({firstName})
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

function HeaderMenuIcon({ name }: { name: string }) {
  const common = { viewBox: "0 0 24 24", className: "size-[18px] shrink-0", fill: "none", stroke: "currentColor", strokeWidth: 2, strokeLinecap: "round" as const, strokeLinejoin: "round" as const, "aria-hidden": true };
  if (name === "heart") return <svg {...common}><path d="M20.8 4.7a5.2 5.2 0 0 0-7.4 0L12 6.1l-1.4-1.4a5.2 5.2 0 0 0-7.4 7.4L12 21l8.8-8.9a5.2 5.2 0 0 0 0-7.4Z" /></svg>;
  if (name === "bell") return <svg {...common}><path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9M10 21h4" /></svg>;
  if (name === "bookmark") return <svg {...common}><path d="M6 3h12v18l-6-4-6 4V3Z" /></svg>;
  if (name === "user") return <svg {...common}><circle cx="12" cy="8" r="4" /><path d="M4 21a8 8 0 0 1 16 0" /></svg>;
  if (name === "pin") return <svg {...common}><path d="M20 10c0 5-8 11-8 11S4 15 4 10a8 8 0 1 1 16 0Z" /><circle cx="12" cy="10" r="2.5" /></svg>;
  if (name === "lock") return <svg {...common}><rect x="4" y="10" width="16" height="11" rx="2" /><path d="M8 10V7a4 4 0 0 1 8 0v3" /></svg>;
  return <svg {...common}><path d="M10 17l5-5-5-5M15 12H3M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" /></svg>;
}
