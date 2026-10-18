"use client";

import { AnimalCard } from "@/components/animal-card";
import { CatalogFilterPanel, DistanceFilter, FilterChecks, FilterPills } from "@/components/catalog/catalog-filters";
import { LoadMoreButton } from "@/components/catalog/load-more-button";
import { EmptyState } from "@/components/empty-state";
import { ExploreTabs } from "@/components/explore-tabs";
import { LoadErrorState } from "@/components/load-error-state";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { SkeletonLoader } from "@/components/skeleton-loader";










import type { useAdoptionCatalog } from "@/hooks/use-adoption-catalog";

export function AdoptionCatalogView({ model }: { model: ReturnType<typeof useAdoptionCatalog> }) {
  const { animals, activeFilters, loadingAnimals, loadError, species, age, sex, size, distance, setSpecies, setAge, setSex, setSize, setDistance, visible, setVisible, clear, toggle } = model;
  return (
    <div className="min-h-screen bg-[#eefdf1] text-[#121e17]">
      <SiteHeader />
      <main className="explore-page mx-auto max-w-300 px-3 py-4 sm:px-10 sm:py-8 lg:px-20 lg:py-12">
        <ExploreTabs />
        <div className="grid items-start gap-4 sm:gap-6 lg:grid-cols-[256px_1fr]">
          <CatalogFilterPanel activeFilters={activeFilters} onClear={clear}>
            <FilterChecks
              title="Espécie"
              options={["Cachorro", "Gato"]}
              selected={species}
              onToggle={(value) => toggle(value, species, setSpecies)}
            />
            <FilterPills
              title="Sexo"
              options={["Qualquer", "Fêmea", "Macho"]}
              selected={sex}
              onSelect={setSex}
            />
            <FilterChecks
              title="Idade"
              options={[
                "Filhote (0-1 ano)",
                "Jovem (1-3 anos)",
                "Adulto (3-8 anos)",
                "Sênior (8+ anos)",
              ]}
              selected={age}
              onToggle={(value) => toggle(value, age, setAge)}
            />
            <FilterPills
              title="Porte"
              options={["P", "M", "G"]}
              selected={size}
              onSelect={setSize}
            />
            <DistanceFilter value={distance} onChange={setDistance} />
          </CatalogFilterPanel>
          <section>
            <div className="mb-4 flex flex-col justify-between gap-2.5 sm:mb-6 sm:flex-row sm:items-end sm:gap-4">
              <div>
                <h1 className="text-xl font-extrabold tracking-[-0.02em] sm:text-[40px] sm:leading-12">
                  Encontre seu novo amigo
                </h1>
                <p className="mt-0.5 text-xs text-[#404942] sm:mt-1 sm:text-base">
                  {animals.length} animais aguardando adoção perto de você.
                </p>
              </div>
              <label className="flex items-center gap-2 text-[10px] text-[#404942] sm:text-xs">
                Ordenar por:
                <select className="h-8 rounded-lg border border-[#d6e6db] bg-white px-2 text-xs outline-none focus:border-[#256441] sm:h-auto sm:px-3 sm:py-2 sm:text-sm">
                  <option>Mais próximos</option>
                  <option>Mais recentes</option>
                </select>
              </label>
            </div>
            {loadingAnimals ? (
              <SkeletonLoader variant="cards" />
            ) : loadError ? (
              <LoadErrorState message="Não foi possível carregar os animais." />
            ) : animals.length ? (
              <div className="grid grid-cols-2 gap-2.5 sm:gap-6 xl:grid-cols-3">
                {animals.slice(0, visible).map((animal) => (
                  <AnimalCard key={animal.id} animal={animal} compactMobile />
                ))}
              </div>
            ) : (
              <EmptyAnimals filtered={activeFilters > 0} />
            )}
            {visible < animals.length && (
              <LoadMoreButton
                onClick={() => setVisible((value) => value + 3)}
              />
            )}
          </section>
        </div>
      </main>
      <div className="mt-10">
        <SiteFooter />
      </div>
    </div>
  );
}

function EmptyAnimals({ filtered }: { filtered: boolean }) {
  return (
    <EmptyState
      message={
        filtered
          ? "Nenhum animal encontrado com esses filtros."
          : "Nenhum animal disponível agora."
      }
      description={
        filtered
          ? "Tente remover alguns filtros para ampliar os resultados."
          : "Novos animais para adoção aparecerão aqui assim que forem publicados."
      }
    />
  );
}
