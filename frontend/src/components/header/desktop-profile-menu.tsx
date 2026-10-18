"use client";

import type { useSession } from "@/lib/auth-client";
import Image from "next/image";
import Link from "next/link";
import type { Dispatch, RefObject, SetStateAction } from "react";
import { HeaderMenuIcon } from "./header-icons";
import { profileLinks } from "./header-links";

type Session = NonNullable<ReturnType<typeof useSession>["data"]>;
type Props = {
  session: Session;
  profileMenuRef: RefObject<HTMLDivElement | null>;
  profileOpen: boolean;
  setProfileOpen: Dispatch<SetStateAction<boolean>>;
  firstName: string;
  isAdmin: boolean;
  pathname: string;
  handleSignOut: () => void;
};

export function DesktopProfileMenu({
  session,
  profileMenuRef,
  profileOpen,
  setProfileOpen,
  firstName,
  isAdmin,
  pathname,
  handleSignOut,
}: Props) {
  return (
    <div ref={profileMenuRef} className="relative">
      <button
        type="button"
        onClick={() => setProfileOpen((value) => !value)}
        aria-expanded={profileOpen}
        aria-haspopup="menu"
        className={`flex items-center gap-2 rounded-xl border px-2 py-1.5 transition ${profileOpen ? "border-[#86a590] bg-white shadow-sm" : "border-transparent hover:bg-[#e1f2e5]"}`}
        title={session.user.name}
      >
        <div className="relative size-8 overflow-hidden rounded-full border border-[#86a590] bg-[#e3f2e6]">
          {session.user.image ? (
            <Image
              src={session.user.image}
              alt={session.user.name}
              fill
              className="object-cover"
            />
          ) : (
            <div className="grid size-full place-items-center text-xs font-bold text-[#256441]">
              {session.user.name?.charAt(0).toUpperCase() || "U"}
            </div>
          )}
        </div>
        <span className="max-w-30 truncate text-sm font-semibold text-[#256441]">
          {firstName}
        </span>
        <svg
          viewBox="0 0 20 20"
          className={`size-4 text-[#68726b] transition-transform ${profileOpen ? "rotate-180" : ""}`}
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          aria-hidden="true"
        >
          <path
            d="m5 7.5 5 5 5-5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>
      <div
        role="menu"
        className={`absolute right-0 top-[calc(100%+10px)] w-72 origin-top-right overflow-hidden rounded-2xl border border-[#d7e6da] bg-white shadow-[0_18px_45px_rgba(27,49,35,0.16)] transition-all duration-150 ${profileOpen ? "visible translate-y-0 scale-100 opacity-100" : "invisible -translate-y-2 scale-95 opacity-0"}`}
      >
        <div className="border-b border-[#e7eee9] bg-[#f7fcf8] px-4 py-3">
          <p className="truncate text-sm font-extrabold text-[#253129]">
            {session.user.name}
          </p>
          <p className="mt-0.5 truncate text-xs text-[#68726b]">
            {session.user.email}
          </p>
        </div>
        <nav className="p-2" aria-label="Áreas do perfil">
          {profileLinks.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              role="menuitem"
              onClick={(event) => {
                setProfileOpen(false);
                if (pathname === "/perfil") {
                  event.preventDefault();
                  window.history.replaceState(null, "", item.href);
                  window.dispatchEvent(new Event("profile-tab-change"));
                }
              }}
              className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold text-[#404942] transition hover:bg-[#eefdf1] hover:text-[#256441]"
            >
              <HeaderMenuIcon name={item.icon} />
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="mx-2 mb-2 border-t border-[#e7eee9] pt-2">
          <Link
            href="/organizacao"
            role="menuitem"
            onClick={() => setProfileOpen(false)}
            className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold text-[#404942] transition hover:bg-[#eefdf1] hover:text-[#256441]"
          >
            <HeaderMenuIcon name="users" />
            Organização
          </Link>
        </div>
        {isAdmin && (
          <div className="mx-2 mb-2 border-t border-[#e7eee9] pt-2">
            <Link
              href="/admin"
              role="menuitem"
              onClick={() => setProfileOpen(false)}
              className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition hover:bg-[#eefdf1] hover:text-[#256441] ${pathname === "/admin" ? "bg-[#eefdf1] text-[#256441]" : "text-[#404942]"}`}
            >
              <HeaderMenuIcon name="admin" />
              Painel administrativo
            </Link>
          </div>
        )}
        <div className="border-t border-[#e7eee9] p-2">
          <button
            type="button"
            role="menuitem"
            onClick={() => {
              setProfileOpen(false);
              handleSignOut();
            }}
            className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-bold text-red-700 transition hover:bg-red-50"
          >
            <HeaderMenuIcon name="logout" />
            Sair da conta
          </button>
        </div>
      </div>
    </div>
  );
}
