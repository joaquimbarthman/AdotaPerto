import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { PhotoGallery } from "@/components/photo-gallery";
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
  const description = animal.description ?? `${animal.name} está aguardando uma família responsável e carinhosa. É um animal companheiro, cheio de personalidade e pronto para construir uma nova história em um lar seguro.`;

  return (
    <div className="min-h-screen bg-[#eefdf1] text-[#121e17]">
      <SiteHeader />
      <main className="mx-auto max-w-[1200px] px-5 py-8 sm:px-10 lg:px-20 lg:py-12">
        <Link href="/adocao" className="mb-8 inline-flex items-center gap-2 rounded-lg px-2 py-1 text-sm font-semibold text-[#256441] transition hover:bg-[#e8f7eb] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#256441]">
          <svg viewBox="0 0 20 20" className="size-4" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><path d="m12.5 4.5-5 5.5 5 5.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
          Voltar
        </Link>

        <div className="grid items-start gap-6 lg:grid-cols-[2fr_1fr]">
          <div className="space-y-6">
            <PhotoGallery animalName={animal.name} photos={photos} />

            <section className="rounded-xl bg-white p-6 shadow-[0_4px_6px_rgba(38,51,43,0.05)] sm:p-10 lg:p-12">
              <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-center"><div><div className="flex items-center gap-3"><h1 className="text-4xl font-extrabold tracking-[-0.02em] sm:text-[40px]">{animal.name}</h1>{animal.sex === "Fêmea" && <Image src="/icons/female.svg" alt="Fêmea" width={11} height={17} />}</div><p className="mt-1 text-lg text-[#404942]">{animal.breed === "SRD" ? "Vira-lata (SRD)" : animal.breed} • Porte {sizeName(animal.size)}</p></div><span className="flex w-fit items-center gap-2 rounded-xl border border-[#aff1c4] bg-[#e8f7eb] px-4 py-2 text-sm font-semibold text-[#256441]"><Image src="/icons/available-detail.svg" alt="" width={17} height={17} />{animal.status === "Disponível" ? "Disponível para Adoção" : animal.status}</span></div>
              <div className="mt-6 grid gap-5 border-t border-[#c0c9bf] pt-6 min-[460px]:grid-cols-3"><Stat icon="/icons/age.svg" label="Idade aproximada" value={animal.age} /><Stat icon="/icons/weight.svg" label="Porte" value={sizeName(animal.size)} /><Stat icon="/icons/female.svg" label="Sexo" value={animal.sex} /></div>
            </section>

            <section className="rounded-xl bg-white p-6 shadow-[0_4px_6px_rgba(38,51,43,0.05)] sm:p-10 lg:p-12"><h2 className="mb-4 text-2xl font-semibold">Sobre {animal.sex === "Fêmea" ? "a" : "o"} {animal.name}</h2><p className="leading-7 text-[#404942]">{description}</p>{animal.personality && <p className="mt-4 leading-7 text-[#404942]"><strong className="text-[#121e17]">Personalidade:</strong> {animal.personality}</p>}{animal.behaviorNotes && <p className="mt-3 leading-7 text-[#404942]"><strong className="text-[#121e17]">Comportamento:</strong> {animal.behaviorNotes}</p>}</section>

            <div className="grid gap-6 sm:grid-cols-2">
              <InfoCard title="Saúde e cuidados" icon="/icons/health.svg" items={[`Castrado: ${animal.neutered ?? "Não sei"}`, animal.vaccination ?? "Situação vacinal não informada", `Vermifugado: ${animal.dewormed ?? "Não sei"}`, animal.healthCondition ?? "Condição de saúde não informada"]} />
              <InfoCard title="Convivência" icon="/icons/coexistence.svg" items={[`Energia: ${animal.energyLevel ?? "Não informada"}`, `Convive com cães: ${animal.livesWithDogs ?? "Não sei"}`, `Convive com gatos: ${animal.livesWithCats ?? "Não sei"}`, `Convive com crianças: ${animal.livesWithChildren ?? "Não sei"}`]} />
            </div>
            <section className="rounded-xl bg-white p-6 shadow-[0_4px_6px_rgba(38,51,43,0.05)] sm:p-10 lg:p-12"><h2 className="mb-5 text-2xl font-semibold">Contexto da adoção</h2><dl className="grid gap-5 sm:grid-cols-2"><Detail label="Motivo da adoção" value={animal.adoptionReason ?? "Não informado"} /><Detail label="Tempo sob os cuidados" value={animal.timeInCare ?? "Não informado"} /><Detail label="Está sob os cuidados do responsável" value={animal.currentlyInCare === undefined ? "Não informado" : animal.currentlyInCare ? "Sim" : "Não"} /></dl></section>
          </div>

          <aside className="space-y-6 lg:sticky lg:top-28">
            <section className="rounded-xl bg-white p-6 shadow-[0_4px_6px_rgba(38,51,43,0.05)]"><h2 className="text-sm font-semibold uppercase tracking-[0.05em] text-[#404942]">Aos cuidados de</h2><div className="mt-4 flex items-center gap-4"><div className="relative size-16 shrink-0 overflow-hidden rounded-full border border-[#e3f2e6]"><Image src="/images/shelter.png" alt="Instituto Patinhas Felizes" fill className="object-cover" /></div><div><h3 className="text-xl font-semibold leading-6">Instituto<br />Patinhas Felizes</h3><p className="mt-1 text-xs text-[#404942]">Responsável verificado</p></div></div></section>
            <section className="rounded-xl border border-[#d7e6da] bg-[#f7fcf8] p-6 text-sm leading-6 text-[#404942]"><h2 className="mb-2 font-bold text-[#256441]">Privacidade e segurança</h2><p>Telefone, e-mail e endereço do responsável não aparecem no anúncio. O contato será liberado somente depois que o pedido de adoção for aprovado.</p></section>
            <button className="w-full rounded-xl bg-[#256441] px-6 py-4 text-sm font-semibold tracking-[0.05em] text-white shadow-sm transition-all hover:-translate-y-0.5 hover:bg-[#194b30] hover:shadow-md active:scale-[0.98]">Solicitar adoção</button>
          </aside>
        </div>
      </main>
      <div className="mt-20"><SiteFooter /></div>
    </div>
  );
}

