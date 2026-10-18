"use client";

import { useNotificationCenter } from "@/hooks/use-notification-center";
import { BellIcon, NotificationDropdown } from "@/components/notification-dropdown";

export function NotificationCenter({ userId, mobileNav = false }: { userId?: string; mobileNav?: boolean }) {
  const { open, setOpen, loading, notices, readIds, rootRef, unread, saveRead, markAsRead } = useNotificationCenter(userId);
  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        disabled={!userId}
        className={`relative grid place-items-center rounded-full transition hover:bg-[#e1f2e5] disabled:opacity-50 ${mobileNav ? "size-6" : "size-9"}`}
        aria-label={
          unread ? `Notificações, ${unread} não lidas` : "Notificações"
        }
        aria-expanded={open}
        aria-haspopup="dialog"
      >
        <BellIcon />
        {unread > 0 && (
          <span className="absolute right-0 top-0 grid min-h-4 min-w-4 place-items-center rounded-full bg-red-500 px-1 text-[9px] font-extrabold leading-none text-white ring-2 ring-[#eefdf1]">
            {unread > 9 ? "9+" : unread}
          </span>
        )}
      </button>
      <NotificationDropdown mobileNav={mobileNav} open={open} setOpen={setOpen} unread={unread} loading={loading} notices={notices} readIds={readIds} saveRead={saveRead} markAsRead={markAsRead} />
    </div>
  );
}
