import Image from "next/image";
import Link from "next/link";
import { DirectionalChevron } from "@/components/directional-chevron";
import { BrandLogo } from "@/components/brand-logo";

export function AuthShell({ children, image, imageAlt, register = false }: { children: React.ReactNode; image: string; imageAlt: string; register?: boolean }) {
  return (
    <main className="flex min-h-dvh items-start justify-center bg-[#f4f7f2] p-0 sm:min-h-screen sm:items-center sm:p-6 lg:p-10">
      <div className="grid min-h-dvh w-full max-w-[1120px] overflow-hidden bg-white shadow-[0_18px_60px_rgba(38,51,43,0.10)] sm:min-h-0 sm:rounded-3xl lg:grid-cols-[1.05fr_.95fr]">
        <section className={`relative h-36 overflow-hidden bg-[#e8f7eb] sm:h-64 lg:h-auto ${register ? "lg:min-h-[720px]" : "lg:min-h-[660px]"}`}>
          <Image src={image} alt={imageAlt} fill priority className="object-cover" sizes="(max-width:1023px) 100vw,50vw" />
          <Link href="/" className="group absolute left-3 top-3 z-10 inline-flex items-center gap-1 rounded-md bg-white/80 px-2.5 py-1.5 text-xs font-semibold text-[#173f2b] backdrop-blur-md transition hover:bg-white/90 sm:left-6 sm:top-6 sm:gap-1.5 sm:rounded-lg sm:px-3 sm:py-2 sm:text-sm"><DirectionalChevron className="transition-transform group-hover:-translate-x-0.5" />Voltar</Link>
          <div className="absolute inset-0 bg-gradient-to-t from-[#17271e]/75 via-transparent to-transparent" />
          <div className="absolute bottom-3 left-4 right-4 text-white sm:bottom-8 sm:left-8 sm:right-8 lg:bottom-10 lg:left-10 lg:right-10">
            <h2 className="text-lg font-bold leading-5 tracking-[-0.02em] sm:text-2xl sm:leading-tight lg:text-[32px]">{register ? "Faça parte dessa rede de cuidado." : "Boas histórias começam com um encontro."}</h2>
            <p className="mt-2 hidden max-w-md text-sm leading-6 text-white/90 sm:block">{register ? "Crie sua conta e ajude mais animais a encontrarem segurança e carinho." : "Acompanhe adoções, favoritos e novas oportunidades de transformar vidas."}</p>
          </div>
        </section>
        <section className="flex items-start px-4 py-5 sm:items-center sm:px-10 sm:py-12 lg:px-14 lg:py-14">
          <div className="mx-auto w-full max-w-[420px]">{children}</div>
        </section>
      </div>
    </main>
  );
}

export function AuthBrand({ withIcon = true }: { withIcon?: boolean }) {
  return <Link href="/" className="inline-block transition-opacity hover:opacity-80" aria-label="AdotaPerto — início"><BrandLogo priority className={`h-auto ${withIcon ? "w-[145px] sm:w-[190px]" : "w-[130px] sm:w-[155px]"}`} /></Link>;
}
