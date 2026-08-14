import Link from "next/link";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";

function AnimalIcon() {
  return (
    <svg viewBox="0 0 32 32" className="size-9" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      <path d="M10 14c-2-4-1-8 1-9 2 2 3 5 3 8m8 1c2-4 1-8-1-9-2 2-3 5-3 8" />
      <path d="M8 20c0-5 3-9 8-9s8 4 8 9c0 5-3 7-8 7s-8-2-8-7Z" />
      <circle cx="13" cy="19" r="1" fill="currentColor" stroke="none" /><circle cx="19" cy="19" r="1" fill="currentColor" stroke="none" />
      <path d="m14 23 2 1 2-1" />
    </svg>
  );
}

function BoxIcon() {
  return (
    <svg viewBox="0 0 32 32" className="size-9" fill="none" stroke="currentColor" strokeWidth="2.2" aria-hidden="true">
      <path d="M6 10h20v16H6zM5 6h22v5H5zM13 16h6" strokeLinejoin="round" />
    </svg>
  );
}

export default function DonationsPage() {
  return (
    <div className="min-h-screen bg-[#eefdf1] text-[#121e17]">
      <SiteHeader />
      <main className="mx-auto flex max-w-[1200px] flex-col items-center px-5 py-16 text-center sm:px-10 sm:py-20 lg:px-20">
        <div className="max-w-2xl">
          <h1 className="text-3xl font-extrabold tracking-[-0.02em] text-[#256441] sm:text-4xl lg:text-[40px]">O que você deseja doar?</h1>
          <p className="mt-3 text-base leading-7 text-[#404942] sm:text-lg">Sua generosidade transforma vidas. Escolha uma categoria para iniciar o processo de forma simples e segura.</p>
        </div>
        <div className="mt-12 grid w-full max-w-[700px] gap-6 sm:grid-cols-2">
          <Link href="/doacoes/animal" className="group relative flex min-h-[330px] flex-col items-center justify-center overflow-hidden rounded-2xl border border-[#d7e6da] bg-white p-8 transition-all duration-300 hover:-translate-y-1 hover:border-[#86c99c] hover:shadow-[0_14px_35px_rgba(37,100,65,0.12)] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#256441]">
            <span className="absolute -right-10 -top-10 size-32 rounded-full bg-[#aff1c4]/25" />
            <span className="grid size-20 place-items-center rounded-full bg-[#e3f2e6] text-[#256441] transition-transform group-hover:scale-105"><AnimalIcon /></span>
            <h2 className="mt-7 text-2xl font-semibold">Um animal</h2>
            <p className="mt-2 max-w-[245px] leading-6 text-[#404942]">Cadastre um pet para encontrar um lar amoroso e responsável.</p>
            <span className="mt-6 inline-flex items-center gap-1.5 text-sm font-bold text-[#256441] opacity-0 transition group-hover:opacity-100 group-focus-visible:opacity-100">
              Começar
              <svg viewBox="0 0 20 20" className="size-4" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><path d="m7.5 4.5 5 5.5-5 5.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
            </span>
          </Link>
          <div className="relative flex min-h-[330px] flex-col items-center justify-center overflow-hidden rounded-2xl border border-[#d7e6da] bg-white p-8">
            <span className="absolute -right-10 -top-10 size-32 rounded-full bg-[#ffdcbf]/30" />
            <span className="grid size-20 place-items-center rounded-full bg-[#e3f2e6] text-[#985700]"><BoxIcon /></span>
            <h2 className="mt-7 text-2xl font-semibold">Itens e recursos</h2>
            <p className="mt-2 max-w-[245px] leading-6 text-[#404942]">Doe ração, caminhas, medicamentos e outros suprimentos essenciais.</p>
            <span className="mt-6 rounded-full bg-[#f5f2eb] px-3 py-1 text-xs font-bold uppercase tracking-wider text-[#6c6457]">Em breve</span>
          </div>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
