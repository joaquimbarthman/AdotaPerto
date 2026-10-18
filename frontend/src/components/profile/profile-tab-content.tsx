"use client";

import { ProfileForm } from "./profile-ui";
import { PublicationsPanel } from "./publications-panel";
import { PersonalData, AddressData } from "./personal-data";
import { AccountAccess } from "./account-access";
import { ProfileRequestsTab } from "./solicitacoes-tab";
import { ProfileFavoritesTab } from "./favoritos-tab";
import type { useProfileController } from "@/hooks/use-profile-controller";

type Model = ReturnType<typeof useProfileController>;

export function ProfileTabContent({ model }: { model: Model }) {
  const {
    router,
    activeTab,
    profile,
    myAnimals,
    myItems,
    publicationFilter,
    setPublicationFilter,
    loadingPublications,
    publicationsError,
    savingPersonal,
    savingAddress,
    croppedPhoto,
    setCroppedPhoto,
    photoPreview,
    setPhotoPreview,
    userName,
    userEmail,
    userImage,
    userBio,
    handleSavePersonalData,
    handleSaveAddressData,
    removePublication,
  } = model;
  return (
          <section
            key={activeTab}
            className="profile-content profile-tab-panel min-w-0"
          >
            {activeTab === "publicacoes" && (
              <PublicationsPanel
                filter={publicationFilter}
                onFilter={setPublicationFilter}
                animals={myAnimals}
                items={myItems}
                loading={loadingPublications}
                error={publicationsError}
                onEdit={(publication) =>
                  router.push(
                    `/doacoes/${publication.kind === "animal" ? "animal" : "item"}?edit=${publication.data.id}`,
                  )
                }
                onRemove={removePublication}
              />
            )}
            {activeTab === "solicitacoes" && <ProfileRequestsTab model={model} />}
            {activeTab === "favoritos" && <ProfileFavoritesTab model={model} />}
            {activeTab === "dados" && (
              <ProfileForm
                key={`dados-${profile?.name}-${profile?.bio}-${profile?.birthDate}-${profile?.instagram}-${profile?.whatsapp}`}
                onSubmit={handleSavePersonalData}
                loading={savingPersonal}
              >
                <PersonalData
                  profile={profile}
                  userName={userName}
                  userImage={photoPreview || userImage}
                  userBio={userBio}
                  photoLoading={savingPersonal && Boolean(croppedPhoto)}
                  onPhotoCrop={(file, preview) => {
                    if (photoPreview) URL.revokeObjectURL(photoPreview);
                    setCroppedPhoto(file);
                    setPhotoPreview(preview);
                  }}
                />
              </ProfileForm>
            )}
            {activeTab === "endereco" && (
              <ProfileForm
                key={`endereco-${profile?.zipCode}-${profile?.street}-${profile?.city}-${profile?.state}`}
                onSubmit={handleSaveAddressData}
                loading={savingAddress}
              >
                <AddressData profile={profile} />
              </ProfileForm>
            )}
            {activeTab === "acesso" && (
              <ProfileForm showActions={false}>
                <AccountAccess userEmail={userEmail} />
              </ProfileForm>
            )}
          </section>
  );
}
