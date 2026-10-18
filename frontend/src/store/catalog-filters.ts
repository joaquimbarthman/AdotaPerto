import { create } from "zustand";

type AdoptionFilters = {
  species: string[];
  age: string[];
  sex: string;
  size: string;
  distance: number;
};

type ItemFilters = {
  categories: string[];
  conditions: string[];
  distance: number;
  sort: string;
};

const defaultAdoption: AdoptionFilters = { species: [], age: [], sex: "Qualquer", size: "", distance: 10 };
const defaultItems: ItemFilters = { categories: [], conditions: [], distance: 10, sort: "Mais recentes" };

type CatalogFilterStore = {
  adoption: AdoptionFilters;
  items: ItemFilters;
  setAdoption: (patch: Partial<AdoptionFilters>) => void;
  setItems: (patch: Partial<ItemFilters>) => void;
  resetAdoption: () => void;
  resetItems: () => void;
};

export const useCatalogFilters = create<CatalogFilterStore>()((set) => ({
  adoption: defaultAdoption,
  items: defaultItems,
  setAdoption: (patch) => set((state) => ({ adoption: { ...state.adoption, ...patch } })),
  setItems: (patch) => set((state) => ({ items: { ...state.items, ...patch } })),
  resetAdoption: () => set({ adoption: defaultAdoption }),
  resetItems: () => set({ items: defaultItems }),
}));
