import Image from "next/image";
import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="border-t border-[#c0c9bf] bg-[#d7e6da] px-5 sm:px-10">
      <div className="mx-auto flex max-w-[1200px] flex-col items-center justify-between gap-8 py-12 lg:flex-row lg:px-20 lg:py-20">
        <strong className="flex items-center gap-2 text-2xl font-bold text-[#256441]"><Image src="/icons/adocao.svg" alt="" width={24} height={24} />AdotaPerto</strong>
        <nav className="flex flex-wrap justify-center gap-x-6 gap-y-3 text-xs font-medium text-[#404942]/80" aria-label="Links institucionais">
          {["Sobre Nós", "Privacidade", "Termos de Uso", "Contato", "Trabalhe Conosco"].map((label) => <Link key={label} href="#" className="transition hover:text-[#256441]">{label}</Link>)}
        </nav>
        <p className="text-center text-sm text-[#4d5b53]/80 lg:text-right">© 2024 AdotaPerto. Todos os direitos reservados.</p>
      </div>
    </footer>
  );
}
