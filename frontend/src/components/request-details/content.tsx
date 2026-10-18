import { DirectionalChevron } from "@/components/directional-chevron";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import Image from "next/image";
import Link from "next/link";
import type { RequestDetails } from "./data";
import { groups, valueExists, formatValue } from "./data";
import { RequestDetailsSidebar } from "./sidebar";

export function RequestDetailsContent({ request }: { request: RequestDetails }) {
  const answers = request.answers || {};
  const score = request.compatibilityScore ?? 0;
  const tone =
    score >= 75
      ? { label: "Alta compatibilidade", color: "#2f7650", bg: "bg-[#e3f2e6]" }
      : score >= 50
        ? {
            label: "Compatibilidade moderada",
            color: "#b36b16",
            bg: "bg-[#fff2e5]",
          }
        : { label: "Baixa compatibilidade", color: "#b33a3a", bg: "bg-red-50" };

  return (
    <div className="min-h-screen bg-[#eefdf1] text-[#121e17]">
      <SiteHeader />
      <main className="request-analysis-page mx-auto w-full max-w-280 overflow-x-hidden px-3 pb-24 pt-4 sm:px-10 sm:py-8 lg:px-20 lg:py-12">
        <Link
          href="/perfil#solicitacoes"
          className="group inline-flex items-center gap-1.5 text-sm font-semibold text-[#404942] transition hover:text-[#256441]"
        >
          <DirectionalChevron className="transition-transform group-hover:-translate-x-0.5" />
          Voltar para solicitações
        </Link>

        <header className="mt-4 flex flex-row items-start justify-between gap-2 sm:mt-6 sm:items-end">
          <div>
            <p className="text-sm font-semibold text-[#256441]">
              Análise da solicitação
            </p>
            <h1 className="mt-1 text-3xl font-extrabold tracking-[-0.02em] sm:text-4xl">
              Perfil de {request.requester.name}
            </h1>
            <p className="mt-2 text-[#526057]">
              Respostas enviadas para a adoção de {request.animal.name}. Este
              formulário é somente para visualização.
            </p>
          </div>
          <span className="w-fit rounded-full bg-[#aff1c4] px-4 py-2 text-xs font-bold text-[#0d5130]">
            {request.status === "PENDING" ? "Em análise" : request.status}
          </span>
        </header>

        <div className="mt-4 grid min-w-0 items-start gap-4 sm:mt-8 sm:gap-8 lg:grid-cols-[minmax(0,1fr)_320px]">
          <div className="min-w-0 space-y-3 sm:space-y-6">
            <section className="flex items-center gap-4 rounded-xl border border-[#bfc9bf]/30 bg-white p-5 shadow-sm">
              <div className="relative size-16 overflow-hidden rounded-full bg-[#e3f2e6]">
                {request.requester.image ? (
                  <Image
                    src={request.requester.image}
                    alt={request.requester.name}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <span className="grid size-full place-items-center text-xl font-bold text-[#256441]">
                    {request.requester.name.charAt(0)}
                  </span>
                )}
              </div>
              <div>
                <h2 className="font-bold">{request.requester.name}</h2>
                <p className="mt-1 text-sm text-[#526057]">
                  {[request.requester.city, request.requester.state]
                    .filter(Boolean)
                    .join(", ") || "Localização não informada"}
                </p>
              </div>
            </section>

            {groups.map((group) => {
              const visible = group.fields.filter(([key]) =>
                valueExists(answers[key]),
              );
              if (!visible.length) return null;
              return (
                <section
                  key={group.title}
                  className="rounded-xl border border-[#bfc9bf]/30 bg-white p-5 shadow-[0_4px_10px_rgba(38,51,43,0.04)] sm:p-7"
                >
                  <h2 className="border-b border-[#ddece0] pb-4 text-xl font-semibold">
                    {group.title}
                  </h2>
                  <dl className="mt-5 grid gap-x-8 gap-y-5 sm:grid-cols-2">
                    {visible.map(([key, label]) => (
                      <div
                        key={key}
                        className={
                          String(answers[key]).length > 90 ? "col-span-2" : ""
                        }
                      >
                        <dt className="text-xs font-bold uppercase tracking-[0.04em] text-[#707971]">
                          {label}
                        </dt>
                        <dd className="mt-1.5 whitespace-pre-wrap text-sm leading-6 text-[#253129]">
                          {formatValue(answers[key])}
                        </dd>
                      </div>
                    ))}
                  </dl>
                </section>
              );
            })}
          </div>

          <RequestDetailsSidebar request={request} score={score} tone={tone} />
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
