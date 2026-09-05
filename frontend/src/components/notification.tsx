"use client";

import { useEffect, useState } from "react";

type Level = "success" | "error" | "warning" | "info";
type Notice = { id: number; text: string; type: Level; exiting?: boolean };
let nextId = 0;
const listeners = new Set<(notice: Notice) => void>();
export function notify(text: string, type: Level = "info") {
  const notice = { id: ++nextId, text, type };
  listeners.forEach((listener) => listener(notice));
}

export function Notification({ text, type = "error" }: { text: string; type?: Level }) {
  useEffect(() => { if (text) notify(text, type); }, [text, type]);
  return null;
}

export function NotificationProvider() {
  const [notices, setNotices] = useState<Notice[]>([]);
  useEffect(() => {
    const timers = new Set<ReturnType<typeof setTimeout>>();
    const receive = (notice: Notice) => {
      setNotices((current) => [...current.filter((entry) => entry.text !== notice.text), notice].slice(-4));
      const exitTimer = setTimeout(() => {
        setNotices((current) => current.map((entry) => entry.id === notice.id ? { ...entry, exiting: true } : entry));
        timers.delete(exitTimer);
      }, 4650);
      const removeTimer = setTimeout(() => {
        setNotices((current) => current.filter((entry) => entry.id !== notice.id));
        timers.delete(removeTimer);
      }, 5000);
      timers.add(exitTimer);
      timers.add(removeTimer);
    };
    listeners.add(receive);
    return () => { listeners.delete(receive); timers.forEach(clearTimeout); };
  }, []);
  const colors = {
    success: { surface: "notification-success", progress: "bg-emerald-500" },
    error: { surface: "notification-error", progress: "bg-red-500" },
    warning: { surface: "notification-warning", progress: "bg-amber-500" },
    info: { surface: "notification-info", progress: "bg-blue-500" },
  };

  return <div className="pointer-events-none fixed right-4 top-24 z-[900] flex w-[calc(100%-2rem)] max-w-max flex-col gap-2 sm:right-6" aria-label="Notificações">{notices.map((notice) => {
    const color = colors[notice.type];
    return <div key={notice.id} role={notice.type === "error" ? "alert" : "status"} className={`${notice.exiting ? "notification-exit" : "notification-enter"} relative overflow-hidden rounded-lg border border-current/10 shadow-[0_10px_30px_rgba(18,30,23,0.14)] ${color.surface}`}>
      <p className="flex min-h-14 items-center gap-3 px-4 py-3.5 text-left text-sm font-semibold leading-5 sm:whitespace-nowrap"><NoticeIcon type={notice.type} />{notice.text}</p>
      <span className={`notification-progress absolute bottom-0 left-0 h-0.5 w-full origin-left ${color.progress}`} aria-hidden="true" />
    </div>;
  })}</div>;
}

function NoticeIcon({ type }: { type: Level }) {
  return <span className="grid size-8 shrink-0 place-items-center rounded-md bg-current/10" aria-hidden="true"><svg viewBox="0 0 24 24" className="size-[18px]" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">{type === "success" ? <><circle cx="12" cy="12" r="9" /><path d="m8 12 2.6 2.6L16.5 9" /></> : type === "error" ? <><circle cx="12" cy="12" r="9" /><path d="m9 9 6 6m0-6-6 6" /></> : <><circle cx="12" cy="12" r="9" /><path d="M12 11v5m0-8v.01" /></>}</svg></span>;
}
