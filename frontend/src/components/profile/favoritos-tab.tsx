"use client";

import { AnimalCard } from "@/components/animal-card";
import { DonationItemCard } from "@/components/donation-item-card";
import { PageHeading, SegmentedControl, ProfileSearch, ProfilePagination, EmptyTab } from "./profile-ui";
import type { useProfileController } from "@/hooks/use-profile-controller";

type Model = ReturnType<typeof useProfileController>;

export function ProfileFavoritesTab({ model }: { model: Model }) {
  const { favoriteType, setFavoriteType, setFavoritePage, filteredFavorites, filteredFavoriteItems, favoriteSearch, setFavoriteSearch, visibleFavorites, visibleFavoriteItems, setFavorites, setFavoriteItems, currentFavoriteCount, favoritePage, favoritePages } = model;
  return (
              <div className="space-y-4 sm:space-y-6">
                <PageHeading
                  title="Seus favoritos"
                  description="Acesse os animais e itens que você marcou com coração."
                />
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <SegmentedControl
                    value={favoriteType}
                    options={[
                      {
                        id: "animais",
                        label: "Animais",
                        count: filteredFavorites.length,
                      },
                      {
                        id: "itens",
                        label: "Itens",
                        count: filteredFavoriteItems.length,
                      },
                    ]}
                    onChange={(value) => {
                      setFavoriteType(value as "animais" | "itens");
                      setFavoritePage(1);
                    }}
                  />
                  <ProfileSearch
                    value={favoriteSearch}
                    onChange={(value) => {
                      setFavoriteSearch(value);
                      setFavoritePage(1);
                    }}
                    placeholder="Buscar favoritos..."
                  />
                </div>
                {favoriteType === "animais" ? (
                  visibleFavorites.length > 0 ? (
                    <div className="grid grid-cols-2 gap-2.5 sm:gap-6 lg:grid-cols-3">
                      {visibleFavorites.map((fav) => (
                        <AnimalCard
                          key={fav.id}
                          animal={fav.animal}
                          compactMobile
                          isInitiallyFavorite
                          onFavoriteChange={(favorite) => {
                            if (!favorite)
                              setFavorites((current) =>
                                current.filter((item) => item.id !== fav.id),
                              );
                          }}
                        />
                      ))}
                    </div>
                  ) : (
                    <EmptyTab
                      title="Nenhum animal favorito"
                      description="Nenhum favorito corresponde à pesquisa."
                    />
                  )
                ) : visibleFavoriteItems.length > 0 ? (
                  <div className="grid grid-cols-2 gap-2.5 sm:gap-6 lg:grid-cols-3">
                    {visibleFavoriteItems.map((favorite) => (
                      <DonationItemCard
                        key={favorite.id}
                        item={favorite.item}
                        compactMobile
                        isInitiallyFavorite
                        onFavoriteChange={(active) => {
                          if (!active)
                            setFavoriteItems((current) =>
                              current.filter(
                                (entry) => entry.id !== favorite.id,
                              ),
                            );
                        }}
                      />
                    ))}
                  </div>
                ) : (
                  <EmptyTab
                    title="Nenhum item favorito"
                    description="Nenhum favorito corresponde à pesquisa."
                  />
                )}
                {currentFavoriteCount > 0 && (
                  <ProfilePagination
                    page={favoritePage}
                    totalPages={favoritePages}
                    onChange={setFavoritePage}
                    label="favoritos"
                  />
                )}
              </div>

  );
}
