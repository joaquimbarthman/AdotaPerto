"use client";

import { DirectionalChevron } from "@/components/directional-chevron";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import type { Animal } from "@/data/animals";
import Image from "next/image";
import { SkeletonLoader } from "@/components/skeleton-loader";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

type RequestDetails = {
  id: string;
  status: string;
  answers: Record<string, string | string[]> | null;
  compatibilityScore: number | null;
  compatibilityDetails: string[] | null;
  animal: Animal;
  requester: { name: string; image?: string | null; city?: string | null; state?: string | null };
};

const groups = [
  { title: "Moradia e ambiente", fields: [["housing", "Onde mora"], ["secureOutdoorSpace", "Espaço externo seguro"], ["isRented", "Imóvel alugado"], ["animalsAllowed", "Animais permitidos"], ["animalArea", "Onde o animal ficará"]] },
  { title: "Família e convivência", fields: [["householdSize", "Pessoas na residência"], ["householdAgreement", "Todos concordam"], ["hasChildren", "Existem crianças"], ["childrenAge", "Faixa etária"]] },
  { title: "Outros animais e experiência", fields: [["hasOtherAnimals", "Possui outros animais"], ["otherAnimalTypes", "Tipos de animais"], ["otherAnimalsCare", "Vacinados e castrados"], ["previousPets", "Já teve animais"]] },
  { title: "Rotina e disponibilidade", fields: [["aloneTime", "Tempo sozinho por dia"], ["dailyTime", "Dedicação diária"], ["petRoutine", "Rotina planejada"]] },
  { title: "Responsabilidade e cuidados", fields: [["financialCondition", "Condições financeiras"], ["healthCommitment", "Cuidados de saúde em dia"], ["veterinaryPlan", "Plano para tratamento veterinário"]] },
  { title: "Motivação", fields: [["motivation", "Por que deseja adotar"], ["additionalInfo", "Informações adicionais"]] },
] as const;

