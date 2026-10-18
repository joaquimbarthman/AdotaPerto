import Image from "next/image";
import Link from "next/link";

export function HomeFeatures() {
  return (
    <section
            className="order-1 mx-auto w-full max-w-300 px-3 py-9 sm:px-10 sm:py-16 lg:px-20"
            aria-labelledby="possibilidades"
          >
            <div className="mb-5 max-w-2xl sm:mb-9">
              <p className="text-[10px] font-extrabold uppercase tracking-[0.14em] text-[#2b724a] sm:text-xs">
                Comece por aqui
              </p>
              <h2
                id="possibilidades"
                className="home-section-title mt-1.5 text-2xl font-extrabold tracking-[-0.035em] text-[#162c20] sm:mt-2 sm:text-4xl"
              >
                Um lugar para cada forma de cuidar
              </h2>
              <p className="mt-2 text-sm leading-5 text-[#526057] sm:mt-3 sm:text-base sm:leading-7">
                Escolha o que faz sentido para você agora. O AdotaPerto organiza
                todo o caminho em poucos passos.
              </p>
            </div>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-4">
              {[
                {
                  href: "/adocao",
                  icon: "/icons/adocao.svg",
                  title: "Quero adotar",
                  text: "Conheça animais e envie uma solicitação responsável.",
                },
                {
                  href: "/doacoes/animal",
                  icon: "/icons/heart.svg",
                  title: "Publicar um animal",
                  text: "Ajude um pet a encontrar uma nova família.",
                },
                {
                  href: "/doacoes/item",
                  icon: "/icons/map-box.svg",
                  title: "Doar itens",
                  text: "Compartilhe recursos úteis com outros cuidadores.",
                },
                {
                  href: "/mapa",
                  icon: "/icons/mapa.svg",
                  title: "Explorar o mapa",
                  text: "Veja animais, doações e serviços próximos.",
                },
              ].map((item) => (
                <Link
                  key={item.title}
                  href={item.href}
                  className="home-care-card group grid min-w-0 grid-cols-[40px_1fr_auto] items-center gap-3 rounded-xl border border-[#ccded1] bg-white p-3 shadow-[0_8px_24px_rgba(37,100,65,.06)] transition hover:-translate-y-1 hover:border-[#7faa8c] hover:shadow-[0_14px_32px_rgba(37,100,65,.12)] sm:block sm:rounded-2xl sm:p-5"
                >
                  <span className="grid size-10 place-items-center rounded-lg bg-[#e8f7eb] sm:size-11 sm:rounded-xl">
                    <Image src={item.icon} alt="" width={18} height={19} />
                  </span>
                  <span className="min-w-0">
                    <h3 className="truncate text-sm font-extrabold text-[#243129] sm:mt-5 sm:text-base">
                      {item.title}
                    </h3>
                    <p className="mt-1 line-clamp-2 text-[10px] leading-4 text-[#68726b] sm:mt-2 sm:text-sm sm:leading-6">
                      {item.text}
                    </p>
                  </span>
                  <span className="inline-flex shrink-0 items-center gap-1 whitespace-nowrap text-[10px] font-bold text-[#256441] transition-transform group-hover:translate-x-1 sm:mt-5 sm:text-sm">
                    Começar <span aria-hidden="true">&gt;</span>
                  </span>
                </Link>
              ))}
            </div>
          </section>
  );
}
