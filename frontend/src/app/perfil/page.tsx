"use client";

import { ProfileDashboard } from "@/components/profile/profile-dashboard";
import { ProfileLoading } from "@/components/profile/profile-ui";
import { useProfileController } from "@/hooks/use-profile-controller";

export default function ProfilePage() {
  const model = useProfileController();
  const { session, isSessionPending, loadingProfile } = model;

  if (isSessionPending || (session && loadingProfile)) {
    return <ProfileLoading label={isSessionPending ? "Verificando sua sessão" : "Carregando seu perfil"} />;
  }
  if (!session) return <ProfileLoading label="Redirecionando para o login" />;

  return <ProfileDashboard {...model} />;
}
