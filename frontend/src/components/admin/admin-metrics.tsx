import { AnimalAdminIcon, DashboardIcon, MetricCard, number, total } from "./admin-ui";
import type { Overview } from "./types";

export function AdminMetrics({ data }: { data: Overview }) {
  return (
<section
              className="admin-metrics-grid"
              aria-label="Indicadores gerais"
            >
              <MetricCard
                featured
                label="Usuários cadastrados"
                value={data.users}
                detail={`${number.format(data.newUsers)} novos nos últimos 7 dias`}
                icon={<DashboardIcon name="users" />}
              />
              <MetricCard
                label="ONGs cadastradas"
                value={data.organizations}
                detail="Total de ONGs cadastradas"
                icon={<DashboardIcon name="users" />}
              />
              <MetricCard
                label="Animais publicados"
                value={total(data.animals)}
                detail="Em todas as situações"
                icon={<AnimalAdminIcon />}
              />
              <MetricCard
                label="Itens para doação"
                value={total(data.items)}
                detail="Anúncios cadastrados"
                icon={<DashboardIcon name="gift" />}
              />
              <MetricCard
                label="Sessões válidas"
                value={data.activeSessions}
                detail="Sessões ainda não expiradas"
                icon={<DashboardIcon name="session" />}
              />
            </section>
  );
}
