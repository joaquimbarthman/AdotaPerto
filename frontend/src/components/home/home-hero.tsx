import { DirectionalChevron } from "@/components/directional-chevron";
import Image from "next/image";
import Link from "next/link";

export function HomeHero() {
  return (
    <section className="home-hero relative overflow-hidden border-b border-[#d7e6da] bg-[radial-gradient(circle_at_78%_18%,rgba(148,213,170,.38),transparent_28%),linear-gradient(135deg,#f8fff9_0%,#eefdf1_52%,#e2f5e7_100%)]">
          <div className="pointer-events-none absolute -left-28 bottom-0 size-80 rounded-full bg-[#bfe8ca]/25 blur-3xl" />
          <div className="mx-auto grid max-w-300 items-center gap-7 px-3 py-7 sm:min-h-162.5 sm:gap-12 sm:px-10 sm:py-14 lg:grid-cols-[1.05fr_.95fr] lg:px-20 lg:py-20">
            <div className="relative z-10">
              <span className="home-hero-kicker inline-flex items-center gap-1.5 rounded-md border px-2.5 py-1.5 text-[9px] font-extrabold uppercase tracking-widest backdrop-blur sm:gap-2 sm:rounded-lg sm:px-3.5 sm:py-2 sm:text-[11px] sm:tracking-[0.12em]">
                <Image src="/icons/adocao.svg" alt="" width={15} height={15} />
                Adoção, cuidado e ajuda perto de você
              </span>
              <h1 className="home-hero-title mt-4 max-w-170 text-[32px] font-extrabold leading-[1.06] tracking-[-0.045em] text-[#162c20] sm:mt-6 sm:text-[58px] lg:text-[66px]">
                Encontre quem precisa de você.{" "}
                <span className="text-[#2b724a]">Bem mais perto.</span>
              </h1>
              <p className="home-hero-copy mt-4 max-w-152.5 text-sm leading-5 text-[#4d5b53] sm:mt-6 sm:text-lg sm:leading-8">
                O AdotaPerto conecta pessoas, animais e redes de cuidado da sua
                região. Adote com responsabilidade, publique um pet, doe itens
                ou encontre apoio no mapa.
              </p>
              <div className="mt-5 grid grid-cols-2 gap-2 sm:mt-8 sm:flex sm:gap-3">
                <Link
                  href="/adocao"
                  className="group inline-flex min-h-11 items-center justify-center gap-1.5 rounded-lg bg-[#256441] px-3 text-center text-[11px] font-extrabold text-white shadow-[0_12px_28px_rgba(37,100,65,.22)] transition hover:-translate-y-0.5 hover:bg-[#194b30] sm:min-h-14 sm:gap-2 sm:rounded-xl sm:px-7 sm:text-sm"
                >
                  Encontrar um animal{" "}
                  <DirectionalChevron
                    direction="right"
                    className="brightness-0 invert transition-transform group-hover:translate-x-1"
                  />
                </Link>
                <Link
                  href="/mapa"
                  className="home-hero-map-cta group inline-flex min-h-11 items-center justify-center gap-1.5 rounded-lg border px-3 text-center text-[11px] font-extrabold backdrop-blur transition hover:-translate-y-0.5 sm:min-h-14 sm:gap-2 sm:rounded-xl sm:px-7 sm:text-sm"
                >
                  <Image src="/icons/mapa.svg" alt="" width={15} height={18} />
                  Explorar perto de mim
                </Link>
              </div>
              <div className="mt-5 grid grid-cols-3 gap-1.5 pb-2 text-[clamp(7px,2.4vw,9px)] font-semibold text-[#526057] sm:mt-7 sm:flex sm:flex-wrap sm:gap-x-6 sm:gap-y-3 sm:pb-0 sm:text-sm">
                <span className="inline-flex min-h-10 items-center justify-center gap-1.5 whitespace-nowrap px-1 py-2 sm:min-h-0 sm:justify-start sm:gap-2 sm:px-0 sm:py-0">
                  <Image src="/icons/heart.svg" alt="" width={13} height={13} />
                  Adoção consciente
                </span>
                <span className="inline-flex min-h-10 items-center justify-center gap-1.5 whitespace-nowrap px-1 py-2 sm:min-h-0 sm:justify-start sm:gap-2 sm:px-0 sm:py-0">
                  <Image
                    src="/icons/health.svg"
                    alt=""
                    width={14}
                    height={14}
                  />
                  Contato direto
                </span>
                <span className="inline-flex min-h-10 items-center justify-center gap-1.5 whitespace-nowrap px-1 py-2 sm:min-h-0 sm:justify-start sm:gap-2 sm:px-0 sm:py-0">
                  <Image
                    src="/icons/location.svg"
                    alt=""
                    width={11}
                    height={14}
                  />
                  Localização segura
                </span>
              </div>
            </div>

            <div className="relative mx-auto w-full max-w-125 pb-10 sm:pb-10">
              <div className="absolute -right-7 -top-7 size-40 rounded-[38px] border border-white/70 bg-[#94d5aa]/45" />
              <div className="relative aspect-[16/10] overflow-hidden rounded-2xl border-4 border-white bg-[#d7e6da] shadow-[0_20px_50px_rgba(29,77,48,.18)] sm:aspect-[5/4] sm:rounded-[32px] sm:border-6 lg:aspect-[4/5]">
                <Image
                  src="/images/login-cover-v2.png"
                  alt="Pessoa acolhendo um cachorro"
                  fill
                  priority
                  className="object-cover"
                  sizes="(max-width:1024px) 90vw,500px"
                />
                <div className="absolute inset-0 bg-linear-to-t from-[#102d1d]/35 via-transparent to-transparent" />
                <div className="absolute bottom-2.5 left-2.5 right-2.5 grid grid-cols-2 gap-1 rounded-lg border border-white/30 bg-[#153d27]/85 p-1.5 text-white shadow-lg backdrop-blur-md sm:bottom-5 sm:left-5 sm:right-5 sm:gap-2 sm:rounded-2xl sm:p-3">
                  <Link
                    href="/doacoes/animal"
                    className="rounded-xl px-3 py-2.5 transition hover:bg-white/10"
                  >
                    <span className="block text-[10px] font-bold uppercase tracking-wider text-[#bce8c9]">
                      Precisa de ajuda?
                    </span>
                    <strong className="mt-0.5 block text-sm">
                      Publicar um animal
                    </strong>
                  </Link>
                  <Link
                    href="/doacoes/item"
                    className="rounded-xl border-l border-white/15 px-3 py-2.5 transition hover:bg-white/10"
                  >
                    <span className="block text-[10px] font-bold uppercase tracking-wider text-[#bce8c9]">
                      Pode contribuir?
                    </span>
                    <strong className="mt-0.5 block text-sm">
                      Doar um item
                    </strong>
                  </Link>
                </div>
              </div>
              <div className="absolute bottom-0 left-2 right-2 flex min-w-0 items-center gap-2 rounded-xl border border-[#c6ddcc] bg-white/95 p-2.5 shadow-[0_12px_28px_rgba(25,60,38,.14)] backdrop-blur sm:-left-8 sm:right-auto sm:gap-3 sm:rounded-2xl sm:p-4">
                <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-[#e3f2e6] sm:size-11 sm:rounded-xl">
                  <Image src="/icons/mapa.svg" alt="" width={18} height={22} />
                </span>
                <span className="min-w-0">
                  <strong className="block truncate text-xs text-[#243129] sm:text-sm">
                    Veja o que existe ao seu redor
                  </strong>
                  <small className="mt-0.5 block truncate text-[10px] text-[#68726b] sm:text-xs">
                    Animais, doações e locais de apoio.
                  </small>
                </span>
              </div>
            </div>
          </div>
        </section>
  );
}
