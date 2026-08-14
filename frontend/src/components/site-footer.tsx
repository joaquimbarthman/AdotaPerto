import Image from "next/image";
import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="border-t border-[#c0c9bf] bg-[#d7e6da] text-[#404942]">
      <div className="mx-auto grid max-w-[1200px] gap-10 px-5 py-12 sm:grid-cols-2 sm:px-10 lg:grid-cols-[1.8fr_1fr_1fr] lg:px-20 lg:py-16">
        <div className="max-w-md sm:col-span-2 lg:col-span-1">
          <Link href="/" className="inline-flex items-center gap-2 text-2xl font-extrabold tracking-[-0.02em] text-[#256441] transition-opacity hover:opacity-80"><Image src="/icons/adocao.svg" alt="" width={26} height={26} />AdotaPerto</Link>
          <p className="mt-4 max-w-sm text-sm leading-6 text-[#4d5b53]">Conectando pessoas e animais para promover adoções responsáveis, seguras e cheias de afeto.</p>
        </div>

        <nav aria-label="Navegação da plataforma">
          <h2 className="text-sm font-bold text-[#121e17]">Plataforma</h2>
          <ul className="mt-4 space-y-3 text-sm">
            <li><Link href="/adocao" className="transition hover:text-[#256441]">Encontrar um animal</Link></li>
            <li><Link href="/doacoes" className="transition hover:text-[#256441]">Doar um animal</Link></li>
            <li><Link href="#" className="transition hover:text-[#256441]">Mapa</Link></li>
          </ul>
        </nav>

        <nav aria-label="Links institucionais">
          <h2 className="text-sm font-bold text-[#121e17]">AdotaPerto</h2>
          <ul className="mt-4 space-y-3 text-sm">
            <li><Link href="#" className="transition hover:text-[#256441]">Sobre nós</Link></li>
            <li><Link href="#" className="transition hover:text-[#256441]">Contato</Link></li>
            <li><Link href="#" className="transition hover:text-[#256441]">Política de privacidade</Link></li>
          </ul>
        </nav>
      </div>

      <div className="border-t border-[#c0c9bf]/30">
        <div className="mx-auto flex max-w-[1200px] flex-col gap-3 px-5 py-5 text-xs text-[#4d5b53] sm:px-10 md:flex-row md:items-center md:justify-between lg:px-20">
          <p>© 2026 AdotaPerto. Todos os direitos reservados.</p>
          <div className="flex flex-wrap gap-x-5 gap-y-2"><Link href="#" className="transition hover:text-[#256441]">Termos de uso</Link><Link href="#" className="transition hover:text-[#256441]">Privacidade</Link><Link href="#" className="transition hover:text-[#256441]">Acessibilidade</Link></div>
        </div>
      </div>
    </footer>
  );
}
