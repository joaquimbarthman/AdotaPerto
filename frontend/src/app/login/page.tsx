import Link from "next/link";
import { AuthField } from "@/components/auth-field";
import { AuthBrand, AuthShell } from "@/components/auth-shell";

export default function LoginPage() {
  return (
    <AuthShell image="/images/login-cover-v2.png" imageAlt="Mulher acolhendo um cachorro caramelo em casa">
      <header className="mb-8"><AuthBrand /><h1 className="mt-7 text-[32px] font-extrabold leading-10 tracking-[-0.02em]">Bem-vindo de volta</h1><p className="mt-2 leading-6 text-[#4d5b53]">Entre para acompanhar seus favoritos e processos de adoção.</p></header>
      <form className="space-y-5">
        <AuthField label="Email" icon="/icons/email.svg" name="email" type="email" placeholder="seu@email.com" autoComplete="email" required />
        <AuthField label="Senha" icon="/icons/password.svg" name="password" type="password" placeholder="••••••••" autoComplete="current-password" required />
        <div className="flex flex-wrap items-center justify-between gap-3 text-sm"><label className="flex cursor-pointer items-center gap-2 text-[#404942]"><input type="checkbox" className="size-4 accent-[#0f5d39]" />Lembrar de mim</label><Link href="#" className="font-semibold text-[#0f5d39] transition hover:underline">Esqueci minha senha</Link></div>
        <button type="submit" className="w-full rounded-xl bg-[#0f5d39] px-6 py-3.5 text-sm font-semibold text-white shadow-sm transition-all hover:-translate-y-0.5 hover:bg-[#0b482c] hover:shadow-md active:scale-[0.99]">Entrar</button>
      </form>
      <p className="mt-7 border-t border-[#e1e8e2] pt-6 text-center text-sm text-[#4d5b53]">Ainda não tem uma conta? <Link href="/cadastro" className="font-semibold text-[#0f5d39] hover:underline">Criar conta</Link></p>
    </AuthShell>
  );
}
