"use client";

import { AnimalDonationForm } from "@/components/donation/animal-donation-form";
import { SiteHeader } from "@/components/site-header";
import { useAnimalDonation } from "@/hooks/use-animal-donation";

export default function AnimalDonationPage() {
  const {
    session,
    isPending,
    checkingAddress,
    loading,
    error,
    mainPhoto,
    setMainPhoto,
    extraPhotos,
    setExtraPhotos,
    mainInputKey,
    setMainInputKey,
    extraInputKey,
    setExtraInputKey,
    editId,
    organizationId,
    editData,
    step,
    setStep,
    formRef,
    returnPath,
    steps,
    goToNextStep,
    submit,
  } = useAnimalDonation();
  if (isPending || !session || checkingAddress)
    return (
      <div className="min-h-screen bg-[#eefdf1]">
        <SiteHeader />
        <main className="grid min-h-[60vh] place-items-center">
          <span
            className="size-6 animate-spin rounded-full border-2 border-[#b8d8c1] border-t-[#256441]"
            aria-label="Verificando acesso e endereço"
          />
        </main>
      </div>
    );

  return (
    <AnimalDonationForm
      formRef={formRef}
      submit={submit}
      returnPath={returnPath}
      editId={editId}
      organizationId={organizationId}
      error={error}
      steps={steps}
      step={step}
      setStep={setStep}
      goToNextStep={goToNextStep}
      loading={loading}
      mainPhoto={mainPhoto}
      setMainPhoto={setMainPhoto}
      extraPhotos={extraPhotos}
      setExtraPhotos={setExtraPhotos}
      mainInputKey={mainInputKey}
      setMainInputKey={setMainInputKey}
      extraInputKey={extraInputKey}
      setExtraInputKey={setExtraInputKey}
      editData={editData}
    />
  );
}
