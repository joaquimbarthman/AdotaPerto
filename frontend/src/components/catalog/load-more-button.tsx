"use client";

import { DirectionalChevron } from "@/components/directional-chevron";

export function LoadMoreButton({ onClick }: { onClick: () => void }) {
  return (
    <div className="flex justify-center pt-8 sm:pt-14">
      <button
        type="button"
        onClick={onClick}
        className="group flex min-h-9 min-w-40 items-center justify-center gap-1.5 rounded-lg border-2 border-[#256441] px-5 py-2 text-xs font-semibold tracking-[0.04em] text-[#256441] transition hover:bg-[#256441] hover:text-white sm:min-w-56 sm:gap-2 sm:rounded-xl sm:px-8 sm:py-3.5 sm:text-sm"
      >
        Carregar mais <DirectionalChevron direction="down" />
      </button>
    </div>
  );
}
