import { AnimalAdminIcon, DashboardIcon, StatusPanel } from "./admin-ui";
import type { Overview } from "./types";

export function AdminStatusGrid({ data }: { data: Overview }) {
  return (
    <div className="grid gap-5 md:grid-cols-2">
      <StatusPanel
        title="Animais"
        description="Situação das publicações"
        rows={data.animals}
        icon={<AnimalAdminIcon />}
      />
      <StatusPanel
        title="Itens para doação"
        description="Situação dos anúncios"
        rows={data.items}
        icon={<DashboardIcon name="gift" />}
      />
      <StatusPanel
        title="Solicitações de adoção"
        description="Distribuição por situação"
        rows={data.adoptions}
        icon={<DashboardIcon name="users" />}
      />
      <StatusPanel
        title="Solicitações de itens"
        description="Distribuição por situação"
        rows={data.donations}
        icon={<DashboardIcon name="session" />}
      />
    </div>
  );
}
