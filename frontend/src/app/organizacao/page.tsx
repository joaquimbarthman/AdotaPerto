"use client";

import { OrganizationDashboard } from "@/components/organization/organization-dashboard";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { useOrganizationController } from "@/hooks/use-organization-controller";
import Image from "next/image";
import Link from "next/link";

const box = "rounded-2xl border border-[#d7e6da] bg-white p-5 shadow-sm sm:p-6";
const input =
  "min-h-11 w-full rounded-lg border border-[#c8d2ca] bg-white px-3 py-2 text-sm outline-none focus:border-[#256441]";
const button =
  "min-h-11 rounded-lg bg-[#256441] px-4 py-2 text-sm font-bold text-white disabled:opacity-50";

export default function OrganizationPage() {
  const {
    session,
    isPending,
    organizations,
    selectedId,
    dashboard,
    tab,
    loading,
    busy,
    error,
    message,
    inviteEmail,
    setInviteEmail,
    inviteRole,
    setInviteRole,
    selectOrganization,
    selectTab,
    createOrganization,
    saveOrganization,
    invite,
    changeRole,
    removeMember,
    cancelInvitation,
    updateRequest,
    deletePublication,
    claimPublications,
    canManage,
    setMessage,
    setLogoFile,
  } = useOrganizationController();
  return (
    <div className="min-h-screen bg-[#eefdf1] text-[#253129]">
      <SiteHeader />
      <main className="mx-auto max-w-300 px-4 pb-28 pt-8 sm:px-6 lg:px-12 lg:pb-16">
        <Link href="/perfil" className="text-sm font-semibold text-[#256441]">
          ← Meu perfil
        </Link>
        <header className="mt-5 flex flex-wrap items-end justify-between gap-4">
          <div className="flex items-center gap-4">
            {dashboard?.organization.logo && (
              <Image
                src={dashboard.organization.logo}
                alt=""
                width={64}
                height={64}
                unoptimized
                className="size-16 rounded-xl border border-[#d7e6da] bg-white object-cover"
              />
            )}
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-[#43805a]">
                Área da organização
              </p>
              <h1 className="mt-2 text-3xl font-extrabold sm:text-4xl">
                {dashboard?.organization.name || "Painel da ONG"}
              </h1>
              <p className="mt-2 text-sm text-[#68726b]">
                Gerencie a equipe, os anúncios e as solicitações da sua
                organização.
              </p>
            </div>
          </div>
          {organizations.length > 1 && (
            <label className="text-xs font-semibold">
              Organização
              <select
                className={`${input} mt-1`}
                value={selectedId || ""}
                onChange={(event) => selectOrganization(event.target.value)}
              >
                {organizations.map(({ organization }) => (
                  <option key={organization.id} value={organization.id}>
                    {organization.name}
                  </option>
                ))}
              </select>
            </label>
          )}
        </header>
        {error && (
          <p
            role="alert"
            className="mt-5 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800"
          >
            {error}
          </p>
        )}
        {message && (
          <p
            role="status"
            className="mt-5 rounded-xl border border-green-200 bg-green-50 p-4 text-sm text-green-800"
          >
            {message}
          </p>
        )}
        {loading || isPending ? (
          <p role="status" className={`${box} mt-6`}>
            Carregando painel...
          </p>
        ) : !dashboard ? (
          <section className={`${box} mt-6 max-w-xl`}>
            <h2 className="text-lg font-bold">
              Você ainda não faz parte de uma ONG
            </h2>
            <p className="mt-2 text-sm text-[#68726b]">
              Crie uma organização ou peça um convite a um gestor.
            </p>
            <form
              onSubmit={createOrganization}
              className="mt-5 flex flex-wrap gap-3"
            >
              <input
                name="name"
                required
                minLength={2}
                maxLength={160}
                placeholder="Nome da ONG"
                className={`${input} flex-1`}
              />
              <button disabled={busy} className={button}>
                Criar ONG
              </button>
            </form>
          </section>
        ) : (
          <OrganizationDashboard
            dashboard={dashboard}
            tab={tab}
            selectTab={selectTab}
            currentUserId={session?.user.id}
            canManage={canManage}
            busy={busy}
            claimPublications={claimPublications}
            deletePublication={deletePublication}
            updateRequest={updateRequest}
            changeRole={changeRole}
            removeMember={removeMember}
            invite={invite}
            inviteEmail={inviteEmail}
            setInviteEmail={setInviteEmail}
            inviteRole={inviteRole}
            setInviteRole={setInviteRole}
            cancelInvitation={cancelInvitation}
            setMessage={setMessage}
            saveOrganization={saveOrganization}
            setLogoFile={setLogoFile}
          />
        )}
      </main>
      <SiteFooter />
    </div>
  );
}
