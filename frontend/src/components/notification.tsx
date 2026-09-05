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

  return <div className="pointer-events-none fixed bottom-6 left-4 z-[200] flex w-[calc(100%-2rem)] max-w-[380px] flex-col-reverse gap-2 sm:left-6" aria-label="Notificações">{notices.map((notice) => {
    const color = colors[notice.type];
    return <div key={notice.id} role={notice.type === "error" ? "alert" : "status"} className={`${notice.exiting ? "notification-exit" : "notification-enter"} relative overflow-hidden rounded-lg shadow-[0_8px_24px_rgba(18,30,23,0.12)] ${color.surface}`}>
      <p className="flex min-h-16 items-center justify-center break-words px-5 py-4 text-center text-sm font-medium leading-5">{notice.text}</p>
      <span className={`notification-progress absolute bottom-0 left-0 h-0.5 w-full origin-left ${color.progress}`} aria-hidden="true" />
    </div>;
  })}</div>;
}
