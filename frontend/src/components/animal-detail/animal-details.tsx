"use client";

import { AnimalMainContent } from "./animal-main-content";
import { AnimalSidebar } from "./animal-sidebar";

import type { Animal } from "@/data/animals";


export type AnimalDetailsProps = {
  animal: Animal;
  locked: boolean;
  sessionPending: boolean;
  approximateDistance: string | null;
  favorite: boolean;
  favoriteLoading: boolean;
  toggleFavorite: () => void;
  handleRequestAdoption: () => void;
};

export function AnimalDetails(props: AnimalDetailsProps) {
  const { animal, locked } = props;
  const photos = animal.images?.length
    ? [animal.image, ...animal.images].filter(
        (photo, index, items) =>
          Boolean(photo) && items.indexOf(photo) === index,
      )
    : [animal.image || "/images/login-cover-v2.png"];

  return (
    <div className="grid min-w-0 items-start gap-3 sm:gap-6 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
      <AnimalMainContent animal={animal} locked={locked} photos={photos} />

      <AnimalSidebar {...props} />
    </div>
  );
}
