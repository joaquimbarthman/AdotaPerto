import Link from "next/link";
import { AuthField } from "@/components/auth-field";
import { AuthBrand, AuthShell } from "@/components/auth-shell";

export default function LoginPage() {
  return (
    <AuthShell image="/images/login-cover.png" imageAlt="Pessoa acariciando um cachorro">
      <header className="mb-10"><AuthBrand withIcon /><h1 className="mt-6 text-[32px] font-bold leading-10 tracking-[-0.01em]">Bem-vindo de volta!</h1><p className="mt-2 text-base text-[#404942]">Entre para continuar ajudando animais a encontrarem um lar.</p></header>
      <form className="space-y-6">
        <AuthField label="Email" icon="/icons/email.svg" name="email" type="email" placeholder="seu@email.com" autoComplete="email" required />
        <AuthField label="Senha" icon="/icons/password.svg" name="password" type="password" placeholder="••••••••" autoComplete="current-password" required />
        <div className="flex flex-wrap items-center justify-between gap-3 text-sm"><label className="flex cursor-pointer items-center gap-2 text-base text-[#404942]"><input type="checkbox" className="size-4 accent-[#0f5d39]" />Lembrar-me</label><Link href="#" className="font-semibold text-[#0f5d39] transition hover:underline">Esqueci minha senha</Link></div>
        <button type="submit" className="w-full rounded-lg bg-[#2f7650] px-6 py-3 text-sm font-semibold text-white shadow-sm transition-all hover:-translate-y-0.5 hover:bg-[#0f5d39] hover:shadow-md active:scale-[0.99]">Entrar</button>
      </form>
      <p className="mt-8 text-center text-base text-[#404942]">Não tem uma conta? <Link href="/cadastro" className="text-sm font-semibold text-[#0f5d39] hover:underline">Cadastre-se</Link></p>
    </AuthShell>
  );
}