export default function RequestDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const [request, setRequest] = useState<RequestDetails | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch(`${API_BASE_URL}/api/adoption-requests/${id}`, { credentials: "include" })
      .then(async (response) => {
        const result = await response.json().catch(() => ({}));
        if (!response.ok) throw new Error(result.error || "Não foi possível carregar a solicitação.");
        setRequest(result);
      })
      .catch((cause: unknown) => setError(cause instanceof Error ? cause.message : "Não foi possível carregar a solicitação."));
  }, [id]);

  if (error) return <StatePage title="Não foi possível abrir os detalhes" message={error} />;
  if (!request) return <SkeletonLoader fullScreen variant="detail" />;

  const answers = request.answers || {};
  const score = request.compatibilityScore ?? 0;
  const tone = score >= 75 ? { label: "Alta compatibilidade", color: "#2f7650", bg: "bg-[#e3f2e6]" } : score >= 50 ? { label: "Compatibilidade moderada", color: "#b36b16", bg: "bg-[#fff2e5]" } : { label: "Baixa compatibilidade", color: "#b33a3a", bg: "bg-red-50" };

  return (
    <div className="min-h-screen bg-[#eefdf1] text-[#121e17]">
      <SiteHeader />
      <main className="request-analysis-page mx-auto w-full max-w-[1120px] overflow-x-hidden px-3 pb-24 pt-4 sm:px-10 sm:py-8 lg:px-20 lg:py-12">
        <Link href="/perfil#solicitacoes" className="group inline-flex items-center gap-1.5 text-sm font-semibold text-[#404942] transition hover:text-[#256441]"><DirectionalChevron className="transition-transform group-hover:-translate-x-0.5" />Voltar para solicitações</Link>

        <header className="mt-4 flex flex-row items-start justify-between gap-2 sm:mt-6 sm:items-end">
          <div><p className="text-sm font-semibold text-[#256441]">Análise da solicitação</p><h1 className="mt-1 text-3xl font-extrabold tracking-[-0.02em] sm:text-4xl">Perfil de {request.requester.name}</h1><p className="mt-2 text-[#526057]">Respostas enviadas para a adoção de {request.animal.name}. Este formulário é somente para visualização.</p></div>
          <span className="w-fit rounded-full bg-[#aff1c4] px-4 py-2 text-xs font-bold text-[#0d5130]">{request.status === "PENDING" ? "Em análise" : request.status}</span>
        </header>

        <div className="mt-4 grid min-w-0 items-start gap-4 sm:mt-8 sm:gap-8 lg:grid-cols-[minmax(0,1fr)_320px]">
          <div className="min-w-0 space-y-3 sm:space-y-6">
            <section className="flex items-center gap-4 rounded-xl border border-[#bfc9bf]/30 bg-white p-5 shadow-sm">
              <div className="relative size-16 overflow-hidden rounded-full bg-[#e3f2e6]">{request.requester.image ? <Image src={request.requester.image} alt={request.requester.name} fill className="object-cover" /> : <span className="grid size-full place-items-center text-xl font-bold text-[#256441]">{request.requester.name.charAt(0)}</span>}</div>
              <div><h2 className="font-bold">{request.requester.name}</h2><p className="mt-1 text-sm text-[#526057]">{[request.requester.city, request.requester.state].filter(Boolean).join(", ") || "Localização não informada"}</p></div>
            </section>

            {groups.map((group) => {
              const visible = group.fields.filter(([key]) => valueExists(answers[key]));
              if (!visible.length) return null;
              return <section key={group.title} className="rounded-xl border border-[#bfc9bf]/30 bg-white p-5 shadow-[0_4px_10px_rgba(38,51,43,0.04)] sm:p-7"><h2 className="border-b border-[#ddece0] pb-4 text-xl font-semibold">{group.title}</h2><dl className="mt-5 grid gap-x-8 gap-y-5 sm:grid-cols-2">{visible.map(([key, label]) => <div key={key} className={String(answers[key]).length > 90 ? "col-span-2" : ""}><dt className="text-xs font-bold uppercase tracking-[0.04em] text-[#707971]">{label}</dt><dd className="mt-1.5 whitespace-pre-wrap text-sm leading-6 text-[#253129]">{formatValue(answers[key])}</dd></div>)}</dl></section>;
            })}
          </div>

          <aside className="request-analysis-sidebar order-first min-w-0 space-y-3 sm:space-y-6 lg:order-none lg:sticky lg:top-28">
            <section className="rounded-xl border border-[#bfc9bf]/30 bg-white p-6 shadow-sm">
              <div className="flex items-end justify-between gap-3"><div><p className="text-sm font-semibold text-[#526057]">Compatibilidade estimada</p><p className="mt-1 text-4xl font-extrabold" style={{ color: tone.color }}>{score}%</p></div><span className={`rounded-full px-3 py-1.5 text-xs font-bold ${tone.bg}`} style={{ color: tone.color }}>{tone.label}</span></div>
              <div className="mt-5 h-3 overflow-hidden rounded-full bg-[#e7eee9]" role="progressbar" aria-label="Compatibilidade estimada" aria-valuemin={0} aria-valuemax={100} aria-valuenow={score}><div className="h-full rounded-full transition-[width] duration-700" style={{ width: `${score}%`, backgroundColor: tone.color }} /></div>
              <p className="mt-3 text-xs leading-5 text-[#707971]">Estimativa de apoio à análise. A decisão final deve considerar a conversa e o bem-estar do animal.</p>
            </section>

            <section className="rounded-xl border border-[#bfc9bf]/30 bg-white p-6 shadow-sm"><h2 className="font-bold">Pontos da análise</h2><ul className="mt-4 space-y-3">{(request.compatibilityDetails || []).map((detail) => <li key={detail} className="flex gap-2.5 text-sm leading-5 text-[#404942]"><span className="mt-1 size-2 shrink-0 rounded-full" style={{ backgroundColor: tone.color }} />{detail}</li>)}</ul></section>

            <section className="flex items-center gap-4 rounded-xl bg-[#f7fcf8] p-4"><div className="relative size-16 shrink-0 overflow-hidden rounded-lg"><Image src={request.animal.image || "/images/login-cover-v2.png"} alt={request.animal.name} fill className="object-cover" /></div><div><p className="text-xs font-semibold text-[#707971]">Animal</p><h2 className="font-bold">{request.animal.name}</h2><Link href={`/adocao/${request.animal.id}`} className="mt-1 inline-block text-xs font-semibold text-[#256441] hover:underline">Ver perfil</Link></div></section>
          </aside>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}

function valueExists(value: string | string[] | undefined) { return Array.isArray(value) ? value.length > 0 : Boolean(value); }
function formatValue(value: string | string[] | undefined) { return Array.isArray(value) ? value.join(", ") : value || "Não informado"; }
function StatePage({ title, message }: { title: string; message: string }) { return <div className="grid min-h-screen place-items-center bg-[#eefdf1] p-6 text-center"><div><h1 className="text-2xl font-bold">{title}</h1><p className="mt-2 text-[#526057]">{message}</p><Link href="/perfil#solicitacoes" className="mt-5 inline-flex items-center gap-1 rounded-xl bg-[#256441] px-5 py-3 font-semibold text-white"><DirectionalChevron />Voltar</Link></div></div>; }
