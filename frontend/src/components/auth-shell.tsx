import Image from "next/image";
import Link from "next/link";
import { DirectionalChevron } from "@/components/directional-chevron";

export function AuthShell({ children, image, imageAlt, register = false }: { children: React.ReactNode; image: string; imageAlt: string; register?: boolean }) {
  return (
    <main className={`flex min-h-screen items-center justify-center bg-[#faf8f3] p-4 sm:p-8 ${register ? "lg:p-16" : "lg:p-8"}`}>
      <div className={`grid w-full overflow-hidden bg-white shadow-[0_4px_20px_rgba(38,51,43,0.04)] lg:grid-cols-2 ${register ? "max-w-[960px] rounded-2xl" : "max-w-[1152px] rounded-3xl"}`}>
        <section className={`relative hidden overflow-hidden bg-[#e8f7eb] lg:block ${register ? "min-h-[800px]" : "min-h-[648px]"}`}>
          <Image src={image} alt={imageAlt} fill priority className="object-cover" sizes="50vw" />
          <Link href="/" className="group absolute left-6 top-6 z-10 inline-flex items-center gap-1.5 rounded-full border border-white/30 bg-white/65 px-4 py-2 text-sm font-semibold text-[#173f2b] shadow-sm backdrop-blur-md transition-all hover:bg-white/85 hover:shadow-md"><DirectionalChevron className="transition-transform group-hover:-translate-x-0.5" />Voltar</Link>
          {register && <><div className="absolute inset-0 bg-gradient-to-t from-[#26332b]/70 via-transparent to-transparent" /><div className="absolute bottom-12 left-12 right-12 text-white"><h2 className="text-[32px] font-bold leading-10 tracking-[-0.01em]">Faça parte da nossa<br />matilha.</h2><p className="mt-3 text-base">Cada adoção é uma nova história de amor que começa.</p></div></>}
        </section>
        <section className={`flex items-center ${register ? "px-5 py-8 sm:px-10 lg:px-14 lg:py-8" : "p-6 sm:p-12 lg:p-16"}`}>
          <div className="w-full"><Link href="/" className="group mb-6 inline-flex items-center gap-1.5 rounded-full bg-[#e8f7eb] px-4 py-2 text-sm font-semibold text-[#0f5d39] lg:hidden"><DirectionalChevron className="transition-transform group-hover:-translate-x-0.5" />Voltar</Link>{children}</div>
        </section>
      </div>
    </main>
  );
}

export function AuthBrand({ withIcon = false }: { withIcon?: boolean }) {
  return <Link href="/" className="inline-flex items-center gap-2 text-2xl font-bold text-[#0f5d39] transition-opacity hover:opacity-80">{withIcon && <Image src="/icons/brand-paw.svg" alt="" width={25} height={24} />}AdotaPerto</Link>;
}
