"use client";

import { notify } from "@/components/notification";
import { ThemeToggle } from "@/components/theme-toggle";
import { authClient } from "@/lib/auth-client";
import type { useProfileController } from "@/hooks/use-profile-controller";

type Model = ReturnType<typeof useProfileController>;

export function ProfileMobileActions({ model }: { model: Model }) {
  const { router } = model;
  return (        <div className="mt-2 flex gap-2 lg:hidden" aria-label="Ações da conta">
          <ThemeToggle profileAction />
          <button
            type="button"
            onClick={async () => {
              const { error } = await authClient.signOut();
              if (error) {
                notify(
                  "Não foi possível sair da conta. Tente novamente.",
                  "error",
                );
                return;
              }
              notify("Você saiu da sua conta com sucesso.", "success");
              router.replace("/");
              router.refresh();
            }}
            className="flex min-h-10 flex-1 items-center justify-center gap-2 rounded-lg border border-red-200 bg-white px-3 py-2 text-xs font-bold text-red-700 transition hover:bg-red-50 active:scale-[0.98]"
          >
            <svg
              viewBox="0 0 24 24"
              className="size-4"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="M10 17l5-5-5-5M15 12H3M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" />
            </svg>
            Sair da conta
          </button>
        </div>
  );
}
