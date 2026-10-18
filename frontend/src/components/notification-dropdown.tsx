"use client";

import {
  BellIcon,
  formatNoticeDate,
  NoticeIcon,
  NotificationSkeleton,
} from "@/components/notification-parts";
import type { Notice } from "@/hooks/use-notification-center";
import Link from "next/link";
import type { Dispatch, SetStateAction } from "react";

type Props = {
  mobileNav: boolean;
  open: boolean;
  setOpen: Dispatch<SetStateAction<boolean>>;
  unread: number;
  loading: boolean;
  notices: Notice[];
  readIds: string[];
  saveRead: (ids: string[]) => void;
  markAsRead: (id: string) => void;
};

export function NotificationDropdown({
  mobileNav,
  open,
  setOpen,
  unread,
  loading,
  notices,
  readIds,
  saveRead,
  markAsRead,
}: Props) {
  return (
    <section
      role="dialog"
      aria-label="Central de notificações"
      className={`notification-dropdown z-50 overflow-hidden border border-[#dce7df] bg-white shadow-[0_16px_42px_rgba(18,45,29,0.20)] transition-all duration-200 ${mobileNav ? "fixed bottom-18.5 left-1/2 w-[calc(100%-24px)] max-w-82.5 -translate-x-1/2 origin-bottom rounded-xl" : "fixed left-3 right-3 top-16 w-auto origin-top rounded-xl sm:absolute sm:left-auto sm:right-0 sm:top-[calc(100%+14px)] sm:w-[min(390px,calc(100vw-24px))] sm:origin-top-right"} ${open ? "visible translate-y-0 scale-100 opacity-100" : `invisible scale-[0.97] opacity-0 ${mobileNav ? "translate-y-2" : "-translate-y-2"}`}`}
    >
      <span
        className="absolute right-3 top-0 h-0.5 w-12 rounded-b-full bg-[#256441]"
        aria-hidden="true"
      />
      <header className="flex min-h-11 items-center justify-between gap-1.5 px-3 py-2 sm:min-h-16 sm:gap-2 sm:px-5 sm:pb-4 sm:pt-5">
        <div className="flex min-w-0 items-center gap-1.5 sm:gap-2">
          <h2 className="truncate text-sm font-extrabold text-[#253129] sm:text-base">
            Notificações
          </h2>
          {unread > 0 && (
            <span className="shrink-0 rounded-full bg-[#e3f2e6] px-1.5 py-0.5 text-[9px] font-extrabold text-[#256441] sm:px-2 sm:text-[11px]">
              {unread} nova{unread === 1 ? "" : "s"}
            </span>
          )}
        </div>
        <div className="flex shrink-0 items-center gap-0.5 sm:gap-1">
          {unread > 0 && (
            <button
              type="button"
              onClick={() => saveRead(notices.map((notice) => notice.id))}
              className="min-h-8 rounded-md px-1.5 text-[9px] font-bold text-[#526057] transition hover:bg-[#eefdf1] hover:text-[#256441] sm:min-h-9 sm:rounded-lg sm:px-2 sm:text-[11px]"
            >
              Marcar lidas
            </button>
          )}
          <button
            type="button"
            onClick={() => setOpen(false)}
            className="grid size-8 place-items-center rounded-md text-[#68726b] transition hover:bg-[#eefdf1] hover:text-[#256441] sm:hidden"
            aria-label="Fechar notificações"
          >
            <svg
              viewBox="0 0 20 20"
              className="size-3.5"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              aria-hidden="true"
            >
              <path d="m5 5 10 10M15 5 5 15" />
            </svg>
          </button>
        </div>
      </header>
      <div className="notification-list max-h-[min(42dvh,300px)] overflow-y-auto overscroll-contain border-y border-[#edf2ee] sm:max-h-[min(58dvh,430px)]">
        {loading ? (
          <NotificationSkeleton />
        ) : notices.length === 0 ? (
          <div className="px-4 py-7 text-center sm:px-6 sm:py-12">
            <div className="mx-auto mb-2 grid size-9 place-items-center rounded-full bg-[#e8f7eb] text-[#256441] sm:mb-3 sm:size-11">
              <BellIcon />
            </div>
            <p className="text-xs font-bold text-[#253129] sm:text-sm">
              Nenhuma novidade
            </p>
            <p className="mx-auto mt-1 max-w-60 text-[10px] leading-4 text-[#68726b] sm:text-xs sm:leading-5">
              Suas atualizações aparecerão aqui quando algo acontecer.
            </p>
          </div>
        ) : (
          notices.map((notice) => {
            const read = readIds.includes(notice.id);
            return (
              <Link
                key={notice.id}
                href={notice.href}
                onClick={() => markAsRead(notice.id)}
                className={`notification-item group relative flex min-h-15 items-start gap-2 border-b border-[#edf2ee] px-3 py-2.5 transition last:border-b-0 hover:bg-[#f5fbf7] sm:min-h-22 sm:gap-3.5 sm:px-5 sm:py-4 ${read ? "notification-item-read opacity-65" : "bg-white"}`}
              >
                <span
                  data-tone={notice.tone}
                  className={`notification-type-icon grid size-7 shrink-0 place-items-center rounded-full sm:size-9 ${notice.tone === "success" ? "bg-emerald-50 text-emerald-700" : notice.tone === "publication" ? "bg-violet-50 text-violet-700" : "bg-blue-50 text-blue-700"}`}
                >
                  <NoticeIcon tone={notice.tone} />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="flex items-start justify-between gap-1.5">
                    <strong className="truncate text-[11px] font-extrabold text-[#253129] sm:text-[13px]">
                      {notice.title}
                    </strong>
                    <span className="inline-flex shrink-0 items-center gap-1 text-[8px] font-medium text-[#859087] sm:gap-1.5 sm:text-[10px]">
                      {!read && (
                        <span
                          className="size-1 rounded-full bg-[#256441] sm:size-1.5"
                          aria-label="Não lida"
                        />
                      )}
                      {formatNoticeDate(notice.createdAt)}
                    </span>
                  </span>
                  <span className="mt-0.5 line-clamp-2 text-[10px] leading-3.5 text-[#68726b] sm:mt-1 sm:line-clamp-3 sm:text-xs sm:leading-[1.5]">
                    {notice.description}
                  </span>
                </span>
                <svg
                  viewBox="0 0 20 20"
                  className="absolute bottom-2.5 right-3 size-3.5 text-[#9aa49d] opacity-0 transition group-hover:translate-x-0.5 group-hover:opacity-100"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  aria-hidden="true"
                >
                  <path d="m7.5 4.5 5 5.5-5 5.5" />
                </svg>
              </Link>
            );
          })
        )}
      </div>
    </section>
  );
}

export { BellIcon } from "@/components/notification-parts";
