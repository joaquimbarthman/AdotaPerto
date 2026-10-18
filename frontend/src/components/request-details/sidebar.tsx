import Image from "next/image";
import Link from "next/link";
import type { RequestDetails } from "./data";

type Tone = { label: string; color: string; bg: string };
export function RequestDetailsSidebar({ request, score, tone }: { request: RequestDetails; score: number; tone: Tone }) {
 return (
<aside className="request-analysis-sidebar order-first min-w-0 space-y-3 sm:space-y-6 lg:order-none lg:sticky lg:top-28">
            <section className="rounded-xl border border-[#bfc9bf]/30 bg-white p-6 shadow-sm">
              <div className="flex items-end justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold text-[#526057]">
                    Compatibilidade estimada
                  </p>
                  <p
                    className="mt-1 text-4xl font-extrabold"
                    style={{ color: tone.color }}
                  >
                    {score}%
                  </p>
                </div>
                <span
                  className={`rounded-full px-3 py-1.5 text-xs font-bold ${tone.bg}`}
                  style={{ color: tone.color }}
                >
                  {tone.label}
                </span>
              </div>
              <div
                className="mt-5 h-3 overflow-hidden rounded-full bg-[#e7eee9]"
                role="progressbar"
                aria-label="Compatibilidade estimada"
                aria-valuemin={0}
                aria-valuemax={100}
                aria-valuenow={score}
              >
                <div
                  className="h-full rounded-full transition-[width] duration-700"
                  style={{ width: `${score}%`, backgroundColor: tone.color }}
                />
              </div>
              <p className="mt-3 text-xs leading-5 text-[#707971]">
                Estimativa de apoio à análise. A decisão final deve considerar a
                conversa e o bem-estar do animal.
              </p>
            </section>

            <section className="rounded-xl border border-[#bfc9bf]/30 bg-white p-6 shadow-sm">
              <h2 className="font-bold">Pontos da análise</h2>
              <ul className="mt-4 space-y-3">
                {(request.compatibilityDetails || []).map((detail) => (
                  <li
                    key={detail}
                    className="flex gap-2.5 text-sm leading-5 text-[#404942]"
                  >
                    <span
                      className="mt-1 size-2 shrink-0 rounded-full"
                      style={{ backgroundColor: tone.color }}
                    />
                    {detail}
                  </li>
                ))}
              </ul>
            </section>

            <section className="flex items-center gap-4 rounded-xl bg-[#f7fcf8] p-4">
              <div className="relative size-16 shrink-0 overflow-hidden rounded-lg">
                <Image
                  src={request.animal.image || "/images/login-cover-v2.png"}
                  alt={request.animal.name}
                  fill
                  className="object-cover"
                />
              </div>
              <div>
                <p className="text-xs font-semibold text-[#707971]">Animal</p>
                <h2 className="font-bold">{request.animal.name}</h2>
                <Link
                  href={`/adocao/${request.animal.id}`}
                  className="mt-1 inline-block text-xs font-semibold text-[#256441] hover:underline"
                >
                  Ver perfil
                </Link>
              </div>
            </section>
          </aside>
 );
}
