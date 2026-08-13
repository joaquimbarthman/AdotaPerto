import Link from "next/link";
import { AuthField } from "@/components/auth-field";
import { AuthBrand, AuthShell } from "@/components/auth-shell";

export default function RegisterPage() {
  return (
    <AuthShell image="/images/register-cover.png" imageAlt="Cachorro descansando junto de uma pessoa" register>
      <div className="mb-4"><AuthBrand /></div>
      <header className="mb-6"><h1 className="text-[30px] font-bold leading-9 tracking-[-0.01em]">Crie sua conta</h1><p className="mt-1 text-sm leading-5 text-[#404942] sm:text-base sm:leading-6">Junte-se à nossa comunidade e ajude a transformar vidas.</p></header>
      <form className="space-y-2.5">
        <AuthField label="Nome Completo" icon="/icons/user.svg" name="name" placeholder="Seu nome completo" autoComplete="name" required />
        <AuthField label="E-mail" icon="/icons/email.svg" name="email" type="email" placeholder="exemplo@email.com" autoComplete="email" required />
        <div className="grid grid-cols-[minmax(0,2fr)_minmax(88px,1fr)] gap-3">
          <AuthField label="Cidade" icon="/icons/city.svg" name="city" placeholder="Sua cidade" autoComplete="address-level2" required />
          <label className="block text-sm font-semibold tracking-[0.01em]">Estado<select name="state" required defaultValue="" className="mt-2 h-[50px] w-full rounded-lg border border-[#bfc9bf] bg-white px-3 text-base font-normal outline-none transition focus:border-[#0f5d39] focus:ring-2 focus:ring-[#0f5d39]/10"><option value="" disabled>UF</option>{["AC","AL","AP","AM","BA","CE","DF","ES","GO","MA","MT","MS","MG","PA","PB","PR","PE","PI","RJ","RN","RS","RO","RR","SC","SP","SE","TO"].map((uf) => <option key={uf}>{uf}</option>)}</select></label>
        </div>
        <AuthField label="Senha" icon="/icons/password.svg" name="password" type="password" placeholder="Mínimo 8 caracteres" autoComplete="new-password" minLength={8} required />
        <AuthField label="Confirmar Senha" icon="/icons/password.svg" name="confirmPassword" type="password" placeholder="Digite a senha novamente" autoComplete="new-password" minLength={8} required />
        <label className="flex cursor-pointer items-start gap-3 py-2 text-sm leading-5 text-[#404942]"><input type="checkbox" required className="mt-0.5 size-4 shrink-0 accent-[#0f5d39]" /><span>Eu li e aceito os <Link href="#" className="text-[#0f5d39] hover:underline">Termos de Uso</Link> e a <Link href="#" className="text-[#0f5d39] hover:underline">Política de Privacidade</Link>.</span></label>
        <button type="submit" className="w-full rounded-xl bg-[#0f5d39] px-6 py-3 text-sm font-semibold text-white shadow-sm transition-all hover:-translate-y-0.5 hover:bg-[#0b482c] hover:shadow-md active:scale-[0.99]">Criar minha conta</button>
      </form>
      <p className="mt-6 text-center text-sm text-[#404942]">Já tem uma conta? <Link href="/login" className="font-semibold text-[#0f5d39] hover:underline">Fazer Login</Link></p>
    </AuthShell>
  );
}
