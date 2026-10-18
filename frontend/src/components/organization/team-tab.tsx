"use client";

import type { DashboardProps } from "./dashboard-props";
import { box, button, input, roleLabel } from "./styles";
import { ExternalsSection } from "./externals-section";

export function TeamTab({ dashboard, canManage, busy, changeRole, removeMember, invite, inviteEmail, setInviteEmail, inviteRole, setInviteRole, cancelInvitation, setMessage, saveExternal, removeExternal }: Pick<DashboardProps, "dashboard" | "canManage" | "busy" | "changeRole" | "removeMember" | "invite" | "inviteEmail" | "setInviteEmail" | "inviteRole" | "setInviteRole" | "cancelInvitation" | "setMessage" | "saveExternal" | "removeExternal">) {
  const date = (value: string) => new Date(value).toLocaleDateString("pt-BR");
  return (
        <div className="mt-6 grid gap-5 lg:grid-cols-2">
          <section className={box}>
            <h2 className="text-lg font-bold">Equipe e voluntários</h2>
            <div className="mt-4 divide-y divide-[#e4eee7]">
              {dashboard.members.map((person) => (
                <div
                  key={person.id}
                  className="flex flex-wrap items-center justify-between gap-3 py-3"
                >
                  <div>
                    <strong className="text-sm">{person.name}</strong>
                    <p className="text-xs text-[#68726b]">
                      {person.email} · {roleLabel(person.role)}
                    </p>
                  </div>
                  {canManage && person.role !== "owner" && (
                    <div className="flex gap-2">
                      <select
                        aria-label={`Função de ${person.name}`}
                        value={person.role}
                        disabled={busy}
                        onChange={(event) =>
                          void changeRole(
                            person.id,
                            event.target.value as "admin" | "member",
                          )
                        }
                        className={input}
                      >
                        <option value="member">Voluntário</option>
                        <option value="admin">Gestor</option>
                      </select>
                      <button
                        type="button"
                        disabled={busy}
                        onClick={() => void removeMember(person.id)}
                        className="text-xs font-semibold text-red-700"
                      >
                        Remover
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </section>
          <section className={box}>
            <h2 className="text-lg font-bold">Convites</h2>
            {canManage ? (
              <>
                <form onSubmit={invite} className="mt-4 space-y-3">
                  <input
                    type="email"
                    required
                    value={inviteEmail}
                    onChange={(event) => setInviteEmail(event.target.value)}
                    placeholder="E-mail do convidado"
                    className={input}
                  />
                  <div className="flex gap-2">
                    <select
                      value={inviteRole}
                      onChange={(event) =>
                        setInviteRole(event.target.value as "member" | "admin")
                      }
                      className={input}
                    >
                      <option value="member">Voluntário</option>
                      <option value="admin">Gestor</option>
                    </select>
                    <button disabled={busy} className={`${button} shrink-0`}>
                      Convidar
                    </button>
                  </div>
                </form>
                <div className="mt-5 divide-y divide-[#e4eee7]">
                  {dashboard.invitations.map((row) => (
                    <div key={row.id} className="py-3">
                      <p className="text-sm font-semibold">{row.email}</p>
                      <p className="text-xs text-[#68726b]">
                        {roleLabel(row.role || "member")} · expira em{" "}
                        {date(row.expiresAt)}
                      </p>
                      <div className="mt-2 flex gap-3">
                        <button
                          type="button"
                          onClick={() =>
                            void navigator.clipboard
                              .writeText(
                                `${window.location.origin}/organizacao/convite?id=${encodeURIComponent(row.id)}`,
                              )
                              .then(() => setMessage("Link copiado."))
                          }
                          className="text-xs font-semibold text-[#256441]"
                        >
                          Copiar link
                        </button>
                        <button
                          type="button"
                          disabled={busy}
                          onClick={() => void cancelInvitation(row.id)}
                          className="text-xs font-semibold text-red-700"
                        >
                          Cancelar
                        </button>
                      </div>
                    </div>
                  ))}
                  {dashboard.invitations.length === 0 && (
                    <p className="py-4 text-sm text-[#68726b]">
                      Nenhum convite pendente.
                    </p>
                  )}
                </div>
              </>
            ) : (
              <p className="mt-4 text-sm text-[#68726b]">
                Convites e funções são gerenciados por responsáveis e gestores.
              </p>
            )}
          </section>
          <ExternalsSection externals={dashboard.externals} canManage={canManage} busy={busy} saveExternal={saveExternal} removeExternal={removeExternal} />
        </div>
  );
}
