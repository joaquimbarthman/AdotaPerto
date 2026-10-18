"use client";

import Image from "next/image";
import { DonationPhotoPreview as PhotoPreview, DonationFormSection as Section } from "@/components/donation-form-ui";

import type { Props } from "./animal-donation-form";

export function AnimalPhotosStep(props: Props) {
  const { step, mainPhoto, setMainPhoto, extraPhotos, setExtraPhotos, mainInputKey, setMainInputKey, extraInputKey, setExtraInputKey, editData } = props;
  return (
<div
              data-donation-step="4"
              className={
                step === 4
                  ? "donation-step-panel space-y-4 sm:space-y-7"
                  : "hidden"
              }
            >
              <Section
                icon={
                  <Image
                    src="/icons/gallery.svg"
                    alt=""
                    width={24}
                    height={24}
                    className="size-6 object-contain"
                  />
                }
                title="Fotos"
                description="Adicione imagens claras e atuais. A primeira será usada como foto principal."
              >
                <div className="grid gap-5 sm:grid-cols-2">
                  <div className="flex flex-col gap-1.5 text-sm font-semibold text-[#121e17]">
                    <span>Foto principal</span>
                    <input
                      key={mainInputKey}
                      name="fotoPrincipal"
                      type="file"
                      accept="image/png,image/jpeg,image/webp"
                      onChange={(event) =>
                        setMainPhoto(event.target.files?.[0] || null)
                      }
                      className="block w-full rounded-lg border border-dashed border-[#86a590] bg-[#f7fcf8] p-4 text-sm file:mr-3 file:rounded-lg file:border-0 file:bg-[#256441] file:px-4 file:py-2 file:font-semibold file:text-white"
                    />
                    {mainPhoto && (
                      <div className="mt-2 max-w-52">
                        <PhotoPreview
                          file={mainPhoto}
                          label="foto principal"
                          onRemove={() => {
                            setMainPhoto(null);
                            setMainInputKey((value) => value + 1);
                          }}
                        />
                      </div>
                    )}
                    {!mainPhoto && typeof editData?.image === "string" && (
                      <div className="relative mt-2 h-32 max-w-52 overflow-hidden rounded-xl">
                        <Image
                          src={editData.image}
                          alt="Foto atual"
                          fill
                          className="object-cover"
                        />
                        <span className="absolute bottom-2 left-2 rounded-md bg-black/65 px-2 py-1 text-xs text-white">
                          Foto atual
                        </span>
                      </div>
                    )}
                  </div>
                  <div className="flex flex-col gap-1.5 text-sm font-semibold text-[#121e17]">
                    <span>
                      Outras fotos{" "}
                      <span className="font-normal text-[#68726b]">
                        (opcional, até 5)
                      </span>
                    </span>
                    <input
                      key={extraInputKey}
                      name="fotos"
                      type="file"
                      accept="image/png,image/jpeg,image/webp"
                      multiple
                      onChange={(event) => {
                        const selected = Array.from(
                          event.target.files || [],
                        ).slice(0, 5);
                        setExtraPhotos(selected);
                      }}
                      className="block w-full rounded-lg border border-dashed border-[#86a590] bg-[#f7fcf8] p-4 text-sm file:mr-3 file:rounded-lg file:border-0 file:bg-[#e3f2e6] file:px-4 file:py-2 file:font-semibold file:text-[#256441]"
                    />
                    {extraPhotos.length > 0 && (
                      <span className="text-xs font-normal text-[#526057]">
                        {extraPhotos.length} foto(s) adicional(is)
                        selecionada(s)
                      </span>
                    )}
                  </div>
                </div>
                {extraPhotos.length > 0 && (
                  <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-5">
                    {extraPhotos.map((file, index) => (
                      <PhotoPreview
                        key={`${file.name}-${file.lastModified}-${index}`}
                        file={file}
                        label={`foto adicional ${index + 1}`}
                        onRemove={() => {
                          setExtraPhotos((photos) =>
                            photos.filter(
                              (_, photoIndex) => photoIndex !== index,
                            ),
                          );
                          setExtraInputKey((value) => value + 1);
                        }}
                      />
                    ))}
                  </div>
                )}
              </Section>
              <section className="rounded-2xl border border-[#d7e6da] bg-white p-5 sm:p-7">
                <label className="flex cursor-pointer items-start gap-3 text-sm leading-6 text-[#343e37]">
                  <input
                    type="checkbox"
                    name="declaracao"
                    required
                    className="mt-1 size-5 shrink-0 accent-[#256441]"
                  />
                  <span>
                    Declaro que sou responsável pelas informações fornecidas,
                    que elas são verdadeiras e que agirei com transparência e
                    responsabilidade durante o processo de adoção.
                  </span>
                </label>
              </section>
            </div>
  );
}
