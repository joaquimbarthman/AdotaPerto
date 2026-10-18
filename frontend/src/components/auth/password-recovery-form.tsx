"use client";


import { AuthBrand, AuthShell } from "@/components/auth-shell";


import { RecoveryCodeStep } from "./recovery-code-step";
import { RecoveryPasswordStep } from "./recovery-password-step";
import { RecoverySuccessStep } from "./recovery-success-step";
import type { FormEvent, KeyboardEvent, RefObject } from "react";

type Step = "code" | "password" | "success";
export type Props = {
  step: Step;
  stepNumber: number;
  email: string;
  otp: string[];
  setOtp: (value: string[]) => void;
  loading: boolean;
  message: string | null;
  codeInputs: RefObject<Array<HTMLInputElement | null>>;
  updateCode: (index: number, value: string) => void;
  handleCodeKey: (
    index: number,
    event: KeyboardEvent<HTMLInputElement>,
  ) => void;
  handleCode: (event: FormEvent<HTMLFormElement>) => void;
  handlePassword: (event: FormEvent<HTMLFormElement>) => void;
  sendCode: (address: string) => Promise<boolean>;
  onLogin: () => void;
};

export function PasswordRecoveryForm(props: Props) {
  const { step, stepNumber } = props;
  return (
    <AuthShell
      image="/images/login-cover-v2.png"
      imageAlt="Mulher acolhendo um cachorro caramelo em casa"
    >
      <AuthBrand />

      {step !== "success" && (
        <div
          className="mt-7 flex items-center gap-2"
          aria-label={`Etapa ${stepNumber} de 2`}
        >
          {[1, 2].map((item) => (
            <span
              key={item}
              className={`h-1.5 flex-1 rounded-full ${item <= stepNumber ? "bg-[#0f5d39]" : "bg-[#dce6de]"}`}
            />
          ))}
        </div>
      )}

      {step === "code" && <RecoveryCodeStep {...props} />}

      {step === "password" && <RecoveryPasswordStep {...props} />}

      {step === "success" && <RecoverySuccessStep {...props} />}
    </AuthShell>
  );
}
