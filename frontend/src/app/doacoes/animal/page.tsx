"use client";

import Link from "next/link";
import Image from "next/image";
import { FormEvent, ReactNode, useState } from "react";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";

const inputClass = "min-h-12 w-full rounded-lg border border-[#8b958e] bg-white px-3.5 text-base text-[#121e17] outline-none transition placeholder:text-[#7d8580] focus:border-[#256441] focus:ring-2 focus:ring-[#256441]/15";

function Section({ icon, title, description, children }: { icon: ReactNode; title: string; description?: string; children: ReactNode }) {
  return (
    <section className="rounded-2xl border border-[#d7e6da] bg-white p-5 shadow-[0_4px_12px_rgba(38,51,43,0.04)] sm:p-8 lg:p-10">
      <div className="mb-6 flex items-start gap-3 text-[#0f5d39]">
        <span className="mt-1 grid size-7 shrink-0 place-items-center">{icon}</span>
        <div><h2 className="text-xl font-bold sm:text-2xl">{title}</h2>{description && <p className="mt-1 text-sm leading-5 text-[#5a655e]">{description}</p>}</div>
      </div>
      {children}
    </section>
  );
}

function Field({ label, optional, children, className = "" }: { label: string; optional?: boolean; children: ReactNode; className?: string }) {
  return <label className={`flex flex-col gap-1.5 text-sm font-semibold text-[#121e17] ${className}`}><span>{label}{optional && <span className="font-normal text-[#68726b]"> (opcional)</span>}</span>{children}</label>;
}

function Select({ name, children, required = true }: { name: string; children: ReactNode; required?: boolean }) {
  return <select name={name} required={required} defaultValue="" className={`${inputClass} appearance-none bg-[linear-gradient(45deg,transparent_50%,#4d5b53_50%),linear-gradient(135deg,#4d5b53_50%,transparent_50%)] bg-[position:calc(100%-18px)_21px,calc(100%-13px)_21px] bg-[size:5px_5px,5px_5px] bg-no-repeat pr-10`}><option value="" disabled>Selecione...</option>{children}</select>;
}

function YesNoUnknown({ name, unknown = true }: { name: string; unknown?: boolean }) {
  return <div className="flex min-h-12 flex-wrap items-center gap-x-5 gap-y-2 rounded-lg border border-[#c5cec7] px-3.5">{["Sim", "Não", ...(unknown ? ["Não sei"] : [])].map((value) => <label key={value} className="inline-flex items-center gap-2 font-normal"><input type="radio" name={name} value={value} required className="size-4 accent-[#256441]" />{value}</label>)}</div>;
}

