"use client";

import type { DashboardProps } from "./dashboard-props";
import { RequestList } from "./organization-lists";

export function RequestsTab({ dashboard, currentUserId, canManage, busy, updateRequest }: Pick<DashboardProps, "dashboard" | "currentUserId" | "canManage" | "busy" | "updateRequest">) {
  return (
        <div className="mt-6 space-y-5">
          <RequestList
            title="Pedidos de adoção"
            rows={dashboard.adoptionRequests}
            kind="animal"
            currentUserId={currentUserId}
            canManage={canManage}
            busy={busy}
            onStatus={updateRequest}
          />
          <RequestList
            title="Pedidos de itens"
            rows={dashboard.itemRequests}
            kind="item"
            currentUserId={currentUserId}
            canManage={canManage}
            busy={busy}
            onStatus={updateRequest}
          />
        </div>
  );
}
