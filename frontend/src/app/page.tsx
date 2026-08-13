import Image from "next/image";
import Link from "next/link";
import { AnimalCard } from "@/components/animal-card";
import { DirectionalChevron } from "@/components/directional-chevron";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { homeAnimals } from "@/data/animals";

const shortcuts = [
  { label: "Adoção", href: "/adocao", icon: "/icons/adocao.svg", background: "bg-[#e8f7eb]" },
  { label: "Doações", href: "#", icon: "/icons/doacoes.svg", background: "bg-[#ffdcbf]" },
  { label: "Serviços", href: "#", icon: "/icons/servicos.svg", background: "bg-[#d7e6da]" },
  { label: "Mapa", href: "#", icon: "/icons/mapa.svg", background: "bg-[#94d5aa]" },
];

export default function Home() {
  return (
    <div className="min-h-screen bg-[#eefdf1] text-[#121e17]">
      <SiteHeader />
      <main>
        <section className="mx-auto flex min-h-[614px] max-w-[1200px] flex-col items-center justify-center px-5 py-20 text-center sm:px-10 lg:px-20 lg:py-[121px]">
          <h1 className="max-w-3xl text-4xl font-extrabold leading-[1.12] tracking-[-0.02em] sm:text-5xl lg:text-[56px] lg:leading-[64px]">Encontre um novo amigo.<br />Ou ajude um a encontrar um lar.</h1>
          <p className="mt-3 max-w-2xl text-base leading-7 text-[#404942] sm:text-lg">Conectando corações e patas. Adote, doe ou encontre serviços essenciais para pets próximos a você. Uma comunidade unida pelo bem-estar animal.</p>
          <div className="mt-12 flex flex-col gap-4 sm:flex-row sm:gap-6">
            <Link href="/adocao" className="rounded-full bg-[#256441] px-8 py-4 text-sm font-semibold tracking-[0.05em] text-white shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:bg-[#194b30] hover:shadow-md active:scale-[0.98]">Encontrar um animal</Link>
            <Link href="#" className="rounded-full bg-[#feb063] px-8 py-4 text-sm font-semibold tracking-[0.05em] text-[#764200] shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:bg-[#f5a24e] hover:shadow-md active:scale-[0.98]">Quero ajudar</Link>
          </div>
        </section>
        <section className="mx-auto grid max-w-[1040px] grid-cols-1 gap-4 px-5 min-[420px]:grid-cols-2 sm:gap-6 lg:grid-cols-4 lg:px-0" aria-label="Acessos rápidos">
          {shortcuts.map((item) => <Link key={item.label} href={item.href} className="group flex min-h-48 flex-col items-center justify-center gap-3 rounded-xl bg-white p-8 shadow-[0_4px_6px_rgba(38,51,43,0.05)] transition-all duration-300 hover:-translate-y-1.5 hover:shadow-lg lg:p-12"><span className={`grid size-16 place-items-center rounded-full transition-transform duration-300 group-hover:scale-110 ${item.background}`}><Image src={item.icon} alt="" width={27} height={27} /></span><span className="text-sm font-semibold tracking-[0.05em]">{item.label}</span></Link>)}
        </section>
        <section className="mx-auto max-w-[1200px] px-5 py-20 sm:px-10 lg:px-20">
          <div className="mb-12 flex items-end justify-between gap-4"><h2 className="text-xl font-bold tracking-[-0.01em] min-[420px]:text-2xl sm:text-[32px] sm:leading-10">Animais próximos de você</h2><Link href="/adocao" className="group inline-flex shrink-0 items-center gap-1 text-sm font-semibold tracking-[0.05em] text-[#256441]">Ver todos <DirectionalChevron direction="right" className="transition-transform group-hover:-translate-x-1" /></Link></div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">{homeAnimals.map((animal) => <AnimalCard key={animal.id} animal={animal} variant="home" />)}</div>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