function PawIcon() {
  return <Image src="/icons/adocao.svg" alt="" width={24} height={24} className="size-5.5 object-contain" />;
}
function HealthIcon() { return <svg viewBox="0 0 24 24" className="size-6" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M9 3h6v4h4v14H5V7h4V3Zm1 12h4m-2-2v4" /></svg>; }
function HeartIcon() { return <svg viewBox="0 0 24 24" className="size-6" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M20.8 5.8a5 5 0 0 0-7.1 0L12 7.5l-1.7-1.7a5 5 0 0 0-7.1 7.1L12 21l8.8-8.1a5 5 0 0 0 0-7.1Z" /></svg>; }
function CameraIcon() { return <svg viewBox="0 0 24 24" className="size-6" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M4 7h4l2-3h4l2 3h4v13H4V7Z" /><circle cx="12" cy="13" r="4" /></svg>; }
function StoryIcon() { return <svg viewBox="0 0 24 24" className="size-5" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M5 4h11a3 3 0 0 1 3 3v13H7a3 3 0 0 1-3-3V5a1 1 0 0 1 1-1Z" /><path d="M7 16h12M8 8h7M8 11h5" strokeLinecap="round" /></svg>; }

export default function AnimalDonationPage() {
  const [sent, setSent] = useState(false);
  function submit(event: FormEvent<HTMLFormElement>) { event.preventDefault(); setSent(true); window.scrollTo({ top: 0, behavior: "smooth" }); }

  return (
    <div className="min-h-screen bg-[#eefdf1] text-[#121e17]">
      <SiteHeader />
      <main className="mx-auto max-w-[1280px] px-5 py-10 sm:px-8 sm:py-12">
        <Link href="/doacoes" className="mb-7 inline-flex items-center gap-2 rounded-lg px-2 py-1 text-sm font-semibold text-[#256441] transition hover:bg-[#e8f7eb]"><span aria-hidden="true">‹</span> Voltar às opções</Link>
        {sent && <div role="status" className="mb-8 rounded-2xl border border-[#86c99c] bg-[#e8f7eb] p-5 text-[#194b30]"><strong>Cadastro recebido!</strong><p className="mt-1 text-sm">As informações do animal foram registradas para revisão.</p></div>}
        <header className="mb-10 max-w-4xl">
          <h1 className="text-3xl font-extrabold tracking-[-0.025em] sm:text-4xl lg:text-5xl">Cadastrar animal para adoção</h1>
          <p className="mt-2 text-base leading-7 text-[#4d5b53] sm:text-lg">Preencha as informações com carinho para ajudar este animal a encontrar um novo lar seguro e amoroso.</p>
        </header>
        <form onSubmit={submit} className="grid items-start gap-8 lg:grid-cols-[minmax(0,1fr)_330px]">
          <div className="flex min-w-0 flex-col gap-7">
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

            <Section icon={<HealthIcon />} title="Saúde e cuidados" description="Caso não saiba alguma informação, selecione “Não sei”.">
              <div className="grid gap-5 sm:grid-cols-2">
                <Field label="Castrado?"><YesNoUnknown name="castrado" /></Field>
                <Field label="Situação vacinal"><Select name="vacinas"><option>Vacinas em dia</option><option>Vacinação incompleta</option><option>Não vacinado</option><option>Não sei</option></Select></Field>
                <Field label="Vermifugado?"><YesNoUnknown name="vermifugado" /></Field>
                <Field label="Possui condição de saúde ou necessidade especial?"><YesNoUnknown name="condicao" unknown={false} /></Field>
                <Field label="Descrição da condição de saúde" optional className="sm:col-span-2"><textarea name="descricaoSaude" rows={4} placeholder="Medicamentos, alimentação especial, limitações ou cuidados necessários..." className={`${inputClass} resize-y py-3`} /></Field>
              </div>
            </Section>

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

            <Section icon={<PawIcon />} title="História e contexto da adoção">
              <div className="grid gap-5 sm:grid-cols-2">
                <Field label="Motivo da adoção" className="sm:col-span-2"><textarea name="motivo" required rows={3} placeholder="Explique por que está buscando um novo lar para o animal." className={`${inputClass} resize-y py-3`} /></Field>
                <Field label="Tempo sob os cuidados do responsável"><input name="tempoCuidados" required placeholder="Ex.: 8 meses" className={inputClass} /></Field>
                <Field label="Está atualmente sob seus cuidados?"><YesNoUnknown name="sobCuidados" unknown={false} /></Field>
                <Field label="Descrição do animal" className="sm:col-span-2"><textarea name="descricao" required rows={5} placeholder="Conte a história, rotina e tudo que ajudará o futuro adotante a conhecê-lo." className={`${inputClass} resize-y py-3`} /></Field>
              </div>
            </Section>

            <Section icon={<CameraIcon />} title="Fotos" description="Adicione imagens claras e atuais. A primeira será usada como foto principal.">
              <div className="grid gap-5 sm:grid-cols-2">
                <Field label="Foto principal"><input name="fotoPrincipal" type="file" accept="image/png,image/jpeg,image/webp" required className="block w-full rounded-lg border border-dashed border-[#86a590] bg-[#f7fcf8] p-4 text-sm file:mr-3 file:rounded-lg file:border-0 file:bg-[#256441] file:px-4 file:py-2 file:font-semibold file:text-white" /></Field>
                <Field label="Outras fotos" optional><input name="fotos" type="file" accept="image/png,image/jpeg,image/webp" multiple className="block w-full rounded-lg border border-dashed border-[#86a590] bg-[#f7fcf8] p-4 text-sm file:mr-3 file:rounded-lg file:border-0 file:bg-[#e3f2e6] file:px-4 file:py-2 file:font-semibold file:text-[#256441]" /></Field>
              </div>
            </Section>

            <section className="rounded-2xl border border-[#d7e6da] bg-white p-5 sm:p-7">
              <label className="flex cursor-pointer items-start gap-3 text-sm leading-6 text-[#343e37]"><input type="checkbox" name="declaracao" required className="mt-1 size-5 shrink-0 accent-[#256441]" /><span>Declaro que sou responsável pelas informações fornecidas, que elas são verdadeiras e que agirei com transparência e responsabilidade durante o processo de adoção.</span></label>
            </section>
            <div className="grid gap-3 border-t border-[#d7e6da] pt-6 sm:grid-cols-[0.8fr_1.2fr]">
              <Link href="/doacoes" className="flex min-h-[52px] w-full items-center justify-center rounded-xl border border-[#256441] bg-white px-6 py-3 text-center text-sm font-semibold text-[#256441] transition hover:bg-[#e8f7eb] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#256441]">Cancelar</Link>
              <button type="submit" className="flex min-h-[52px] w-full items-center justify-center gap-2 rounded-xl bg-[#0f5d39] px-6 py-3 text-sm font-semibold text-white shadow-[0_4px_12px_rgba(15,93,57,0.18)] transition hover:-translate-y-0.5 hover:bg-[#194b30] hover:shadow-[0_7px_16px_rgba(15,93,57,0.22)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#256441]"><svg viewBox="0 0 20 20" className="size-4" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><path d="m5 10 3.2 3.2L15 6.5" strokeLinecap="round" strokeLinejoin="round" /></svg>Finalizar cadastro</button>
            </div>
          </div>

          <aside className="lg:sticky lg:top-28">
            <div className="mb-3 rounded-2xl border border-[#d7e6da] bg-white px-5 py-4 shadow-[0_4px_14px_rgba(38,51,43,0.04)]">
              <h2 className="text-lg font-bold text-[#194b30]">Dicas para um bom anúncio</h2>
              <p className="mt-1 text-sm leading-5 text-[#526057]">Pequenos cuidados aumentam as chances de adoção.</p>
            </div>
            <ul className="divide-y divide-[#e6eee8] rounded-2xl border border-[#d7e6da] bg-white px-5 text-sm leading-5 text-[#526057] shadow-[0_4px_14px_rgba(38,51,43,0.04)]">
              <li className="flex items-start gap-3 py-4"><span className="mt-0.5 shrink-0 text-[#256441]"><CameraIcon /></span><span><strong className="mb-0.5 block text-[#253129]">Boas fotos</strong>Use iluminação natural e mostre diferentes ângulos.</span></li>
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
