"use client";

import { SiteFooter } from "@/components/site-footer";
import { notify, Notification } from "@/components/notification";
import { SiteHeader } from "@/components/site-header";
import { DirectionalChevron } from "@/components/directional-chevron";
import { SkeletonLoader } from "@/components/skeleton-loader";
import type { Animal } from "@/data/animals";
import { useSession } from "@/lib/auth-client";
import Image from "next/image";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { FormEvent, ReactNode, useEffect, useState } from "react";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

export default function AdoptionRequestPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { data: session, isPending } = useSession();
  const [animal, setAnimal] = useState<Animal | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [housing, setHousing] = useState("");
  const [hasOtherAnimals, setHasOtherAnimals] = useState("");
  const [hasChildren, setHasChildren] = useState("");
  const [isRented, setIsRented] = useState("");

  useEffect(() => {
    if (!isPending && !session) router.replace(`/login?reason=unauthenticated`);
  }, [isPending, router, session]);

  const ownAnimal = Boolean(session && animal && (animal.userId === session.user.id || animal.owner?.id === session.user.id));
  useEffect(() => {
    if (!session || !animal) return;
    if (ownAnimal || animal.viewerRequestStatus || animal.status !== "Disponível") {
      notify(ownAnimal ? "Você não pode adotar seu próprio animal." : "Este animal já possui uma solicitação sua ou está indisponível.", "warning");
      router.replace(`/adocao/${id}`);
    }
  }, [session, animal, ownAnimal, router, id]);

  useEffect(() => {
    if (!id) return;
    fetch(`${API_BASE_URL}/api/animals/${id}`, { credentials: "include" })
      .then(async (response) => {
        if (!response.ok) throw new Error("Animal n\u00e3o encontrado.");
        setAnimal(await response.json());
      })
      .catch((cause: unknown) => setError(cause instanceof Error ? cause.message : "N\u00e3o foi poss\u00edvel carregar o animal."))
      .finally(() => setLoading(false));
  }, [id]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    if (!session) { router.replace("/login?reason=unauthenticated"); return; }
    if (!animal || ownAnimal || animal.viewerRequestStatus || animal.status !== "Disponível") return;

    const form = new FormData(event.currentTarget);
    const answers: Record<string, string | string[]> = {};
    for (const [key, value] of form.entries()) {
      if (key === "otherAnimalTypes") continue;
      answers[key] = String(value);
    }
    answers.otherAnimalTypes = form.getAll("otherAnimalTypes").map(String);

    setSubmitting(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/adoption-requests`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ animalId: animal.id, answers, notes: String(form.get("motivation") || "") }),
      });
      const result = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(result.error || "N\u00e3o foi poss\u00edvel enviar a solicita\u00e7\u00e3o.");
      notify("Solicitação de adoção enviada com sucesso.", "success");
      router.replace(`/adocao/${animal.id}`);
      router.refresh();
    } catch (cause: unknown) {
      setError(cause instanceof Error ? cause.message : "N\u00e3o foi poss\u00edvel enviar a solicita\u00e7\u00e3o.");
    } finally {
      setSubmitting(false);
    }
  }

  if (loading || isPending || !session || ownAnimal || (animal && (animal.viewerRequestStatus || animal.status !== "Disponível"))) return <PageLoading />;

  if (!animal) {
    return <div className="grid min-h-screen place-items-center bg-[#eefdf1] p-6 text-center"><div><h1 className="text-2xl font-bold">Animal n&atilde;o encontrado</h1><Link href="/adocao" className="mt-5 inline-block rounded-xl bg-[#2f7650] px-5 py-3 font-semibold text-white">Voltar para ado&ccedil;&atilde;o</Link></div></div>;
  }

  const unavailable = Boolean(animal.viewerRequestStatus) || animal.status === "Adotado";

  return (
    <div className="min-h-screen bg-[#eefdf1] text-[#121e17]">
      <SiteHeader />
      <main className="adoption-request-page mx-auto w-full max-w-[1200px] overflow-x-hidden px-3 pb-24 pt-4 sm:px-10 sm:pb-20 sm:pt-8 lg:px-20 lg:pt-12">
        <Link href={`/adocao/${animal.id}`} className="group inline-flex items-center gap-1.5 text-sm font-semibold text-[#404942] transition hover:text-[#2f7650]"><DirectionalChevron className="transition-transform group-hover:-translate-x-0.5" />Voltar para o perfil de {animal.name}</Link>
        <header className="mb-5 mt-4 sm:mb-10 sm:mt-5">
          <h1 className="text-2xl font-extrabold leading-7 tracking-[-0.02em] sm:text-5xl">Solicita&ccedil;&atilde;o de Ado&ccedil;&atilde;o</h1>
          <p className="mt-1.5 text-xs leading-4 text-[#404942] sm:mt-2 sm:text-lg sm:leading-7">Preencha o formul&aacute;rio abaixo para demonstrar seu interesse.</p>
        </header>

        <form onSubmit={handleSubmit} className="grid min-w-0 items-start gap-4 sm:gap-8 lg:grid-cols-[minmax(0,2fr)_minmax(280px,1fr)] lg:gap-12">
            <div className="min-w-0 space-y-4 sm:space-y-8">
              <AnimalSummary animal={animal} />

              {error && <Notification text={error} />}

              {unavailable ? (
                <div className="rounded-xl border border-[#d7e6da] bg-white p-8 text-center shadow-sm"><h2 className="text-xl font-bold">Solicita&ccedil;&atilde;o indispon&iacute;vel</h2><p className="mt-2 text-sm text-[#526057]">Voc&ecirc; j&aacute; possui uma solicita&ccedil;&atilde;o para este animal ou ele n&atilde;o est&aacute; mais dispon&iacute;vel.</p></div>
              ) : (
                <section className="request-form-card overflow-hidden rounded-xl border border-[#bfc9bf]/30 bg-white p-4 shadow-[0_4px_10px_rgba(38,51,43,0.04)] sm:p-8 lg:p-10">
                  <FormSection title="Moradia e ambiente">
                    <RadioQuestion legend={"Onde voc\u00ea mora?"} name="housing" options={["Casa", "Apartamento", "Outro"]} value={housing} onChange={setHousing} />
                    <RadioQuestion legend={"Sua resid\u00eancia possui espa\u00e7o externo seguro?"} name="secureOutdoorSpace" options={["Sim", "N\u00e3o"]} />
                    <RadioQuestion legend={"O im\u00f3vel \u00e9 alugado?"} name="isRented" options={["Sim", "N\u00e3o"]} value={isRented} onChange={setIsRented} />
                    {(isRented === "Sim" || housing === "Apartamento") && <RadioQuestion legend={"Animais s\u00e3o permitidos no im\u00f3vel?"} name="animalsAllowed" options={["Sim", "N\u00e3o", "N\u00e3o se aplica"]} />}
                    <RadioQuestion legend={"Onde o animal ficar\u00e1?"} name="animalArea" options={["Dentro de casa", "\u00c1rea externa", "Ambos"]} />
                  </FormSection>

                  <FormSection title={"Fam\u00edlia e conviv\u00eancia"}>
                    <NumberQuestion label={"Quantas pessoas moram com voc\u00ea?"} name="householdSize" min={1} max={30} />
                    <RadioQuestion legend={"Todos est\u00e3o de acordo com a ado\u00e7\u00e3o?"} name="householdAgreement" options={["Sim", "N\u00e3o"]} />
                    <RadioQuestion legend={"Existem crian\u00e7as na resid\u00eancia?"} name="hasChildren" options={["Sim", "N\u00e3o"]} value={hasChildren} onChange={setHasChildren} />
                    {hasChildren === "Sim" && <SelectQuestion label={"Faixa et\u00e1ria das crian\u00e7as"} name="childrenAge" options={["0 a 3 anos", "4 a 7 anos", "8 a 12 anos", "13 anos ou mais", "Mais de uma faixa"]} />}
                  </FormSection>

                  <FormSection title={"Outros animais e experi\u00eancia"}>
                    <RadioQuestion legend="Possui outros animais atualmente?" name="hasOtherAnimals" options={["Sim", "N\u00e3o"]} value={hasOtherAnimals} onChange={setHasOtherAnimals} />
                    {hasOtherAnimals === "Sim" && <div className="rounded-xl bg-[#f7fcf8] p-4"><CheckboxQuestion legend="Quais animais?" name="otherAnimalTypes" options={["C\u00e3es", "Gatos", "Outros"]} /><div className="mt-5"><RadioQuestion legend={"Eles s\u00e3o vacinados e castrados?"} name="otherAnimalsCare" options={["Sim", "Parcialmente", "N\u00e3o"]} /></div></div>}
                    <RadioQuestion legend={"J\u00e1 teve animais anteriormente?"} name="previousPets" options={["Sim", "N\u00e3o"]} />
                  </FormSection>

                  <FormSection title="Rotina e disponibilidade">
                    <SelectQuestion label={"Quanto tempo o animal ficar\u00e1 sozinho por dia?"} name="aloneTime" options={["At\u00e9 2 horas", "De 2 a 4 horas", "De 4 a 8 horas", "Mais de 8 horas"]} />
                    <SelectQuestion label="Quanto tempo consegue dedicar diariamente ao animal?" name="dailyTime" options={["Menos de 1 hora", "De 1 a 2 horas", "De 2 a 4 horas", "Mais de 4 horas"]} />
                  </FormSection>

                  <FormSection title="Responsabilidade e cuidados">
                    <RadioQuestion legend={"Possui condi\u00e7\u00f5es de arcar com alimenta\u00e7\u00e3o, vacina\u00e7\u00e3o e cuidados veterin\u00e1rios?"} name="financialCondition" options={["Sim", "N\u00e3o"]} />
                    <RadioQuestion legend={"Est\u00e1 disposto a manter vacina\u00e7\u00e3o e cuidados de sa\u00fade em dia?"} name="healthCommitment" options={["Sim", "N\u00e3o"]} />
                    <TextQuestion label={"Como pretende lidar caso o animal necessite de tratamento veterin\u00e1rio?"} name="veterinaryPlan" placeholder={"Conte como voc\u00ea se organizaria para oferecer o tratamento necess\u00e1rio..."} rows={3} />
                  </FormSection>

                  <FormSection title={"Motiva\u00e7\u00e3o"}>
                    <TextQuestion label="Por que gostaria de adotar este animal?" name="motivation" placeholder={"Conte-nos um pouco sobre suas motiva\u00e7\u00f5es..."} rows={5} />
                    <TextQuestion label="Como seria a rotina do animal em sua casa?" name="petRoutine" placeholder={"Descreva passeios, alimenta\u00e7\u00e3o, companhia e onde ele dormiria..."} rows={4} />
                    <TextQuestion label={"H\u00e1 algo que o respons\u00e1vel deveria saber? (opcional)"} name="additionalInfo" placeholder={"Compartilhe outras informa\u00e7\u00f5es importantes..."} rows={3} required={false} />
                  </FormSection>
                </section>
              )}
            </div>

            <NextSteps animal={animal} submitting={submitting} disabled={unavailable} />
        </form>
      </main>
      <SiteFooter />
    </div>
  );
}

function AnimalSummary({ animal }: { animal: Animal }) {
  return <section className="flex gap-5 rounded-xl border border-[#bfc9bf]/30 bg-white p-5 shadow-[0_4px_20px_rgba(38,51,43,0.04)] sm:gap-6 sm:p-6"><div className="relative size-24 shrink-0 overflow-hidden rounded-lg sm:size-32"><Image src={animal.image || "/images/login-cover-v2.png"} alt={animal.name} fill className="object-cover" /></div><div className="min-w-0"><h2 className="text-2xl font-semibold">{animal.name}</h2><div className="mt-3 flex flex-wrap gap-2"><Tag>{animal.species}</Tag><Tag>{animal.sex}</Tag><Tag>{animal.age}</Tag><Tag>Porte {sizeName(animal.size)}</Tag></div><div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-xs text-[#526057]"><span>Energia: {animal.energyLevel || "N\u00e3o informada"}</span><span>Sa&uacute;de: {animal.healthCondition || "sem necessidade informada"}</span></div></div></section>;
}

function NextSteps({ animal, submitting, disabled }: { animal: Animal; submitting: boolean; disabled: boolean }) {
  return <aside className="rounded-xl border border-[#bfc9bf]/30 bg-white p-6 shadow-[0_4px_10px_rgba(38,51,43,0.04)] lg:sticky lg:top-28"><h2 className="text-2xl font-semibold">Pr&oacute;ximos Passos</h2><ol className="mt-5 space-y-4 text-sm leading-6 text-[#404942]"><li><strong className="text-[#121e17]">1. An&aacute;lise</strong><br />O respons&aacute;vel por {animal.name} analisar&aacute; seu perfil e suas respostas.</li><li><strong className="text-[#121e17]">2. Retorno</strong><br />Voc&ecirc; poder&aacute; acompanhar a decis&atilde;o pelo seu perfil.</li><li><strong className="text-[#121e17]">3. Contato</strong><br />Se aprovada, a solicita&ccedil;&atilde;o permitir&aacute; o contato com o respons&aacute;vel.</li></ol><div className="mt-6 rounded-lg bg-[#e3f2e6] p-4 text-xs leading-5 text-[#404942]"><strong className="text-[#256441]">Lembre-se:</strong> a ado&ccedil;&atilde;o &eacute; um ato de amor e responsabilidade a longo prazo.</div><button type="submit" disabled={submitting || disabled} className="mt-7 w-full rounded-xl bg-[#2f7650] px-6 py-3.5 text-sm font-semibold text-white shadow-sm transition hover:-translate-y-0.5 hover:bg-[#245d3f] disabled:translate-y-0 disabled:opacity-50">{submitting ? "Enviando..." : "Enviar solicita\u00e7\u00e3o"}</button><p className="mt-3 text-center text-xs text-[#707971]">Revise as respostas antes de enviar.</p></aside>;
}

function FormSection({ title, children }: { title: string; children: ReactNode }) {
  return <section className="request-form-section border-b border-[#ddece0] py-5 first:pt-0 last:border-0 last:pb-0 sm:py-8"><h2 className="mb-3 text-base font-semibold sm:mb-6 sm:text-2xl">{title}</h2><div className="space-y-4 sm:space-y-7">{children}</div></section>;
}

function RadioQuestion({ legend, name, options, value, onChange }: { legend: string; name: string; options: string[]; value?: string; onChange?: (value: string) => void }) {
  return <fieldset><legend className="mb-2 text-xs font-semibold leading-4 tracking-[0.01em] sm:mb-3 sm:text-sm">{legend}</legend><div className="grid grid-cols-2 gap-1.5 sm:flex sm:flex-wrap sm:gap-2">{options.map((option) => <label key={option} className="flex min-h-10 min-w-0 cursor-pointer items-center gap-1.5 rounded-lg border border-[#d7e6da] bg-[#f7fcf8] px-2.5 py-2 text-[11px] leading-4 text-[#404942] transition hover:border-[#86a590] has-[:checked]:border-[#2f7650] has-[:checked]:bg-[#e3f2e6] has-[:checked]:font-semibold has-[:checked]:text-[#194b30] sm:min-h-11 sm:gap-2.5 sm:px-3.5 sm:py-2.5 sm:text-sm"><input type="radio" name={name} value={option} checked={value === undefined ? undefined : value === option} onChange={(event) => onChange?.(event.target.value)} required className="size-3.5 shrink-0 accent-[#2f7650] sm:size-4" />{option}</label>)}</div></fieldset>;
}

function CheckboxQuestion({ legend, name, options }: { legend: string; name: string; options: string[] }) {
  return <fieldset><legend className="mb-3 text-sm font-semibold">{legend}</legend><div className="grid gap-2 sm:flex sm:flex-wrap">{options.map((option) => <label key={option} className="flex min-h-11 cursor-pointer items-center gap-2.5 rounded-lg border border-[#d7e6da] bg-white px-3.5 py-2.5 text-sm text-[#404942] transition hover:border-[#86a590] has-[:checked]:border-[#2f7650] has-[:checked]:bg-[#e3f2e6] has-[:checked]:font-semibold"><input type="checkbox" name={name} value={option} className="size-4 rounded accent-[#2f7650]" />{option}</label>)}</div></fieldset>;
}

function SelectQuestion({ label, name, options }: { label: string; name: string; options: string[] }) {
  return <label className="block"><span className="mb-2 block text-sm font-semibold">{label}</span><select name={name} defaultValue="" required className="h-12 w-full rounded-lg border border-[#bfc9bf] bg-white px-4 text-sm outline-none transition focus:border-[#2f7650] focus:ring-4 focus:ring-[#2f7650]/10"><option value="" disabled>Selecione uma op&ccedil;&atilde;o</option>{options.map((option) => <option key={option}>{option}</option>)}</select></label>;
}

function NumberQuestion({ label, name, min, max }: { label: string; name: string; min: number; max: number }) {
  return <label className="block"><span className="mb-2 block text-sm font-semibold">{label}</span><input type="number" name={name} min={min} max={max} required inputMode="numeric" className="h-12 w-full max-w-48 rounded-lg border border-[#bfc9bf] bg-white px-4 outline-none transition focus:border-[#2f7650] focus:ring-4 focus:ring-[#2f7650]/10" /></label>;
}

function TextQuestion({ label, name, placeholder, rows, required = true }: { label: string; name: string; placeholder: string; rows: number; required?: boolean }) {
  return <label className="block"><span className="mb-2 block text-sm font-semibold">{label}</span><textarea name={name} rows={rows} required={required} maxLength={2000} placeholder={placeholder} className="w-full resize-y rounded-lg border border-[#bfc9bf] bg-white px-4 py-3 text-sm leading-6 outline-none transition placeholder:text-[#7b857e] focus:border-[#2f7650] focus:ring-4 focus:ring-[#2f7650]/10" /></label>;
}

function Tag({ children }: { children: ReactNode }) { return <span className="rounded-full bg-[#e3f2e6] px-3 py-1 text-xs font-medium text-[#0f5d39]">{children}</span>; }

function PageLoading() { return <SkeletonLoader fullScreen variant="form" />; }

function sizeName(size?: string) { return ({ P: "Pequeno", M: "M\u00e9dio", G: "Grande" } as Record<string, string>)[size || ""] || size || "N\u00e3o informado"; }
