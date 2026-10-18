"use client";

import { apiBaseUrl } from "@/lib/api-url";
import { useRouter } from "next/navigation";
import { type FormEvent, useEffect, useRef, useState } from "react";
import { authClient } from "@/lib/auth-client";
import { authErrorMessage } from "@/lib/auth-error-message";
type OrganizationRegistration = {
  name: string;
  slug: string;
  cnpj: string;
  phone: string;
  website: string;
  instagram: string;
  description: string;
};

function organizationSlug(name: string) {
  const base = name.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "ong";
  return `${base}-${crypto.randomUUID().slice(0, 8)}`;
}

export function useRegistration() {
  const router = useRouter();
  const userFieldsRef = useRef<HTMLDivElement>(null);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isFirstUser, setIsFirstUser] = useState(false);
  const [isOrganization, setIsOrganization] = useState(false);
  const [step, setStep] = useState<"user" | "organization">("user");
  const [pendingOrganization, setPendingOrganization] = useState<OrganizationRegistration | null>(null);
  const [registrationCheck, setRegistrationCheck] = useState<"loading" | "ready" | "error">("loading");
  const [checkAttempt, setCheckAttempt] = useState(0);

  useEffect(() => {
    let controller: AbortController;
    async function checkRegistration() {
      controller?.abort();
      controller = new AbortController();
      const { signal } = controller;
      try {
        const apiUrl = apiBaseUrl();
        const response = await fetch(`${apiUrl}/api/registration/status`, {
          cache: "no-store",
          signal,
        });
        if (!response.ok) throw new Error("Registration status unavailable");
        const data = await response.json();
        if (typeof data.isFirstUser !== "boolean") throw new Error("Invalid registration status");
        if (!signal.aborted) {
          setIsFirstUser(data.isFirstUser);
          setRegistrationCheck("ready");
        }
      } catch {
        if (!signal.aborted) {
          setIsFirstUser(false);
          setRegistrationCheck("error");
        }
      }
    }
    void checkRegistration();
    window.addEventListener("focus", checkRegistration);
    return () => {
      controller?.abort();
      window.removeEventListener("focus", checkRegistration);
    };
  }, [checkAttempt]);

  function continueToOrganization() {
    const fields = userFieldsRef.current?.querySelectorAll<HTMLInputElement>("input");
    for (const field of fields ?? []) {
      if (!field.reportValidity()) return;
    }
    const password = userFieldsRef.current?.querySelector<HTMLInputElement>('input[name="password"]')?.value;
    const confirmation = userFieldsRef.current?.querySelector<HTMLInputElement>('input[name="confirmPassword"]')?.value;
    if (password !== confirmation) {
      setErrorMessage("As senhas não coincidem.");
      return;
    }
    setErrorMessage(null);
    setStep("organization");
    userFieldsRef.current?.parentElement?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (isOrganization && step === "user") {
      continueToOrganization();
      return;
    }
    setErrorMessage(null);

    const formData = new FormData(event.currentTarget);
    const name = formData.get("name") as string;
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;
    const confirmPassword = formData.get("confirmPassword") as string;
    const organizationName = (formData.get("organizationName") as string | null)?.trim() ?? "";

    if (password !== confirmPassword) {
      setErrorMessage("As senhas não coincidem.");
      return;
    }

    if (isOrganization && !organizationName) {
      setErrorMessage("Informe o nome da ONG ou organização.");
      return;
    }

    setLoading(true);

    const { error } = await authClient.signUp.email({
      name,
      email,
      password,
    });

    if (error) {
      setLoading(false);
      setErrorMessage(authErrorMessage(error, "Erro ao criar conta. Tente novamente."));
      return;
    }

    if (isOrganization) {
      const organizationData: OrganizationRegistration = {
        name: organizationName,
        slug: organizationSlug(organizationName),
        cnpj: formData.get("organizationDocument") as string,
        phone: formData.get("organizationPhone") as string,
        website: formData.get("organizationWebsite") as string,
        instagram: formData.get("organizationInstagram") as string,
        description: formData.get("organizationDescription") as string,
      };
      setPendingOrganization(organizationData);
      const result = await authClient.organization.create(organizationData);
      if (result.error) {
        setLoading(false);
        setErrorMessage("Sua conta foi criada, mas não conseguimos salvar os dados da ONG. Tente novamente.");
        return;
      }
      setPendingOrganization(null);
    }

    setLoading(false);
    router.replace(isOrganization ? "/organizacao" : "/");
    router.refresh();
  }

  async function retryOrganizationRegistration() {
    if (!pendingOrganization) return;
    setLoading(true);
    const { error } = await authClient.organization.create(pendingOrganization);
    setLoading(false);
    if (error) {
      setErrorMessage("Ainda não foi possível salvar os dados da ONG. Tente novamente.");
      return;
    }
    setPendingOrganization(null);
    router.replace("/organizacao");
    router.refresh();
  }

  return { userFieldsRef, handleSubmit, retryOrganizationRegistration, loading, errorMessage, isFirstUser,
    isOrganization, setIsOrganization, step, setStep, pendingOrganization, registrationCheck,
    setRegistrationCheck, setCheckAttempt };
}