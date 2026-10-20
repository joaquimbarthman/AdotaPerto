export type OrganizationNeed = {
  id: string; title: string; category: string; quantity: number; unit: string; priority: string;
  description: string; status: string; createdAt: string;
  organization?: { id: string; name?: string | null; image?: string | null; city?: string | null; state?: string | null };
};

const priorityStyle: Record<string, string> = {
  Urgente: "bg-[#fff0f0] text-[#b42318] border-[#fecaca]", Alta: "bg-[#fff7e8] text-[#9a5b13] border-[#fed7aa]",
  Média: "bg-[#fffce8] text-[#776814] border-[#fde68a]", Baixa: "bg-[#e8f7eb] text-[#256441] border-[#b9dfc3]",
};

export function OrganizationNeedCard({ need }: { need: OrganizationNeed }) {
  const location = [need.organization?.city, need.organization?.state].filter(Boolean).join(", ");
  return <article className="flex min-h-64 flex-col rounded-xl border border-[#d7e6da] bg-white p-4 shadow-[0_6px_20px_rgba(38,51,43,0.06)] transition hover:-translate-y-1 hover:border-[#9bc6a7] hover:shadow-[0_12px_28px_rgba(38,51,43,0.11)] sm:rounded-2xl sm:p-5">
    <div className="flex items-start justify-between gap-3"><span className="grid size-11 place-items-center rounded-xl bg-[#e3f2e6] text-xl" aria-hidden="true">♡</span><span className={`rounded-full border px-2.5 py-1 text-[11px] font-bold ${priorityStyle[need.priority] || priorityStyle.Média}`}>{need.priority}</span></div>
    <p className="mt-4 text-[11px] font-bold uppercase tracking-[0.12em] text-[#3f7d58]">{need.category}</p>
    <h2 className="mt-1 line-clamp-2 text-lg font-extrabold tracking-[-0.01em] text-[#253129]">{need.title}</h2>
    <p className="mt-2 line-clamp-2 text-xs leading-5 text-[#5b675f]">{need.description}</p>
    <div className="mt-auto border-t border-[#e7eee9] pt-3"><strong className="text-sm text-[#256441]">{need.quantity} {need.unit}</strong><p className="mt-1 truncate text-xs font-semibold text-[#404942]">{need.organization?.name || "ONG verificada"}</p>{location && <p className="mt-0.5 text-[11px] text-[#718078]">{location}</p>}</div>
  </article>;
}
