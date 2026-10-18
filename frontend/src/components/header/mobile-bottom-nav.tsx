"use client";

import { NotificationCenter } from "@/components/notification-center";
import type { useSession } from "@/lib/auth-client";
import Image from "next/image";
import Link from "next/link";
import { MobileLoginIcon, MobileNavIcon } from "./header-icons";
import { links } from "./header-links";

type Session = NonNullable<ReturnType<typeof useSession>["data"]>;

export function MobileBottomNav({
  session,
  pathname,
}: {
  session: Session | null;
  pathname: string;
}) {
  return (
    <nav
      className={`mobile-bottom-nav fixed inset-x-0 bottom-0 z-40 grid h-17 border-t border-[#d7e6da] bg-white px-1 pb-[env(safe-area-inset-bottom)] shadow-[0_-8px_24px_rgba(24,55,35,0.10)] lg:hidden ${session ? "grid-cols-6" : "grid-cols-5"}`}
      aria-label="Navegação principal móvel"
    >
      {links.map((link) => {
        const active =
          pathname === link.href ||
          (link.href !== "/" && pathname.startsWith(`${link.href}/`)) ||
          (link.label === "Explorar" && pathname.startsWith("/itens"));
        return (
          <Link
            key={link.href}
            href={link.href}
            className={`flex min-w-0 flex-col items-center justify-center gap-1 rounded-xl px-1 text-[10px] font-bold transition ${active ? "text-[#256441]" : "text-[#68726b]"}`}
          >
            <span className="grid size-6 shrink-0 place-items-center">
              <MobileNavIcon name={link.label} active={active} />
            </span>
            <span className="truncate">{link.label}</span>
          </Link>
        );
      })}
      {session && (
        <div className="flex min-w-0 flex-col items-center justify-center gap-1 rounded-xl px-1 text-[10px] font-bold text-[#68726b]">
          <NotificationCenter userId={session.user.id} mobileNav />
          <span className="truncate">Alertas</span>
        </div>
      )}
      <Link
        href={session ? "/perfil" : "/login"}
        className={`flex min-w-0 flex-col items-center justify-center gap-1 rounded-xl px-1 text-[10px] font-bold transition ${pathname.startsWith("/perfil") || pathname === "/login" ? "text-[#256441]" : "text-[#68726b]"}`}
      >
        <span className="grid size-6 shrink-0 place-items-center">
          {session ? (
            <span
              className={`relative size-5 overflow-hidden rounded-full border-2 ${pathname.startsWith("/perfil") ? "border-[#256441]" : "border-[#9ab0a0]"}`}
            >
              {session.user.image ? (
                <Image
                  src={session.user.image}
                  alt=""
                  fill
                  className="object-cover"
                />
              ) : (
                <span className="grid size-full place-items-center bg-[#e3f2e6] text-[9px] font-extrabold text-[#256441]">
                  {session.user.name?.charAt(0).toUpperCase() || "U"}
                </span>
              )}
            </span>
          ) : (
            <MobileLoginIcon />
          )}
        </span>
        <span className="truncate">{session ? "Perfil" : "Entrar"}</span>
      </Link>
    </nav>
  );
}
