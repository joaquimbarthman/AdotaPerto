"use client";

import { BrandLogo } from "@/components/brand-logo";
import { links } from "@/components/header/header-links";
import { MobileHeaderMenu } from "@/components/header/mobile-header-menu";
import { MobileBottomNav } from "@/components/header/mobile-bottom-nav";
import { DesktopProfileMenu } from "@/components/header/desktop-profile-menu";
import { notify } from "@/components/notification";
import { NotificationCenter } from "@/components/notification-center";
import { ThemeToggle } from "@/components/theme-toggle";
import { signOut, useSession } from "@/lib/auth-client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

export function SiteHeader() {
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const profileMenuRef = useRef<HTMLDivElement>(null);
  const { data: session, isPending } = useSession();
  const isAdmin = session?.user.role?.split(",").includes("admin");
  const firstName = session?.user.name?.trim().split(/\s+/)[0] || "Usuário";

  useEffect(() => {
    function closeMenu(event: MouseEvent) {
      if (!profileMenuRef.current?.contains(event.target as Node))
        setProfileOpen(false);
    }
    function closeOnEscape(event: KeyboardEvent) {
      if (event.key === "Escape") setProfileOpen(false);
    }
    document.addEventListener("mousedown", closeMenu);
    document.addEventListener("keydown", closeOnEscape);
    return () => {
      document.removeEventListener("mousedown", closeMenu);
      document.removeEventListener("keydown", closeOnEscape);
    };
  }, []);

  async function handleSignOut() {
    await signOut({
      fetchOptions: {
        onSuccess: () => {
          notify("Você saiu da sua conta com sucesso.", "success");
          router.replace("/");
          router.refresh();
        },
        onError: () => {
          notify("Não foi possível sair da conta. Tente novamente.", "error");
        },
      },
    });
  }

  return (
    <>
      <header className="sticky top-0 z-30 hidden border-b border-black/[0.03] bg-[#eefdf1]/95 shadow-[0_1px_5px_rgba(38,51,43,0.05)] backdrop-blur lg:block">
        <div className="relative mx-auto flex h-14 max-w-300 items-center justify-end px-4 sm:px-6 lg:h-20 lg:justify-between lg:px-20">
          <Link
            href="/"
            className="hidden transition-opacity hover:opacity-80 lg:block"
            aria-label="AdotaPerto — início"
          >
            <BrandLogo priority className="h-auto w-42 sm:w-51.25" />
          </Link>
          <nav
            className="hidden items-center gap-6 lg:flex"
            aria-label="Navegação principal"
          >
            {links.map((link) => {
              const active =
                pathname === link.href ||
                (link.href !== "/" && pathname.startsWith(`${link.href}/`)) ||
                (link.label === "Explorar" && pathname.startsWith("/itens"));
              return (
                <Link
                  key={link.label}
                  href={link.href}
                  className={`relative pb-2 text-sm font-semibold tracking-wider transition-colors duration-200 after:absolute after:bottom-0 after:left-0 after:h-0.5 after:bg-[#256441] after:transition-all after:duration-300 ${active ? "font-bold text-[#256441] after:w-full" : "text-[#404942] after:w-0 hover:text-[#256441] hover:after:w-full"}`}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>
          <div className="hidden items-center gap-3 lg:flex">
            {session && <NotificationCenter userId={session.user.id} />}
            <ThemeToggle />

            {isPending ? (
              <div
                className="skeleton-shimmer size-9 overflow-hidden rounded-full"
                aria-label="Carregando sessão"
              />
            ) : session ? (
              <DesktopProfileMenu session={session} profileMenuRef={profileMenuRef} profileOpen={profileOpen} setProfileOpen={setProfileOpen} firstName={firstName} isAdmin={Boolean(isAdmin)} pathname={pathname} handleSignOut={handleSignOut} />
            ) : (
              <Link
                href="/login"
                className="rounded-lg px-4 py-2 text-sm font-semibold tracking-wider text-[#256441] transition hover:bg-[#e8f7eb]"
              >
                Entrar
              </Link>
            )}
          </div>
          <MobileHeaderMenu open={open} setOpen={setOpen} session={session} pathname={pathname} firstName={firstName} isAdmin={Boolean(isAdmin)} handleSignOut={handleSignOut} />
        </div>
      </header>
      <MobileBottomNav session={session} pathname={pathname} />
    </>
  );
}
