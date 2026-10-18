import type { ReactNode } from "react";

const number = new Intl.NumberFormat("pt-BR");

export function MetricCard({
  label,
  value,
  detail,
  icon,
  featured = false,
}: {
  label: string;
  value: number;
  detail: string;
  icon: ReactNode;
  featured?: boolean;
}) {
  return (
    <article
      className={`admin-metric-card ${featured ? "admin-metric-featured" : ""}`}
    >
      <div className="flex items-center justify-between gap-3">
        <p className="admin-metric-label">{label}</p>
        <span className="admin-metric-icon">{icon}</span>
      </div>
      <p className="admin-metric-value">{number.format(value)}</p>
      <p className="admin-metric-detail">{detail}</p>
    </article>
  );
}
