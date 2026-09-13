"use client";

import { notify } from "@/components/notification";
import {
  fetchProfileAddressCompletion,
  PROFILE_ADDRESS_MESSAGE,
  PROFILE_ADDRESS_PATH,
} from "@/lib/profile-address";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export function useProfileAddressGuard(
  userId: string | undefined,
  sessionPending: boolean,
) {
  const router = useRouter();
  const [checkingAddress, setCheckingAddress] = useState(true);

  useEffect(() => {
    if (sessionPending || !userId) return;
    const controller = new AbortController();

    fetchProfileAddressCompletion(controller.signal)
      .then((complete) => {
        if (complete) {
          setCheckingAddress(false);
          return;
        }
        notify(PROFILE_ADDRESS_MESSAGE, "warning");
        router.replace(PROFILE_ADDRESS_PATH);
      })
      .catch((error: unknown) => {
        if ((error as Error)?.name === "AbortError") return;
        notify("Não foi possível verificar seu endereço. Tente novamente.", "error");
        router.replace(PROFILE_ADDRESS_PATH);
      });

    return () => controller.abort();
  }, [router, sessionPending, userId]);

  return checkingAddress;
}
