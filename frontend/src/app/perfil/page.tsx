"use client";

import { Notification } from "@/components/notification";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { FormEvent } from "react";
import { useEffect, useState } from "react";
import { AnimalCard } from "@/components/animal-card";
import { SkeletonLoader } from "@/components/skeleton-loader";
import { LoadErrorState } from "@/components/load-error-state";
import { DonationItemCard } from "@/components/donation-item-card";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { authClient, useSession } from "@/lib/auth-client";
import type { Animal } from "@/data/animals";
import { uploadImages } from "@/lib/uploads";
import { ThemeToggle } from "@/components/theme-toggle";
import type { TabId, UserProfile, AdoptionRequestItem, FavoriteItem, FavoriteDonationItem, DonationItem, EditablePublication, DonationItemRequest } from "@/components/profile/types";
import { API_BASE_URL, tabs } from "@/components/profile/config";
import { PageHeading, ProfileNavIcon, SegmentedControl, RequestDirectionTabs, RequestTypePicker, ProfileSearch, ProfilePagination, ProfileLoading, ProfileForm, EmptyTab } from "@/components/profile/profile-ui";
import { DeletePublicationModal, PublicationsPanel } from "@/components/profile/publications-panel";
import { ItemRequestSection, RequestSection } from "@/components/profile/request-sections";
import { PersonalData, AddressData } from "@/components/profile/personal-data";
import { AccountAccess } from "@/components/profile/account-access";
import { useDebouncedValue } from "@/components/profile/use-debounced-value";

function formatMemberSince(date?: string | Date) {
  if (!date) return "Membro recente";
  const d = new Date(date);
  if (isNaN(d.getTime())) return "Membro recente";
  return `Desde ${d.toLocaleDateString("pt-BR", { month: "2-digit", year: "numeric" })}`;
}

