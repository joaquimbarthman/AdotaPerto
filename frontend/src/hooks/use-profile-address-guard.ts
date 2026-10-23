"use client";

import { notify } from "@/components/notification";
import {
  fetchProfileAddressStatus,
} from "@/lib/profile-address";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export function useProfileAddressGuard(
  userId: string | undefined,
  sessionPending: boolean,
  requiredAccountType?: "PERSON" | "ORGANIZATION",
) {
  const router = useRouter();
  const [checkingAddress, setCheckingAddress] = useState(true);

  useEffect(() => {
    if (sessionPending || !userId) return;
    const controller = new AbortController();

    fetchProfileAddressStatus(controller.signal)
      .then((status) => {
        if (requiredAccountType && status.accountType !== requiredAccountType) {
          notify(requiredAccountType === "ORGANIZATION" ? "Apenas perfis de ONG podem publicar necessidades." : "Esta publicação exige um perfil pessoal.", "warning");
          router.replace("/doacoes");
          return;
        }
        if (status.complete) {
          setCheckingAddress(false);
          return;
        }
        notify(status.message, "warning");
        router.replace(status.path);
      })
      .catch((error: unknown) => {
        if ((error as Error)?.name === "AbortError") return;
        notify("Não foi possível verificar seu endereço. Tente novamente.", "error");
        router.replace("/perfil");
      });

    return () => controller.abort();
  }, [requiredAccountType, router, sessionPending, userId]);

  return checkingAddress;
}
