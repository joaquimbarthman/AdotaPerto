"use client";

import { Notification } from "@/components/notification";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { FormEvent, ReactNode } from "react";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { AnimalCard } from "@/components/animal-card";
import { SkeletonLoader } from "@/components/skeleton-loader";
import { LoadErrorState } from "@/components/load-error-state";
import { DonationItemCard } from "@/components/donation-item-card";
import { EmptyState } from "@/components/empty-state";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { authClient, useSession } from "@/lib/auth-client";
import type { Animal } from "@/data/animals";
import { uploadImages } from "@/lib/uploads";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

const tabs = [
  { id: "publicacoes", label: "Minhas publicações" },
  { id: "solicitacoes", label: "Solicitações" },
  { id: "favoritos", label: "Favoritos" },
  { id: "dados", label: "Dados pessoais" },
  { id: "endereco", label: "Endereço" },
  { id: "acesso", label: "Acesso à conta" },
] as const;

type TabId = (typeof tabs)[number]["id"];

type UserProfile = {
  id: string;
  name: string;
  email: string;
  image?: string | null;
  birthDate?: string | null;
  instagram?: string | null;
  whatsapp?: string | null;
  bio?: string | null;
  zipCode?: string | null;
  street?: string | null;
  city?: string | null;
  state?: string | null;
  createdAt: string;
};

type AdoptionRequestItem = {
  id: string;
  status: string;
  notes?: string | null;
  answers?: Record<string, string | string[]> | null;
  compatibilityScore?: number | null;
  compatibilityDetails?: string[] | null;
  createdAt: string;
  animal: Animal;
  requester?: {
    id: string;
    name: string;
    image?: string | null;
    city?: string | null;
    state?: string | null;
  };
  ownerContact?: {
    name: string;
    email: string;
    whatsapp?: string | null;
    instagram?: string | null;
  };
};

type FavoriteItem = {
  id: string;
  createdAt: string;
  animal: Animal;
};

type FavoriteDonationItem = { id: string; createdAt: string; item: DonationItem };

type DonationItem = {
  id: string;
  title: string;
  itemName: string;
  category: string;
  quantity: number;
  unit: string;
  condition: string;
  description: string;
  mainImage: string;
  deliveryMethod: string;
  status: "Disponível" | "Pausado" | "Doado";
  createdAt: string;
};

type EditablePublication = { kind: "animal"; data: Animal } | { kind: "item"; data: DonationItem };

type DonationItemRequest = {
  id: string; status: string; quantity: number; message?: string | null; createdAt: string; item: DonationItem;
  requester?: { id: string; name: string; image?: string | null; city?: string | null; state?: string | null };
  ownerContact?: AdoptionRequestItem["ownerContact"];
};

