"use client";

import { PasswordRecoveryForm } from "@/components/auth/password-recovery-form";
import { authClient } from "@/lib/auth-client";
import { authErrorMessage } from "@/lib/auth-error-message";
import { useRouter } from "next/navigation";
import { FormEvent, KeyboardEvent, useEffect, useRef, useState } from "react";

type Step = "code" | "password" | "success";

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [step, setStep] = useState<Step>("code");
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState(["", "", "", ""]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const codeInputs = useRef<Array<HTMLInputElement | null>>([]);
  const recoveryStarted = useRef(false);

  useEffect(() => {
    if (recoveryStarted.current) return;
    recoveryStarted.current = true;
    async function startRecovery() {
      const session = await authClient.getSession();
      const storedEmail = sessionStorage.getItem("password-recovery-email");
      sessionStorage.removeItem("password-recovery-email");
      const accountEmail = session.data?.user.email || storedEmail;
      if (!accountEmail) {
        router.replace("/login?reason=recovery-email-required");
        return;
      }
      const address = accountEmail.trim().toLowerCase();
      setEmail(address);
      await sendCode(address);
    }
    void startRecovery();
  }, [router]);

  async function sendCode(address: string) {
    setLoading(true);
    setMessage(null);
    const { error } = await authClient.emailOtp.requestPasswordReset({
      email: address,
    });
    setLoading(false);
    if (error) {
      setMessage(
        authErrorMessage(
          error,
          "N\u00e3o foi poss\u00edvel enviar o c\u00f3digo. Tente novamente.",
        ),
      );
      return false;
    }
    return true;
  }

  function updateCode(index: number, value: string) {
    const digit = value.replace(/\D/g, "").slice(-1);
    setOtp((current) =>
      current.map((item, position) => (position === index ? digit : item)),
    );
    setMessage(null);
    if (digit && index < 3) codeInputs.current[index + 1]?.focus();
  }

  function handleCodeKey(
    index: number,
    event: KeyboardEvent<HTMLInputElement>,
  ) {
    if (event.key === "Backspace" && !otp[index] && index > 0)
      codeInputs.current[index - 1]?.focus();
  }

  async function handleCode(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (otp.some((digit) => !digit)) {
      setMessage("Digite os 4 d\u00edgitos enviados para o seu e-mail.");
      return;
    }

    setMessage(null);
    setLoading(true);
    const { error } = await authClient.emailOtp.checkVerificationOtp({
      email,
      otp: otp.join(""),
      type: "forget-password",
    });
    setLoading(false);
    if (error) {
      setMessage(
        "O c\u00f3digo \u00e9 inv\u00e1lido ou expirou. Solicite um novo c\u00f3digo.",
      );
      return;
    }

    setStep("password");
  }

  async function handlePassword(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage(null);
    const data = new FormData(event.currentTarget);
    const password = String(data.get("password") || "");
    const confirmation = String(data.get("confirmation") || "");
    if (password !== confirmation) {
      setMessage("As senhas n\u00e3o coincidem.");
      return;
    }

    setLoading(true);
    const { error } = await authClient.emailOtp.resetPassword({
      email,
      otp: otp.join(""),
      password,
    });
    setLoading(false);
    if (error) {
      setMessage(
        authErrorMessage(
          error,
          "O c\u00f3digo \u00e9 inv\u00e1lido ou expirou. Solicite um novo c\u00f3digo.",
        ),
      );
      return;
    }
    setStep("success");
  }

  const stepNumber = step === "code" ? 1 : 2;

  return (
    <PasswordRecoveryForm
      step={step}
      stepNumber={stepNumber}
      email={email}
      otp={otp}
      setOtp={setOtp}
      loading={loading}
      message={message}
      codeInputs={codeInputs}
      updateCode={updateCode}
      handleCodeKey={handleCodeKey}
      handleCode={handleCode}
      handlePassword={handlePassword}
      sendCode={sendCode}
      onLogin={() => router.push("/login")}
    />
  );
}
