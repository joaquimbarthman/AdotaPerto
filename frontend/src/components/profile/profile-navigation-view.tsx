"use client";

import Link from "next/link";
import { tabs } from "./config";
import { ProfileNavIcon } from "./profile-ui";
import type { useProfileController } from "@/hooks/use-profile-controller";

type Model = ReturnType<typeof useProfileController>;

export function ProfileNavigation({ model }: { model: Model }) {
  const { session, activeTab, setActiveTab, setToastMessage } = model;
  return (          <nav
            className="profile-mobile-tabs sticky top-0 z-20 flex min-w-0 max-w-full gap-1 overflow-x-auto rounded-lg border-y border-[#d7e6da] bg-[#eefdf1]/95 px-1 py-2 backdrop-blur lg:top-28 lg:flex-col lg:gap-2 lg:overflow-visible lg:rounded-none lg:border-0 lg:bg-transparent lg:p-0"
            aria-label="Áreas do perfil"
          >
            {tabs.map((item, index) => (
              <div
                key={item.id}
                className={`shrink-0 lg:w-full ${index === 3 ? "lg:mt-3 lg:border-t lg:border-[#c0c9bf] lg:pt-4" : ""}`}
              >
                <button
                  id={`tab-${item.id}`}
                  type="button"
                  aria-pressed={activeTab === item.id}
                  onClick={() => {
                    setToastMessage(null);
                    setActiveTab(item.id);
                    window.history.replaceState(null, "", `#${item.id}`);
                  }}
                  className={`flex h-9 w-auto items-center justify-center gap-1.5 whitespace-nowrap rounded-md px-2.5 text-left text-[10px] font-semibold leading-none transition lg:h-auto lg:w-full lg:justify-start lg:gap-3 lg:rounded-lg lg:px-4 lg:py-3 lg:text-sm lg:leading-normal ${activeTab === item.id ? "bg-[#3f7d58] text-white shadow-sm" : "bg-white/60 text-[#404942] hover:bg-white hover:text-[#256441] lg:bg-transparent"}`}
                >
                  <ProfileNavIcon id={item.id} />
                  <span>{item.label}</span>
                </button>
              </div>
            ))}
            {session?.user.role?.split(",").includes("admin") && (
              <div className="shrink-0 lg:mt-3 lg:w-full lg:border-t lg:border-[#c0c9bf] lg:pt-4">
                <Link
                  href="/admin"
                  className="flex h-9 w-auto items-center justify-center gap-1.5 whitespace-nowrap rounded-md bg-white/60 px-2.5 text-left text-[10px] font-semibold leading-none text-[#256441] transition hover:bg-white lg:h-auto lg:w-full lg:justify-start lg:gap-3 lg:rounded-lg lg:bg-transparent lg:px-4 lg:py-3 lg:text-sm lg:leading-normal"
                >
                  <svg
                    viewBox="0 0 24 24"
                    className="size-4 shrink-0 lg:size-5"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                  >
                    <rect x="3" y="3" width="7" height="7" rx="1.5" />
                    <rect x="14" y="3" width="7" height="7" rx="1.5" />
                    <rect x="3" y="14" width="7" height="7" rx="1.5" />
                    <rect x="14" y="14" width="7" height="7" rx="1.5" />
                  </svg>
                  <span>Painel administrativo</span>
                </Link>
              </div>
            )}
          </nav>
  );
}
