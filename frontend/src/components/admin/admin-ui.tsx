import Image from "next/image";
import type { ReactNode } from "react";
import type { StatusCount } from "./types";

export const number = new Intl.NumberFormat("pt-BR");
export const total = (rows: StatusCount[]) =>
  rows.reduce((sum, row) => sum + row.total, 0);
const statusTone: Record<string, string> = {
  disponível: "admin-status-green",
  disponivel: "admin-status-green",
  aprovado: "admin-status-green",
  aprovada: "admin-status-green",
  adotado: "admin-status-blue",
  adotada: "admin-status-blue",
  doado: "admin-status-blue",
  doada: "admin-status-blue",
  pendente: "admin-status-amber",
  "em análise": "admin-status-amber",
  pausado: "admin-status-muted",
  pausada: "admin-status-muted",
  recusado: "admin-status-red",
  recusada: "admin-status-red",
  cancelado: "admin-status-red",
  cancelada: "admin-status-red",
};
const statusLabels: Record<string, string> = {
  pending: "Em análise",
  approved: "Aprovada",
  rejected: "Recusada",
  canceled: "Cancelada",
  cancelled: "Cancelada",
  available: "Disponível",
  paused: "Pausado",
  adopted: "Adotado",
  donated: "Doado",
};

function translateStatus(status: string) {
  return statusLabels[status.trim().toLocaleLowerCase("pt-BR")] || status;
}

export function AnimalAdminIcon() {
  return (
    <Image
      src="/icons/adocao.svg"
      alt=""
      width={22}
      height={22}
      className="admin-animal-icon"
    />
  );
}

export function DashboardIcon({
  name,
}: {
  name: "users" | "gift" | "session" | "refresh" | "shield" | "clock";
}) {
  const props = {
    viewBox: "0 0 24 24",
    className: "size-5",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.9,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    "aria-hidden": true,
  };
  if (name === "users")
    return (
      <svg {...props}>
        <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
      </svg>
    );
  if (name === "gift")
    return (
      <svg {...props}>
        <path d="M20 12v9H4v-9M2 7h20v5H2zM12 22V7M12 7H7.5A2.5 2.5 0 1 1 10 4.5L12 7Zm0 0h4.5A2.5 2.5 0 1 0 14 4.5L12 7Z" />
      </svg>
    );
  if (name === "session")
    return (
      <svg {...props}>
        <rect x="3" y="4" width="18" height="16" rx="3" />
        <path d="M7 9h10M7 13h4M7 17h7" />
        <circle cx="17" cy="16" r="2.5" />
        <path d="m16 16 1 1 2-2" />
      </svg>
    );
  if (name === "refresh")
    return (
      <svg {...props}>
        <path d="M20 6v5h-5M4 18v-5h5" />
        <path d="M18.5 9A7 7 0 0 0 6.3 5.7L4 8m16 8-2.3 2.3A7 7 0 0 1 5.5 15" />
      </svg>
    );
  if (name === "shield")
    return (
      <svg {...props}>
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Z" />
        <path d="m9 12 2 2 4-4" />
      </svg>
    );
  return (
    <svg {...props}>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3 2" />
    </svg>
  );
}

export function StatusPanel({
  title,
  description,
  rows,
  icon,
}: {
  title: string;
  description: string;
  rows: StatusCount[];
  icon: ReactNode;
}) {
  const sum = total(rows);
  return (
    <section className="admin-card admin-status-panel">
      <div className="flex items-center justify-between gap-4">
        <div className="flex min-w-0 items-center gap-3">
          <span className="admin-panel-icon">{icon}</span>
          <div>
            <h2 className="admin-card-title">{title}</h2>
            <p className="admin-muted mt-1 text-xs">{description}</p>
          </div>
        </div>
        <span className="admin-total-badge">{number.format(sum)}</span>
      </div>
      {rows.length === 0 ? (
        <div className="admin-empty-state">Nenhum registro por aqui ainda.</div>
      ) : (
        <ul className="mt-7 space-y-5">
          {rows.map((row) => {
            const label = translateStatus(row.status);
            const tone =
              statusTone[label.toLocaleLowerCase("pt-BR")] ||
              "admin-status-green";
            const percentage = sum ? Math.round((row.total / sum) * 100) : 0;
            return (
              <li key={row.status}>
                <div className="mb-2 flex items-center justify-between gap-3 text-sm">
                  <span className="admin-status-label">
                    <i className={tone} />
                    {label}
                  </span>
                  <span className="admin-status-value">
                    {number.format(row.total)} <small>{percentage}%</small>
                  </span>
                </div>
                <div aria-hidden="true" className="admin-progress">
                  <div className={tone} style={{ width: `${percentage}%` }} />
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}

export { MetricCard } from "./metric-card";
