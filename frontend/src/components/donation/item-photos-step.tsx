"use client";

import { DonationField, DonationFormSection, DonationPhotoPreview } from "@/components/donation-form-ui";
import { SectionIcon } from "./item-form-parts";

import Image from "next/image";
import type { Props } from "./item-donation-form";

export function ItemPhotosStep(props: Props) {
  const { step, mainPhoto, setMainPhoto, extraPhotos, setExtraPhotos, mainInputKey, setMainInputKey, extraInputKey, setExtraInputKey, editData, errors, setErrors } = props;
  return (
<div
              data-donation-step="2"
              className={step === 2 ? "donation-step-panel" : "hidden"}
            >
              <DonationFormSection
                icon={<SectionIcon src="/icons/gallery.svg" />}
                title="Fotos"
                description="Use imagens claras e reais. A foto principal aparecerá em destaque no anúncio."
              >
                <div className="grid gap-6 sm:grid-cols-2">
                  <DonationField
                    label="Foto principal"
                    error={errors.mainPhoto}
                  >
                    <input
                      key={mainInputKey}
                      type="file"
                      accept="image/png,image/jpeg,image/webp"
                      onChange={(event) => {
                        setMainPhoto(event.target.files?.[0] || null);
                        setErrors((current) => ({ ...current, mainPhoto: "" }));
                      }}
                      className="block min-h-14 w-full rounded-lg border border-dashed border-[#86a590] bg-[#f7fcf8] p-3 text-sm file:mr-3 file:rounded-lg file:border-0 file:bg-[#256441] file:px-4 file:py-2 file:font-semibold file:text-white"
                    />
                    {mainPhoto && (
                      <div className="mt-3 max-w-64">
                        <DonationPhotoPreview
                          featured
                          file={mainPhoto}
                          label="Foto principal"
                          onRemove={() => {
                            setMainPhoto(null);
                            setMainInputKey((value) => value + 1);
                          }}
                        />
                      </div>
                    )}
                    {!mainPhoto && typeof editData?.mainImage === "string" && (
                      <div className="relative mt-3 h-36 max-w-64 overflow-hidden rounded-xl">
                        <Image
                          src={editData.mainImage}
                          alt="Foto atual"
                          fill
                          className="object-cover"
                        />
                        <span className="absolute bottom-2 left-2 rounded-md bg-black/65 px-2 py-1 text-xs text-white">
                          Foto atual
                        </span>
                      </div>
                    )}
                  </DonationField>
                  <DonationField label="Fotos adicionais" optional>
                    <input
                      key={extraInputKey}
                      type="file"
                      accept="image/png,image/jpeg,image/webp"
                      multiple
                      onChange={(event) =>
                        setExtraPhotos(
                          Array.from(event.target.files || []).slice(0, 5),
                        )
                      }
                      className="block min-h-14 w-full rounded-lg border border-dashed border-[#86a590] bg-[#f7fcf8] p-3 text-sm file:mr-3 file:rounded-lg file:border-0 file:bg-[#e3f2e6] file:px-4 file:py-2 file:font-semibold file:text-[#256441]"
                    />
                    <span className="text-xs font-normal text-[#526057]">
                      Até 5 imagens adicionais.
                    </span>
                  </DonationField>
                </div>
                {extraPhotos.length > 0 && (
                  <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-5">
                    {extraPhotos.map((file, index) => (
                      <DonationPhotoPreview
                        key={`${file.name}-${file.lastModified}-${index}`}
                        file={file}
                        label={`Foto adicional ${index + 1}`}
                        onRemove={() => {
                          setExtraPhotos((files) =>
                            files.filter((_, itemIndex) => itemIndex !== index),
                          );
                          setExtraInputKey((value) => value + 1);
                        }}
                      />
                    ))}
                  </div>
                )}
              </DonationFormSection>
            </div>
  );
}
