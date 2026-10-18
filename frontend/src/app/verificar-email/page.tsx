"use client";

import { Suspense } from "react";
import { VerificationResult } from "@/components/auth/email-verification-result";
import { AuthBrand, AuthShell } from "@/components/auth-shell";

export default function VerifyEmailPage() {
  return (
    <AuthShell
      image="/images/login-cover-v2.png"
      imageAlt="Mulher acolhendo um cachorro caramelo em casa"
    >
      <AuthBrand />
      <Suspense
        fallback={
          <p role="status" className="mt-9 text-center text-[#4d5b53]">
            Verificando seu e-mail...
          </p>
        }
      >
        <VerificationResult />
      </Suspense>
    </AuthShell>
  );
}
