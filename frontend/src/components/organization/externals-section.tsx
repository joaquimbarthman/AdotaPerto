"use client";

import { useState, type FormEvent } from "react";
import type { External, ExternalValues } from "./types";
import { box, button, input } from "./styles";

const kindLabel = { prestador: "Prestador", parceiro: "Parceiro", outro: "Outro" };

type Props = {
  externals: External[];
  canManage: boolean;
  busy: boolean;
  saveExternal: (id: string | null, values: ExternalValues) => Promise<boolean>;
  removeExternal: (id: string) => Promise<void>;
};

export function ExternalsSection({ externals, canManage, busy, saveExternal, removeExternal }: Props) {
  const [editing, setEditing] = useState<External | null>(null);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const data = new FormData(form);
    const values: ExternalValues = {
      name: String(data.get("name") || "").trim(),
      kind: String(data.get("kind") || "outro") as ExternalValues["kind"],
      email: String(data.get("email") || "").trim() || null,
      phone: String(data.get("phone") || "").trim() || null,
      notes: String(data.get("notes") || "").trim() || null,
    };
    if (await saveExternal(editing?.id || null, values)) {
      setEditing(null);
      form.reset();
    }
  }

  return (
    <section className={`${box} lg:col-span-2`}>
      <h2 className="text-lg font-bold">Contatos externos</h2>
      <p className="mt-1 text-sm text-[#68726b]">Prestadores, parceiros e outros contatos da ONG, sem acesso ao painel.</p>
      <div className="mt-4 divide-y divide-[#e4eee7]">
        {externals.map((person) => (
          <div key={person.id} className="flex flex-wrap items-start justify-between gap-3 py-3">
            <div className="min-w-0">
              <strong className="text-sm">{person.name}</strong>
              <p className="text-xs text-[#68726b]">{kindLabel[person.kind]}{person.email ? ` · ${person.email}` : ""}{person.phone ? ` · ${person.phone}` : ""}</p>
              {person.notes && <p className="mt-1 text-xs text-[#68726b]">{person.notes}</p>}
            </div>
            {canManage && <div className="flex gap-3">
              <button type="button" disabled={busy} onClick={() => setEditing(person)} className="text-xs font-semibold text-[#256441]">Editar</button>
              <button type="button" disabled={busy} onClick={() => void removeExternal(person.id)} className="text-xs font-semibold text-red-700">Remover</button>
            </div>}
          </div>
        ))}
        {externals.length === 0 && <p className="py-4 text-sm text-[#68726b]">Nenhum contato externo cadastrado.</p>}
      </div>
      {canManage && <form key={editing?.id || "new"} onSubmit={submit} className="mt-5 grid gap-3 border-t border-[#e4eee7] pt-5 sm:grid-cols-2">
        <h3 className="text-sm font-bold sm:col-span-2">{editing ? "Editar contato" : "Adicionar contato externo"}</h3>
        <label className="text-xs font-semibold">Nome
          <input name="name" required minLength={2} maxLength={160} defaultValue={editing?.name || ""} className={`${input} mt-1`} />
        </label>
        <label className="text-xs font-semibold">Tipo
          <select name="kind" defaultValue={editing?.kind || "prestador"} className={`${input} mt-1`}>
            <option value="prestador">Prestador</option><option value="parceiro">Parceiro</option><option value="outro">Outro</option>
          </select>
        </label>
        <label className="text-xs font-semibold">E-mail
          <input name="email" type="email" maxLength={255} defaultValue={editing?.email || ""} className={`${input} mt-1`} />
        </label>
        <label className="text-xs font-semibold">Telefone
          <input name="phone" type="tel" maxLength={30} defaultValue={editing?.phone || ""} className={`${input} mt-1`} />
        </label>
        <label className="text-xs font-semibold sm:col-span-2">Observações
          <textarea name="notes" maxLength={500} defaultValue={editing?.notes || ""} rows={2} className={`${input} mt-1 h-auto`} />
        </label>
        <div className="flex gap-3 sm:col-span-2">
          <button type="submit" disabled={busy} className={button}>{editing ? "Salvar alterações" : "Adicionar contato"}</button>
          {editing && <button type="button" disabled={busy} onClick={() => setEditing(null)} className="text-sm font-semibold text-[#526057]">Cancelar</button>}
        </div>
      </form>}
    </section>
  );
}
