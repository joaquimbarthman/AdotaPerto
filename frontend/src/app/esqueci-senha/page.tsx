"use client";

import { Notification } from "@/components/notification";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, KeyboardEvent, useEffect, useRef, useState } from "react";
import { AuthField } from "@/components/auth-field";
import { AuthBrand, AuthShell } from "@/components/auth-shell";
import { authClient } from "@/lib/auth-client";

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
    const { error } = await authClient.emailOtp.requestPasswordReset({ email: address });
    setLoading(false);
    if (error) {
      setMessage(error.message || "N\u00e3o foi poss\u00edvel enviar o c\u00f3digo. Tente novamente.");
      return false;
    }
    return true;
  }

  function updateCode(index: number, value: string) {
    const digit = value.replace(/\D/g, "").slice(-1);
    setOtp((current) => current.map((item, position) => position === index ? digit : item));
    setMessage(null);
    if (digit && index < 3) codeInputs.current[index + 1]?.focus();
  }

  function handleCodeKey(index: number, event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === "Backspace" && !otp[index] && index > 0) codeInputs.current[index - 1]?.focus();
  }

  function handleCode(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (otp.some((digit) => !digit)) {
      setMessage("Digite os 4 d\u00edgitos enviados para o seu e-mail.");
      return;
    }
    setMessage(null);
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
    const { error } = await authClient.emailOtp.resetPassword({ email, otp: otp.join(""), password });
    setLoading(false);
    if (error) {
      setMessage(error.message || "O c\u00f3digo \u00e9 inv\u00e1lido ou expirou. Solicite um novo c\u00f3digo.");
      return;
    }
    setStep("success");
  }

  const stepNumber = step === "code" ? 1 : 2;

  return (
    <AuthShell image="/images/login-cover-v2.png" imageAlt="Mulher acolhendo um cachorro caramelo em casa">
      <AuthBrand />

      {step !== "success" && (
        <div className="mt-7 flex items-center gap-2" aria-label={`Etapa ${stepNumber} de 2`}>
          {[1, 2].map((item) => <span key={item} className={`h-1.5 flex-1 rounded-full ${item <= stepNumber ? "bg-[#0f5d39]" : "bg-[#dce6de]"}`} />)}
        </div>
      )}

      {step === "code" && (
        <section className="mt-7">
          <PageHeading title={"Digite o c\u00f3digo"} description={email ? <>Enviamos um c&oacute;digo para o e-mail vinculado à sua conta: <strong className="font-semibold text-[#243129]">{email}</strong>. Ele expira em 10 minutos.</> : "Preparando o envio para o e-mail vinculado à sua conta..."} />
          <StatusMessage message={message} />
          <form onSubmit={handleCode}>
            <div className="flex justify-center gap-3" onPaste={(event) => { const digits = event.clipboardData.getData("text").replace(/\D/g, "").slice(0, 4).split(""); if (digits.length) { event.preventDefault(); setOtp([digits[0] || "", digits[1] || "", digits[2] || "", digits[3] || ""]); codeInputs.current[Math.min(digits.length, 4) - 1]?.focus(); } }}>
              {otp.map((digit, index) => (
                <input key={index} ref={(element) => { codeInputs.current[index] = element; }} value={digit} onChange={(event) => updateCode(index, event.target.value)} onKeyDown={(event) => handleCodeKey(index, event)} inputMode="numeric" pattern="[0-9]" maxLength={1} aria-label={`D\u00edgito ${index + 1} do c\u00f3digo`} autoFocus={index === 0} className="size-14 rounded-xl border border-[#c8d2ca] bg-[#fbfdfb] text-center text-2xl font-bold text-[#121e17] outline-none transition focus:border-[#0f5d39] focus:ring-4 focus:ring-[#0f5d39]/10 sm:size-16" />
              ))}
            </div>
            <div className="mt-6"><PrimaryButton loading={false} label="Continuar" loadingLabel="" /></div>
          </form>
          <p className="mt-5 text-center text-sm text-[#4d5b53]">N&atilde;o recebeu? <button type="button" disabled={loading} onClick={() => sendCode(email)} className="font-semibold text-[#0f5d39] hover:underline disabled:opacity-60">Reenviar c&oacute;digo</button></p>
          <BackToLogin />
        </section>
      )}

      {step === "password" && (
        <section className="mt-7">
          <PageHeading title="Crie uma nova senha" description={"Use pelo menos 8 caracteres. Evite senhas usadas em outros servi\u00e7os."} />
          <StatusMessage message={message} />
          <form onSubmit={handlePassword} className="space-y-5">
            <AuthField label="Nova senha" icon="/icons/password.svg" name="password" type="password" placeholder={"M\u00ednimo de 8 caracteres"} autoComplete="new-password" minLength={8} required autoFocus />
            <AuthField label="Confirmar nova senha" icon="/icons/password.svg" name="confirmation" type="password" placeholder="Digite a senha novamente" autoComplete="new-password" minLength={8} required />
            <PrimaryButton loading={loading} label="Redefinir senha" loadingLabel="Redefinindo..." />
          </form>
        </section>
      )}

      {step === "success" && (
        <section className="mt-10 text-center">
          <div className="mx-auto grid size-16 place-items-center rounded-full bg-[#e3f2e6]"><Image src="/icons/check.svg" alt="" width={28} height={28} /></div>
          <h1 className="mt-5 text-[30px] font-extrabold tracking-[-0.02em]">Senha redefinida</h1>
          <p className="mt-2 leading-6 text-[#4d5b53]">Sua nova senha j&aacute; est&aacute; ativa. Agora voc&ecirc; pode entrar novamente na sua conta.</p>
          <button type="button" onClick={() => router.push("/login")} className="mt-7 w-full rounded-xl bg-[#0f5d39] px-6 py-3.5 text-sm font-semibold text-white transition hover:bg-[#0b482c]">Ir para o login</button>
        </section>
      )}
    </AuthShell>
  );
}

function PageHeading({ title, description }: { title: string; description: React.ReactNode }) {
  return <header className="mb-6"><h1 className="text-[30px] font-extrabold leading-10 tracking-[-0.02em]">{title}</h1><p className="mt-2 leading-6 text-[#4d5b53]">{description}</p></header>;
}

function StatusMessage({ message }: { message: string | null }) {
  return message ? <Notification text={message} /> : null;
}

function PrimaryButton({ loading, label, loadingLabel }: { loading: boolean; label: string; loadingLabel: string }) {
  return <button type="submit" disabled={loading} className="w-full rounded-xl bg-[#0f5d39] px-6 py-3.5 text-sm font-semibold text-white shadow-sm transition-all hover:-translate-y-0.5 hover:bg-[#0b482c] hover:shadow-md active:scale-[0.99] disabled:opacity-60">{loading ? loadingLabel : label}</button>;
}

function BackToLogin() {
  return <p className="mt-7 border-t border-[#e1e8e2] pt-6 text-center text-sm text-[#4d5b53]">Lembrou sua senha? <Link href="/login" className="font-semibold text-[#0f5d39] hover:underline">Voltar para o login</Link></p>;
}
