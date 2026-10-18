"use client";

import { CatalogFilterPanel, DistanceFilter, FilterChecks } from "@/components/catalog/catalog-filters";
import { LoadMoreButton } from "@/components/catalog/load-more-button";
import { DonationItemCard } from "@/components/donation-item-card";
import { EmptyState } from "@/components/empty-state";
import { ExploreTabs } from "@/components/explore-tabs";
import { LoadErrorState } from "@/components/load-error-state";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { SkeletonLoader } from "@/components/skeleton-loader";







export type { DonationItem } from "@/data/donation-items";


const CATEGORY_OPTIONS = [
  "Ração",
  "Petiscos",
  "Produtos de higiene",
  "Caminhas e cobertores",
  "Coleiras e guias",
  "Caixas de transporte",
  "Brinquedos",
  "Utensílios",
  "Produtos de limpeza",
  "Outros",
];
const CONDITION_OPTIONS = [
  "Novo",
  "Lacrado",
  "Aberto em boas condições",
  "Usado em boas condições",
];

import type { useItemCatalog } from "@/hooks/use-item-catalog";

export function ItemCatalogView({ model }: { model: ReturnType<typeof useItemCatalog> }) {
  const { filteredItems, activeFilters, loading, queryError, categories, conditions, distance, sort, setCategories, setConditions, setDistance, setSort, visible, setVisible, clear, toggle } = model;
  return (
    <div className="min-h-screen bg-[#eefdf1] text-[#121e17]">
      <SiteHeader />
      <main className="explore-page mx-auto max-w-300 px-3 py-4 sm:px-10 sm:py-8 lg:px-20 lg:py-12">
        <ExploreTabs />
        <div className="grid items-start gap-4 sm:gap-6 lg:grid-cols-[256px_1fr]">
          <CatalogFilterPanel activeFilters={activeFilters} onClear={clear}>
            <FilterChecks
              title="Categoria"
              options={CATEGORY_OPTIONS}
              selected={categories}
              onToggle={(value) => toggle(value, categories, setCategories)}
            />
            <FilterChecks
              title="Condição"
              options={CONDITION_OPTIONS}
              selected={conditions}
              onToggle={(value) => toggle(value, conditions, setConditions)}
            />
            <DistanceFilter
              value={distance}
              onChange={(next) => {
                setDistance(next);
                setVisible(6);
              }}
            />
          </CatalogFilterPanel>
          <section>
            <div className="mb-4 flex flex-col justify-between gap-2.5 sm:mb-6 sm:flex-row sm:items-end sm:gap-4">
              <div>
                <h1 className="text-xl font-extrabold tracking-[-0.02em] sm:text-[40px] sm:leading-12">
                  Itens disponíveis
                </h1>
                <p className="mt-0.5 text-xs text-[#404942] sm:mt-1 sm:text-base">
                  {filteredItems.length}{" "}
                  {filteredItems.length === 1
                    ? "item disponível"
                    : "itens disponíveis"}{" "}
                  para ajudar quem precisa.
                </p>
              </div>
              <label className="flex items-center gap-2 text-[10px] text-[#404942] sm:text-xs">
                Ordenar por:
                <select
                  value={sort}
                  onChange={(event) => setSort(event.target.value)}
                  className="h-8 rounded-lg border border-[#d6e6db] bg-white px-2 text-xs outline-none focus:border-[#256441] sm:h-auto sm:px-3 sm:py-2 sm:text-sm"
                >
                  <option>Mais recentes</option>
                  <option>Maior quantidade</option>
                </select>
              </label>
            </div>
            {loading ? (
              <SkeletonLoader variant="cards" />
            ) : queryError ? (
              <LoadErrorState message="Não foi possível carregar as doações." />
            ) : filteredItems.length ? (
              <div className="grid grid-cols-2 gap-2.5 sm:gap-6 xl:grid-cols-3">
                {filteredItems.slice(0, visible).map((item) => (
                  <DonationItemCard key={item.id} item={item} compactMobile />
                ))}
              </div>
            ) : (
              <EmptyItems filtered={activeFilters > 0} />
            )}
            {visible < filteredItems.length && (
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

function EmptyItems({ filtered }: { filtered: boolean }) {
  return (
    <EmptyState
      message={
        filtered
          ? "Nenhum item encontrado com esses filtros."
          : "Nenhum item disponível agora."
      }
      description={
        filtered
          ? "Tente remover alguns filtros para ampliar os resultados."
          : "Novos itens para doação aparecerão aqui assim que forem publicados."
      }
    />
  );
}
