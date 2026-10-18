"use client";

import { Notification } from "@/components/notification";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { DeletePublicationModal } from "./publications-panel";
import { ProfileSummary } from "./profile-summary";
import { ProfileMobileActions } from "./profile-mobile-actions";
import { ProfileNavigation } from "./profile-navigation-view";
import { ProfileTabContent } from "./profile-tab-content";
import type { useProfileController } from "@/hooks/use-profile-controller";

type ProfileModel = ReturnType<typeof useProfileController>;

export function ProfileDashboard(model: ProfileModel) {
  const { toastMessage, publicationToDelete, setPublicationToDelete, deletingPublication, confirmPublicationRemoval } = model;
  return (
    <div className="min-h-screen bg-[#eefdf1] text-[#121e17]">
      <SiteHeader />
      <main className="mx-auto max-w-300 px-3 pb-24 pt-4 sm:px-10 sm:pt-8 lg:px-20">
        {toastMessage && <Notification text={toastMessage.text} type={toastMessage.type} />}
        <ProfileSummary model={model} />
        <ProfileMobileActions model={model} />
        <div className="mt-4 grid items-start gap-5 sm:mt-10 sm:gap-8 lg:grid-cols-[230px_1fr] lg:gap-12">
          <ProfileNavigation model={model} />
          <ProfileTabContent model={model} />
        </div>
      </main>
      {publicationToDelete && <DeletePublicationModal publication={publicationToDelete} loading={deletingPublication} onCancel={() => setPublicationToDelete(null)} onConfirm={confirmPublicationRemoval} />}
      <SiteFooter />
    </div>
  );
}
