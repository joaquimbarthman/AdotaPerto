import type { FormEvent } from "react";
import type { Dashboard, Tab } from "./types";

type Kind = "animal" | "item";
export type DashboardProps = {
  dashboard: Dashboard;
  tab: Tab;
  selectTab: (tab: Tab) => void;
  currentUserId?: string;
  canManage: boolean;
  busy: boolean;
  claimPublications: () => Promise<void>;
  deletePublication: (kind: Kind, id: string) => Promise<void>;
  updateRequest: (
    kind: Kind,
    id: string,
    status: "Aprovada" | "Recusada",
  ) => Promise<void>;
  changeRole: (memberId: string, role: "admin" | "member") => Promise<void>;
  removeMember: (memberId: string) => Promise<void>;
  invite: (event: FormEvent<HTMLFormElement>) => Promise<void>;
  inviteEmail: string;
  setInviteEmail: (value: string) => void;
  inviteRole: "member" | "admin";
  setInviteRole: (role: "member" | "admin") => void;
  cancelInvitation: (invitationId: string) => Promise<void>;
  setMessage: (message: string | null) => void;
  saveOrganization: (event: FormEvent<HTMLFormElement>) => Promise<void>;
  setLogoFile: (file: File | null) => void;
};
