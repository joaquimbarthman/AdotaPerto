import type { Notice } from "@/hooks/use-notification-center";

export function BellIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="size-5 text-[#256441]"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9M10 21h4" />
    </svg>
  );
}
export function NoticeIcon({ tone }: { tone: Notice["tone"] }) {
  if (tone === "success")
    return (
      <svg
        viewBox="0 0 20 20"
        className="size-4.5"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="m4 10 4 4 8-9" />
      </svg>
    );
  if (tone === "publication")
    return (
      <svg
        viewBox="0 0 20 20"
        className="size-4.5"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M4 6.5h12v10H4zM3 3.5h14v4H3zM7.5 10.5h5" />
      </svg>
    );
  return (
    <svg
      viewBox="0 0 20 20"
      className="size-4.5"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M15 7a5 5 0 0 0-10 0c0 5.5-2.5 5.5-2.5 7h15c0-1.5-2.5-1.5-2.5-7M8.5 17h3" />
    </svg>
  );
}
export function formatNoticeDate(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime()) || date.getTime() === 0) return "";
  const elapsed = Date.now() - date.getTime();
  const minutes = Math.floor(elapsed / 60000);
  if (minutes < 1) return "agora";
  if (minutes < 60) return `${minutes} min`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} h`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days} d`;
  return date.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" });
}
export function NotificationSkeleton() {
  return (
    <div aria-label="Carregando notificações">
      {[0, 1, 2].map((item) => (
        <div
          key={item}
          className="flex min-h-15 gap-2 border-b border-[#edf2ee] px-3 py-2.5 last:border-b-0 sm:min-h-22 sm:gap-3.5 sm:px-5 sm:py-4"
        >
          <div className="skeleton-shimmer size-7 shrink-0 rounded-full sm:size-9" />
          <div className="flex-1 space-y-1.5 sm:space-y-2">
            <div className="skeleton-shimmer h-3 w-24 rounded sm:h-3.5 sm:w-32" />
            <div className="skeleton-shimmer h-2.5 w-full rounded sm:h-3" />
            <div className="skeleton-shimmer h-2.5 w-2/3 rounded sm:h-3" />
          </div>
        </div>
      ))}
    </div>
  );
}
