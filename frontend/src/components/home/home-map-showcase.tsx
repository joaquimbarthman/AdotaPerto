import { HomeMapPreview } from "@/components/home-map-preview";
import Image from "next/image";
import Link from "next/link";

export function HomeMapShowcase() {
  return (
    <section
            className="order-2 mx-auto w-full max-w-300 px-3 pb-6 sm:px-10 sm:pb-8 lg:px-20"
            aria-labelledby="mapa-inicial"
          >
            <div className="home-map-showcase grid overflow-hidden rounded-2xl border border-[#bad2c1] bg-white shadow-[0_18px_48px_rgba(37,100,65,.1)] lg:grid-cols-[.72fr_1.28fr]">
              <div className="home-map-pitch relative z-10 flex flex-col justify-center border-b border-[#dce9df] bg-[linear-gradient(145deg,#f8fff9_0%,#e8f7eb_100%)] p-4 sm:p-9 lg:border-b-0 lg:border-r">
                <span className="home-map-icon grid size-11 place-items-center rounded-lg bg-[#d8eddd]">
                  <Image src="/icons/mapa.svg" alt="" width={20} height={25} />
                </span>
                <p className="mt-6 text-[10px] font-extrabold uppercase tracking-[.15em] text-[#2b724a]">
                  Mapa AdotaPerto
                </p>
                <h2
                  id="mapa-inicial"
                  className="mt-2 text-2xl font-extrabold leading-tight tracking-[-.04em] text-[#162c20] sm:text-3xl"
                >
                  A ajuda certa pode estar a poucos minutos.
                </h2>
                <p className="mt-4 text-sm leading-6 text-[#526057]">
                  Explore sua região e encontre animais para adoção, doações e
                  uma rede de apoio para cuidar melhor de cada pet.
                </p>
                <div className="mt-6 grid grid-cols-2 gap-2">
                  {[
                    ["/icons/adocao.svg", "Animais"],
                    ["/icons/map-box.svg", "Doações"],
                    ["/icons/map-stethoscope.svg", "Veterinários"],
                    ["/icons/map-house.svg", "ONGs"],
                  ].map(([icon, label]) => (
                    <span
                      key={label}
                      className="home-map-category inline-flex items-center gap-2 rounded-lg border border-[#c8ddce] bg-white/75 px-3 py-2.5 text-[11px] font-bold text-[#31523e]"
                    >
                      <Image src={icon} alt="" width={15} height={15} />
                      {label}
                    </span>
                  ))}
                </div>
                <div className="mt-6 flex items-start gap-2 border-t border-[#cfe1d3] pt-5 text-xs leading-5 text-[#68766d]">
                  <Image
                    src="/icons/location.svg"
                    alt=""
                    width={13}
                    height={17}
                    className="mt-0.5 shrink-0"
                  />
                  <span>
                    Localizações residenciais são aproximadas para proteger quem
                    publica.
                  </span>
                </div>
                <Link
                  href="/mapa"
                  className="group mt-7 inline-flex min-h-12 items-center justify-center gap-2 rounded-lg bg-[#256441] px-5 text-sm font-extrabold text-white shadow-[0_10px_24px_rgba(37,100,65,.2)] transition hover:-translate-y-0.5 hover:bg-[#194b30]"
                >
                  Explorar minha região{" "}
                  <span className="transition-transform group-hover:translate-x-1">
                    &gt;
                  </span>
                </Link>
              </div>
              <div className="map-surface relative min-h-65 overflow-hidden sm:min-h-115">
                <HomeMapPreview />
                <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(90deg,rgba(232,247,235,.22),transparent_28%)]" />
                <div className="home-map-tip absolute bottom-5 left-5 right-5 flex items-center gap-3 rounded-lg border border-white/70 bg-white/90 p-3.5 shadow-[0_10px_28px_rgba(31,61,42,.15)] backdrop-blur sm:left-auto sm:max-w-71.25">
                  <span className="grid size-9 shrink-0 place-items-center rounded-md bg-[#e3f2e6]">
                    <Image
                      src="/icons/map-search.svg"
                      alt=""
                      width={17}
                      height={17}
                    />
                  </span>
                  <span>
                    <strong className="block text-xs text-[#26332b]">
                      Pesquise por cidade ou CEP
                    </strong>
                    <small className="mt-0.5 block text-[10px] leading-4 text-[#68726b]">
                      Veja resultados próximos em poucos segundos.
                    </small>
                  </span>
                </div>
              </div>
            </div>
          </section>
  );
}