function formatMemberSince(date?: string | Date) {
  if (!date) return "Membro recente";
  const d = new Date(date);
  if (isNaN(d.getTime())) return "Membro recente";
  const month = d.toLocaleDateString("pt-BR", { month: "short" }).replace(".", "");
  const formattedMonth = month.charAt(0).toUpperCase() + month.slice(1);
  return `Membro desde ${formattedMonth} de ${d.getFullYear()}`;
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
  const [requestFilter, setRequestFilter] = useState<"recebidas" | "enviadas">("recebidas");
  const [requestType, setRequestType] = useState<"animais" | "itens">("animais");
  const [itemRequests, setItemRequests] = useState<DonationItemRequest[]>([]);
  const [receivedItemRequests, setReceivedItemRequests] = useState<DonationItemRequest[]>([]);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [savingPersonal, setSavingPersonal] = useState(false);
  const [savingAddress, setSavingAddress] = useState(false);
  const [toastMessage, setToastMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [loadingPublications, setLoadingPublications] = useState(true);
  const [publicationsError, setPublicationsError] = useState<string | null>(null);
  const [loadingRequests, setLoadingRequests] = useState(true);
  const [requestsError, setRequestsError] = useState<string | null>(null);

  const { data: session, isPending: isSessionPending } = useSession();

  useEffect(() => {
    function selectTabFromHash() {
      const id = window.location.hash.replace("#", "") as TabId;
      if (tabs.some((tab) => tab.id === id)) setActiveTab(id);
    }
    queueMicrotask(selectTabFromHash);
    window.addEventListener("hashchange", selectTabFromHash);
    return () => window.removeEventListener("hashchange", selectTabFromHash);
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
    const photo = formData.get("foto");

    setSavingPersonal(true);
    try {
      const [image] = photo instanceof File && photo.size > 0 ? await uploadImages([photo]) : [];
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

  async function removePublication(publication: EditablePublication) {
    if (!window.confirm("Excluir esta publicação permanentemente?")) return;
    const endpoint = publication.kind === "animal" ? "animals" : "donation-items";
    const response = await fetch(`${API_BASE_URL}/api/${endpoint}/${publication.data.id}`, { method: "DELETE", credentials: "include" });
    if (!response.ok) return setToastMessage({ type: "error", text: "Não foi possível excluir a publicação." });
    if (publication.kind === "animal") setMyAnimals((items) => items.filter((item) => item.id !== publication.data.id));
    else setMyItems((items) => items.filter((item) => item.id !== publication.data.id));
    setToastMessage({ type: "success", text: "Publicação excluída." });
  }

  return (
    <div className="min-h-screen bg-[#eefdf1] text-[#121e17]">
      <SiteHeader />
      <main className="mx-auto max-w-[1200px] px-5 pb-24 pt-8 sm:px-10 lg:px-20">
        {toastMessage && <Notification text={toastMessage.text} type={toastMessage.type} />}

        <section className="relative overflow-hidden rounded-2xl bg-white p-5 shadow-[0_4px_12px_rgba(38,51,43,0.05)] sm:p-6">
          <div className="absolute -bottom-20 -right-20 size-64 rounded-full bg-[#aff1c4]/20 blur-3xl" />
          <div className="relative flex flex-col items-center gap-5 sm:flex-row sm:items-start">
            <div className="relative size-28 shrink-0 overflow-hidden rounded-full border-4 border-[#d7e6da] bg-[#e3f2e6] p-1 sm:size-32">
              {userImage ? (
                <Image src={userImage} alt={userName} fill className="rounded-full object-cover" priority />
              ) : (
                <div className="grid size-full place-items-center text-4xl font-bold text-[#256441]">
                  {userName.charAt(0).toUpperCase()}
                </div>
              )}
            </div>
            <div className="flex-1 text-center sm:text-left">
              <h1 className="text-[32px] font-bold leading-10 tracking-[-0.01em]">{userName}</h1>
              <div className="mt-1 flex flex-wrap justify-center gap-x-4 gap-y-1 text-sm text-[#404942] sm:justify-start sm:text-base">
                {userLocation && <span className="flex items-center gap-1"><Image src="/icons/location.svg" alt="" width={14} height={17} />{userLocation}</span>}
                {userLocation && <span className="hidden size-1 self-center rounded-full bg-[#707971] sm:block" />}
                <span className="flex items-center gap-1"><Image src="/icons/member-since.svg" alt="" width={18} height={20} />{memberSince}</span>
              </div>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-[#404942] sm:text-base">
                {userBio || "Nenhuma biografia adicionada ainda. Clique na aba 'Dados pessoais' para editar."}
              </p>
            </div>
          </div>
        </section>

        <div className="mt-10 grid items-start gap-8 lg:grid-cols-[230px_1fr] lg:gap-12">
          <nav className="flex gap-2 overflow-x-auto pb-2 lg:sticky lg:top-28 lg:flex-col lg:overflow-visible" aria-label="Áreas do perfil">
            {tabs.map((item, index) => (
              <div key={item.id} className={`shrink-0 lg:w-full ${index === 3 ? "lg:mt-3 lg:border-t lg:border-[#c0c9bf] lg:pt-4" : ""}`}>
                <button id={`tab-${item.id}`} type="button" aria-pressed={activeTab === item.id} onClick={() => { setToastMessage(null); setActiveTab(item.id); window.history.replaceState(null, "", `#${item.id}`); }} className={`flex w-full items-center gap-3 rounded-lg px-4 py-3 text-left text-sm font-semibold tracking-[0.02em] transition ${activeTab === item.id ? "bg-[#3f7d58] text-white shadow-sm" : "text-[#404942] hover:bg-white/70 hover:text-[#256441]"}`}>
                  <ProfileNavIcon id={item.id} />{item.label}
                </button>
              </div>
            ))}
          </nav>

          <section className="min-w-0">
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
              <div className="space-y-7">
                <PageHeading title="Central de solicitações" description="Acompanhe adoções e pedidos de itens em uma única área." action={<RequestTypePicker value={requestType} onChange={setRequestType} animalCount={requests.length + receivedRequests.length} itemCount={itemRequests.length + receivedItemRequests.length} />} />
                <div className="flex items-center justify-between gap-4">
                  <RequestDirectionTabs value={requestFilter} options={requestType === "animais" ? [{ id: "recebidas", label: "Recebidas", count: receivedRequests.length }, { id: "enviadas", label: "Enviadas", count: requests.length }] : [{ id: "recebidas", label: "Recebidas", count: receivedItemRequests.length }, { id: "enviadas", label: "Enviadas", count: itemRequests.length }]} onChange={(value) => setRequestFilter(value as "recebidas" | "enviadas")} />
                </div>
                {loadingRequests ? <SkeletonLoader variant="cards" /> : requestsError ? <LoadErrorState message="Não foi possível carregar suas solicitações." /> : requestType === "animais" ? (requestFilter === "recebidas"
                  ? <RequestSection empty="Seus animais ainda não receberam solicitações." requests={receivedRequests} received onUpdate={updateReceivedRequest} />
                  : <RequestSection empty="Você ainda não solicitou nenhuma adoção." requests={requests} />)
                : (requestFilter === "recebidas"
                    ? <ItemRequestSection empty="Seus itens ainda não receberam solicitações." requests={receivedItemRequests} received onUpdate={updateReceivedItemRequest} />
                    : <ItemRequestSection empty="Você ainda não solicitou nenhum item." requests={itemRequests} />)}
              </div>
            )}
            {activeTab === "favoritos" && (
              <div className="space-y-6">
                <PageHeading title="Seus favoritos" description="Acesse os animais e itens que você marcou com coração." />
                <SegmentedControl value={favoriteType} options={[{ id: "animais", label: "Animais", count: favorites.length }, { id: "itens", label: "Itens", count: favoriteItems.length }]} onChange={(value) => setFavoriteType(value as "animais" | "itens")} />
                {favoriteType === "animais" ? (favorites.length > 0 ? <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">{favorites.map((fav) => <AnimalCard key={fav.id} animal={fav.animal} isInitiallyFavorite onFavoriteChange={(favorite) => { if (!favorite) setFavorites((current) => current.filter((item) => item.id !== fav.id)); }} />)}</div> : <EmptyTab title="Nenhum animal favorito" description="Os animais que você favoritar aparecerão aqui." />) : (favoriteItems.length > 0 ? <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">{favoriteItems.map((favorite) => <DonationItemCard key={favorite.id} item={favorite.item} isInitiallyFavorite onFavoriteChange={(active) => { if (!active) setFavoriteItems((current) => current.filter((entry) => entry.id !== favorite.id)); }} />)}</div> : <EmptyTab title="Nenhum item favorito" description="Os itens que você favoritar aparecerão aqui." />)}
              </div>
            )}
            {activeTab === "dados" && (
              <ProfileForm key={`dados-${profile?.name}-${profile?.bio}-${profile?.birthDate}-${profile?.instagram}-${profile?.whatsapp}`} onSubmit={handleSavePersonalData} loading={savingPersonal}>
                <PersonalData profile={profile} userName={userName} userImage={userImage} userBio={userBio} />
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
      <SiteFooter />
    </div>
  );
}

function PageHeading({ title, description, action }: { title: string; description: string; action?: ReactNode }) {
  return <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between"><div><p className="mb-1 text-xs font-bold uppercase tracking-[0.14em] text-[#3f7d58]">Área de gestão</p><h2 className="text-2xl font-extrabold tracking-[-0.02em] sm:text-3xl">{title}</h2><p className="mt-1 max-w-2xl text-sm leading-6 text-[#5b675f]">{description}</p></div>{action}</header>;
}

function ProfileNavIcon({ id }: { id: TabId }) {
  const common = { viewBox: "0 0 24 24", className: "size-5 shrink-0", fill: "none", stroke: "currentColor", strokeWidth: 2, strokeLinecap: "round" as const, strokeLinejoin: "round" as const, "aria-hidden": true };
  if (id === "publicacoes") return <svg {...common}><path d="M20.8 4.7a5.2 5.2 0 0 0-7.4 0L12 6.1l-1.4-1.4a5.2 5.2 0 0 0-7.4 7.4L12 21l8.8-8.9a5.2 5.2 0 0 0 0-7.4Z" /></svg>;
  if (id === "solicitacoes") return <svg {...common}><path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9M10 21h4" /></svg>;
  if (id === "favoritos") return <svg {...common}><path d="M6 3h12v18l-6-4-6 4V3Z" /></svg>;
  if (id === "dados") return <svg {...common}><circle cx="12" cy="8" r="4" /><path d="M4 21a8 8 0 0 1 16 0" /></svg>;
  if (id === "endereco") return <svg {...common}><path d="M20 10c0 5-8 11-8 11S4 15 4 10a8 8 0 1 1 16 0Z" /><circle cx="12" cy="10" r="2.5" /></svg>;
  return <svg {...common}><rect x="4" y="10" width="16" height="11" rx="2" /><path d="M8 10V7a4 4 0 0 1 8 0v3M12 15v2" /></svg>;
}

function SegmentedControl({ value, options, onChange }: { value: string; options: { id: string; label: string; count: number }[]; onChange: (id: string) => void }) {
  return <div className="flex w-fit flex-wrap items-center gap-2" role="tablist">{options.map((option) => <button key={option.id} type="button" role="tab" aria-selected={value === option.id} onClick={() => onChange(option.id)} className={`group inline-flex min-h-9 items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-semibold transition ${value === option.id ? "bg-[#e3f2e6] text-[#256441]" : "text-[#526057] hover:bg-[#e8f7eb] hover:text-[#256441]"}`}><span>{option.label}</span><span className="rounded-full bg-[#256441]/10 px-1.5 py-0.5 text-[11px] font-bold text-[#256441]">{option.count}</span><svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.8" className={`size-3.5 transition-transform group-hover:translate-x-0.5 ${value === option.id ? "opacity-100" : "opacity-50"}`} aria-hidden="true"><path d="m7.5 4.5 5 5.5-5 5.5" /></svg></button>)}</div>;
}

function RequestDirectionTabs({ value, options, onChange }: { value: string; options: { id: string; label: string; count: number }[]; onChange: (id: string) => void }) {
  return <div className="mb-4 flex w-fit flex-wrap items-center gap-2" role="tablist" aria-label="Direção da solicitação">{options.map((option) => <button key={option.id} type="button" role="tab" aria-selected={value === option.id} onClick={() => onChange(option.id)} className={`group inline-flex min-h-9 items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-semibold transition ${value === option.id ? "bg-[#e3f2e6] text-[#256441]" : "text-[#526057] hover:bg-[#e8f7eb] hover:text-[#256441]"}`}><span>{option.label}</span><span className="rounded-full bg-[#256441]/10 px-1.5 py-0.5 text-[11px] font-bold text-[#256441]">{option.count}</span><svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.8" className={`size-3.5 transition-transform group-hover:translate-x-0.5 ${value === option.id ? "opacity-100" : "opacity-50"}`} aria-hidden="true"><path d="m7.5 4.5 5 5.5-5 5.5" /></svg></button>)}</div>;
}

function RequestTypePicker({ value, onChange, animalCount, itemCount }: { value: "animais" | "itens"; onChange: (value: "animais" | "itens") => void; animalCount: number; itemCount: number }) {
  const options = [
    { id: "animais" as const, title: "Animais", count: animalCount },
    { id: "itens" as const, title: "Itens", count: itemCount },
  ];
  return <div className="flex flex-wrap items-center gap-2" role="tablist" aria-label="Tipo de solicitação">{options.map((option) => <button key={option.id} type="button" role="tab" aria-selected={value === option.id} onClick={() => onChange(option.id)} className={`group inline-flex min-h-9 items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-semibold transition ${value === option.id ? "bg-[#e3f2e6] text-[#256441]" : "text-[#526057] hover:bg-[#e8f7eb] hover:text-[#256441]"}`}><span>{option.title}</span><span className="rounded-full bg-[#256441]/10 px-1.5 py-0.5 text-[11px] font-bold text-[#256441]">{option.count}</span><svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.8" className={`size-3.5 transition-transform group-hover:translate-x-0.5 ${value === option.id ? "opacity-100" : "opacity-50"}`} aria-hidden="true"><path d="m7.5 4.5 5 5.5-5 5.5" /></svg></button>)}</div>;
}

function PublicationsPanel({ filter, onFilter, animals, items, loading, error, onEdit, onRemove }: { filter: "animais" | "itens"; onFilter: (value: "animais" | "itens") => void; animals: Animal[]; items: DonationItem[]; loading: boolean; error: string | null; onEdit: (publication: EditablePublication) => void; onRemove: (publication: EditablePublication) => void }) {
  const publications: EditablePublication[] = filter === "animais" ? animals.map((data) => ({ kind: "animal", data })) : items.map((data) => ({ kind: "item", data }));
  return <div className="space-y-7">
    <PageHeading title="Minhas publicações" description="Gerencie os anúncios que outras pessoas encontram na plataforma." action={<div className="flex gap-2"><Link href="/doacoes/animal" className="rounded-xl border border-[#256441] bg-white px-4 py-2.5 text-sm font-bold text-[#256441] hover:bg-[#eefdf1]">+ Animal</Link><Link href="/doacoes/item" className="rounded-xl bg-[#256441] px-4 py-2.5 text-sm font-bold text-white hover:bg-[#194b30]">+ Item</Link></div>} />
    <SegmentedControl value={filter} options={[{ id: "animais", label: "Animais", count: animals.length }, { id: "itens", label: "Itens", count: items.length }]} onChange={(value) => onFilter(value as "animais" | "itens")} />
    {loading ? (
      <PublicationSkeleton />
    ) : error ? (
      <LoadErrorState message="Não foi possível carregar suas publicações." />
    ) : publications.length === 0 ? (
      <EmptyTab title={filter === "animais" ? "Nenhum animal publicado" : "Nenhum item publicado"} description="Sua primeira publicação aparecerá aqui com opções de edição e status." />
    ) : (
      <div className="grid gap-4 sm:grid-cols-2">{publications.map((publication) => <PublicationCard key={publication.data.id} publication={publication} onEdit={onEdit} onRemove={onRemove} />)}</div>
    )}
  </div>;
}

function PublicationSkeleton() { return <SkeletonLoader variant="cards" />; }

function ProfileLoading({ label }: { label: string }) {
  return <div className="min-h-screen bg-[#eefdf1] text-[#121e17]"><SiteHeader /><SkeletonLoader variant="profile" /><span className="sr-only">{label}</span></div>;
}

function PublicationCard({ publication, onEdit, onRemove }: { publication: EditablePublication; onEdit: (publication: EditablePublication) => void; onRemove: (publication: EditablePublication) => void }) {
  const isAnimal = publication.kind === "animal";
  const data = publication.data;
  const title = publication.kind === "animal" ? publication.data.name : publication.data.title;
  const image = publication.kind === "animal" ? publication.data.image : publication.data.mainImage;
  const detail = publication.kind === "animal" ? `${publication.data.species} • ${publication.data.sex} • ${publication.data.age}` : `${publication.data.quantity} ${publication.data.unit} • ${publication.data.category}`;
  return <article className="group overflow-hidden rounded-2xl border border-[#e1e8e2] bg-white shadow-[0_5px_16px_rgba(38,51,43,0.06)] transition-all duration-300 ease-out hover:-translate-y-1.5 hover:scale-[1.01] hover:border-[#9fc5aa] hover:shadow-[0_18px_38px_rgba(31,91,57,0.15)] motion-reduce:transform-none motion-reduce:transition-none"><div className="relative h-44 overflow-hidden bg-[#e3f2e6]"><Image src={image || "/images/login-cover-v2.png"} alt={title} fill className="object-cover transition-transform duration-500 ease-out group-hover:scale-[1.06] motion-reduce:transform-none" /><span className="absolute left-3 top-3 rounded-full bg-white/95 px-3 py-1.5 text-xs font-bold text-[#256441] shadow-sm transition-transform duration-300 group-hover:-translate-y-0.5 motion-reduce:transform-none">{data.status}</span><div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#194b30]/10 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" /></div><div className="p-5"><p className="text-xs font-bold uppercase tracking-wider text-[#708078]">{isAnimal ? "Adoção" : "Doação de item"}</p><h3 className="mt-1 truncate text-xl font-extrabold transition-colors duration-300 group-hover:text-[#256441]">{title}</h3><p className="mt-1 text-sm text-[#526057]">{detail}</p><div className="mt-5 grid grid-cols-[1fr_auto] gap-2 border-t border-[#e7eee9] pt-4"><button type="button" onClick={() => onEdit(publication)} className="rounded-lg bg-[#e3f2e6] px-4 py-2.5 text-sm font-bold text-[#256441] transition hover:bg-[#d7eeda]">Editar publicação</button><button type="button" onClick={() => onRemove(publication)} className="rounded-lg px-3 py-2.5 text-sm font-bold text-red-700 transition hover:bg-red-50" aria-label={`Excluir ${title}`}>Excluir</button></div></div></article>;
}

function ProfileForm({ children, showActions = true, onSubmit, loading }: { children: ReactNode; showActions?: boolean; onSubmit?: (event: FormEvent<HTMLFormElement>) => void; loading?: boolean }) {
  return (
    <form onSubmit={onSubmit || ((event) => event.preventDefault())} className="overflow-hidden rounded-xl bg-white shadow-[0_4px_12px_rgba(38,51,43,0.05)]">
      <div className="min-h-[420px] p-5 sm:p-7">{children}</div>
      {showActions && (
        <footer className="flex flex-col-reverse gap-3 border-t border-[#d7e6da] bg-[#f7fcf8] px-5 py-4 sm:flex-row sm:justify-end sm:px-7">
          <button type="reset" className="rounded-xl border border-[#86a590] px-6 py-3 text-sm font-bold text-[#256441] transition hover:bg-[#e8f7eb]">Cancelar</button>
          <button type="submit" disabled={loading} className="rounded-xl bg-[#256441] px-7 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-[#194b30] active:scale-[0.98] disabled:opacity-60">
            {loading ? "Salvando..." : "Salvar alterações"}
          </button>
        </footer>
      )}
    </form>
  );
}

function ItemRequestSection({ empty, requests, received = false, onUpdate }: { empty: string; requests: DonationItemRequest[]; received?: boolean; onUpdate?: (id: string, status: "Aprovada" | "Recusada") => void }) {
  return <section className="space-y-4">
    {requests.length === 0 ? <EmptyState message={empty} /> : <div className="space-y-4">{requests.map((request) => <article key={request.id} className="group grid overflow-hidden rounded-2xl border border-[#e1e8e2] bg-white shadow-[0_4px_14px_rgba(38,51,43,0.05)] transition-all duration-300 ease-out hover:-translate-y-1.5 hover:scale-[1.005] hover:border-[#9fc5aa] hover:shadow-[0_18px_38px_rgba(31,91,57,0.14)] motion-reduce:transform-none motion-reduce:transition-none sm:grid-cols-[140px_1fr]">
      <div className="relative h-44 overflow-hidden bg-[#e3f2e6] sm:h-full sm:min-h-[184px]"><Image src={request.item.mainImage || "/images/login-cover-v2.png"} alt={request.item.title} fill sizes="140px" className="object-cover transition-transform duration-500 ease-out group-hover:scale-[1.07] motion-reduce:transform-none" /><div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-transparent to-[#194b30]/10 opacity-0 transition-opacity duration-300 group-hover:opacity-100" /></div>
      <div className="flex min-w-0 flex-col p-5"><div className="flex items-start justify-between gap-3"><div className="min-w-0"><p className="text-xs font-bold uppercase tracking-wider text-[#708078]">Solicitação de item</p><h4 className="mt-1 truncate text-xl font-extrabold">{request.item.title}</h4>{received && request.requester && <p className="mt-1 text-sm text-[#526057]">Solicitado por <strong>{request.requester.name}</strong></p>}</div><StatusBadge status={request.status} /></div>
        <div className="mt-3 flex flex-wrap gap-2"><span className="rounded-md bg-[#e3f2e6] px-3 py-1.5 text-xs font-semibold text-[#404942]">{request.item.category}</span><span className="rounded-md bg-[#e3f2e6] px-3 py-1.5 text-xs font-semibold text-[#404942]">{request.quantity} {request.item.unit}</span><span className="rounded-md bg-[#e3f2e6] px-3 py-1.5 text-xs font-semibold text-[#404942]">{request.item.deliveryMethod}</span></div>
        <p className="mt-3 text-xs font-medium text-[#68726b]">Solicitação enviada em {formatRequestDate(request.createdAt)}</p>
        {!received && isApproved(request.status) && request.ownerContact && <ApprovedContactLinks contact={request.ownerContact} />}
        <div className="mt-auto flex flex-col gap-3 pt-4 sm:flex-row sm:items-center sm:justify-between"><Link href={`/itens/${request.item.id}`} className="inline-flex min-h-11 items-center justify-center rounded-xl border border-[#86a590] bg-white px-4 text-sm font-semibold text-[#256441] transition hover:bg-[#f0faf3]">Ver item</Link>{received && (request.status === "Em análise" || request.status === "PENDING") && onUpdate && <div className="grid grid-cols-2 gap-2"><button type="button" onClick={() => onUpdate(request.id, "Recusada")} className="min-h-11 rounded-xl border border-red-200 px-4 text-sm font-semibold text-red-700 hover:bg-red-50">Recusar</button><button type="button" onClick={() => onUpdate(request.id, "Aprovada")} className="min-h-11 rounded-xl bg-[#256441] px-5 text-sm font-semibold text-white hover:bg-[#194b30]">Aprovar</button></div>}</div>
      </div>
    </article>)}</div>}
  </section>;
}

function formatRequestDate(value: string) {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "data não informada" : date.toLocaleDateString("pt-BR");
}

function StatusBadge({ status }: { status: string }) {
  const normalized = status === "PENDING" ? "Em análise" : status;
  const tone = normalized === "Aprovada" ? "bg-green-100 text-green-800" : normalized === "Recusada" || normalized === "Cancelada" ? "bg-red-50 text-red-700" : "bg-[#fff2e5] text-[#764200]";
  return <span className={`shrink-0 rounded-md px-3 py-1.5 text-xs font-bold ${tone}`}>{normalized}</span>;
}

function isApproved(status: string) {
  return status === "Aprovada" || status === "APPROVED";
}

function ApprovedContactLinks({ contact }: { contact: NonNullable<AdoptionRequestItem["ownerContact"]> }) {
  const phone = contact.whatsapp?.trim();
  const instagram = contact.instagram?.trim();
  if (!phone && !instagram) return null;
  const phoneDigits = phone?.replace(/\D/g, "") || "";
  const whatsappNumber = phoneDigits.length === 10 || phoneDigits.length === 11 ? `55${phoneDigits}` : phoneDigits;
  const instagramUser = instagram?.replace(/^https?:\/\/(www\.)?instagram\.com\//i, "").replace(/^@/, "").replace(/\/$/, "");
  return <div className="mt-4 flex flex-wrap gap-2" aria-label="Contatos do responsável">
    {phone && <a href={`https://wa.me/${whatsappNumber}`} target="_blank" rel="noreferrer" className="inline-flex min-h-10 items-center gap-2 rounded-lg bg-[#e3f2e6] px-3.5 text-xs font-bold text-[#256441] transition hover:bg-[#d7eeda]" aria-label={`Conversar pelo WhatsApp no número ${phone}`}><svg viewBox="0 0 24 24" className="size-[17px] shrink-0" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M20 11.5a8 8 0 0 1-11.8 7L4 19.8l1.3-4A8 8 0 1 1 20 11.5Z" /><path d="M9 8.5c.4 3 2.1 4.7 5.2 5.3" /></svg><span>{phone}</span></a>}
    {instagram && instagramUser && <a href={`https://instagram.com/${instagramUser}`} target="_blank" rel="noreferrer" className="inline-flex min-h-10 items-center gap-2 rounded-lg bg-[#e3f2e6] px-3.5 text-xs font-bold text-[#256441] transition hover:bg-[#d7eeda]" aria-label={`Abrir Instagram de ${instagram}`}><svg viewBox="0 0 24 24" className="size-[17px] shrink-0" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><rect x="3" y="3" width="18" height="18" rx="5" /><circle cx="12" cy="12" r="4" /><circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" /></svg><span>@{instagramUser}</span></a>}
  </div>;
}

function RequestSection({ empty, requests, received = false, onUpdate }: { empty: string; requests: AdoptionRequestItem[]; received?: boolean; onUpdate?: (id: string, status: "Aprovada" | "Recusada") => void }) {
  return (
    <section className="space-y-4">
      {requests.length === 0 ? (
        <EmptyState message={empty} />
      ) : requests.map((request) => (
        <article key={request.id} className="group grid overflow-hidden rounded-2xl border border-[#e1e8e2] bg-white shadow-[0_4px_14px_rgba(38,51,43,0.05)] transition-all duration-300 ease-out hover:-translate-y-1.5 hover:scale-[1.005] hover:border-[#9fc5aa] hover:shadow-[0_18px_38px_rgba(31,91,57,0.14)] motion-reduce:transform-none motion-reduce:transition-none sm:grid-cols-[148px_1fr]">
          <div className="relative h-44 overflow-hidden sm:h-full sm:min-h-[180px]">
            <Image src={request.animal?.image || "/images/login-cover-v2.png"} alt={request.animal?.name || "Animal"} fill sizes="148px" className="object-cover transition-transform duration-500 ease-out group-hover:scale-[1.07] motion-reduce:transform-none" />
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-transparent to-[#194b30]/10 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
          </div>
          <div className="flex flex-col p-5 sm:p-6">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-[#708078]">Solicitação de adoção</p><h4 className="mt-1 text-xl font-extrabold">{request.animal?.name}</h4>
                {received && request.requester && <p className="mt-1 text-sm text-[#526057]">Solicitado por <strong>{request.requester.name}</strong></p>}
              </div>
              <StatusBadge status={request.status} />
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              <span className="rounded-md bg-[#e3f2e6] px-3 py-1.5 text-xs font-semibold text-[#404942]">{request.animal?.species}</span>
              <span className="rounded-md bg-[#e3f2e6] px-3 py-1.5 text-xs font-semibold text-[#404942]">{request.animal?.sex}</span>
            </div>
            <p className="mt-3 text-xs font-medium text-[#68726b]">Solicitação enviada em {formatRequestDate(request.createdAt)}</p>
            {!received && isApproved(request.status) && request.ownerContact && <ApprovedContactLinks contact={request.ownerContact} />}
            <div className="mt-auto flex flex-col gap-3 pt-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex flex-col gap-2 min-[440px]:flex-row">
                <Link href={`/adocao/${request.animal?.id}`} className="inline-flex min-h-11 items-center justify-center rounded-xl border border-[#86a590] bg-white px-4 text-sm font-semibold text-[#256441] transition hover:bg-[#f0faf3]">Ver animal</Link>
                {received && request.answers && <Link href={`/perfil/solicitacoes/${request.id}`} className="inline-flex min-h-11 items-center justify-center rounded-xl bg-[#e3f2e6] px-4 text-sm font-semibold text-[#194b30] transition hover:bg-[#d7eeda]">Informações da solicitação</Link>}
              </div>
              {received && (request.status === "Em análise" || request.status === "PENDING") && onUpdate && (
                <div className="grid grid-cols-2 gap-2">
                  <button type="button" onClick={() => onUpdate(request.id, "Recusada")} className="min-h-11 rounded-xl border border-red-200 bg-white px-4 text-sm font-semibold text-red-700 transition hover:bg-red-50">Recusar</button>
                  <button type="button" onClick={() => onUpdate(request.id, "Aprovada")} className="min-h-11 rounded-xl bg-[#256441] px-5 text-sm font-semibold text-white shadow-sm transition hover:bg-[#194b30]">Aprovar</button>
                </div>
              )}
            </div>
          </div>
        </article>
      ))}
    </section>
  );
}

function EmptyTab({ title, description }: { title: string; description: string }) {
  return <EmptyState message={title} description={description} />;
}

function SectionHeading({ title, description }: { title: string; description: string }) {
  return (
    <header className="mb-7">
      <h2 className="text-2xl font-bold tracking-[-0.01em]">{title}</h2>
      <p className="mt-1 text-sm leading-6 text-[#5b675f]">{description}</p>
    </header>
  );
}

function PersonalData({ profile, userName, userImage, userBio }: { profile: UserProfile | null; userName: string; userImage: string; userBio: string }) {
  const birthDate = profile?.birthDate || "";
  const instagram = profile?.instagram || "";
  const whatsapp = profile?.whatsapp || "";

  return (
    <section id="panel-dados" role="tabpanel" aria-labelledby="tab-dados">
      <SectionHeading title="Dados pessoais" description="Consulte e atualize suas informações pessoais de perfil." />
      <div className="grid gap-8 lg:grid-cols-[180px_1fr] lg:gap-12">
        <div>
          <p className="mb-3 text-sm font-bold text-[#253129]">Foto de perfil</p>
          <div className="flex items-center gap-4 lg:flex-col lg:items-start">
            <div className="relative size-24 shrink-0 overflow-hidden rounded-full border-4 border-[#e3f2e6] bg-[#e3f2e6] shadow-sm lg:size-32">
              {userImage ? (
                <Image src={userImage} alt={userName} fill priority className="object-cover" />
              ) : (
                <div className="grid size-full place-items-center text-3xl font-bold text-[#256441]">
                  {userName.charAt(0).toUpperCase()}
                </div>
              )}
            </div>
            <div>
              <label className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-[#86a590] px-4 py-2.5 text-sm font-bold text-[#256441] transition hover:bg-[#e8f7eb]">
                <Image src="/icons/edit.svg" alt="" width={14} height={14} />Alterar foto
                <input type="file" name="foto" accept="image/png,image/jpeg,image/webp" className="sr-only" />
              </label>
              <p className="mt-2 text-xs leading-5 text-[#7b8980]">JPG, PNG ou WebP. Máx. 5 MB.</p>
            </div>
          </div>
        </div>
        <div className="grid content-start gap-5 sm:grid-cols-2">
          <div className="sm:col-span-2"><ProfileField label="Nome completo" name="nome" defaultValue={userName} autoComplete="name" required /></div>
          <ProfileField label="Data de nascimento" name="nascimento" type="date" defaultValue={birthDate} autoComplete="bday" />
          <ProfileField label="Instagram" name="instagram" defaultValue={instagram} placeholder="@seuusuario" autoComplete="off" />
          <ProfileField label={"WhatsApp / n\u00famero"} name="whatsapp" type="tel" inputMode="tel" defaultValue={whatsapp} placeholder="(00) 00000-0000" autoComplete="tel" />
          <label className="sm:col-span-2">
            <span className="mb-2 block text-sm font-bold text-[#253129]">Bio</span>
            <textarea name="bio" rows={5} maxLength={300} defaultValue={userBio} placeholder="Conte um pouco sobre você..." className="w-full resize-y rounded-xl border border-[#c0c9bf] bg-[#f7fcf8] px-4 py-3 text-sm leading-6 text-[#121e17] outline-none transition placeholder:text-[#879188] focus:border-[#3f7d58] focus:ring-2 focus:ring-[#3f7d58]/15" />
            <span className="mt-1.5 block text-right text-xs text-[#7b8980]">Até 300 caracteres</span>
          </label>
        </div>
      </div>
    </section>
  );
}

function AddressData({ profile }: { profile: UserProfile | null }) {
  const cep = profile?.zipCode || "";
  const rua = profile?.street || "";
  const cidade = profile?.city || "";
  const estado = profile?.state || "";

  return (
    <section id="panel-endereco" role="tabpanel" aria-labelledby="tab-endereco">
      <SectionHeading title="Endereço" description="Essas informações ajudam a encontrar animais e iniciativas perto de você." />
      <div className="grid max-w-3xl gap-5 sm:grid-cols-2">
        <div className="sm:max-w-[240px]"><ProfileField label="CEP" name="cep" inputMode="numeric" defaultValue={cep} placeholder="00000-000" autoComplete="postal-code" /></div>
        <div className="hidden sm:block" />
        <div className="sm:col-span-2"><ProfileField label="Rua" name="rua" defaultValue={rua} placeholder="Digite o nome da rua" autoComplete="street-address" /></div>
        <ProfileField label="Cidade" name="cidade" defaultValue={cidade} placeholder="Sua cidade" autoComplete="address-level2" />
        <ProfileField label="Estado" name="estado" defaultValue={estado} placeholder="Seu estado" autoComplete="address-level1" />
      </div>
    </section>
  );
}

function AccountAccess({ userEmail }: { userEmail: string }) {
  const [modal, setModal] = useState<"email" | "senha" | null>(null);
  const [statusMessage, setStatusMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [loading, setLoading] = useState(false);

  async function handlePasswordChange(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatusMessage(null);
    const form = new FormData(e.currentTarget);
    const currentPassword = form.get("senhaAtual") as string;
    const newPassword = form.get("novaSenha") as string;
    const confirmPassword = form.get("confirmarSenha") as string;

    if (newPassword !== confirmPassword) {
      setStatusMessage({ type: "error", text: "As novas senhas não coincidem." });
      return;
    }

    setLoading(true);
    const { error } = await authClient.changePassword({
      currentPassword,
      newPassword,
      revokeOtherSessions: true,
    });
    setLoading(false);

    if (error) {
      setStatusMessage({ type: "error", text: error.message || "Erro ao alterar a senha." });
      return;
    }

    setStatusMessage({ type: "success", text: "Senha alterada com sucesso!" });
    setModal(null);
  }

  async function handleEmailChange(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatusMessage(null);
    const form = new FormData(e.currentTarget);
    const newEmail = form.get("novoEmail") as string;

    setLoading(true);
    const { error } = await authClient.changeEmail({
      newEmail,
      callbackURL: "/perfil",
    });
    setLoading(false);

    if (error) {
      setStatusMessage({ type: "error", text: error.message || "Erro ao solicitar alteração de e-mail." });
      return;
    }

    setStatusMessage({ type: "success", text: "Solicitação enviada! Verifique seu e-mail para confirmar." });
    setModal(null);
  }

  return (
    <section id="panel-acesso" role="tabpanel" aria-labelledby="tab-acesso">
      <SectionHeading title="Acesso à conta" description="Consulte e altere com segurança seus dados de acesso." />

      {statusMessage && <Notification text={statusMessage.text} type={statusMessage.type} />}

      <div className="max-w-3xl divide-y divide-[#d7e6da] overflow-hidden rounded-xl border border-[#d7e6da]">
        <AccessRow icon="/icons/email.svg" title="E-mail" value={userEmail} onEdit={() => { setStatusMessage(null); setModal("email"); }} />
        <AccessRow icon="/icons/password.svg" title="Senha" value="••••••••••••" onEdit={() => { setStatusMessage(null); setModal("senha"); }} />
      </div>

      <div className="mt-5 max-w-3xl rounded-xl border border-[#d7e6da] bg-[#f7fcf8] p-5">
        <h3 className="text-sm font-bold text-[#253129]">Esqueceu sua senha?</h3>
        <p className="mt-1 text-sm leading-6 text-[#5b675f]">Receba um c&oacute;digo de 4 d&iacute;gitos no seu e-mail e crie uma nova senha com seguran&ccedil;a.</p>
        <Link href="/esqueci-senha" className="mt-4 inline-flex rounded-lg border border-[#256441] px-5 py-2.5 text-sm font-bold text-[#256441] transition hover:bg-[#256441] hover:text-white">Redefinir senha</Link>
      </div>

      {modal === "email" && (
        <AccountModal title="Alterar e-mail" description="Informe o novo e-mail para receber a confirmação." onClose={() => setModal(null)}>
          <form onSubmit={handleEmailChange} className="space-y-4">
            <ProfileField label="Novo e-mail" name="novoEmail" type="email" placeholder="novoemail@exemplo.com" autoComplete="email" required />
            <footer className="flex flex-col-reverse gap-3 border-t border-[#d7e6da] bg-[#f7fcf8] pt-4 sm:flex-row sm:justify-end">
              <button type="button" onClick={() => setModal(null)} className="rounded-lg border border-[#86a590] px-5 py-2.5 text-sm font-bold text-[#256441] transition hover:bg-[#e8f7eb]">Cancelar</button>
              <button type="submit" disabled={loading} className="rounded-lg bg-[#256441] px-5 py-2.5 text-sm font-bold text-white transition hover:bg-[#194b30] disabled:opacity-60">{loading ? "Enviando..." : "Confirmar alteração"}</button>
            </footer>
          </form>
        </AccountModal>
      )}

      {modal === "senha" && (
        <AccountModal title="Alterar senha" description="Crie uma senha segura com pelo menos 8 caracteres." onClose={() => setModal(null)}>
          <form onSubmit={handlePasswordChange} className="space-y-4">
            <ProfileField label="Senha atual" name="senhaAtual" type="password" placeholder="Digite sua senha atual" autoComplete="current-password" required />
            <ProfileField label="Nova senha" name="novaSenha" type="password" placeholder="Digite a nova senha" autoComplete="new-password" minLength={8} required />
            <ProfileField label="Confirmar senha" name="confirmarSenha" type="password" placeholder="Repita a nova senha" autoComplete="new-password" minLength={8} required />
            <footer className="flex flex-col-reverse gap-3 border-t border-[#d7e6da] bg-[#f7fcf8] pt-4 sm:flex-row sm:justify-end">
              <button type="button" onClick={() => setModal(null)} className="rounded-lg border border-[#86a590] px-5 py-2.5 text-sm font-bold text-[#256441] transition hover:bg-[#e8f7eb]">Cancelar</button>
              <button type="submit" disabled={loading} className="rounded-lg bg-[#256441] px-5 py-2.5 text-sm font-bold text-white transition hover:bg-[#194b30] disabled:opacity-60">{loading ? "Salvando..." : "Confirmar alteração"}</button>
            </footer>
          </form>
        </AccountModal>
      )}
    </section>
  );
}

function AccessRow({ icon, title, value, onEdit }: { icon: string; title: string; value: string; onEdit: () => void }) {
  return (
    <div className="flex flex-col gap-4 bg-[#f7fcf8] p-5 sm:flex-row sm:items-center">
      <div className="flex min-w-0 flex-1 items-center gap-4">
        <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-[#e3f2e6]"><Image src={icon} alt="" width={19} height={19} /></span>
        <div className="min-w-0"><p className="text-sm font-bold text-[#253129]">{title}</p><p className="mt-1 truncate text-sm text-[#5b675f]">{value}</p></div>
      </div>
      <button type="button" onClick={onEdit} className="rounded-lg border border-[#256441] px-5 py-2.5 text-sm font-bold text-[#256441] transition hover:bg-[#256441] hover:text-white">Alterar</button>
    </div>
  );
}

function AccountModal({ title, description, onClose, children }: { title: string; description: string; onClose: () => void; children: ReactNode }) {
  return createPortal(
    <div className="fixed inset-0 z-50 grid place-items-center bg-[#121e17]/55 p-4 backdrop-blur-[2px]" role="dialog" aria-modal="true" aria-labelledby="account-modal-title" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}>
      <div className="w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-2xl">
        <header className="flex items-start justify-between gap-4 border-b border-[#d7e6da] px-5 py-5 sm:px-6">
          <div><h3 id="account-modal-title" className="text-xl font-bold">{title}</h3><p className="mt-1 text-sm leading-5 text-[#5b675f]">{description}</p></div>
          <button type="button" onClick={onClose} aria-label="Fechar modal" className="grid size-9 shrink-0 place-items-center rounded-full text-xl text-[#5b675f] transition hover:bg-[#e8f7eb]">×</button>
        </header>
        <div className="space-y-5 p-5 sm:p-6">{children}</div>
      </div>
    </div>,
    document.body,
  );
}

type ProfileFieldProps = {
  label: string;
  name: string;
  type?: string;
  defaultValue?: string;
  placeholder?: string;
  autoComplete?: string;
  inputMode?: "numeric" | "text" | "tel" | "email" | "url";
  minLength?: number;
  required?: boolean;
};

function ProfileField({ label, ...props }: ProfileFieldProps) {
  return (
    <label>
      <span className="mb-2 block text-sm font-bold text-[#253129]">{label}</span>
      <input {...props} className="h-12 w-full rounded-xl border border-[#c0c9bf] bg-[#f7fcf8] px-4 text-sm text-[#121e17] outline-none transition placeholder:text-[#879188] focus:border-[#3f7d58] focus:ring-2 focus:ring-[#3f7d58]/15" />
    </label>
  );
}
