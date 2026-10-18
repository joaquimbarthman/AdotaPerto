"use client";

import { apiBaseUrl } from "@/lib/api-url";
import { useEffect, useMemo, useRef, useState } from "react";

const API_BASE_URL = apiBaseUrl();
export type Notice = {
  id: string;
  title: string;
  description: string;
  href: string;
  createdAt: string;
  tone: "success" | "info" | "publication";
};
type RequestRecord = {
  id: string;
  status?: string;
  createdAt?: string;
  animal?: { name?: string };
  item?: { title?: string; itemName?: string };
  requester?: { name?: string };
};
type PublicationRecord = {
  id: string;
  createdAt?: string;
  name?: string;
  title?: string;
  itemName?: string;
};

export function useNotificationCenter(userId?: string) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [notices, setNotices] = useState<Notice[]>([]);
  const [readIds, setReadIds] = useState<string[]>([]);
  const rootRef = useRef<HTMLDivElement>(null);
  const storageKey = `adotaperto:notifications-read:${userId || "guest"}`;

  useEffect(() => {
    let active = true;
    async function loadNotifications() {
      setLoading(true);
      try {
        const endpoints = [
          "/api/adoption-requests",
          "/api/adoption-requests/received",
          "/api/donation-item-requests",
          "/api/donation-item-requests/received",
          "/api/animals/mine",
          "/api/donation-items/mine",
        ];
        const responses = await Promise.all(
          endpoints.map((endpoint) =>
            fetch(`${API_BASE_URL}${endpoint}`, { credentials: "include" }),
          ),
        );
        const data = await Promise.all(
          responses.map(async (response) =>
            response.ok ? response.json() : [],
          ),
        );
        if (!active) return;
        const [
          sentAnimals,
          receivedAnimals,
          sentItems,
          receivedItems,
          animals,
          items,
        ] = data as [
          RequestRecord[],
          RequestRecord[],
          RequestRecord[],
          RequestRecord[],
          PublicationRecord[],
          PublicationRecord[],
        ];
        const next: Notice[] = [];
        const addSent = (request: RequestRecord, kind: "animal" | "item") => {
          const subject =
            kind === "animal"
              ? request.animal?.name || "animal"
              : request.item?.title || request.item?.itemName || "item";
          const approved =
            request.status === "Aprovada" || request.status === "APPROVED";
          const refused =
            request.status === "Recusada" || request.status === "REJECTED";
          next.push({
            id: `sent-${kind}-${request.id}-${request.status || "pending"}`,
            title: approved
              ? "Solicitação aprovada"
              : refused
                ? "Solicitação atualizada"
                : "Solicitação enviada",
            description: approved
              ? `Seu pedido para ${subject} foi aprovado.`
              : refused
                ? `Seu pedido para ${subject} não foi aprovado.`
                : `Seu pedido para ${subject} está em análise.`,
            href: "/perfil#solicitacoes",
            createdAt: request.createdAt || new Date(0).toISOString(),
            tone: approved ? "success" : "info",
          });
        };
        const addReceived = (
          request: RequestRecord,
          kind: "animal" | "item",
        ) => {
          const subject =
            kind === "animal"
              ? request.animal?.name || "seu animal"
              : request.item?.title || request.item?.itemName || "seu item";
          next.push({
            id: `received-${kind}-${request.id}-${request.status || "pending"}`,
            title: "Nova solicitação",
            description: `${request.requester?.name || "Alguém"} demonstrou interesse em ${subject}.`,
            href: "/perfil#solicitacoes",
            createdAt: request.createdAt || new Date(0).toISOString(),
            tone: "info",
          });
        };
        const addPublication = (
          publication: PublicationRecord,
          kind: "animal" | "item",
        ) => {
          const subject =
            kind === "animal"
              ? publication.name || "Animal"
              : publication.title || publication.itemName || "Item";
          next.push({
            id: `publication-${kind}-${publication.id}`,
            title: "Publicação ativa",
            description: `${subject} já está visível para a comunidade.`,
            href: "/perfil#publicacoes",
            createdAt: publication.createdAt || new Date(0).toISOString(),
            tone: "publication",
          });
        };
        (Array.isArray(sentAnimals) ? sentAnimals : []).forEach((item) =>
          addSent(item, "animal"),
        );
        (Array.isArray(receivedAnimals) ? receivedAnimals : []).forEach(
          (item) => addReceived(item, "animal"),
        );
        (Array.isArray(sentItems) ? sentItems : []).forEach((item) =>
          addSent(item, "item"),
        );
        (Array.isArray(receivedItems) ? receivedItems : []).forEach((item) =>
          addReceived(item, "item"),
        );
        (Array.isArray(animals) ? animals : []).forEach((item) =>
          addPublication(item, "animal"),
        );
        (Array.isArray(items) ? items : []).forEach((item) =>
          addPublication(item, "item"),
        );
        setNotices(
          next
            .sort(
              (a, b) =>
                new Date(b.createdAt).getTime() -
                new Date(a.createdAt).getTime(),
            )
            .slice(0, 10),
        );
      } finally {
        if (active) setLoading(false);
      }
    }
    queueMicrotask(() => {
      if (!active) return;
      if (!userId) {
        setNotices([]);
        return;
      }
      try {
        setReadIds(JSON.parse(window.localStorage.getItem(storageKey) || "[]"));
      } catch {
        setReadIds([]);
      }
      loadNotifications();
    });
  return () => {
      active = false;
    };
  }, [storageKey, userId]);

  useEffect(() => {
    function close(event: MouseEvent) {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    }
    function closeOnEscape(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", close);
    document.addEventListener("keydown", closeOnEscape);
    return () => {
      document.removeEventListener("mousedown", close);
      document.removeEventListener("keydown", closeOnEscape);
    };
  }, []);

  const unread = useMemo(
    () => notices.filter((notice) => !readIds.includes(notice.id)).length,
    [notices, readIds],
  );
  function saveRead(ids: string[]) {
    setReadIds(ids);
    window.localStorage.setItem(storageKey, JSON.stringify(ids));
  }
  function markAsRead(id: string) {
    saveRead(Array.from(new Set([...readIds, id])));
    setOpen(false);
  }

  return { open, setOpen, loading, notices, readIds, rootRef, unread, saveRead, markAsRead };
}