import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { DirectionalChevron } from "@/components/directional-chevron";
import { adoptionAnimals, homeAnimals } from "@/data/animals";

const allAnimals = [...adoptionAnimals, ...homeAnimals];

export function generateStaticParams() {
  return allAnimals.map((animal) => ({ id: animal.id }));
}

export default async function PetDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const animal = allAnimals.find((item) => item.id === id);
  if (!animal) notFound();

  const isLuna = animal.id === "luna";
  const photos = isLuna ? ["/images/luna-detail-1.png", "/images/luna-detail-2.png", "/images/luna-detail-3.png"] : [animal.image, animal.image, animal.image];
  const description = isLuna
    ? "Luna é uma cachorrinha muito dócil e cheia de energia! Ela foi resgatada das ruas há alguns meses e, desde então, tem mostrado ser uma companheira incrível. Adora brincar com bolinhas e correr no quintal, mas também não dispensa um bom cafuné no sofá."
    : `${animal.name} está aguardando uma família responsável e carinhosa. É um animal companheiro, cheio de personalidade e pronto para construir uma nova história em um lar seguro.`;

  return (
    <div className="min-h-screen bg-[#eefdf1] text-[#121e17]">
      <SiteHeader />
      <main className="mx-auto max-w-[1200px] px-5 py-8 sm:px-10 lg:px-20 lg:py-12">
        <nav className="mb-8 flex flex-wrap items-center gap-2 text-xs font-medium text-[#404942]" aria-label="Navegação estrutural">
          <Link href="/">Início</Link><Crumb /><Link href="/adocao">Adotar</Link><Crumb /><span>{animal.species === "Cachorro" ? "Cães" : "Gatos"}</span><Crumb /><strong className="text-[#121e17]">{animal.name}</strong>
        </nav>

        <div className="grid items-start gap-6 lg:grid-cols-[2fr_1fr]">
          <div className="space-y-6">
            <section className="grid h-[360px] grid-cols-3 grid-rows-2 gap-3 sm:h-[500px]" aria-label={`Fotos de ${animal.name}`}>
              <div className="relative col-span-2 row-span-2 overflow-hidden rounded-xl shadow-sm"><Image src={photos[0]} alt={`${animal.name} em destaque`} fill className="object-cover transition-transform duration-500 hover:scale-[1.02]" sizes="(max-width:1024px) 66vw,550px" priority /></div>
              <div className="relative overflow-hidden rounded-xl shadow-sm"><Image src={photos[1]} alt={`${animal.name} brincando`} fill className="object-cover transition-transform duration-500 hover:scale-105" sizes="(max-width:1024px) 33vw,250px" /></div>
              <div className="group relative overflow-hidden rounded-xl shadow-sm"><Image src={photos[2]} alt={`${animal.name} descansando`} fill className="object-cover transition-transform duration-500 group-hover:scale-105" sizes="(max-width:1024px) 33vw,250px" /><div className="absolute inset-0 flex items-center justify-center bg-[#256441]/0 opacity-0 transition duration-300 group-hover:bg-[#256441]/40 group-hover:opacity-100"><span className="flex items-center gap-2 font-semibold text-white"><Image src="/icons/gallery.svg" alt="" width={20} height={20} /> Ver todas</span></div></div>
            </section>

            <section className="rounded-xl bg-white p-6 shadow-[0_4px_6px_rgba(38,51,43,0.05)] sm:p-10 lg:p-12">
              <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-center"><div><div className="flex items-center gap-3"><h1 className="text-4xl font-extrabold tracking-[-0.02em] sm:text-[40px]">{animal.name}</h1>{animal.sex === "Fêmea" && <Image src="/icons/female.svg" alt="Fêmea" width={11} height={17} />}</div><p className="mt-1 text-lg text-[#404942]">{animal.breed === "SRD" ? "Vira-lata (SRD)" : animal.breed} • Porte {sizeName(animal.size)}</p></div><span className="flex w-fit items-center gap-2 rounded-full border border-[#aff1c4] bg-[#e8f7eb] px-4 py-2 text-sm font-semibold text-[#256441]"><Image src="/icons/available-detail.svg" alt="" width={17} height={17} />{animal.status === "Disponível" ? "Disponível para Adoção" : animal.status}</span></div>
              <div className="mt-6 grid gap-5 border-t border-[#c0c9bf] pt-6 min-[460px]:grid-cols-3"><Stat icon="/icons/age.svg" label="Idade" value={animal.age} /><Stat icon="/icons/weight.svg" label="Peso" value={animal.weight ?? "14 kg"} /><Stat icon="/icons/color.svg" label="Cor" value={isLuna ? "Caramelo" : "Variada"} /></div>
            </section>

            <section className="rounded-xl bg-white p-6 shadow-[0_4px_6px_rgba(38,51,43,0.05)] sm:p-10 lg:p-12"><h2 className="mb-4 text-2xl font-semibold">Sobre {animal.sex === "Fêmea" ? "a" : "o"} {animal.name}</h2><p className="leading-7 text-[#404942]">{description}</p><p className="mt-4 leading-7 text-[#404942]">Apesar do passado difícil, é um pet muito carinhoso e se adapta bem quando recebe paciência, atenção e respeito ao seu tempo.</p></section>

            <div className="grid gap-6 sm:grid-cols-2">
              <InfoCard title="Saúde" icon="/icons/health.svg" items={["Vacinada (V10 e Raiva)", "Vermifugada", "Castrada", "Necessidades especiais"]} unknownLast />
              <InfoCard title="Comportamento" icon="/icons/behavior.svg" items={["Dócil com humanos", "Convive bem com cães", "Convívio com gatos (não testado)", "Gosta de crianças"]} unknownIndex={2} />
            </div>
          </div>

          <aside className="space-y-6 lg:sticky lg:top-28">
            <section className="rounded-xl bg-white p-6 shadow-[0_4px_6px_rgba(38,51,43,0.05)]"><h2 className="text-sm font-semibold uppercase tracking-[0.05em] text-[#404942]">Aos cuidados de</h2><div className="mt-4 flex items-center gap-4"><div className="relative size-16 shrink-0 overflow-hidden rounded-full border border-[#e3f2e6]"><Image src="/images/shelter.png" alt="Instituto Patinhas Felizes" fill className="object-cover" /></div><div><h3 className="text-xl font-semibold leading-6">Instituto<br />Patinhas Felizes</h3><p className="mt-1 flex items-center gap-1 text-xs text-[#404942]"><Image src="/icons/shelter-location.svg" alt="" width={11} height={14} />São Paulo, SP (Zona Sul)</p></div></div><Link href="#" className="group mt-4 inline-flex items-center gap-1 text-sm font-semibold text-[#256441]">Ver perfil do abrigo <DirectionalChevron direction="right" className="transition-transform group-hover:-translate-x-1" /></Link></section>
            <section className="rounded-xl bg-white p-6 shadow-[0_4px_6px_rgba(38,51,43,0.05)]"><h2 className="mb-3 flex items-center gap-2 text-sm font-semibold tracking-[0.05em]"><Image src="/icons/map.svg" alt="" width={18} height={18} />Localização Aproximada</h2><div className="relative h-40 overflow-hidden rounded-lg"><Image src="/images/map-detail.png" alt="Mapa aproximado da Zona Sul de São Paulo" fill className="object-cover" /><span className="absolute bottom-3 left-3 rounded-full bg-white/90 px-3 py-1 text-xs font-medium shadow-sm backdrop-blur-sm">Zona Sul, São Paulo</span></div></section>
            <button className="w-full rounded-xl bg-[#256441] px-6 py-4 text-sm font-semibold tracking-[0.05em] text-white shadow-sm transition-all hover:-translate-y-0.5 hover:bg-[#194b30] hover:shadow-md active:scale-[0.98]">Tenho interesse em adotar</button>
          </aside>
        </div>
      </main>
      <div className="mt-20"><SiteFooter /></div>
    </div>
  );
}

