import type { Animal } from "@/data/animals";
import Image from "next/image";
import type { ReactNode } from "react";

export function AnimalSummary({ animal }: { animal: Animal }) {
  return (
    <section className="flex gap-5 rounded-xl border border-[#bfc9bf]/30 bg-white p-5 shadow-[0_4px_20px_rgba(38,51,43,0.04)] sm:gap-6 sm:p-6">
      <div className="relative size-24 shrink-0 overflow-hidden rounded-lg sm:size-32">
        <Image
          src={animal.image || "/images/login-cover-v2.png"}
          alt={animal.name}
          fill
          className="object-cover"
        />
      </div>
      <div className="min-w-0">
        <h2 className="text-2xl font-semibold">{animal.name}</h2>
        <div className="mt-3 flex flex-wrap gap-2">
          <Tag>{animal.species}</Tag>
          <Tag>{animal.sex}</Tag>
          <Tag>{animal.age}</Tag>
          <Tag>Porte {sizeName(animal.size)}</Tag>
        </div>
        <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-xs text-[#526057]">
          <span>Energia: {animal.energyLevel || "N\u00e3o informada"}</span>
          <span>
            Sa&uacute;de:{" "}
            {animal.healthCondition || "sem necessidade informada"}
          </span>
        </div>
      </div>
    </section>
  );
}

export function NextSteps({ animal }: { animal: Animal }) {
  return (
    <aside className="rounded-xl border border-[#bfc9bf]/30 bg-white p-6 shadow-[0_4px_10px_rgba(38,51,43,0.04)] lg:sticky lg:top-28">
      <h2 className="text-2xl font-semibold">Pr&oacute;ximos Passos</h2>
      <ol className="mt-5 space-y-4 text-sm leading-6 text-[#404942]">
        <li>
          <strong className="text-[#121e17]">1. An&aacute;lise</strong>
          <br />O respons&aacute;vel por {animal.name} analisar&aacute; seu
          perfil e suas respostas.
        </li>
        <li>
          <strong className="text-[#121e17]">2. Retorno</strong>
          <br />
          Voc&ecirc; poder&aacute; acompanhar a decis&atilde;o pelo seu perfil.
        </li>
        <li>
          <strong className="text-[#121e17]">3. Contato</strong>
          <br />
          Se aprovada, a solicita&ccedil;&atilde;o permitir&aacute; o contato
          com o respons&aacute;vel.
        </li>
      </ol>
      <div className="mt-6 rounded-lg bg-[#e3f2e6] p-4 text-xs leading-5 text-[#404942]">
        <strong className="text-[#256441]">Lembre-se:</strong> a
        ado&ccedil;&atilde;o &eacute; um ato de amor e responsabilidade a longo
        prazo.
      </div>
    </aside>
  );
}

function Tag({ children }: { children: ReactNode }) {
  return (
    <span className="rounded-full bg-[#e3f2e6] px-3 py-1 text-xs font-medium text-[#0f5d39]">
      {children}
    </span>
  );
}

function sizeName(size?: string) {
  return (
    ({ P: "Pequeno", M: "M\u00e9dio", G: "Grande" } as Record<string, string>)[
      size || ""
    ] ||
    size ||
    "N\u00e3o informado"
  );
}
