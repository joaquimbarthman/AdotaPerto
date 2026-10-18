"use client";

import { SkeletonLoader } from "@/components/skeleton-loader";
import { LoadErrorState } from "@/components/load-error-state";
import { PageHeading, RequestDirectionTabs, RequestTypePicker, ProfileSearch, ProfilePagination } from "./profile-ui";
import { ItemRequestSection, RequestSection } from "./request-sections";
import type { useProfileController } from "@/hooks/use-profile-controller";

type Model = ReturnType<typeof useProfileController>;

export function ProfileRequestsTab({ model }: { model: Model }) {
  const { requestType, setRequestType, setRequestPage, filteredRequests, filteredReceivedRequests, filteredItemRequests, filteredReceivedItemRequests, requestFilter, setRequestFilter, requestSearch, setRequestSearch, loadingRequests, requestsError, visibleReceivedRequests, visibleRequests, visibleReceivedItemRequests, visibleItemRequests, updateReceivedRequest, updateReceivedItemRequest, currentRequestCount, requestPage, requestPages } = model;
  return (
              <div className="space-y-5 sm:space-y-7">
                <PageHeading
                  title="Central de solicitações"
                  description="Acompanhe adoções e pedidos de itens em uma única área."
                  action={
                    <RequestTypePicker
                      value={requestType}
                      onChange={(value) => {
                        setRequestType(value);
                        setRequestPage(1);
                      }}
                      animalCount={
                        filteredRequests.length +
                        filteredReceivedRequests.length
                      }
                      itemCount={
                        filteredItemRequests.length +
                        filteredReceivedItemRequests.length
                      }
                    />
                  }
                />
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <RequestDirectionTabs
                    value={requestFilter}
                    options={
                      requestType === "animais"
                        ? [
                            {
                              id: "recebidas",
                              label: "Recebidas",
                              count: filteredReceivedRequests.length,
                            },
                            {
                              id: "enviadas",
                              label: "Enviadas",
                              count: filteredRequests.length,
                            },
                          ]
                        : [
                            {
                              id: "recebidas",
                              label: "Recebidas",
                              count: filteredReceivedItemRequests.length,
                            },
                            {
                              id: "enviadas",
                              label: "Enviadas",
                              count: filteredItemRequests.length,
                            },
                          ]
                    }
                    onChange={(value) => {
                      setRequestFilter(value as "recebidas" | "enviadas");
                      setRequestPage(1);
                    }}
                  />
                  <ProfileSearch
                    value={requestSearch}
                    onChange={(value) => {
                      setRequestSearch(value);
                      setRequestPage(1);
                    }}
                    placeholder="Buscar solicitações..."
                  />
                </div>
                {loadingRequests ? (
                  <SkeletonLoader variant="cards" />
                ) : requestsError ? (
                  <LoadErrorState message="Não foi possível carregar suas solicitações." />
                ) : requestType === "animais" ? (
                  requestFilter === "recebidas" ? (
                    <RequestSection
                      empty="Nenhuma solicitação encontrada."
                      requests={visibleReceivedRequests}
                      received
                      onUpdate={updateReceivedRequest}
                    />
                  ) : (
                    <RequestSection
                      empty="Nenhuma solicitação encontrada."
                      requests={visibleRequests}
                    />
                  )
                ) : requestFilter === "recebidas" ? (
                  <ItemRequestSection
                    empty="Nenhuma solicitação encontrada."
                    requests={visibleReceivedItemRequests}
                    received
                    onUpdate={updateReceivedItemRequest}
                  />
                ) : (
                  <ItemRequestSection
                    empty="Nenhuma solicitação encontrada."
                    requests={visibleItemRequests}
                  />
                )}
                {currentRequestCount > 0 && (
                  <ProfilePagination
                    page={requestPage}
                    totalPages={requestPages}
                    onChange={setRequestPage}
                    label="solicitações"
                  />
                )}
              </div>

  );
}
