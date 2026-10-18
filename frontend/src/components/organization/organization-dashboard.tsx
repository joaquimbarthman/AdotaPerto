"use client";

import { organizationTabs } from "./types";
import type { DashboardProps } from "./dashboard-props";
import { OverviewTab } from "./overview-tab";
import { PublicationsTab } from "./publications-tab";
import { RequestsTab } from "./requests-tab";
import { TeamTab } from "./team-tab";
import { OrganizationDataTab } from "./organization-data-tab";

export function OrganizationDashboard({
  dashboard,
  tab,
  selectTab,
  currentUserId,
  canManage,
  busy,
  claimPublications,
  deletePublication,
  updateRequest,
  changeRole,
  removeMember,
  invite,
  inviteEmail,
  setInviteEmail,
  inviteRole,
  setInviteRole,
  cancelInvitation,
  saveExternal,
  removeExternal,
  setMessage,
  saveOrganization,
  setLogoFile,
}: DashboardProps) {
  return (
    <>
      <nav
        className="mt-8 flex gap-2 overflow-x-auto border-b border-[#cbded0] pb-2"
        aria-label="Seções da organização"
      >
        {organizationTabs.map(({ id, label }) => (
          <button
            key={id}
            type="button"
            onClick={() => selectTab(id)}
            className={`shrink-0 rounded-lg px-4 py-2 text-sm font-semibold ${tab === id ? "bg-[#256441] text-white" : "text-[#526057] hover:bg-white"}`}
          >
            {label}
          </button>
        ))}
      </nav>
      {tab === "visao-geral" && <OverviewTab dashboard={dashboard} />}
      {tab === "publicacoes" && (
        <PublicationsTab
          dashboard={dashboard}
          currentUserId={currentUserId}
          canManage={canManage}
          busy={busy}
          claimPublications={claimPublications}
          deletePublication={deletePublication}
        />
      )}
      {tab === "solicitacoes" && (
        <RequestsTab
          dashboard={dashboard}
          currentUserId={currentUserId}
          canManage={canManage}
          busy={busy}
          updateRequest={updateRequest}
        />
      )}
      {tab === "equipe" && (
        <TeamTab
          dashboard={dashboard}
          canManage={canManage}
          busy={busy}
          changeRole={changeRole}
          removeMember={removeMember}
          invite={invite}
          inviteEmail={inviteEmail}
          setInviteEmail={setInviteEmail}
          inviteRole={inviteRole}
          setInviteRole={setInviteRole}
          cancelInvitation={cancelInvitation}
          saveExternal={saveExternal}
          removeExternal={removeExternal}
          setMessage={setMessage}
        />
      )}
      {tab === "dados" && (
        <OrganizationDataTab
          dashboard={dashboard}
          canManage={canManage}
          busy={busy}
          saveOrganization={saveOrganization}
          setLogoFile={setLogoFile}
        />
      )}
    </>
  );
}

