"use client";

import Image from "next/image";
import type { useProfileController } from "@/hooks/use-profile-controller";

type Model = ReturnType<typeof useProfileController>;

export function ProfileSummary({ model }: { model: Model }) {
  const { userImage, userName, userLocation, memberSince, userBio } = model;
  return (        <section className="relative overflow-hidden rounded-xl bg-white p-4 shadow-[0_4px_12px_rgba(38,51,43,0.05)] sm:rounded-2xl sm:p-6">
          <div className="absolute -bottom-20 -right-20 size-64 rounded-full bg-[#aff1c4]/20 blur-3xl" />
          <div className="relative flex items-start gap-3.5 sm:gap-5">
            <div className="relative size-18 shrink-0 overflow-hidden rounded-full border-3 border-[#d7e6da] bg-[#e3f2e6] p-0.5 sm:size-32 sm:border-4 sm:p-1">
              {userImage ? (
                <Image
                  src={userImage}
                  alt={userName}
                  fill
                  className="rounded-full object-cover"
                  priority
                />
              ) : (
                <div className="grid size-full place-items-center text-4xl font-bold text-[#256441]">
                  {userName.charAt(0).toUpperCase()}
                </div>
              )}
            </div>
            <div className="min-w-0 flex-1 text-left">
              <h1 className="truncate text-xl font-bold leading-7 tracking-[-0.01em] sm:text-[32px] sm:leading-10">
                {userName}
              </h1>
              <div className="mt-0.5 flex min-w-0 flex-nowrap items-center gap-2 overflow-hidden text-[10px] text-[#404942] sm:mt-1 sm:gap-x-4 sm:text-base">
                {userLocation && (
                  <span className="flex min-w-0 items-center gap-1 whitespace-nowrap">
                    <Image
                      src="/icons/location.svg"
                      alt=""
                      width={12}
                      height={15}
                      className="shrink-0 sm:h-4.25 sm:w-3.5"
                    />
                    <span className="truncate">{userLocation}</span>
                  </span>
                )}
                {userLocation && (
                  <span className="size-1 shrink-0 rounded-full bg-[#707971]" />
                )}
                <span className="flex shrink-0 items-center gap-1 whitespace-nowrap">
                  <Image
                    src="/icons/member-since.svg"
                    alt=""
                    width={14}
                    height={16}
                    className="shrink-0 sm:h-5 sm:w-4.5"
                  />
                  {memberSince}
                </span>
              </div>
              <p className="mt-1.5 line-clamp-2 max-w-2xl text-xs leading-4 text-[#404942] sm:mt-3 sm:block sm:text-base sm:leading-6">
                {userBio ||
                  "Nenhuma biografia adicionada ainda. Clique na aba 'Dados pessoais' para editar."}
              </p>
            </div>
          </div>
        </section>
  );
}
