import Image from "next/image";
import Link from "next/link";
import { AnimalCard } from "@/components/animal-card";
import { DirectionalChevron } from "@/components/directional-chevron";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import type { Animal } from "@/data/animals";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

const shortcuts = [
  { label: "Adoção", href: "/adocao", icon: "/icons/adocao.svg", background: "bg-[#e8f7eb]" },
  { label: "Doação", href: "/doacoes", icon: "/icons/doacoes.svg", background: "bg-[#ffdcbf]" },
  { label: "Mapa", href: "#", icon: "/icons/mapa.svg", background: "bg-[#94d5aa]" },
];

async function getFeaturedAnimals(): Promise<Animal[]> {
  try {
    const res = await fetch(`${API_BASE_URL}/api/animals`, { cache: "no-store" });
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data) && data.length > 0) {
        return data.slice(0, 4);
      }
    }
  } catch {
    // fallback
  }
  return [];
}

export default async function Home() {
  const animals = await getFeaturedAnimals();

  return (
    <div className="min-h-screen bg-[#eefdf1] text-[#121e17]">
      <SiteHeader />
      <main>
        <section className="mx-auto grid min-h-[610px] max-w-[1200px] items-center gap-10 px-5 py-14 sm:px-10 lg:grid-cols-[1.05fr_.95fr] lg:px-20 lg:py-20">
          <div className="text-center lg:text-left">
            <span className="inline-flex items-center gap-2 rounded-lg bg-[#e3f2e6] px-4 py-2 text-xs font-bold uppercase tracking-[0.12em] text-[#256441]"><Image src="/icons/adocao.svg" alt="" width={17} height={17} />Adoção responsável perto de você</span>
            <h1 className="mt-6 text-4xl font-extrabold leading-[1.1] tracking-[-0.035em] sm:text-5xl lg:text-[54px] lg:leading-[1.08]">Um novo lar pode começar com um encontro.</h1>
            <p className="mx-auto mt-5 max-w-xl text-base leading-7 text-[#404942] sm:text-lg lg:mx-0">Conheça animais que esperam por uma família ou ajude um pet a encontrar cuidado, segurança e carinho.</p>
            <div className="mt-8 flex flex-col justify-center gap-3 min-[430px]:flex-row lg:justify-start">
              <Link href="/adocao" className="rounded-xl bg-[#256441] px-7 py-3.5 text-sm font-semibold tracking-[0.04em] text-white shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:bg-[#194b30] hover:shadow-md active:scale-[0.98]">Encontrar um animal</Link>
              <Link href="/doacoes" className="rounded-xl border border-[#e99b50] bg-[#fff2e5] px-7 py-3.5 text-sm font-semibold tracking-[0.04em] text-[#764200] transition-all duration-200 hover:-translate-y-0.5 hover:bg-[#ffdcbf] active:scale-[0.98]">Quero ajudar</Link>
            </div>
            <div className="mt-8 flex flex-wrap justify-center gap-x-6 gap-y-2 text-xs font-semibold text-[#526057] lg:justify-start"><span>✓ Adoção consciente</span><span>✓ Dados protegidos</span><span>✓ Processo seguro</span></div>
          </div>
          <div className="relative mx-auto w-full max-w-[480px]">
            <div className="relative aspect-[4/5] overflow-hidden rounded-[28px] bg-[#d7e6da] shadow-[0_24px_60px_rgba(37,100,65,0.16)] sm:aspect-[5/4] lg:aspect-[4/5]">
              <Image src="/images/login-cover-v2.png" alt="Pessoa acolhendo um cachorro caramelo" fill priority className="object-cover" sizes="(max-width:1024px) 90vw,440px" />
              <div className="absolute inset-0 bg-gradient-to-t from-[#163522]/35 via-transparent to-transparent" />
            </div>
            <div className="absolute -bottom-5 left-4 flex items-center gap-3 rounded-2xl bg-white/95 px-4 py-3 shadow-xl backdrop-blur sm:left-[-22px]"><span className="grid size-10 place-items-center rounded-full bg-[#e8f7eb]"><Image src="/icons/heart.svg" alt="" width={20} height={19} /></span><span className="text-left"><strong className="block text-sm">Encontre seu companheiro</strong><small className="text-[#5b675f]">Animais próximos de você</small></span></div>
          </div>
        </section>
        <section className="mx-auto grid max-w-[900px] grid-cols-1 gap-4 px-5 min-[420px]:grid-cols-2 sm:gap-6 lg:grid-cols-3 lg:px-0" aria-label="Acessos rápidos">
          {shortcuts.map((item) => <Link key={item.label} href={item.href} className="group flex min-h-48 flex-col items-center justify-center gap-3 rounded-xl bg-white p-8 shadow-[0_4px_6px_rgba(38,51,43,0.05)] transition-all duration-300 hover:-translate-y-1.5 hover:shadow-lg lg:p-12"><span className={`grid size-16 place-items-center rounded-full transition-transform duration-300 group-hover:scale-110 ${item.background}`}><Image src={item.icon} alt="" width={27} height={27} /></span><span className="text-sm font-semibold tracking-[0.05em]">{item.label}</span></Link>)}
        </section>
        <section className="mx-auto max-w-[1200px] px-5 py-20 sm:px-10 lg:px-20">
          <div className="mb-12 flex items-end justify-between gap-4"><h2 className="text-xl font-bold tracking-[-0.01em] min-[420px]:text-2xl sm:text-[32px] sm:leading-10">Animais próximos de você</h2><Link href="/adocao" className="group inline-flex shrink-0 items-center gap-1 text-sm font-semibold tracking-[0.05em] text-[#256441]">Ver todos <DirectionalChevron direction="right" className="transition-transform group-hover:-translate-x-1" /></Link></div>
          {animals.length > 0 ? (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">{animals.map((animal) => <AnimalCard key={animal.id} animal={animal} />)}</div>
          ) : (
            <div className="rounded-xl bg-white p-10 text-center text-[#526057]">Não foi possível carregar os animais agora.</div>
          )}
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