function Crumb() { return <DirectionalChevron direction="right" className="size-3 text-xs text-[#809087]" />; }
function sizeName(size: "P" | "M" | "G") { return ({ P: "Pequeno", M: "Médio", G: "Grande" } as const)[size]; }
function Stat({ icon, label, value }: { icon: string; label: string; value: string }) { return <div className="flex items-center gap-3"><span className="grid size-10 shrink-0 place-items-center rounded-full bg-[#e3f2e6]"><Image src={icon} alt="" width={20} height={20} /></span><span><small className="block text-xs font-medium text-[#404942]">{label}</small><strong className="text-sm font-semibold tracking-[0.05em]">{value}</strong></span></div>; }
function InfoCard({ title, icon, items, unknownLast, unknownIndex }: { title: string; icon: string; items: string[]; unknownLast?: boolean; unknownIndex?: number }) { return <section className="rounded-xl bg-white p-6 shadow-[0_4px_6px_rgba(38,51,43,0.05)]"><h2 className="mb-4 flex items-center gap-2 text-sm font-semibold tracking-[0.05em]"><Image src={icon} alt="" width={20} height={20} />{title}</h2><ul className="space-y-3">{items.map((item, index) => { const unknown = (unknownLast && index === items.length - 1) || unknownIndex === index; return <li key={item} className="flex items-start gap-3 text-sm text-[#404942]"><Image src={unknown ? "/icons/unknown.svg" : "/icons/check-detail.svg"} alt="" width={17} height={13} className="mt-1" />{item}</li>; })}</ul></section>; }
