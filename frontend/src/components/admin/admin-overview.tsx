import { DashboardIcon } from "./admin-ui";
import { AdminMetrics } from "./admin-metrics";
import { AdminStatusGrid } from "./admin-status-grid";
import { RecentUsersTable } from "./recent-users-table";
import type { Overview } from "./types";

type Props = { data: Overview; seedContent: () => Promise<void>; seeding: boolean; seedMessage: string | null; seedError: boolean };

export function AdminOverview({ data, seedContent, seeding, seedMessage, seedError }: Props) {
  return (

          <>
            <AdminMetrics data={data} />
            <section className="admin-card mt-6 flex flex-wrap items-center justify-between gap-4 p-5 sm:p-6">
              <div>
                <h2 className="admin-card-title">Conteúdo de exemplo</h2>
                <p className="admin-muted mt-1 text-xs">
                  Adiciona exemplos ausentes à sua conta e completa campos
                  vazios dos animais de exemplo já cadastrados. Dados
                  preenchidos são preservados.
                </p>
                {seedMessage && (
                  <p
                    role="status"
                    className={`mt-3 text-sm ${seedError ? "text-red-600" : "text-green-700"}`}
                  >
                    {seedMessage}
                  </p>
                )}
              </div>
              <button
                type="button"
                onClick={seedContent}
                disabled={seeding}
                className="admin-primary-link disabled:cursor-wait disabled:opacity-60"
              >
                {seeding
                  ? "Carregando conteúdo..."
                  : "Adicionar animais e itens"}
              </button>
            </section>
            <div className="mb-4 mt-10 flex items-end justify-between gap-4">
              <div>
                <p className="admin-section-kicker">Distribuição</p>
                <h2 className="admin-section-title">Atividade da plataforma</h2>
              </div>
              <p className="admin-muted hidden max-w-sm text-right text-xs sm:block">
                Uma leitura rápida da situação atual de anúncios e pedidos.
              </p>
            </div>
            <AdminStatusGrid data={data} />
            <RecentUsersTable data={data} />
            <p className="admin-updated">
              <DashboardIcon name="clock" />
              Atualizado em {new Date(data.generatedAt).toLocaleString("pt-BR")}
            </p>
          </>
        
  );
}
