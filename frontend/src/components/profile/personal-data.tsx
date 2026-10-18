"use client";

import { ProfilePhotoCropper } from "@/components/profile-photo-cropper";
import { ProfileField, SectionHeading } from "./profile-ui";
import type { UserProfile } from "./types";

export function PersonalData({
  profile,
  userName,
  userImage,
  userBio,
  photoLoading,
  onPhotoCrop,
}: {
  profile: UserProfile | null;
  userName: string;
  userImage: string;
  userBio: string;
  photoLoading: boolean;
  onPhotoCrop: (file: File, preview: string) => void;
}) {
  const birthDate = profile?.birthDate || "";
  const instagram = profile?.instagram || "";
  const whatsapp = profile?.whatsapp || "";

  return (
    <section id="panel-dados" role="tabpanel" aria-labelledby="tab-dados">
      <SectionHeading
        title="Dados pessoais"
        description="Consulte e atualize suas informações pessoais de perfil."
      />
      <div className="grid gap-5 sm:gap-8 lg:grid-cols-[180px_1fr] lg:gap-12">
        <div>
          <p className="mb-3 text-sm font-bold text-[#253129]">
            Foto de perfil
          </p>
          <div className="flex items-center gap-4 lg:flex-col lg:items-start">
            <ProfilePhotoCropper
              currentImage={userImage}
              name={userName}
              loading={photoLoading}
              onCrop={onPhotoCrop}
            />
          </div>
        </div>
        <div className="grid content-start gap-4 sm:grid-cols-2 sm:gap-5">
          <div className="sm:col-span-2">
            <ProfileField
              label="Nome completo"
              name="nome"
              defaultValue={userName}
              autoComplete="name"
              required
            />
          </div>
          <ProfileField
            label="Data de nascimento"
            name="nascimento"
            type="date"
            defaultValue={birthDate}
            autoComplete="bday"
          />
          <ProfileField
            label="Instagram"
            name="instagram"
            defaultValue={instagram}
            placeholder="@seuusuario"
            autoComplete="off"
          />
          <ProfileField
            label={"WhatsApp / n\u00famero"}
            name="whatsapp"
            type="tel"
            inputMode="tel"
            defaultValue={whatsapp}
            placeholder="(00) 00000-0000"
            autoComplete="tel"
          />
          <label className="sm:col-span-2">
            <span className="mb-2 block text-sm font-bold text-[#253129]">
              Bio
            </span>
            <textarea
              name="bio"
              rows={5}
              maxLength={300}
              defaultValue={userBio}
              placeholder="Conte um pouco sobre você..."
              className="w-full resize-y rounded-xl border border-[#c0c9bf] bg-[#f7fcf8] px-4 py-3 text-sm leading-6 text-[#121e17] outline-none transition placeholder:text-[#879188] focus:border-[#3f7d58] focus:ring-2 focus:ring-[#3f7d58]/15"
            />
            <span className="mt-1.5 block text-right text-xs text-[#7b8980]">
              Até 300 caracteres
            </span>
          </label>
        </div>
      </div>
    </section>
  );
}

export { AddressData } from "./address-data";
