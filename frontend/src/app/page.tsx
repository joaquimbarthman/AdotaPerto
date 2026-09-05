import Image from "next/image";
import Link from "next/link";
import { DirectionalChevron } from "@/components/directional-chevron";
import { HomeMapPreview } from "@/components/home-map-preview";
import { HomeNearbyAnimals } from "@/components/home-nearby-animals";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import type { Animal } from "@/data/animals";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

async function getFeaturedAnimals(): Promise<Animal[]> {
  try {
    const res = await fetch(`${API_BASE_URL}/api/animals`, { cache: "no-store" });
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data) && data.length > 0) {
        return data;
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
        <section className="home-hero relative overflow-hidden border-b border-[#d7e6da] bg-[radial-gradient(circle_at_78%_18%,rgba(148,213,170,.38),transparent_28%),linear-gradient(135deg,#f8fff9_0%,#eefdf1_52%,#e2f5e7_100%)]">
          <div className="pointer-events-none absolute -left-28 bottom-0 size-80 rounded-full bg-[#bfe8ca]/25 blur-3xl" />
          <div className="mx-auto grid min-h-[650px] max-w-[1200px] items-center gap-12 px-5 py-14 sm:px-10 lg:grid-cols-[1.05fr_.95fr] lg:px-20 lg:py-20">
            <div className="relative z-10">
              <span className="home-hero-kicker inline-flex items-center gap-2 rounded-lg border px-3.5 py-2 text-[11px] font-extrabold uppercase tracking-[0.12em] backdrop-blur"><Image src="/icons/adocao.svg" alt="" width={15} height={15} />Adoção, cuidado e ajuda perto de você</span>
              <h1 className="home-hero-title mt-6 max-w-[680px] text-[42px] font-extrabold leading-[1.04] tracking-[-0.05em] text-[#162c20] sm:text-[58px] lg:text-[66px]">Encontre quem precisa de você. <span className="text-[#2b724a]">Bem mais perto.</span></h1>
              <p className="home-hero-copy mt-6 max-w-[610px] text-base leading-7 text-[#4d5b53] sm:text-lg sm:leading-8">O AdotaPerto conecta pessoas, animais e redes de cuidado da sua região. Adote com responsabilidade, publique um pet, doe itens ou encontre apoio no mapa.</p>
              <div className="mt-8 flex flex-col gap-3 min-[440px]:flex-row">
                <Link href="/adocao" className="group inline-flex min-h-14 items-center justify-center gap-2 rounded-xl bg-[#256441] px-7 text-sm font-extrabold text-white shadow-[0_12px_28px_rgba(37,100,65,.22)] transition hover:-translate-y-0.5 hover:bg-[#194b30]">Encontrar um animal <DirectionalChevron direction="right" className="brightness-0 invert transition-transform group-hover:translate-x-1" /></Link>
                <Link href="/mapa" className="home-hero-map-cta group inline-flex min-h-14 items-center justify-center gap-2 rounded-xl border px-7 text-sm font-extrabold backdrop-blur transition hover:-translate-y-0.5"><Image src="/icons/mapa.svg" alt="" width={17} height={20} />Explorar perto de mim</Link>
              </div>
              <div className="mt-7 flex flex-wrap gap-x-6 gap-y-3 text-sm font-semibold text-[#526057]">
                <span className="inline-flex items-center gap-2"><Image src="/icons/heart.svg" alt="" width={17} height={16} />Adoção consciente</span>
                <span className="inline-flex items-center gap-2"><Image src="/icons/health.svg" alt="" width={18} height={18} />Contato direto</span>
                <span className="inline-flex items-center gap-2"><Image src="/icons/location.svg" alt="" width={14} height={18} />Localização aproximada e segura</span>
              </div>
            </div>

            <div className="relative mx-auto w-full max-w-[500px] pb-14 sm:pb-10">
              <div className="absolute -right-7 -top-7 size-40 rounded-[38px] border border-white/70 bg-[#94d5aa]/45" />
              <div className="relative aspect-[5/4] overflow-hidden rounded-[32px] border-[6px] border-white bg-[#d7e6da] shadow-[0_30px_70px_rgba(29,77,48,.2)] lg:aspect-[4/5]">
                <Image src="/images/login-cover-v2.png" alt="Pessoa acolhendo um cachorro" fill priority className="object-cover" sizes="(max-width:1024px) 90vw,500px" />
                <div className="absolute inset-0 bg-gradient-to-t from-[#102d1d]/35 via-transparent to-transparent" />
                <div className="absolute bottom-5 left-5 right-5 grid grid-cols-2 gap-2 rounded-2xl border border-white/30 bg-[#153d27]/85 p-3 text-white shadow-lg backdrop-blur-md">
                  <Link href="/doacoes/animal" className="rounded-xl px-3 py-2.5 transition hover:bg-white/10"><span className="block text-[10px] font-bold uppercase tracking-wider text-[#bce8c9]">Precisa de ajuda?</span><strong className="mt-0.5 block text-sm">Publicar um animal</strong></Link>
                  <Link href="/doacoes/item" className="rounded-xl border-l border-white/15 px-3 py-2.5 transition hover:bg-white/10"><span className="block text-[10px] font-bold uppercase tracking-wider text-[#bce8c9]">Pode contribuir?</span><strong className="mt-0.5 block text-sm">Doar um item</strong></Link>
                </div>
              </div>
              <div className="absolute bottom-0 -left-2 flex items-center gap-3 rounded-2xl border border-[#c6ddcc] bg-white/95 p-4 shadow-[0_16px_38px_rgba(25,60,38,.16)] backdrop-blur sm:-left-8"><span className="grid size-11 place-items-center rounded-xl bg-[#e3f2e6]"><Image src="/icons/mapa.svg" alt="" width={21} height={26} /></span><span><strong className="block text-sm text-[#243129]">Veja o que existe ao seu redor</strong><small className="mt-0.5 block text-[#68726b]">Animais, doações e locais de apoio.</small></span></div>
            </div>
          </div>
        </section>

        <div className="flex flex-col">
        <section className="order-1 mx-auto w-full max-w-[1200px] px-5 py-16 sm:px-10 lg:px-20" aria-labelledby="possibilidades">
          <div className="mb-9 max-w-2xl"><p className="text-xs font-extrabold uppercase tracking-[0.14em] text-[#2b724a]">Comece por aqui</p><h2 id="possibilidades" className="home-section-title mt-2 text-3xl font-extrabold tracking-[-0.035em] text-[#162c20] sm:text-4xl">Um lugar para cada forma de cuidar</h2><p className="mt-3 leading-7 text-[#526057]">Escolha o que faz sentido para você agora. O AdotaPerto organiza todo o caminho em poucos passos.</p></div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { href: "/adocao", icon: "/icons/adocao.svg", title: "Quero adotar", text: "Conheça animais e envie uma solicitação responsável." },
              { href: "/doacoes/animal", icon: "/icons/heart.svg", title: "Publicar um animal", text: "Ajude um pet a encontrar uma nova família." },
              { href: "/doacoes/item", icon: "/icons/map-box.svg", title: "Doar itens", text: "Compartilhe recursos úteis com outros cuidadores." },
              { href: "/mapa", icon: "/icons/mapa.svg", title: "Explorar o mapa", text: "Veja animais, doações e serviços próximos." },
            ].map((item) => <Link key={item.title} href={item.href} className="home-care-card group rounded-2xl border border-[#ccded1] bg-white p-5 shadow-[0_8px_24px_rgba(37,100,65,.06)] transition hover:-translate-y-1 hover:border-[#7faa8c] hover:shadow-[0_14px_32px_rgba(37,100,65,.12)]"><span className="grid size-11 place-items-center rounded-xl bg-[#e8f7eb]"><Image src={item.icon} alt="" width={21} height={22} /></span><h3 className="mt-5 text-base font-extrabold text-[#243129]">{item.title}</h3><p className="mt-2 text-sm leading-6 text-[#68726b]">{item.text}</p><span className="mt-5 inline-flex text-sm font-bold text-[#256441] transition-transform group-hover:translate-x-1">Começar &gt;</span></Link>)}
          </div>
        </section>
        <section className="order-2 mx-auto w-full max-w-[1200px] px-5 pb-8 sm:px-10 lg:px-20" aria-labelledby="mapa-inicial">
          <div className="home-map-showcase grid overflow-hidden rounded-2xl border border-[#bad2c1] bg-white shadow-[0_18px_48px_rgba(37,100,65,.1)] lg:grid-cols-[.72fr_1.28fr]">
            <div className="home-map-pitch relative z-10 flex flex-col justify-center border-b border-[#dce9df] bg-[linear-gradient(145deg,#f8fff9_0%,#e8f7eb_100%)] p-7 sm:p-9 lg:border-b-0 lg:border-r">
              <span className="home-map-icon grid size-11 place-items-center rounded-lg bg-[#d8eddd]"><Image src="/icons/mapa.svg" alt="" width={20} height={25} /></span>
              <p className="mt-6 text-[10px] font-extrabold uppercase tracking-[.15em] text-[#2b724a]">Mapa AdotaPerto</p>
              <h2 id="mapa-inicial" className="mt-2 text-3xl font-extrabold leading-tight tracking-[-.04em] text-[#162c20]">A ajuda certa pode estar a poucos minutos.</h2>
              <p className="mt-4 text-sm leading-6 text-[#526057]">Explore sua região e encontre animais para adoção, doações e uma rede de apoio para cuidar melhor de cada pet.</p>
              <div className="mt-6 grid grid-cols-2 gap-2">
                {[["/icons/adocao.svg","Animais"],["/icons/map-box.svg","Doações"],["/icons/map-stethoscope.svg","Veterinários"],["/icons/map-house.svg","ONGs"]].map(([icon,label]) => <span key={label} className="home-map-category inline-flex items-center gap-2 rounded-lg border border-[#c8ddce] bg-white/75 px-3 py-2.5 text-[11px] font-bold text-[#31523e]"><Image src={icon} alt="" width={15} height={15} />{label}</span>)}
              </div>
              <div className="mt-6 flex items-start gap-2 border-t border-[#cfe1d3] pt-5 text-xs leading-5 text-[#68766d]"><Image src="/icons/location.svg" alt="" width={13} height={17} className="mt-0.5 shrink-0" /><span>Localizações residenciais são aproximadas para proteger quem publica.</span></div>
              <Link href="/mapa" className="group mt-7 inline-flex min-h-12 items-center justify-center gap-2 rounded-lg bg-[#256441] px-5 text-sm font-extrabold text-white shadow-[0_10px_24px_rgba(37,100,65,.2)] transition hover:-translate-y-0.5 hover:bg-[#194b30]">Explorar minha região <span className="transition-transform group-hover:translate-x-1">&gt;</span></Link>
            </div>
            <div className="map-surface relative min-h-[390px] overflow-hidden sm:min-h-[460px]">
              <HomeMapPreview />
              <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(90deg,rgba(232,247,235,.22),transparent_28%)]" />
              <div className="home-map-tip absolute bottom-5 left-5 right-5 flex items-center gap-3 rounded-lg border border-white/70 bg-white/90 p-3.5 shadow-[0_10px_28px_rgba(31,61,42,.15)] backdrop-blur sm:left-auto sm:max-w-[285px]">
                <span className="grid size-9 shrink-0 place-items-center rounded-md bg-[#e3f2e6]"><Image src="/icons/map-search.svg" alt="" width={17} height={17} /></span>
                <span><strong className="block text-xs text-[#26332b]">Pesquise por cidade ou CEP</strong><small className="mt-0.5 block text-[10px] leading-4 text-[#68726b]">Veja resultados próximos em poucos segundos.</small></span>
              </div>
            </div>
          </div>
        </section>
        <HomeNearbyAnimals animals={animals} />
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
