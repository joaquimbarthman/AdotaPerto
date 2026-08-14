"use client";

import Image from "next/image";
import { useState } from "react";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";

const tabs = [
  { id: "adocoes", label: "Minhas Adoções", icon: "/icons/adoptions.svg" },
  { id: "doacoes", label: "Minhas Doações", icon: "/icons/donations-profile.svg" },
  { id: "favoritos", label: "Favoritos", icon: "/icons/favorites.svg" },
  { id: "configuracoes", label: "Configurações", icon: "/icons/settings.svg" },
] as const;

const requests = [
  { name: "Max, o Golden", image: "/images/max-profile.png", tags: ["Cachorro", "Filhote", "Macho"], date: "12 Out 2023", status: "Em Análise", statusClass: "bg-[#ffdcbf] text-[#6a3b00]", action: "Ver detalhes da solicitação" },
  { name: "Luna", image: "/images/luna-profile.png", tags: ["Gato", "Jovem", "Fêmea"], date: "05 Out 2023", status: "Entrevista Agendada", statusClass: "bg-[#d7e6da] text-[#31523e]", notice: "Entrevista online agendada para 20 Out, 14:00.", action: "Ver detalhes da solicitação" },
  { name: "Pipoca", image: "/images/pipoca-profile.png", tags: ["Cachorro", "Adulto", "Macho"], date: "15 Set 2023", status: "Aprovado", statusClass: "bg-[#aff1c4] text-[#0d5130]", action: "Combinar Retirada", primary: true },
];

export default function ProfilePage() {
  const [tab, setTab] = useState<(typeof tabs)[number]["id"]>("adocoes");

  return (
    <div className="min-h-screen bg-[#eefdf1] text-[#121e17]">
      <SiteHeader />
      <main className="mx-auto max-w-[1200px] px-5 pb-24 pt-8 sm:px-10 lg:px-20">
        <section className="relative overflow-hidden rounded-2xl bg-white p-5 shadow-[0_4px_12px_rgba(38,51,43,0.05)] sm:p-6">
          <div className="absolute -bottom-20 -right-20 size-64 rounded-full bg-[#aff1c4]/20 blur-3xl" />
          <div className="relative flex flex-col items-center gap-5 sm:flex-row sm:items-start">
            <div className="relative size-28 shrink-0 overflow-hidden rounded-full border-4 border-[#d7e6da] p-1 sm:size-32"><Image src="/images/ana-profile.png" alt="Ana Silva" fill className="rounded-full object-cover" priority /></div>
            <div className="flex-1 text-center sm:text-left"><h1 className="text-[32px] font-bold leading-10 tracking-[-0.01em]">Ana Silva</h1><div className="mt-1 flex flex-wrap justify-center gap-x-4 gap-y-1 text-sm text-[#404942] sm:justify-start sm:text-base"><span className="flex items-center gap-1"><Image src="/icons/location.svg" alt="" width={14} height={17} />São Paulo, SP</span><span className="hidden size-1 self-center rounded-full bg-[#707971] sm:block" /><span className="flex items-center gap-1"><Image src="/icons/member-since.svg" alt="" width={18} height={20} />Membro desde Ago 2023</span></div><p className="mt-3 max-w-2xl text-sm leading-6 text-[#404942] sm:text-base">Apaixonada por animais e sempre disposta a ajudar. Buscando um novo membro peludo para alegrar a casa!</p></div>
            <button className="inline-flex shrink-0 items-center gap-2 rounded-xl border-2 border-[#c0c9bf] px-5 py-2.5 text-sm font-semibold text-[#256441] transition hover:border-[#256441] hover:bg-[#eefdf1]"><Image src="/icons/edit.svg" alt="" width={14} height={14} />Editar perfil</button>
          </div>
        </section>

        <div className="mt-10 grid items-start gap-8 lg:grid-cols-[220px_1fr] lg:gap-12">
          <nav className="flex gap-2 overflow-x-auto pb-2 lg:sticky lg:top-28 lg:flex-col lg:overflow-visible" aria-label="Áreas do perfil">
            {tabs.map((item, index) => <button key={item.id} onClick={() => setTab(item.id)} className={`flex shrink-0 items-center gap-3 rounded-lg px-4 py-3 text-sm font-semibold tracking-[0.04em] transition ${tab === item.id ? "bg-[#3f7d58] text-white shadow-sm" : "text-[#404942] hover:bg-white/70 hover:text-[#256441]"} ${index === 3 ? "lg:mt-3 lg:border-t lg:border-[#c0c9bf] lg:pt-5" : ""}`}><Image src={item.icon} alt="" width={20} height={20} className={tab === item.id ? "brightness-0 invert" : ""} />{item.label}</button>)}
          </nav>

          <section className="min-w-0">
            {tab === "adocoes" ? <Adoptions /> : <EmptyTab title={tabs.find((item) => item.id === tab)?.label ?? "Perfil"} />}
          </section>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}

function Adoptions() {
  return <><header className="mb-6 flex items-end justify-between gap-4"><h2 className="text-2xl font-semibold">Processos de Adoção</h2><span className="text-sm font-semibold tracking-[0.04em] text-[#707971]">3 solicitações</span></header><div className="space-y-5">{requests.map((request) => <article key={request.name} className="group grid overflow-hidden rounded-xl bg-white shadow-[0_4px_12px_rgba(38,51,43,0.05)] transition-all hover:-translate-y-0.5 hover:shadow-lg sm:grid-cols-[180px_1fr]"><div className="relative h-52 overflow-hidden sm:h-full sm:min-h-[210px]"><Image src={request.image} alt={request.name} fill className="object-cover transition-transform duration-500 group-hover:scale-105" sizes="(max-width:640px) 100vw,180px" /></div><div className="flex flex-col p-5 sm:p-6"><div className="flex flex-wrap items-start justify-between gap-3"><h3 className="text-2xl font-semibold">{request.name}</h3><span className={`rounded-full px-3 py-1.5 text-xs font-semibold ${request.statusClass}`}>{request.status}</span></div><div className="mt-2 flex flex-wrap gap-2">{request.tags.map((tag) => <span key={tag} className="rounded-full bg-[#e3f2e6] px-3 py-1.5 text-xs font-semibold text-[#404942]">{tag}</span>)}</div><p className="mt-3 flex items-center gap-2 text-sm text-[#404942] sm:text-base"><Image src="/icons/date.svg" alt="" width={15} height={15} />Solicitado em {request.date}</p>{request.notice && <p className="mt-3 rounded-lg border border-[#c0c9bf]/30 bg-[#e8f7eb] p-3 text-sm text-[#404942]">ⓘ &nbsp;{request.notice}</p>}<div className="mt-auto flex justify-end border-t border-[#c0c9bf]/30 pt-4"><button className={`rounded-xl px-5 py-2.5 text-sm font-semibold tracking-[0.04em] transition active:scale-[0.98] ${request.primary ? "bg-[#256441] text-white hover:bg-[#194b30]" : "border-2 border-[#256441] text-[#256441] hover:bg-[#256441] hover:text-white"}`}>{request.action}</button></div></div></article>)}</div></>;
}

function EmptyTab({ title }: { title: string }) {
  return <div className="rounded-2xl bg-white p-10 text-center shadow-[0_4px_12px_rgba(38,51,43,0.05)]"><h2 className="text-2xl font-semibold">{title}</h2><p className="mt-2 text-[#404942]">Esta área será preenchida conforme você utilizar a plataforma.</p></div>;
}