function sizeName(size: "P" | "M" | "G") { return ({ P: "Pequeno", M: "Médio", G: "Grande" } as const)[size]; }
function Stat({ icon, label, value }: { icon: string; label: string; value: string }) { return <div className="flex items-center gap-3"><span className="grid size-10 shrink-0 place-items-center rounded-full bg-[#e3f2e6]"><Image src={icon} alt="" width={20} height={20} /></span><span><small className="block text-xs font-medium text-[#404942]">{label}</small><strong className="text-sm font-semibold tracking-[0.05em]">{value}</strong></span></div>; }
function Detail({ label, value }: { label: string; value: string }) { return <div><dt className="text-sm font-semibold text-[#121e17]">{label}</dt><dd className="mt-1 leading-6 text-[#404942]">{value}</dd></div>; }
function InfoCard({ title, icon, items, unknownLast, unknownIndex }: { title: string; icon: string; items: string[]; unknownLast?: boolean; unknownIndex?: number }) { return <section className="rounded-xl bg-white p-6 shadow-[0_4px_6px_rgba(38,51,43,0.05)]"><h2 className="mb-4 flex items-center gap-2 text-sm font-semibold tracking-[0.05em]"><Image src={icon} alt="" width={20} height={20} />{title}</h2><ul className="space-y-3">{items.map((item, index) => { const unknown = (unknownLast && index === items.length - 1) || unknownIndex === index; return <li key={item} className="flex items-start gap-3 text-sm text-[#404942]"><Image src={unknown ? "/icons/unknown.svg" : "/icons/check-detail.svg"} alt="" width={17} height={13} className="mt-1" />{item}</li>; })}</ul></section>; }
