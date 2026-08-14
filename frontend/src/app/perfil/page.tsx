"use client";

import Image from "next/image";
import type { ReactNode } from "react";
import { useState } from "react";
import { createPortal } from "react-dom";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";

const tabs = [
  { id: "adocoes", label: "Animais para adoção", icon: "/icons/adoptions.svg" },
  { id: "doacoes", label: "Itens para doar", icon: "/icons/donations-profile.svg" },
  { id: "favoritos", label: "Favoritos", icon: "/icons/favorites.svg" },
  { id: "dados", label: "Dados pessoais", icon: "/icons/user.svg" },
  { id: "endereco", label: "Endereço", icon: "/icons/location.svg" },
  { id: "acesso", label: "Acesso à conta", icon: "/icons/password.svg" },
] as const;

const requests = [
  { name: "Max, o Golden", image: "/images/max-profile.png", tags: ["Cachorro", "Filhote", "Macho"], date: "12 Out 2023", status: "Em análise", statusClass: "bg-[#ffdcbf] text-[#6a3b00]" },
  { name: "Luna", image: "/images/luna-profile.png", tags: ["Gato", "Jovem", "Fêmea"], date: "05 Out 2023", status: "Entrevista agendada", statusClass: "bg-[#d7e6da] text-[#31523e]" },
  { name: "Pipoca", image: "/images/pipoca-profile.png", tags: ["Cachorro", "Adulto", "Macho"], date: "15 Set 2023", status: "Aprovado", statusClass: "bg-[#aff1c4] text-[#0d5130]" },
];

type TabId = (typeof tabs)[number]["id"];

