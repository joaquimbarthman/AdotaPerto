"use client";

import Image from "next/image";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { AuthBrand, AuthShell } from "@/components/auth-shell";
import { authClient } from "@/lib/auth-client";

type Result = "loading" | "success" | "invalid" | "signed-out" | "pending" | "unavailable";

const messages: Record<Result, { title: string; description: string }> = {
  loading: { title: "Verificando seu e-mail", description: "Aguarde um instante enquanto consultamos os dados da sua conta." },
  success: { title: "E-mail atualizado!", description: "Seu novo endereço foi confirmado. Use esse e-mail para entrar na sua conta a partir de agora." },
  invalid: { title: "Não foi possível confirmar", description: "Este link é inválido ou expirou. Acesse seu perfil e solicite novamente a troca de e-mail." },
  "signed-out": { title: "Entre para conferir", description: "Sua sessão não está ativa neste navegador. Entre na sua conta para conferir o e-mail cadastrado." },
  pending: { title: "Confirme seu novo e-mail", description: "Abra a mensagem enviada ao novo endereço e clique em “Confirmar novo e-mail” para concluir a alteração." },
  unavailable: { title: "Não conseguimos verificar", description: "Houve uma falha ao consultar sua conta. Tente novamente em alguns instantes." },
};

function VerificationResult() {
  const params = useSearchParams();
  const email = params.get("email")?.trim().toLowerCase();
  const error = params.get("error");
  const [result, setResult] = useState<Result>("loading");
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    let cancelled = false;
    async function check() {
      let next: Result;
      if (error) next = "invalid";
      else if (!email) next = "pending";
      else {
        try {
          const session = await authClient.getSession({ query: { disableCookieCache: true } });
          if (session.error) next = "unavailable";
          else if (!session.data) next = "signed-out";
          else next = session.data.user.email.toLowerCase() === email && session.data.user.emailVerified ? "success" : "pending";
        } catch {
          next = "unavailable";
        }
      }
      if (!cancelled) setResult(next);
    }
    void check();
    return () => { cancelled = true; };
  }, [email, error, attempt]);

  const content = messages[result];
  const failed = result === "invalid" || result === "unavailable";

  return (
    <section className="mt-9 text-center" aria-live="polite" aria-busy={result === "loading"}>
      <div className={`mx-auto grid size-16 place-items-center rounded-2xl ${failed ? "bg-[#fff1e6]" : "bg-[#e3f2e6]"}`}>
        {result === "loading" ? <span className="size-7 animate-spin rounded-full border-[3px] border-[#c8d2ca] border-t-[#0f5d39] motion-reduce:animate-none" aria-hidden="true" /> : <Image src={result === "success" ? "/icons/check.svg" : "/icons/email.svg"} alt="" width={28} height={28} />}
      </div>
      <p className="mt-6 text-xs font-bold uppercase tracking-[0.12em] text-[#0f5d39]">Acesso à conta</p>
      <h1 className="mt-2 text-[30px] font-extrabold leading-tight tracking-[-0.02em]">{content.title}</h1>
      <p className="mt-3 leading-6 text-[#4d5b53]">{content.description}</p>

      {result === "success" && email && <div className="mt-6 rounded-xl border border-[#d7e6da] bg-[#f7fcf8] px-4 py-4"><p className="text-xs font-semibold text-[#4d5b53]">Seu e-mail de acesso</p><p className="mt-1 break-all font-bold text-[#243129]">{email}</p></div>}
      {result === "pending" && <p className="mt-5 rounded-xl border border-[#d7e6da] bg-[#f7fcf8] p-4 text-sm leading-6 text-[#4d5b53]">Não encontrou a mensagem? Confira também as pastas de spam e lixo eletrônico.</p>}

      {result !== "loading" && <div className="mt-7 space-y-3">
        {result === "unavailable" ? <button type="button" onClick={() => { setResult("loading"); setAttempt((value) => value + 1); }} className="w-full rounded-xl bg-[#0f5d39] px-6 py-3.5 text-sm font-semibold text-white transition hover:bg-[#0b482c]">Tentar novamente</button> : <Link href={result === "signed-out" ? "/login" : "/perfil"} className="block w-full rounded-xl bg-[#0f5d39] px-6 py-3.5 text-sm font-semibold text-white transition hover:bg-[#0b482c]">{result === "signed-out" ? "Ir para o login" : "Voltar para o perfil"}</Link>}
        <Link href="/" className="inline-block px-4 py-2 text-sm font-semibold text-[#0f5d39] hover:underline">Voltar ao início</Link>
      </div>}
      <p className="mt-7 border-t border-[#e1e8e2] pt-5 text-xs leading-5 text-[#4d5b53]">Sua conta continua com seus favoritos, anúncios e histórias de adoção.</p>
    </section>
  );
}

export default function VerifyEmailPage() {
  return <AuthShell image="/images/login-cover-v2.png" imageAlt="Mulher acolhendo um cachorro caramelo em casa">
    <AuthBrand />
    <Suspense fallback={<p role="status" className="mt-9 text-center text-[#4d5b53]">Verificando seu e-mail...</p>}><VerificationResult /></Suspense>
  </AuthShell>;
}
