"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { FormEvent, ReactNode } from "react";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { AnimalCard } from "@/components/animal-card";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { authClient, useSession } from "@/lib/auth-client";
import type { Animal } from "@/data/animals";
import { uploadImages } from "@/lib/uploads";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

const tabs = [
  { id: "adocoes", label: "Animais para adoção", icon: "/icons/adoptions.svg" },
  { id: "doacoes", label: "Itens para doar", icon: "/icons/donations-profile.svg" },
  { id: "favoritos", label: "Favoritos", icon: "/icons/favorites.svg" },
  { id: "dados", label: "Dados pessoais", icon: "/icons/user.svg" },
  { id: "endereco", label: "Endereço", icon: "/icons/location.svg" },
  { id: "acesso", label: "Acesso à conta", icon: "/icons/password.svg" },
] as const;

type TabId = (typeof tabs)[number]["id"];

type UserProfile = {
  id: string;
  name: string;
  email: string;
  image?: string | null;
  birthDate?: string | null;
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
  createdAt: string;
  animal: Animal;
};

type FavoriteItem = {
  id: string;
  createdAt: string;
  animal: Animal;
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
  const [favorites, setFavorites] = useState<FavoriteItem[]>([]);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [savingPersonal, setSavingPersonal] = useState(false);
  const [savingAddress, setSavingAddress] = useState(false);
  const [toastMessage, setToastMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const { data: session, isPending: isSessionPending } = useSession();

  useEffect(() => {
    if (!isSessionPending && !session) {
      router.push("/login");
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
        try {
          const res = await fetch(`${API_BASE_URL}/api/adoption-requests`, { credentials: "include" });
          if (res.ok) {
            const data = await res.json();
            if (Array.isArray(data)) setRequests(data);
          }
        } catch {
          // ignore
        }
      }

      async function loadFavorites() {
        try {
          const res = await fetch(`${API_BASE_URL}/api/favorites`, { credentials: "include" });
          if (res.ok) {
            const data = await res.json();
            if (Array.isArray(data)) setFavorites(data);
          }
        } catch {
          // ignore
        }
      }

      loadProfile();
      loadRequests();
      loadFavorites();
    }
  }, [isSessionPending, session, router]);

  if (isSessionPending || (session && loadingProfile)) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#eefdf1] text-[#256441]">
        <div className="flex flex-col items-center gap-3">
          <div className="size-10 animate-spin rounded-full border-4 border-[#256441] border-t-transparent" />
          <p className="text-sm font-semibold">Carregando perfil...</p>
        </div>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-[#eefdf1] px-4 text-center">
        <h1 className="text-2xl font-bold text-[#121e17]">Você não está conectado</h1>
        <p className="mt-2 text-[#526057]">Faça login para visualizar seu perfil.</p>
        <Link href="/login" className="mt-6 rounded-xl bg-[#256441] px-6 py-3 font-semibold text-white transition hover:bg-[#194b30]">
          Ir para o Login
        </Link>
      </div>
    );
  }

  const userName = profile?.name || session.user.name || "Usuário";
  const userEmail = profile?.email || session.user.email || "";
  const userImage = profile?.image || session.user.image || "";
  const userBio = profile?.bio || "";
  const userCity = profile?.city || "";
  const userState = profile?.state || "";
  const userLocation = userCity && userState ? `${userCity}, ${userState}` : userCity || userState || "";
  const memberSince = formatMemberSince(profile?.createdAt || session.user.createdAt);

  async function handleSavePersonalData(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setToastMessage(null);
    const formData = new FormData(event.currentTarget);
    const name = formData.get("nome") as string;
    const birthDate = formData.get("nascimento") as string;
    const bio = formData.get("bio") as string;
    const photo = formData.get("foto");

    setSavingPersonal(true);
    try {
      const [image] = photo instanceof File && photo.size > 0 ? await uploadImages([photo]) : [];
      const res = await fetch(`${API_BASE_URL}/api/users/me`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ name, birthDate, bio, ...(image ? { image } : {}) }),
      });

      if (!res.ok) {
        throw new Error("Erro ao salvar dados pessoais.");
      }

      const updated = await res.json();
      setProfile((prev) => (prev ? { ...prev, ...updated } : updated));

      await authClient.updateUser({ name, ...(image ? { image } : {}) });

      setToastMessage({ type: "success", text: "Dados pessoais salvos com sucesso no banco!" });
    } catch (err: any) {
      setToastMessage({ type: "error", text: err.message || "Falha ao salvar dados pessoais." });
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
    } catch (err: any) {
      setToastMessage({ type: "error", text: err.message || "Falha ao salvar endereço." });
    } finally {
      setSavingAddress(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#eefdf1] text-[#121e17]">
      <SiteHeader />
      <main className="mx-auto max-w-[1200px] px-5 pb-24 pt-8 sm:px-10 lg:px-20">
        {toastMessage && (
          <div className={`mb-6 rounded-2xl border p-4 text-sm font-semibold shadow-sm ${toastMessage.type === "success" ? "border-green-200 bg-green-50 text-green-800" : "border-red-200 bg-red-50 text-red-800"}`}>
            {toastMessage.text}
          </div>
        )}

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
              <button key={item.id} id={`tab-${item.id}`} type="button" aria-pressed={activeTab === item.id} onClick={() => { setToastMessage(null); setActiveTab(item.id); }} className={`flex shrink-0 items-center gap-3 rounded-lg px-4 py-3 text-left text-sm font-semibold tracking-[0.02em] transition ${activeTab === item.id ? "bg-[#3f7d58] text-white shadow-sm" : "text-[#404942] hover:bg-white/70 hover:text-[#256441]"} ${index === 3 ? "lg:mt-3 lg:border-t lg:border-[#c0c9bf] lg:pt-5" : ""}`}>
                <Image src={item.icon} alt="" width={20} height={20} className={activeTab === item.id ? "brightness-0 invert" : ""} />{item.label}
              </button>
            ))}
          </nav>

          <section className="min-w-0">
            {activeTab === "adocoes" && (
              requests.length > 0 ? (
                <div className="space-y-5">
                  <header className="flex items-end justify-between gap-4">
                    <div>
                      <h2 className="text-2xl font-bold">Animais para adoção</h2>
                      <p className="mt-1 text-sm text-[#5b675f]">Acompanhe seus processos de adoção.</p>
                    </div>
                    <span className="shrink-0 text-sm font-semibold text-[#707971]">{requests.length} solicitações</span>
                  </header>
                  {requests.map((req) => (
                    <article key={req.id} className="group grid overflow-hidden rounded-xl bg-white shadow-[0_4px_12px_rgba(38,51,43,0.05)] sm:grid-cols-[180px_1fr]">
                      <div className="relative h-52 overflow-hidden sm:h-full sm:min-h-[190px]">
                        <Image src={req.animal?.image || "/images/login-cover-v2.png"} alt={req.animal?.name || "Animal"} fill className="object-cover" />
                      </div>
                      <div className="flex flex-col p-5 sm:p-6">
                        <div className="flex flex-wrap items-start justify-between gap-3">
                          <h3 className="text-2xl font-semibold">{req.animal?.name}</h3>
                          <span className="rounded-full bg-[#aff1c4] px-3 py-1.5 text-xs font-semibold text-[#0d5130]">
                            {req.status}
                          </span>
                        </div>
                        <div className="mt-2 flex flex-wrap gap-2">
                          <span className="rounded-full bg-[#e3f2e6] px-3 py-1.5 text-xs font-semibold text-[#404942]">{req.animal?.species}</span>
                          <span className="rounded-full bg-[#e3f2e6] px-3 py-1.5 text-xs font-semibold text-[#404942]">{req.animal?.sex}</span>
                        </div>
                        <div className="mt-auto flex justify-end border-t border-[#c0c9bf]/30 pt-4">
                          <Link href={`/adocao/${req.animal?.id}`} className="rounded-xl border-2 border-[#256441] px-5 py-2.5 text-sm font-semibold text-[#256441] transition hover:bg-[#256441] hover:text-white">
                            Ver detalhes do pet
                          </Link>
                        </div>
                      </div>
                    </article>
                  ))}
                </div>
              ) : (
                <EmptyTab title="Animais para adoção" description="Você ainda não possui solicitações de adoção em andamento." />
              )
            )}
            {activeTab === "doacoes" && <EmptyTab title="Itens para doar" description="Seus itens cadastrados para doação aparecerão aqui." />}
            {activeTab === "favoritos" && (
              favorites.length > 0 ? (
                <div className="space-y-6">
                  <header className="flex items-end justify-between gap-4">
                    <div>
                      <h2 className="text-2xl font-bold">Seus Favoritos</h2>
                      <p className="mt-1 text-sm text-[#5b675f]">Pets que você marcou com coração.</p>
                    </div>
                  </header>
                  <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                    {favorites.map((fav) => (
                      <AnimalCard key={fav.id} animal={fav.animal} />
                    ))}
                  </div>
                </div>
              ) : (
                <EmptyTab title="Favoritos" description="Os animais e itens que você favoritar aparecerão aqui." />
              )
            )}
            {activeTab === "dados" && (
              <ProfileForm key={`dados-${profile?.name}-${profile?.bio}-${profile?.birthDate}`} onSubmit={handleSavePersonalData} loading={savingPersonal}>
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

function EmptyTab({ title, description }: { title: string; description: string }) {
  return (
    <div className="rounded-xl bg-white p-10 text-center shadow-[0_4px_12px_rgba(38,51,43,0.05)]">
      <div className="mx-auto mb-4 grid size-12 place-items-center rounded-full bg-[#e8f7eb]">
        <Image src="/icons/heart.svg" alt="" width={21} height={21} />
      </div>
      <h2 className="text-2xl font-bold">{title}</h2>
      <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-[#5b675f]">{description}</p>
    </div>
  );
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

      {statusMessage && (
        <div className={`mb-5 rounded-xl border p-4 text-sm font-medium ${statusMessage.type === "success" ? "border-green-200 bg-green-50 text-green-800" : "border-red-200 bg-red-50 text-red-800"}`}>
          {statusMessage.text}
        </div>
      )}

      <div className="max-w-3xl divide-y divide-[#d7e6da] overflow-hidden rounded-xl border border-[#d7e6da]">
        <AccessRow icon="/icons/email.svg" title="E-mail" value={userEmail} onEdit={() => { setStatusMessage(null); setModal("email"); }} />
        <AccessRow icon="/icons/password.svg" title="Senha" value="••••••••••••" onEdit={() => { setStatusMessage(null); setModal("senha"); }} />
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
