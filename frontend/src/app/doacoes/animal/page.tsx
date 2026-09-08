"use client";

import { Notification, notify } from "@/components/notification";

import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { FormEvent, useEffect, useRef, useState } from "react";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { useSession } from "@/lib/auth-client";
import { uploadImages } from "@/lib/uploads";
import { DonationField as Field, DonationFormSection as Section, DonationPhotoPreview as PhotoPreview, DonationSelect as Select, DonationStepProgress, donationInputClass as inputClass } from "@/components/donation-form-ui";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

function YesNoUnknown({ name, unknown = true }: { name: string; unknown?: boolean }) {
  return <div className="donation-radio-group flex min-h-11 flex-wrap items-center gap-x-4 gap-y-1.5 rounded-lg border border-[#c5cec7] px-3 sm:min-h-12 sm:gap-x-5 sm:gap-y-2 sm:px-3.5">{["Sim", "Não", ...(unknown ? ["Não sei"] : [])].map((value) => <label key={value} className="inline-flex items-center gap-1.5 text-xs font-normal sm:gap-2 sm:text-sm"><input type="radio" name={name} value={value} required className="size-3.5 accent-[#256441] sm:size-4" />{value}</label>)}</div>;
}

function PawIcon() {
  return <Image src="/icons/adocao.svg" alt="" width={24} height={24} className="size-5.5 object-contain" />;
}
function HealthIcon() { return <svg viewBox="0 0 24 24" className="size-6" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M9 3h6v4h4v14H5V7h4V3Zm1 12h4m-2-2v4" /></svg>; }
function HeartIcon() { return <svg viewBox="0 0 24 24" className="size-6" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M20.8 5.8a5 5 0 0 0-7.1 0L12 7.5l-1.7-1.7a5 5 0 0 0-7.1 7.1L12 21l8.8-8.1a5 5 0 0 0 0-7.1Z" /></svg>; }
function StoryIcon() { return <svg viewBox="0 0 24 24" className="size-5" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M5 4h11a3 3 0 0 1 3 3v13H7a3 3 0 0 1-3-3V5a1 1 0 0 1 1-1Z" /><path d="M7 16h12M8 8h7M8 11h5" strokeLinecap="round" /></svg>; }

export default function AnimalDonationPage() {
  const router = useRouter();
  const { data: session, isPending } = useSession();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mainPhoto, setMainPhoto] = useState<File | null>(null);
  const [extraPhotos, setExtraPhotos] = useState<File[]>([]);
  const [mainInputKey, setMainInputKey] = useState(0);
  const [extraInputKey, setExtraInputKey] = useState(0);
  const [editId, setEditId] = useState<string | null>(null);
  const [editData, setEditData] = useState<Record<string, unknown> | null>(null);
  const [step, setStep] = useState(0);
  const formRef = useRef<HTMLFormElement>(null);

  const steps = ["Informações básicas", "Saúde", "Comportamento", "História", "Fotos e confirmação"] as const;

  function goToNextStep() {
    setError(null);
    const container = formRef.current?.querySelector<HTMLElement>(`[data-donation-step="${step}"]`);
    const controls = container?.querySelectorAll<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>("input, select, textarea");
    for (const control of controls || []) {
      if (!control.checkValidity()) { control.reportValidity(); return; }
    }
    setStep((current) => Math.min(current + 1, steps.length - 1));
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  useEffect(() => {
    if (!isPending && !session) router.replace("/login?reason=unauthenticated");
  }, [isPending, router, session]);

  useEffect(() => {
    const id = new URLSearchParams(window.location.search).get("edit");
    if (id) queueMicrotask(() => setEditId(id));
  }, []);

  useEffect(() => {
    if (!editId) return;
    fetch(`${API_BASE_URL}/api/animals/${editId}`, { credentials: "include" })
      .then(async (response) => { if (!response.ok) throw new Error("Anúncio não encontrado."); return response.json(); })
      .then(setEditData)
      .catch((cause: unknown) => setError(cause instanceof Error ? cause.message : "Não foi possível carregar o anúncio."));
  }, [editId]);

  useEffect(() => {
    if (!editData || !formRef.current) return;
    const values: Record<string, unknown> = {
      nome: editData.name, especie: editData.species === "Cachorro" ? "Cão" : editData.species, sexo: editData.sex,
      idade: editData.age, porte: editData.size === "P" ? "Pequeno" : editData.size === "G" ? "Grande" : "Médio", raca: editData.breed,
      castrado: editData.neutered, vacinas: editData.vaccination, vermifugado: editData.dewormed,
      condicao: editData.hasHealthCondition ? "Sim" : "Não", descricaoSaude: editData.healthCondition,
      energia: editData.energyLevel, caes: editData.livesWithDogs, gatos: editData.livesWithCats, criancas: editData.livesWithChildren,
      personalidade: editData.personality, comportamento: editData.behaviorNotes, motivo: editData.adoptionReason,
      tempoCuidados: editData.timeInCare, sobCuidados: editData.currentlyInCare ? "Sim" : "Não", descricao: editData.description,
    };
    Object.entries(values).forEach(([name, value]) => {
      if (value == null) return;
      const controls = formRef.current?.elements.namedItem(name);
      if (controls instanceof RadioNodeList) controls.value = String(value);
      else if (controls instanceof HTMLInputElement || controls instanceof HTMLSelectElement || controls instanceof HTMLTextAreaElement) controls.value = String(value);
    });
  }, [editData]);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    if (!session) {
      setError("Você precisa estar conectado para cadastrar um animal para adoção.");
      router.push("/login");
      return;
    }

    if (!mainPhoto && !editData?.image) {
      setError("Selecione uma foto principal do animal.");
      return;
    }

    const formData = new FormData(event.currentTarget);
    const sizeMap: Record<string, string> = { "Pequeno": "P", "Médio": "M", "Grande": "G" };
    const rawPorte = formData.get("porte") as string;
    const porte = sizeMap[rawPorte] || rawPorte || "M";

    setLoading(true);
    try {
      const files = [mainPhoto, ...extraPhotos].filter((file): file is File => file instanceof File);
      const uploadedUrls = await uploadImages(files);
      const image = mainPhoto ? uploadedUrls[0] : String(editData?.image || "/images/login-cover-v2.png");
      const images = extraPhotos.length ? uploadedUrls.slice(mainPhoto ? 1 : 0) : (Array.isArray(editData?.images) ? editData.images : []);

      const payload = {
      name: formData.get("nome") as string,
      species: (formData.get("especie") as string) === "Cão" ? "Cachorro" : (formData.get("especie") as string) || "Cachorro",
      sex: formData.get("sexo") as string,
      age: formData.get("idade") as string,
      size: porte,
      breed: (formData.get("raca") as string) || "SRD",
      neutered: formData.get("castrado") as string,
      vaccination: formData.get("vacinas") as string,
      dewormed: formData.get("vermifugado") as string,
      hasHealthCondition: formData.get("condicao") === "Sim",
      healthCondition: formData.get("descricaoSaude") as string,
      energyLevel: formData.get("energia") as string,
      livesWithDogs: formData.get("caes") as string,
      livesWithCats: formData.get("gatos") as string,
      livesWithChildren: formData.get("criancas") as string,
      personality: formData.get("personalidade") as string,
      behaviorNotes: formData.get("comportamento") as string,
      adoptionReason: formData.get("motivo") as string,
      timeInCare: formData.get("tempoCuidados") as string,
      currentlyInCare: formData.get("sobCuidados") === "Sim",
      description: formData.get("descricao") as string,
      image,
      images,
      status: String(editData?.status || "Disponível"),
      };

      const res = await fetch(`${API_BASE_URL}/api/animals${editId ? `/${editId}` : ""}`, {
        method: editId ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Erro ao salvar cadastro do animal.");
      }

      notify(editId ? "Animal atualizado com sucesso." : "Animal cadastrado com sucesso.", "success");
      router.push(editId ? "/perfil#publicacoes" : "/adocao");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Erro ao cadastrar animal.");
    } finally {
      setLoading(false);
    }
  }

  if (isPending || !session) return <div className="min-h-screen bg-[#eefdf1]"><SiteHeader /><main className="grid min-h-[60vh] place-items-center"><span className="size-6 animate-spin rounded-full border-2 border-[#b8d8c1] border-t-[#256441]" aria-label="Verificando acesso" /></main></div>;

  return (
    <div className="min-h-screen bg-[#eefdf1] text-[#121e17]">
      <SiteHeader />
      <main className="donation-form-page mx-auto w-full max-w-[1120px] px-3 pb-24 pt-4 sm:px-8 sm:py-12 lg:px-16">
        <Link href={editId ? "/perfil#publicacoes" : "/doacoes"} className="mb-4 inline-flex items-center gap-1.5 rounded-lg px-1 py-1 text-xs font-semibold text-[#256441] transition hover:bg-[#e8f7eb] sm:mb-7 sm:gap-2 sm:px-2 sm:text-sm"><span aria-hidden="true">‹</span> {editId ? "Voltar às publicações" : "Voltar às opções"}</Link>
        
        {error && <Notification text={error} />}

        <header className="mb-5 max-w-4xl sm:mb-10">
          <h1 className="text-2xl font-extrabold leading-7 tracking-[-0.025em] sm:text-4xl lg:text-5xl">{editId ? "Editar anúncio do animal" : "Cadastrar animal para adoção"}</h1>
          <p className="mt-1.5 text-xs leading-4 text-[#4d5b53] sm:mt-2 sm:text-lg sm:leading-7">Preencha as informações com carinho para ajudar este animal a encontrar um novo lar seguro e amoroso.</p>
        </header>

        <form ref={formRef} onSubmit={submit} className="donation-form mx-auto grid max-w-[1120px] items-start gap-4 sm:gap-8 lg:grid-cols-[minmax(0,1fr)_300px]">
          <div className="donation-form-fields flex min-w-0 flex-col gap-4 sm:gap-7">
            <DonationStepProgress steps={steps} current={step} />
            <div data-donation-step="0" className={step === 0 ? "donation-step-panel" : "hidden"}>
            <Section icon={<PawIcon />} title="Informações básicas">
              <div className="grid gap-5 sm:grid-cols-2">
                <Field label="Nome"><input name="nome" required placeholder="Ex.: Caramelo" className={inputClass} /></Field>
                <Field label="Espécie"><Select name="especie"><option>Cão</option><option>Gato</option><option>Outro</option></Select></Field>
                <Field label="Sexo"><Select name="sexo"><option>Fêmea</option><option>Macho</option><option>Não identificado</option></Select></Field>
                <Field label="Idade aproximada"><input name="idade" required placeholder="Ex.: 2 anos" className={inputClass} /></Field>
                <Field label="Porte"><Select name="porte"><option>Pequeno</option><option>Médio</option><option>Grande</option></Select></Field>
                <Field label="Raça" optional><input name="raca" placeholder="Ex.: Sem raça definida" className={inputClass} /></Field>
              </div>
            </Section>
            </div>

            <div data-donation-step="1" className={step === 1 ? "donation-step-panel" : "hidden"}>
            <Section icon={<HealthIcon />} title="Saúde e cuidados" description="Caso não saiba alguma informação, selecione “Não sei”.">
              <div className="grid gap-5 sm:grid-cols-2 sm:items-end">
                <Field label="Castrado?"><YesNoUnknown name="castrado" /></Field>
                <Field label="Situação vacinal"><Select name="vacinas"><option>Vacinas em dia</option><option>Vacinação incompleta</option><option>Não vacinado</option><option>Não sei</option></Select></Field>
                <Field label="Vermifugado?"><YesNoUnknown name="vermifugado" /></Field>
                <Field label="Possui condição de saúde ou necessidade especial?"><YesNoUnknown name="condicao" unknown={false} /></Field>
                <Field label="Descrição da condição de saúde" optional className="sm:col-span-2"><textarea name="descricaoSaude" rows={4} placeholder="Medicamentos, alimentação especial, limitações ou cuidados necessários..." className={`${inputClass} resize-y py-3`} /></Field>
              </div>
            </Section>
            </div>

            <div data-donation-step="2" className={step === 2 ? "donation-step-panel" : "hidden"}>
            <Section icon={<HeartIcon />} title="Convivência e comportamento">
              <div className="grid gap-5 sm:grid-cols-2">
                <Field label="Nível de energia"><Select name="energia"><option>Baixo</option><option>Moderado</option><option>Alto</option></Select></Field>
                <Field label="Convive com cães?"><YesNoUnknown name="caes" /></Field>
                <Field label="Convive com gatos?"><YesNoUnknown name="gatos" /></Field>
                <Field label="Convive com crianças?"><YesNoUnknown name="criancas" /></Field>
                <Field label="Personalidade" className="sm:col-span-2"><textarea name="personalidade" required rows={4} placeholder="Conte se ele é carinhoso, tímido, brincalhão, protetor..." className={`${inputClass} resize-y py-3`} /></Field>
                <Field label="Observações sobre comportamento" optional className="sm:col-span-2"><textarea name="comportamento" rows={4} placeholder="Medos, hábitos, adaptação, treinamento ou outras informações..." className={`${inputClass} resize-y py-3`} /></Field>
              </div>
            </Section>
            </div>

            <div data-donation-step="3" className={step === 3 ? "donation-step-panel" : "hidden"}>
            <Section icon={<PawIcon />} title="História e contexto da adoção">
              <div className="grid gap-5 sm:grid-cols-2">
                <Field label="Motivo da adoção" className="sm:col-span-2"><textarea name="motivo" required rows={3} placeholder="Explique por que está buscando um novo lar para o animal." className={`${inputClass} resize-y py-3`} /></Field>
                <Field label="Tempo sob os cuidados do responsável"><input name="tempoCuidados" required placeholder="Ex.: 8 meses" className={inputClass} /></Field>
                <Field label="Está atualmente sob seus cuidados?"><YesNoUnknown name="sobCuidados" unknown={false} /></Field>
                <Field label="Descrição do animal" className="sm:col-span-2"><textarea name="descricao" required rows={5} placeholder="Conte a história, rotina e tudo que ajudará o futuro adotante a conhecê-lo." className={`${inputClass} resize-y py-3`} /></Field>
              </div>
            </Section>
            </div>

            <div data-donation-step="4" className={step === 4 ? "donation-step-panel space-y-4 sm:space-y-7" : "hidden"}>
            <Section icon={<Image src="/icons/gallery.svg" alt="" width={24} height={24} className="size-6 object-contain" />} title="Fotos" description="Adicione imagens claras e atuais. A primeira será usada como foto principal.">
              <div className="grid gap-5 sm:grid-cols-2">
                <div className="flex flex-col gap-1.5 text-sm font-semibold text-[#121e17]">
                  <span>Foto principal</span>
                  <input key={mainInputKey} name="fotoPrincipal" type="file" accept="image/png,image/jpeg,image/webp" onChange={(event) => setMainPhoto(event.target.files?.[0] || null)} className="block w-full rounded-lg border border-dashed border-[#86a590] bg-[#f7fcf8] p-4 text-sm file:mr-3 file:rounded-lg file:border-0 file:bg-[#256441] file:px-4 file:py-2 file:font-semibold file:text-white" />
                  {mainPhoto && <div className="mt-2 max-w-52"><PhotoPreview file={mainPhoto} label="foto principal" onRemove={() => { setMainPhoto(null); setMainInputKey((value) => value + 1); }} /></div>}
                  {!mainPhoto && typeof editData?.image === "string" && <div className="relative mt-2 h-32 max-w-52 overflow-hidden rounded-xl"><Image src={editData.image} alt="Foto atual" fill className="object-cover" /><span className="absolute bottom-2 left-2 rounded-md bg-black/65 px-2 py-1 text-xs text-white">Foto atual</span></div>}
                </div>
                <div className="flex flex-col gap-1.5 text-sm font-semibold text-[#121e17]">
                  <span>Outras fotos <span className="font-normal text-[#68726b]">(opcional, até 5)</span></span>
                  <input key={extraInputKey} name="fotos" type="file" accept="image/png,image/jpeg,image/webp" multiple onChange={(event) => { const selected = Array.from(event.target.files || []).slice(0, 5); setExtraPhotos(selected); }} className="block w-full rounded-lg border border-dashed border-[#86a590] bg-[#f7fcf8] p-4 text-sm file:mr-3 file:rounded-lg file:border-0 file:bg-[#e3f2e6] file:px-4 file:py-2 file:font-semibold file:text-[#256441]" />
                  {extraPhotos.length > 0 && <span className="text-xs font-normal text-[#526057]">{extraPhotos.length} foto(s) adicional(is) selecionada(s)</span>}
                </div>
              </div>
              {extraPhotos.length > 0 && (
                <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-5">
                  {extraPhotos.map((file, index) => <PhotoPreview key={`${file.name}-${file.lastModified}-${index}`} file={file} label={`foto adicional ${index + 1}`} onRemove={() => { setExtraPhotos((photos) => photos.filter((_, photoIndex) => photoIndex !== index)); setExtraInputKey((value) => value + 1); }} />)}
                </div>
              )}
            </Section>
            <section className="rounded-2xl border border-[#d7e6da] bg-white p-5 sm:p-7">
              <label className="flex cursor-pointer items-start gap-3 text-sm leading-6 text-[#343e37]"><input type="checkbox" name="declaracao" required className="mt-1 size-5 shrink-0 accent-[#256441]" /><span>Declaro que sou responsável pelas informações fornecidas, que elas são verdadeiras e que agirei com transparência e responsabilidade durante o processo de adoção.</span></label>
            </section>
            </div>
            
            <div className="donation-form-actions grid grid-cols-2 gap-2 border-t border-[#d7e6da] pt-4 sm:gap-3 sm:pt-6">
              {step === 0 ? <Link href={editId ? "/perfil#publicacoes" : "/doacoes"} className="flex min-h-[52px] w-full items-center justify-center rounded-xl border border-[#256441] bg-white px-6 py-3 text-center text-sm font-semibold text-[#256441] transition hover:bg-[#e8f7eb]">Cancelar</Link> : <button type="button" onClick={() => setStep((current) => current - 1)} className="flex min-h-[52px] w-full items-center justify-center rounded-xl border border-[#256441] bg-white px-6 py-3 text-sm font-semibold text-[#256441] transition hover:bg-[#e8f7eb]">Voltar</button>}
              {step < steps.length - 1 ? <button type="button" onClick={goToNextStep} className="flex min-h-[52px] w-full items-center justify-center rounded-xl bg-[#0f5d39] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#194b30]">Continuar</button> : <button type="submit" disabled={loading} className="flex min-h-[52px] w-full items-center justify-center gap-2 rounded-xl bg-[#0f5d39] px-6 py-3 text-sm font-semibold text-white shadow-[0_4px_12px_rgba(15,93,57,0.18)] transition hover:-translate-y-0.5 hover:bg-[#194b30] hover:shadow-[0_7px_16px_rgba(15,93,57,0.22)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#256441] disabled:opacity-60">
                <svg viewBox="0 0 20 20" className="size-4" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><path d="m5 10 3.2 3.2L15 6.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
                {loading ? "Salvando..." : editId ? "Salvar alterações" : "Finalizar cadastro"}
              </button>}
            </div>
          </div>

          <aside className="donation-form-tips lg:sticky lg:top-28">
            <div className="mb-3 rounded-2xl border border-[#d7e6da] bg-white px-5 py-4 shadow-[0_4px_14px_rgba(38,51,43,0.04)]">
              <h2 className="text-lg font-bold text-[#194b30]">Dicas para um bom anúncio</h2>
              <p className="mt-1 text-sm leading-5 text-[#526057]">Pequenos cuidados aumentam as chances de adoção.</p>
            </div>
            <ul className="divide-y divide-[#e6eee8] rounded-2xl border border-[#d7e6da] bg-white px-5 text-sm leading-5 text-[#526057] shadow-[0_4px_14px_rgba(38,51,43,0.04)]">
              <li className="flex items-start gap-3 py-4"><span className="mt-0.5 grid size-6 shrink-0 place-items-center"><Image src="/icons/gallery.svg" alt="" width={24} height={24} className="size-6 object-contain" /></span><span><strong className="mb-0.5 block text-[#253129]">Boas fotos</strong>Use iluminação natural e mostre diferentes ângulos.</span></li>
              <li className="flex items-start gap-3 py-4"><span className="mt-0.5 shrink-0 text-[#256441]"><HeartIcon /></span><span><strong className="mb-0.5 block text-[#253129]">Seja honesto</strong>Descreva a personalidade e os cuidados reais para evitar devoluções.</span></li>
              <li className="flex items-start gap-3 py-4"><span className="mt-0.5 shrink-0 text-[#256441]"><StoryIcon /></span><span><strong className="mb-0.5 block text-[#253129]">Conte a história</strong>Um relato verdadeiro cria conexão com possíveis adotantes.</span></li>
            </ul>
          </aside>
        </form>
      </main>
      <SiteFooter />
    </div>
  );
}