export default function ProfilePage() {
  const [activeTab, setActiveTab] = useState<TabId>("adocoes");

  return (
    <div className="min-h-screen bg-[#eefdf1] text-[#121e17]">
      <SiteHeader />
      <main className="mx-auto max-w-[1200px] px-5 pb-24 pt-8 sm:px-10 lg:px-20">
        <section className="relative overflow-hidden rounded-2xl bg-white p-5 shadow-[0_4px_12px_rgba(38,51,43,0.05)] sm:p-6">
          <div className="absolute -bottom-20 -right-20 size-64 rounded-full bg-[#aff1c4]/20 blur-3xl" />
          <div className="relative flex flex-col items-center gap-5 sm:flex-row sm:items-start">
            <div className="relative size-28 shrink-0 overflow-hidden rounded-full border-4 border-[#d7e6da] p-1 sm:size-32">
              <Image src="/images/ana-profile.png" alt="Ana Silva" fill className="rounded-full object-cover" priority />
            </div>
            <div className="flex-1 text-center sm:text-left">
              <h1 className="text-[32px] font-bold leading-10 tracking-[-0.01em]">Ana Silva</h1>
              <div className="mt-1 flex flex-wrap justify-center gap-x-4 gap-y-1 text-sm text-[#404942] sm:justify-start sm:text-base">
                <span className="flex items-center gap-1"><Image src="/icons/location.svg" alt="" width={14} height={17} />São Paulo, SP</span>
                <span className="hidden size-1 self-center rounded-full bg-[#707971] sm:block" />
                <span className="flex items-center gap-1"><Image src="/icons/member-since.svg" alt="" width={18} height={20} />Membro desde Ago 2023</span>
              </div>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-[#404942] sm:text-base">Apaixonada por animais e sempre disposta a ajudar. Buscando um novo membro peludo para alegrar a casa!</p>
            </div>
          </div>
        </section>

        <div className="mt-10 grid items-start gap-8 lg:grid-cols-[230px_1fr] lg:gap-12">
          <nav className="flex gap-2 overflow-x-auto pb-2 lg:sticky lg:top-28 lg:flex-col lg:overflow-visible" aria-label="Áreas do perfil">
            {tabs.map((item, index) => (
              <button key={item.id} id={`tab-${item.id}`} type="button" aria-pressed={activeTab === item.id} onClick={() => setActiveTab(item.id)} className={`flex shrink-0 items-center gap-3 rounded-lg px-4 py-3 text-left text-sm font-semibold tracking-[0.02em] transition ${activeTab === item.id ? "bg-[#3f7d58] text-white shadow-sm" : "text-[#404942] hover:bg-white/70 hover:text-[#256441]"} ${index === 3 ? "lg:mt-3 lg:border-t lg:border-[#c0c9bf] lg:pt-5" : ""}`}>
                <Image src={item.icon} alt="" width={20} height={20} className={activeTab === item.id ? "brightness-0 invert" : ""} />{item.label}
              </button>
            ))}
          </nav>

          <section className="min-w-0">
            {activeTab === "adocoes" && <Adoptions />}
            {activeTab === "doacoes" && <EmptyTab title="Itens para doar" description="Seus itens cadastrados para doação aparecerão aqui." />}
            {activeTab === "favoritos" && <EmptyTab title="Favoritos" description="Os animais e itens que você favoritar aparecerão aqui." />}
            {activeTab === "dados" && <ProfileForm><PersonalData /></ProfileForm>}
            {activeTab === "endereco" && <ProfileForm><AddressData /></ProfileForm>}
            {activeTab === "acesso" && <ProfileForm showActions={false}><AccountAccess /></ProfileForm>}
          </section>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}

function Adoptions() {
  return (
    <>
      <header className="mb-6 flex items-end justify-between gap-4">
        <div><h2 className="text-2xl font-bold">Animais para adoção</h2><p className="mt-1 text-sm text-[#5b675f]">Acompanhe seus processos de adoção.</p></div>
        <span className="shrink-0 text-sm font-semibold text-[#707971]">3 solicitações</span>
      </header>
      <div className="space-y-5">
        {requests.map((request) => (
          <article key={request.name} className="group grid overflow-hidden rounded-xl bg-white shadow-[0_4px_12px_rgba(38,51,43,0.05)] transition hover:-translate-y-0.5 hover:shadow-lg sm:grid-cols-[180px_1fr]">
            <div className="relative h-52 overflow-hidden sm:h-full sm:min-h-[210px]"><Image src={request.image} alt={request.name} fill className="object-cover transition-transform duration-500 group-hover:scale-105" sizes="(max-width:640px) 100vw,180px" /></div>
            <div className="flex flex-col p-5 sm:p-6">
              <div className="flex flex-wrap items-start justify-between gap-3"><h3 className="text-2xl font-semibold">{request.name}</h3><span className={`rounded-full px-3 py-1.5 text-xs font-semibold ${request.statusClass}`}>{request.status}</span></div>
              <div className="mt-2 flex flex-wrap gap-2">{request.tags.map((tag) => <span key={tag} className="rounded-full bg-[#e3f2e6] px-3 py-1.5 text-xs font-semibold text-[#404942]">{tag}</span>)}</div>
              <p className="mt-3 flex items-center gap-2 text-sm text-[#404942] sm:text-base"><Image src="/icons/date.svg" alt="" width={15} height={15} />Solicitado em {request.date}</p>
              <div className="mt-auto flex justify-end border-t border-[#c0c9bf]/30 pt-4"><button type="button" className="rounded-xl border-2 border-[#256441] px-5 py-2.5 text-sm font-semibold text-[#256441] transition hover:bg-[#256441] hover:text-white">Ver detalhes</button></div>
            </div>
          </article>
        ))}
      </div>
    </>
  );
}

function ProfileForm({ children, showActions = true }: { children: ReactNode; showActions?: boolean }) {
  return (
    <form onSubmit={(event) => event.preventDefault()} className="overflow-hidden rounded-xl bg-white shadow-[0_4px_12px_rgba(38,51,43,0.05)]">
      <div className="min-h-[420px] p-5 sm:p-7">{children}</div>
      {showActions && <footer className="flex flex-col-reverse gap-3 border-t border-[#d7e6da] bg-[#f7fcf8] px-5 py-4 sm:flex-row sm:justify-end sm:px-7">
        <button type="reset" className="rounded-xl border border-[#86a590] px-6 py-3 text-sm font-bold text-[#256441] transition hover:bg-[#e8f7eb]">Cancelar</button>
        <button type="submit" className="rounded-xl bg-[#256441] px-7 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-[#194b30] active:scale-[0.98]">Salvar alterações</button>
      </footer>}
    </form>
  );
}

function EmptyTab({ title, description }: { title: string; description: string }) {
  return <div className="rounded-xl bg-white p-10 text-center shadow-[0_4px_12px_rgba(38,51,43,0.05)]"><div className="mx-auto mb-4 grid size-12 place-items-center rounded-full bg-[#e8f7eb]"><Image src="/icons/heart.svg" alt="" width={21} height={21} /></div><h2 className="text-2xl font-bold">{title}</h2><p className="mx-auto mt-2 max-w-md text-sm leading-6 text-[#5b675f]">{description}</p></div>;
}

function SectionHeading({ title, description }: { title: string; description: string }) {
  return <header className="mb-7"><h2 className="text-2xl font-bold tracking-[-0.01em]">{title}</h2><p className="mt-1 text-sm leading-6 text-[#5b675f]">{description}</p></header>;
}

function PersonalData() {
  return (
    <section id="panel-dados" role="tabpanel" aria-labelledby="tab-dados">
      <SectionHeading title="Dados pessoais" description="Conte um pouco sobre você e escolha como aparecerá no seu perfil." />
      <div className="grid gap-8 lg:grid-cols-[180px_1fr] lg:gap-12">
        <div>
          <p className="mb-3 text-sm font-bold text-[#253129]">Foto de perfil</p>
          <div className="flex items-center gap-4 lg:flex-col lg:items-start">
            <div className="relative size-24 shrink-0 overflow-hidden rounded-full border-4 border-[#e3f2e6] shadow-sm lg:size-32">
              <Image src="/images/ana-profile.png" alt="Foto de perfil de Ana Silva" fill priority className="object-cover" />
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
          <div className="sm:col-span-2"><ProfileField label="Nome completo" name="nome" defaultValue="Ana Silva" autoComplete="name" required /></div>
          <ProfileField label="Data de nascimento" name="nascimento" type="date" defaultValue="1998-05-14" autoComplete="bday" />
          <label className="sm:col-span-2">
            <span className="mb-2 block text-sm font-bold text-[#253129]">Bio</span>
            <textarea name="bio" rows={5} maxLength={300} defaultValue="Apaixonada por animais e sempre disposta a ajudar. Buscando um novo membro peludo para alegrar a casa!" placeholder="Conte um pouco sobre você..." className="w-full resize-y rounded-xl border border-[#c0c9bf] bg-[#f7fcf8] px-4 py-3 text-sm leading-6 text-[#121e17] outline-none transition placeholder:text-[#879188] focus:border-[#3f7d58] focus:ring-2 focus:ring-[#3f7d58]/15" />
            <span className="mt-1.5 block text-right text-xs text-[#7b8980]">Até 300 caracteres</span>
          </label>
        </div>
      </div>
    </section>
  );
}

function AddressData() {
  return (
    <section id="panel-endereco" role="tabpanel" aria-labelledby="tab-endereco">
      <SectionHeading title="Endereço" description="Essas informações ajudam a encontrar animais e iniciativas perto de você." />
      <div className="grid max-w-3xl gap-5 sm:grid-cols-2">
        <div className="sm:max-w-[240px]"><ProfileField label="CEP" name="cep" inputMode="numeric" defaultValue="01310-100" placeholder="00000-000" autoComplete="postal-code" required /></div>
        <div className="hidden sm:block" />
        <div className="sm:col-span-2"><ProfileField label="Rua" name="rua" defaultValue="Avenida Paulista" placeholder="Digite o nome da rua" autoComplete="street-address" required /></div>
        <ProfileField label="Cidade" name="cidade" defaultValue="São Paulo" autoComplete="address-level2" required />
        <ProfileField label="Estado" name="estado" defaultValue="São Paulo" autoComplete="address-level1" required />
      </div>
    </section>
  );
}

function AccountAccess() {
  const [modal, setModal] = useState<"email" | "senha" | null>(null);

  return (
    <section id="panel-acesso" role="tabpanel" aria-labelledby="tab-acesso">
      <SectionHeading title="Acesso à conta" description="Consulte e altere com segurança seus dados de acesso." />
      <div className="max-w-3xl divide-y divide-[#d7e6da] overflow-hidden rounded-xl border border-[#d7e6da]">
        <AccessRow icon="/icons/email.svg" title="E-mail" value="ana.silva@email.com" onEdit={() => setModal("email")} />
        <AccessRow icon="/icons/password.svg" title="Senha" value="••••••••••••" onEdit={() => setModal("senha")} />
      </div>

      {modal === "email" && (
        <AccountModal title="Alterar e-mail" description="Confirme sua identidade para cadastrar um novo e-mail." onClose={() => setModal(null)}>
          <ProfileField label="Senha atual" name="senhaConfirmacao" type="password" placeholder="Digite sua senha" autoComplete="current-password" required />
          <ProfileField label="Novo e-mail" name="novoEmail" type="email" placeholder="novoemail@exemplo.com" autoComplete="email" required />
        </AccountModal>
      )}

      {modal === "senha" && (
        <AccountModal title="Alterar senha" description="Crie uma senha segura com pelo menos 8 caracteres." onClose={() => setModal(null)}>
          <ProfileField label="Senha atual" name="senhaAtual" type="password" placeholder="Digite sua senha atual" autoComplete="current-password" required />
          <ProfileField label="Nova senha" name="novaSenha" type="password" placeholder="Digite a nova senha" autoComplete="new-password" minLength={8} required />
          <ProfileField label="Confirmar senha" name="confirmarSenha" type="password" placeholder="Repita a nova senha" autoComplete="new-password" minLength={8} required />
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
        <footer className="flex flex-col-reverse gap-3 border-t border-[#d7e6da] bg-[#f7fcf8] px-5 py-4 sm:flex-row sm:justify-end sm:px-6">
          <button type="button" onClick={onClose} className="rounded-lg border border-[#86a590] px-5 py-2.5 text-sm font-bold text-[#256441] transition hover:bg-[#e8f7eb]">Cancelar</button>
          <button type="button" className="rounded-lg bg-[#256441] px-5 py-2.5 text-sm font-bold text-white transition hover:bg-[#194b30]">Confirmar alteração</button>
        </footer>
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
