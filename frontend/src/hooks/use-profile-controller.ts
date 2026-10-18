"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState, type FormEvent } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { catalogKeys } from "@/lib/catalog";
import { authClient, useSession } from "@/lib/auth-client";
import type { Animal } from "@/data/animals";
import { uploadImages } from "@/lib/uploads";
import type { TabId, UserProfile, AdoptionRequestItem, FavoriteItem, FavoriteDonationItem, DonationItem, EditablePublication, DonationItemRequest } from "@/components/profile/types";
import { API_BASE_URL, tabs } from "@/components/profile/config";
import { useDebouncedValue } from "@/components/profile/use-debounced-value";
function formatMemberSince(date?: string | Date) {
  if (!date) return "Membro recente";
  const d = new Date(date);
  if (isNaN(d.getTime())) return "Membro recente";
  return `Desde ${d.toLocaleDateString("pt-BR", { month: "2-digit", year: "numeric" })}`;
}

export function useProfileController() {
  const router = useRouter();
  const queryClient = useQueryClient();
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

  const userName = profile?.name || session?.user.name || "Usuário";
  const userEmail = profile?.email || session?.user.email || "";
  const userImage = profile?.image || session?.user.image || "";
  const userBio = profile?.bio || "";
  const userCity = profile?.city || "";
  const userState = profile?.state || "";
  const userLocation = userCity && userState ? `${userCity}, ${userState}` : userCity || userState || "";
  const memberSince = formatMemberSince(profile?.createdAt || session?.user.createdAt);
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

    void queryClient.invalidateQueries({ queryKey: catalogKeys.animals });
    void queryClient.invalidateQueries({ queryKey: ["catalog", "animal"] });
    void queryClient.invalidateQueries({ queryKey: ["map", "listings"] });
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
    void queryClient.invalidateQueries({ queryKey: catalogKeys.items });
    void queryClient.invalidateQueries({ queryKey: ["catalog", "item"] });
    void queryClient.invalidateQueries({ queryKey: ["map", "listings"] });
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
      void queryClient.invalidateQueries({ queryKey: publication.kind === "animal" ? catalogKeys.animals : catalogKeys.items });
      void queryClient.invalidateQueries({ queryKey: ["catalog", publication.kind] });
      void queryClient.invalidateQueries({ queryKey: ["map", "listings"] });
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

  return {
    router, session, isSessionPending, loadingProfile, activeTab, setActiveTab, profile,
    requests, receivedRequests, favorites, setFavorites, favoriteItems, setFavoriteItems,
    favoriteType, setFavoriteType, myAnimals, myItems, publicationFilter, setPublicationFilter,
    requestSearch, setRequestSearch, favoriteSearch, setFavoriteSearch, requestPage, setRequestPage,
    favoritePage, setFavoritePage, requestFilter, setRequestFilter, requestType, setRequestType,
    loadingPublications, publicationsError, loadingRequests, requestsError, savingPersonal, savingAddress,
    croppedPhoto, setCroppedPhoto, photoPreview, setPhotoPreview, toastMessage, setToastMessage,
    publicationToDelete, setPublicationToDelete, deletingPublication, userName, userEmail, userImage,
    userBio, userLocation, memberSince, filteredRequests, filteredReceivedRequests,
    filteredItemRequests, filteredReceivedItemRequests, filteredFavorites, filteredFavoriteItems,
    currentRequestCount, requestPages, visibleRequests, visibleReceivedRequests, visibleItemRequests,
    visibleReceivedItemRequests, currentFavoriteCount, favoritePages, visibleFavorites, visibleFavoriteItems,
    updateReceivedRequest, updateReceivedItemRequest, handleSavePersonalData, handleSaveAddressData,
    removePublication, confirmPublicationRemoval,
  };
}