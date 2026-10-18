"use client";

import { RegistrationForm } from "@/components/auth/registration-form";
import { useRegistration } from "@/hooks/use-registration";

export default function RegisterPage() {
  const registration = useRegistration();
  return <RegistrationForm {...registration} />;
}
