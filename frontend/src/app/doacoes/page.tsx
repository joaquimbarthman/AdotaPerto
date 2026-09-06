import Link from "next/link";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Ajudar",
  description: "Publique um animal ou doe itens para ajudar pessoas e pets perto de você.",
};

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
      <main className="mx-auto flex w-full max-w-[1200px] flex-col items-center px-3 py-7 text-center sm:px-10 sm:py-20 lg:px-20">
        <div className="max-w-2xl">
          <h1 className="text-2xl font-extrabold tracking-[-0.02em] text-[#256441] sm:text-4xl lg:text-[40px]">O que você deseja doar?</h1>
          <p className="mt-2 text-sm leading-5 text-[#404942] sm:mt-3 sm:text-lg sm:leading-7">Sua generosidade transforma vidas. Escolha uma categoria para iniciar o processo de forma simples e segura.</p>
        </div>
        <div className="mt-6 grid w-full max-w-[700px] grid-cols-1 gap-3 sm:mt-12 sm:grid-cols-2 sm:gap-6">
          <Link href="/doacoes/animal" className="group relative grid min-h-[118px] min-w-0 grid-cols-[56px_minmax(0,1fr)_auto] items-center gap-3 overflow-hidden rounded-xl border border-[#d7e6da] bg-white p-3 text-left transition-all duration-300 hover:-translate-y-1 hover:border-[#86c99c] hover:shadow-[0_14px_35px_rgba(37,100,65,0.12)] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#256441] sm:flex sm:min-h-[330px] sm:flex-col sm:justify-center sm:rounded-2xl sm:p-8 sm:text-center">
            <span className="pointer-events-none absolute -right-6 -top-8 size-20 rounded-full bg-[#aff1c4]/20 sm:-right-10 sm:-top-10 sm:size-32" />
            <span className="relative z-10 grid size-14 place-items-center rounded-full bg-[#e3f2e6] text-[#256441] transition-transform group-hover:scale-105 sm:size-20"><AnimalIcon /></span>
            <span className="relative z-10 min-w-0 sm:contents">
              <h2 className="text-base font-semibold sm:mt-7 sm:text-2xl">Um animal</h2>
              <p className="mt-1 line-clamp-2 max-w-[245px] text-[11px] leading-4 text-[#404942] sm:mt-2 sm:line-clamp-3 sm:text-base sm:leading-6">Cadastre um pet para encontrar um lar amoroso e responsável.</p>
            </span>
            <span className="relative z-10 inline-flex items-center gap-1 whitespace-nowrap text-[11px] font-bold text-[#256441] transition sm:mt-6 sm:gap-1.5 sm:text-sm sm:opacity-0 sm:group-hover:opacity-100 sm:group-focus-visible:opacity-100">
              Começar
              <svg viewBox="0 0 20 20" className="size-4" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><path d="m7.5 4.5 5 5.5-5 5.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
            </span>
          </Link>
          <Link href="/doacoes/item" className="group relative grid min-h-[118px] min-w-0 grid-cols-[56px_minmax(0,1fr)_auto] items-center gap-3 overflow-hidden rounded-xl border border-[#d7e6da] bg-white p-3 text-left transition-all duration-300 hover:-translate-y-1 hover:border-[#86c99c] hover:shadow-[0_14px_35px_rgba(37,100,65,0.12)] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#256441] sm:flex sm:min-h-[330px] sm:flex-col sm:justify-center sm:rounded-2xl sm:p-8 sm:text-center">
            <span className="pointer-events-none absolute -right-6 -top-8 size-20 rounded-full bg-[#ffdcbf]/20 sm:-right-10 sm:-top-10 sm:size-32" />
            <span className="relative z-10 grid size-14 place-items-center rounded-full bg-[#e3f2e6] text-[#985700] sm:size-20"><BoxIcon /></span>
            <span className="relative z-10 min-w-0 sm:contents">
              <h2 className="text-base font-semibold sm:mt-7 sm:text-2xl">Itens e recursos</h2>
              <p className="mt-1 line-clamp-2 max-w-[245px] text-[11px] leading-4 text-[#404942] sm:mt-2 sm:line-clamp-3 sm:text-base sm:leading-6">Doe ração, caminhas, medicamentos e outros suprimentos essenciais.</p>
            </span>
            <span className="relative z-10 inline-flex items-center gap-1 whitespace-nowrap text-[11px] font-bold text-[#256441] transition sm:mt-6 sm:gap-1.5 sm:text-sm sm:opacity-0 sm:group-hover:opacity-100 sm:group-focus-visible:opacity-100">Começar <span aria-hidden="true">›</span></span>
          </Link>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