export default function ProfilePage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<TabId>("dados");
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [requests, setRequests] = useState<AdoptionRequestItem[]>([]);
  const [receivedRequests, setReceivedRequests] = useState<AdoptionRequestItem[]>([]);
  const [favorites, setFavorites] = useState<FavoriteItem[]>([]);
  const [favoriteItems, setFavoriteItems] = useState<FavoriteDonationItem[]>([]);
  const [favoriteType, setFavoriteType] = useState<"animais" | "itens">("animais");
  const [myAnimals, setMyAnimals] = useState<Animal[]>([]);
  const [myItems, setMyItems] = useState<DonationItem[]>([]);
  const [publicationFilter, setPublicationFilter] = useState<"animais" | "itens">("animais");
  const [requestSearch, setRequestSearch] = useState("");
  const [favoriteSearch, setFavoriteSearch] = useState("");
  const [requestPage, setRequestPage] = useState(1);
  const [favoritePage, setFavoritePage] = useState(1);
  const [requestFilter, setRequestFilter] = useState<"recebidas" | "enviadas">("recebidas");
  const [requestType, setRequestType] = useState<"animais" | "itens">("animais");
  const [itemRequests, setItemRequests] = useState<DonationItemRequest[]>([]);
  const [receivedItemRequests, setReceivedItemRequests] = useState<DonationItemRequest[]>([]);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [savingPersonal, setSavingPersonal] = useState(false);
  const [savingAddress, setSavingAddress] = useState(false);
  const [croppedPhoto, setCroppedPhoto] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState("");
  const [toastMessage, setToastMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [loadingPublications, setLoadingPublications] = useState(true);
  const [publicationsError, setPublicationsError] = useState<string | null>(null);
  const [loadingRequests, setLoadingRequests] = useState(true);
  const [requestsError, setRequestsError] = useState<string | null>(null);
  const [publicationToDelete, setPublicationToDelete] = useState<EditablePublication | null>(null);
  const [deletingPublication, setDeletingPublication] = useState(false);

  const { data: session, isPending: isSessionPending } = useSession();
  const debouncedRequestSearch = useDebouncedValue(requestSearch, 300);
  const debouncedFavoriteSearch = useDebouncedValue(favoriteSearch, 300);

  useEffect(() => { setRequestPage(1); }, [debouncedRequestSearch, requestFilter, requestType]);
  useEffect(() => { setFavoritePage(1); }, [debouncedFavoriteSearch, favoriteType]);

  useEffect(() => {
    function selectTabFromHash() {
      const id = window.location.hash.replace("#", "") as TabId;
      if (tabs.some((tab) => tab.id === id)) setActiveTab(id);
    }
    queueMicrotask(selectTabFromHash);
    window.addEventListener("hashchange", selectTabFromHash);
    window.addEventListener("popstate", selectTabFromHash);
    window.addEventListener("profile-tab-change", selectTabFromHash);
    return () => {
      window.removeEventListener("hashchange", selectTabFromHash);
      window.removeEventListener("popstate", selectTabFromHash);
      window.removeEventListener("profile-tab-change", selectTabFromHash);
    };
  }, []);

  useEffect(() => {
    if (!isSessionPending && !session) {
      router.replace("/login?reason=unauthenticated");
      return;
    }

    if (session) {
      async function loadProfile() {
        try {
          const res = await fetch(`${API_BASE_URL}/api/users/me`, {
            credentials: "include",
          });
          if (res.ok) {
            const data = await res.json();
            setProfile(data);
          }
        } catch {
          if (session) {
            setProfile({
              id: session.user.id,
              name: session.user.name,
              email: session.user.email,
              image: session.user.image,
              createdAt: String(session.user.createdAt),
            });
          }
        } finally {
          setLoadingProfile(false);
        }
      }

      async function loadRequests() {
        setLoadingRequests(true);
        setRequestsError(null);
        try {
          const [sentResponse, receivedResponse, sentItemsResponse, receivedItemsResponse] = await Promise.all([
            fetch(`${API_BASE_URL}/api/adoption-requests`, { credentials: "include" }),
            fetch(`${API_BASE_URL}/api/adoption-requests/received`, { credentials: "include" }),
            fetch(`${API_BASE_URL}/api/donation-item-requests`, { credentials: "include" }),
            fetch(`${API_BASE_URL}/api/donation-item-requests/received`, { credentials: "include" }),
          ]);
          if (!sentResponse.ok || !receivedResponse.ok || !sentItemsResponse.ok || !receivedItemsResponse.ok) {
            throw new Error("Não foi possível carregar as solicitações.");
          }
          if (sentResponse.ok) {
            const data = await sentResponse.json();
            if (Array.isArray(data)) setRequests(data);
          }
          if (receivedResponse.ok) {
            const data = await receivedResponse.json();
            if (Array.isArray(data)) setReceivedRequests(data);
          }
          if (sentItemsResponse.ok) { const data = await sentItemsResponse.json(); if (Array.isArray(data)) setItemRequests(data); }
          if (receivedItemsResponse.ok) { const data = await receivedItemsResponse.json(); if (Array.isArray(data)) setReceivedItemRequests(data); }
        } catch {
          setRequestsError("Não foi possível carregar suas solicitações.");
        } finally {
          setLoadingRequests(false);
        }
      }

      async function loadFavorites() {
        try {
          const [animalsResponse, itemsResponse] = await Promise.all([
            fetch(`${API_BASE_URL}/api/favorites`, { credentials: "include" }),
            fetch(`${API_BASE_URL}/api/favorites/items`, { credentials: "include" }),
          ]);
          if (animalsResponse.ok) { const data = await animalsResponse.json(); if (Array.isArray(data)) setFavorites(data); }
          if (itemsResponse.ok) { const data = await itemsResponse.json(); if (Array.isArray(data)) setFavoriteItems(data); }
        } catch {
          // ignore
        }
      }

      async function loadPublications() {
        setLoadingPublications(true);
        setPublicationsError(null);
        try {
          const [animalsResponse, itemsResponse] = await Promise.all([
            fetch(`${API_BASE_URL}/api/animals/mine`, { credentials: "include" }),
            fetch(`${API_BASE_URL}/api/donation-items/mine`, { credentials: "include" }),
          ]);
          const animalsData = animalsResponse.ok ? await animalsResponse.json() : null;
          const itemsData = itemsResponse.ok ? await itemsResponse.json() : null;
          if (!animalsResponse.ok || !itemsResponse.ok) throw new Error("Não foi possível carregar todas as publicações.");
          setMyAnimals(Array.isArray(animalsData) ? animalsData : []);
          setMyItems(Array.isArray(itemsData) ? itemsData : []);
        } catch {
          setPublicationsError("Não foi possível carregar suas publicações.");
        } finally {
          setLoadingPublications(false);
        }
      }

      loadProfile();
      loadRequests();
      loadFavorites();
      loadPublications();
    }
  }, [isSessionPending, session, router]);

  if (isSessionPending || (session && loadingProfile)) return <ProfileLoading label={isSessionPending ? "Verificando sua sessão" : "Carregando seu perfil"} />;

  if (!session) {
    return <ProfileLoading label="Redirecionando para o login" />;
  }

  const userName = profile?.name || session.user.name || "Usuário";
  const userEmail = profile?.email || session.user.email || "";
  const userImage = profile?.image || session.user.image || "";
  const userBio = profile?.bio || "";
  const userCity = profile?.city || "";
  const userState = profile?.state || "";
  const userLocation = userCity && userState ? `${userCity}, ${userState}` : userCity || userState || "";
  const memberSince = formatMemberSince(profile?.createdAt || session.user.createdAt);
  const normalizedRequestSearch = debouncedRequestSearch.trim().toLocaleLowerCase("pt-BR");
  const matchRequest = (request: AdoptionRequestItem) => [request.animal.name, request.animal.species, request.requester?.name, request.status].some((value) => value?.toLocaleLowerCase("pt-BR").includes(normalizedRequestSearch));
  const matchItemRequest = (request: DonationItemRequest) => [request.item.title, request.item.itemName, request.requester?.name, request.status].some((value) => value?.toLocaleLowerCase("pt-BR").includes(normalizedRequestSearch));
  const filteredRequests = normalizedRequestSearch ? requests.filter(matchRequest) : requests;
  const filteredReceivedRequests = normalizedRequestSearch ? receivedRequests.filter(matchRequest) : receivedRequests;
  const filteredItemRequests = normalizedRequestSearch ? itemRequests.filter(matchItemRequest) : itemRequests;
  const filteredReceivedItemRequests = normalizedRequestSearch ? receivedItemRequests.filter(matchItemRequest) : receivedItemRequests;
  const normalizedFavoriteSearch = debouncedFavoriteSearch.trim().toLocaleLowerCase("pt-BR");
  const filteredFavorites = normalizedFavoriteSearch ? favorites.filter(({ animal }) => [animal.name, animal.species, animal.breed].some((value) => value?.toLocaleLowerCase("pt-BR").includes(normalizedFavoriteSearch))) : favorites;
  const filteredFavoriteItems = normalizedFavoriteSearch ? favoriteItems.filter(({ item }) => [item.title, item.itemName, item.category].some((value) => value?.toLocaleLowerCase("pt-BR").includes(normalizedFavoriteSearch))) : favoriteItems;
  const requestPageSize = 6;
  const currentRequestCount = requestType === "animais" ? (requestFilter === "recebidas" ? filteredReceivedRequests.length : filteredRequests.length) : (requestFilter === "recebidas" ? filteredReceivedItemRequests.length : filteredItemRequests.length);
  const requestPages = Math.max(1, Math.ceil(currentRequestCount / requestPageSize));
  const requestStart = (requestPage - 1) * requestPageSize;
  const visibleRequests = filteredRequests.slice(requestStart, requestStart + requestPageSize);
  const visibleReceivedRequests = filteredReceivedRequests.slice(requestStart, requestStart + requestPageSize);
  const visibleItemRequests = filteredItemRequests.slice(requestStart, requestStart + requestPageSize);
  const visibleReceivedItemRequests = filteredReceivedItemRequests.slice(requestStart, requestStart + requestPageSize);
  const currentFavoriteCount = favoriteType === "animais" ? filteredFavorites.length : filteredFavoriteItems.length;
  const favoritePages = Math.max(1, Math.ceil(currentFavoriteCount / 6));
  const favoriteStart = (favoritePage - 1) * 6;
  const visibleFavorites = filteredFavorites.slice(favoriteStart, favoriteStart + 6);
  const visibleFavoriteItems = filteredFavoriteItems.slice(favoriteStart, favoriteStart + 6);

  async function updateReceivedRequest(id: string, status: "Aprovada" | "Recusada") {
    const response = await fetch(`${API_BASE_URL}/api/adoption-requests/${id}/status`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ status }),
    });

    if (!response.ok) {
      setToastMessage({ type: "error", text: "Não foi possível atualizar a solicitação." });
      return;
    }

    setReceivedRequests((items) => items.map((item) => item.id === id ? { ...item, status } : item));
    setToastMessage({ type: "success", text: `Solicitação ${status.toLowerCase()} com sucesso.` });
  }

  async function handleSavePersonalData(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setToastMessage(null);
    const formData = new FormData(event.currentTarget);
    const name = formData.get("nome") as string;
    const birthDate = formData.get("nascimento") as string;
    const instagram = formData.get("instagram") as string;
    const whatsapp = formData.get("whatsapp") as string;
    const bio = formData.get("bio") as string;

    setSavingPersonal(true);
    try {
      const [image] = croppedPhoto ? await uploadImages([croppedPhoto]) : [];
      const res = await fetch(`${API_BASE_URL}/api/users/me`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ name, birthDate, instagram, whatsapp, bio, ...(image ? { image } : {}) }),
      });

      if (!res.ok) {
        throw new Error("Erro ao salvar dados pessoais.");
      }

      const updated = await res.json();
      setProfile((prev) => (prev ? { ...prev, ...updated } : updated));

      await authClient.updateUser({ name, ...(image ? { image } : {}) });

      setCroppedPhoto(null);
      if (photoPreview) URL.revokeObjectURL(photoPreview);
      setPhotoPreview("");

      setToastMessage({ type: "success", text: "Dados pessoais salvos com sucesso no banco!" });
    } catch (err: unknown) {
      setToastMessage({ type: "error", text: err instanceof Error ? err.message : "Falha ao salvar dados pessoais." });
    } finally {
      setSavingPersonal(false);
    }
  }

  async function handleSaveAddressData(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setToastMessage(null);
    const formData = new FormData(event.currentTarget);
    const zipCode = formData.get("cep") as string;
    const street = formData.get("rua") as string;
    const city = formData.get("cidade") as string;
    const state = formData.get("estado") as string;

    setSavingAddress(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/users/me`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ zipCode, street, city, state }),
      });

      if (!res.ok) {
        throw new Error("Erro ao salvar endereço.");
      }

      const updated = await res.json();
      setProfile((prev) => (prev ? { ...prev, ...updated } : updated));

      setToastMessage({ type: "success", text: "Endereço salvo com sucesso no banco!" });
    } catch (err: unknown) {
      setToastMessage({ type: "error", text: err instanceof Error ? err.message : "Falha ao salvar endereço." });
    } finally {
      setSavingAddress(false);
    }
  }

  async function updateReceivedItemRequest(id: string, status: "Aprovada" | "Recusada") {
    const response = await fetch(`${API_BASE_URL}/api/donation-item-requests/${id}/status`, { method: "PATCH", headers: { "Content-Type": "application/json" }, credentials: "include", body: JSON.stringify({ status }) });
    if (!response.ok) return setToastMessage({ type: "error", text: "Não foi possível atualizar a solicitação do item." });
    setReceivedItemRequests((items) => items.map((item) => item.id === id ? { ...item, status } : item));
    setToastMessage({ type: "success", text: `Solicitação ${status.toLowerCase()} com sucesso.` });
  }

  function removePublication(publication: EditablePublication) {
    setPublicationToDelete(publication);
  }

  async function confirmPublicationRemoval() {
    const publication = publicationToDelete;
    if (!publication || deletingPublication) return;
    setDeletingPublication(true);
    const endpoint = publication.kind === "animal" ? "animals" : "donation-items";
    try {
      const response = await fetch(`${API_BASE_URL}/api/${endpoint}/${publication.data.id}`, { method: "DELETE", credentials: "include" });
      if (!response.ok) throw new Error();
      if (publication.kind === "animal") setMyAnimals((items) => items.filter((item) => item.id !== publication.data.id));
      else setMyItems((items) => items.filter((item) => item.id !== publication.data.id));
      setPublicationToDelete(null);
      setToastMessage({ type: "success", text: "Publicação excluída com sucesso." });
    } catch {
      setToastMessage({ type: "error", text: "Não foi possível excluir a publicação." });
    } finally {
      setDeletingPublication(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#eefdf1] text-[#121e17]">
      <SiteHeader />
      <main className="mx-auto max-w-[1200px] px-3 pb-24 pt-4 sm:px-10 sm:pt-8 lg:px-20">
        {toastMessage && <Notification text={toastMessage.text} type={toastMessage.type} />}

        <section className="relative overflow-hidden rounded-xl bg-white p-4 shadow-[0_4px_12px_rgba(38,51,43,0.05)] sm:rounded-2xl sm:p-6">
          <div className="absolute -bottom-20 -right-20 size-64 rounded-full bg-[#aff1c4]/20 blur-3xl" />
          <div className="relative flex items-start gap-3.5 sm:gap-5">
            <div className="relative size-18 shrink-0 overflow-hidden rounded-full border-[3px] border-[#d7e6da] bg-[#e3f2e6] p-0.5 sm:size-32 sm:border-4 sm:p-1">
              {userImage ? (
                <Image src={userImage} alt={userName} fill className="rounded-full object-cover" priority />
              ) : (
                <div className="grid size-full place-items-center text-4xl font-bold text-[#256441]">
                  {userName.charAt(0).toUpperCase()}
                </div>
              )}
            </div>
            <div className="min-w-0 flex-1 text-left">
              <h1 className="truncate text-xl font-bold leading-7 tracking-[-0.01em] sm:text-[32px] sm:leading-10">{userName}</h1>
              <div className="mt-0.5 flex min-w-0 flex-nowrap items-center gap-2 overflow-hidden text-[10px] text-[#404942] sm:mt-1 sm:gap-x-4 sm:text-base">
                {userLocation && <span className="flex min-w-0 items-center gap-1 whitespace-nowrap"><Image src="/icons/location.svg" alt="" width={12} height={15} className="shrink-0 sm:h-[17px] sm:w-[14px]" /><span className="truncate">{userLocation}</span></span>}
                {userLocation && <span className="size-1 shrink-0 rounded-full bg-[#707971]" />}
                <span className="flex shrink-0 items-center gap-1 whitespace-nowrap"><Image src="/icons/member-since.svg" alt="" width={14} height={16} className="shrink-0 sm:h-5 sm:w-[18px]" />{memberSince}</span>
              </div>
              <p className="mt-1.5 line-clamp-2 max-w-2xl text-xs leading-4 text-[#404942] sm:mt-3 sm:block sm:text-base sm:leading-6">
                {userBio || "Nenhuma biografia adicionada ainda. Clique na aba 'Dados pessoais' para editar."}
              </p>
            </div>
          </div>
        </section>

        <div className="mt-2 flex gap-2 lg:hidden" aria-label="Ações da conta">
          <ThemeToggle profileAction />
          <button type="button" onClick={async () => { await authClient.signOut(); router.replace("/"); router.refresh(); }} className="flex min-h-10 flex-1 items-center justify-center gap-2 rounded-lg border border-red-200 bg-white px-3 py-2 text-xs font-bold text-red-700 transition hover:bg-red-50 active:scale-[0.98]">
            <svg viewBox="0 0 24 24" className="size-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M10 17l5-5-5-5M15 12H3M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" /></svg>
            Sair da conta
          </button>
        </div>

        <div className="mt-4 grid items-start gap-5 sm:mt-10 sm:gap-8 lg:grid-cols-[230px_1fr] lg:gap-12">
          <nav className="profile-mobile-tabs sticky top-0 z-20 flex min-w-0 max-w-full gap-1 overflow-x-auto rounded-lg border-y border-[#d7e6da] bg-[#eefdf1]/95 px-1 py-2 backdrop-blur lg:top-28 lg:flex-col lg:gap-2 lg:overflow-visible lg:rounded-none lg:border-0 lg:bg-transparent lg:p-0" aria-label="Áreas do perfil">
            {tabs.map((item, index) => (
              <div key={item.id} className={`shrink-0 lg:w-full ${index === 3 ? "lg:mt-3 lg:border-t lg:border-[#c0c9bf] lg:pt-4" : ""}`}>
                <button id={`tab-${item.id}`} type="button" aria-pressed={activeTab === item.id} onClick={() => { setToastMessage(null); setActiveTab(item.id); window.history.replaceState(null, "", `#${item.id}`); }} className={`flex h-9 w-auto items-center justify-center gap-1.5 whitespace-nowrap rounded-md px-2.5 text-left text-[10px] font-semibold leading-none transition lg:h-auto lg:w-full lg:justify-start lg:gap-3 lg:rounded-lg lg:px-4 lg:py-3 lg:text-sm lg:leading-normal ${activeTab === item.id ? "bg-[#3f7d58] text-white shadow-sm" : "bg-white/60 text-[#404942] hover:bg-white hover:text-[#256441] lg:bg-transparent"}`}>
                  <ProfileNavIcon id={item.id} /><span>{item.label}</span>
                </button>
              </div>
            ))}
            {session?.user.role?.split(",").includes("admin") && (
              <div className="shrink-0 lg:mt-3 lg:w-full lg:border-t lg:border-[#c0c9bf] lg:pt-4">
                <Link href="/admin" className="flex h-9 w-auto items-center justify-center gap-1.5 whitespace-nowrap rounded-md bg-white/60 px-2.5 text-left text-[10px] font-semibold leading-none text-[#256441] transition hover:bg-white lg:h-auto lg:w-full lg:justify-start lg:gap-3 lg:rounded-lg lg:bg-transparent lg:px-4 lg:py-3 lg:text-sm lg:leading-normal">
                  <svg viewBox="0 0 24 24" className="size-4 shrink-0 lg:size-5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><rect x="3" y="3" width="7" height="7" rx="1.5" /><rect x="14" y="3" width="7" height="7" rx="1.5" /><rect x="3" y="14" width="7" height="7" rx="1.5" /><rect x="14" y="14" width="7" height="7" rx="1.5" /></svg>
                  <span>Painel administrativo</span>
                </Link>
              </div>
            )}
          </nav>

          <section key={activeTab} className="profile-content profile-tab-panel min-w-0">
            {activeTab === "publicacoes" && (
              <PublicationsPanel
                filter={publicationFilter}
                onFilter={setPublicationFilter}
                animals={myAnimals}
                items={myItems}
                loading={loadingPublications}
                error={publicationsError}
                onEdit={(publication) => router.push(`/doacoes/${publication.kind === "animal" ? "animal" : "item"}?edit=${publication.data.id}`)}
                onRemove={removePublication}
              />
            )}
            {activeTab === "solicitacoes" && (
              <div className="space-y-5 sm:space-y-7">
                <PageHeading title="Central de solicitações" description="Acompanhe adoções e pedidos de itens em uma única área." action={<RequestTypePicker value={requestType} onChange={setRequestType} animalCount={filteredRequests.length + filteredReceivedRequests.length} itemCount={filteredItemRequests.length + filteredReceivedItemRequests.length} />} />
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <RequestDirectionTabs value={requestFilter} options={requestType === "animais" ? [{ id: "recebidas", label: "Recebidas", count: filteredReceivedRequests.length }, { id: "enviadas", label: "Enviadas", count: filteredRequests.length }] : [{ id: "recebidas", label: "Recebidas", count: filteredReceivedItemRequests.length }, { id: "enviadas", label: "Enviadas", count: filteredItemRequests.length }]} onChange={(value) => setRequestFilter(value as "recebidas" | "enviadas")} />
                  <ProfileSearch value={requestSearch} onChange={setRequestSearch} placeholder="Buscar solicitações..." />
                </div>
                {loadingRequests ? <SkeletonLoader variant="cards" /> : requestsError ? <LoadErrorState message="Não foi possível carregar suas solicitações." /> : requestType === "animais" ? (requestFilter === "recebidas"
                  ? <RequestSection empty="Nenhuma solicitação encontrada." requests={visibleReceivedRequests} received onUpdate={updateReceivedRequest} />
                  : <RequestSection empty="Nenhuma solicitação encontrada." requests={visibleRequests} />)
                : (requestFilter === "recebidas"
                    ? <ItemRequestSection empty="Nenhuma solicitação encontrada." requests={visibleReceivedItemRequests} received onUpdate={updateReceivedItemRequest} />
                    : <ItemRequestSection empty="Nenhuma solicitação encontrada." requests={visibleItemRequests} />)}
                {currentRequestCount > 0 && <ProfilePagination page={requestPage} totalPages={requestPages} onChange={setRequestPage} label="solicitações" />}
              </div>
            )}
            {activeTab === "favoritos" && (
              <div className="space-y-4 sm:space-y-6">
                <PageHeading title="Seus favoritos" description="Acesse os animais e itens que você marcou com coração." />
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"><SegmentedControl value={favoriteType} options={[{ id: "animais", label: "Animais", count: filteredFavorites.length }, { id: "itens", label: "Itens", count: filteredFavoriteItems.length }]} onChange={(value) => setFavoriteType(value as "animais" | "itens")} /><ProfileSearch value={favoriteSearch} onChange={setFavoriteSearch} placeholder="Buscar favoritos..." /></div>
                {favoriteType === "animais" ? (visibleFavorites.length > 0 ? <div className="grid grid-cols-2 gap-2.5 sm:gap-6 lg:grid-cols-3">{visibleFavorites.map((fav) => <AnimalCard key={fav.id} animal={fav.animal} compactMobile isInitiallyFavorite onFavoriteChange={(favorite) => { if (!favorite) setFavorites((current) => current.filter((item) => item.id !== fav.id)); }} />)}</div> : <EmptyTab title="Nenhum animal favorito" description="Nenhum favorito corresponde à pesquisa." />) : (visibleFavoriteItems.length > 0 ? <div className="grid grid-cols-2 gap-2.5 sm:gap-6 lg:grid-cols-3">{visibleFavoriteItems.map((favorite) => <DonationItemCard key={favorite.id} item={favorite.item} compactMobile isInitiallyFavorite onFavoriteChange={(active) => { if (!active) setFavoriteItems((current) => current.filter((entry) => entry.id !== favorite.id)); }} />)}</div> : <EmptyTab title="Nenhum item favorito" description="Nenhum favorito corresponde à pesquisa." />)}
                {currentFavoriteCount > 0 && <ProfilePagination page={favoritePage} totalPages={favoritePages} onChange={setFavoritePage} label="favoritos" />}
              </div>
            )}
            {activeTab === "dados" && (
              <ProfileForm key={`dados-${profile?.name}-${profile?.bio}-${profile?.birthDate}-${profile?.instagram}-${profile?.whatsapp}`} onSubmit={handleSavePersonalData} loading={savingPersonal}>
                <PersonalData profile={profile} userName={userName} userImage={photoPreview || userImage} userBio={userBio} photoLoading={savingPersonal && Boolean(croppedPhoto)} onPhotoCrop={(file, preview) => { if (photoPreview) URL.revokeObjectURL(photoPreview); setCroppedPhoto(file); setPhotoPreview(preview); }} />
              </ProfileForm>
            )}
            {activeTab === "endereco" && (
              <ProfileForm key={`endereco-${profile?.zipCode}-${profile?.street}-${profile?.city}-${profile?.state}`} onSubmit={handleSaveAddressData} loading={savingAddress}>
                <AddressData profile={profile} />
              </ProfileForm>
            )}
            {activeTab === "acesso" && <ProfileForm showActions={false}><AccountAccess userEmail={userEmail} /></ProfileForm>}
          </section>
        </div>
      </main>
      {publicationToDelete && <DeletePublicationModal publication={publicationToDelete} loading={deletingPublication} onCancel={() => setPublicationToDelete(null)} onConfirm={confirmPublicationRemoval} />}
      <SiteFooter />
    </div>
  );
}
