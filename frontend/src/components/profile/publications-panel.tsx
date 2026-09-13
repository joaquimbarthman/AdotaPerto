"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { SkeletonLoader } from "@/components/skeleton-loader";
import { LoadErrorState } from "@/components/load-error-state";
import type { Animal } from "@/data/animals";
import type { DonationItem, EditablePublication } from "./types";
import { PageHeading, SegmentedControl, ProfileSearch, EmptyTab } from "./profile-ui";
import { useDebouncedValue } from "./use-debounced-value";

export function DeletePublicationModal({ publication, loading, onCancel, onConfirm }: { publication: EditablePublication; loading: boolean; onCancel: () => void; onConfirm: () => void }) {
  const title = publication.kind === "animal" ? publication.data.name : publication.data.title;
  const kind = publication.kind === "animal" ? "animal" : "item";

  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const closeOnEscape = (event: KeyboardEvent) => { if (event.key === "Escape" && !loading) onCancel(); };
    window.addEventListener("keydown", closeOnEscape);
    return () => { document.body.style.overflow = previousOverflow; window.removeEventListener("keydown", closeOnEscape); };
  }, [loading, onCancel]);

  if (typeof document === "undefined") return null;
  return createPortal(
    <div className="fixed inset-0 z-[1000] grid place-items-center bg-[#0d1c13]/65 p-4 backdrop-blur-sm sm:p-5" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget && !loading) onCancel(); }}>
      <section role="alertdialog" aria-modal="true" aria-labelledby="delete-publication-title" aria-describedby="delete-publication-description" className="w-full max-w-[330px] overflow-hidden rounded-xl border border-[#d7e6da] bg-white shadow-[0_28px_80px_rgba(5,22,12,.32)] sm:max-w-md">
        <div className="p-4 sm:p-7">
          <p className="text-[9px] font-extrabold uppercase tracking-[.12em] text-red-700 sm:text-[10px] sm:tracking-[.14em]">Excluir publicação</p>
          <h2 id="delete-publication-title" className="mt-1.5 truncate text-base font-extrabold tracking-[-.02em] text-[#253129] sm:mt-2 sm:text-xl" title={`Excluir “${title}”?`}>Excluir “{title}”?</h2>
          <p id="delete-publication-description" className="mt-2 text-xs leading-4 text-[#5b675f] sm:mt-3 sm:text-sm sm:leading-6">Este {kind} deixará de aparecer no AdotaPerto. Essa ação não poderá ser desfeita.</p>
        </div>
        <footer className="grid grid-cols-2 gap-2 border-t border-[#e1e8e2] bg-[#f7fcf8] p-3 sm:gap-3 sm:px-7 sm:py-5">
          <button type="button" disabled={loading} onClick={onCancel} className="min-h-9 rounded-lg border border-[#bfcfc3] bg-white px-3 text-xs font-bold text-[#404942] transition hover:border-[#86a590] hover:bg-[#eefdf1] disabled:opacity-50 sm:min-h-11 sm:px-4 sm:text-sm">Cancelar</button>
          <button type="button" disabled={loading} onClick={onConfirm} autoFocus className="flex min-h-9 items-center justify-center gap-1.5 rounded-lg bg-red-700 px-3 text-xs font-bold text-white transition hover:bg-red-800 disabled:cursor-wait disabled:opacity-65 sm:min-h-11 sm:gap-2 sm:px-4 sm:text-sm">{loading ? <><span className="size-3.5 animate-spin rounded-full border-2 border-white/40 border-t-white sm:size-4" />Excluindo...</> : <><span className="sm:hidden">Excluir</span><span className="hidden sm:inline">Excluir publicação</span></>}</button>
        </footer>
      </section>
    </div>,
    document.body,
  );
}

export function PublicationsPanel({ filter, onFilter, animals, items, loading, error, onEdit, onRemove }: { filter: "animais" | "itens"; onFilter: (value: "animais" | "itens") => void; animals: Animal[]; items: DonationItem[]; loading: boolean; error: string | null; onEdit: (publication: EditablePublication) => void; onRemove: (publication: EditablePublication) => void }) {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebouncedValue(search, 300);
  const query = debouncedSearch.trim().toLocaleLowerCase("pt-BR");
  const publications: EditablePublication[] = (filter === "animais" ? animals.map((data): EditablePublication => ({ kind: "animal", data })) : items.map((data): EditablePublication => ({ kind: "item", data }))).filter((publication) => {
    if (!query) return true;
    const values = publication.kind === "animal" ? [publication.data.name, publication.data.species, publication.data.breed] : [publication.data.title, publication.data.itemName, publication.data.category];
    return values.some((value) => value?.toLocaleLowerCase("pt-BR").includes(query));
  });
  const pageSize = 6;
  const totalPages = Math.max(1, Math.ceil(publications.length / pageSize));
  const visiblePublications = publications.slice((page - 1) * pageSize, page * pageSize);

  useEffect(() => { setPage(1); }, [filter, debouncedSearch]);
  useEffect(() => { if (page > totalPages) setPage(totalPages); }, [page, totalPages]);

  return <div className="space-y-5 sm:space-y-7">
    <PageHeading title="Minhas publicações" description="Gerencie os anúncios que outras pessoas encontram na plataforma." action={<div className="flex gap-2"><Link href="/doacoes/animal" className="profile-action rounded-xl border border-[#256441] bg-white px-4 py-2.5 text-sm font-bold text-[#256441] hover:bg-[#eefdf1]">+ Animal</Link><Link href="/doacoes/item" className="profile-action rounded-xl bg-[#256441] px-4 py-2.5 text-sm font-bold text-white hover:bg-[#194b30]">+ Item</Link></div>} />
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"><SegmentedControl value={filter} options={[{ id: "animais", label: "Animais", count: filter === "animais" ? publications.length : animals.length }, { id: "itens", label: "Itens", count: filter === "itens" ? publications.length : items.length }]} onChange={(value) => onFilter(value as "animais" | "itens")} /><ProfileSearch value={search} onChange={setSearch} placeholder="Buscar publicações..." /></div>
    {loading ? (
      <PublicationSkeleton />
    ) : error ? (
      <LoadErrorState message="Não foi possível carregar suas publicações." />
    ) : publications.length === 0 ? (
      <EmptyTab title={filter === "animais" ? "Nenhum animal publicado" : "Nenhum item publicado"} description="Sua primeira publicação aparecerá aqui com opções de edição e status." />
    ) : (
      <><div className="grid gap-4 sm:grid-cols-2">{visiblePublications.map((publication) => <PublicationCard key={publication.data.id} publication={publication} onEdit={onEdit} onRemove={onRemove} />)}</div>{totalPages > 1 && <nav className="flex items-center justify-center gap-2 pt-3" aria-label="Paginação das publicações"><button type="button" disabled={page === 1} onClick={() => setPage((value) => Math.max(1, value - 1))} className="grid size-9 place-items-center rounded-lg border border-[#c6d5ca] bg-white text-lg font-bold text-[#256441] transition hover:border-[#86a590] hover:bg-[#eefdf1] disabled:pointer-events-none disabled:opacity-35" aria-label="Página anterior">‹</button>{Array.from({ length: totalPages }, (_, index) => index + 1).map((number) => <button key={number} type="button" onClick={() => setPage(number)} aria-current={page === number ? "page" : undefined} className={`grid size-9 place-items-center rounded-lg border text-xs font-bold transition ${page === number ? "border-[#256441] bg-[#256441] text-white" : "border-[#c6d5ca] bg-white text-[#526057] hover:border-[#86a590] hover:text-[#256441]"}`}>{number}</button>)}<button type="button" disabled={page === totalPages} onClick={() => setPage((value) => Math.min(totalPages, value + 1))} className="grid size-9 place-items-center rounded-lg border border-[#c6d5ca] bg-white text-lg font-bold text-[#256441] transition hover:border-[#86a590] hover:bg-[#eefdf1] disabled:pointer-events-none disabled:opacity-35" aria-label="Próxima página">›</button></nav>}</>
    )}
  </div>;
}

export function PublicationSkeleton() { return <SkeletonLoader variant="cards" />; }

export function PublicationCard({ publication, onEdit, onRemove }: { publication: EditablePublication; onEdit: (publication: EditablePublication) => void; onRemove: (publication: EditablePublication) => void }) {
  const isAnimal = publication.kind === "animal";
  const data = publication.data;
  const title = publication.kind === "animal" ? publication.data.name : publication.data.title;
  const image = publication.kind === "animal" ? publication.data.image : publication.data.mainImage;
  const detail = publication.kind === "animal" ? `${publication.data.species} • ${publication.data.sex} • ${publication.data.age}` : `${publication.data.quantity} ${publication.data.unit} • ${publication.data.category}`;
  return <article className="group grid grid-cols-[112px_1fr] overflow-hidden rounded-xl border border-[#e1e8e2] bg-white shadow-[0_5px_16px_rgba(38,51,43,0.06)] transition-all duration-300 ease-out hover:border-[#9fc5aa] hover:shadow-[0_18px_38px_rgba(31,91,57,0.15)] motion-reduce:transition-none sm:block sm:rounded-2xl sm:hover:-translate-y-1.5 sm:hover:scale-[1.01]"><div className="relative h-full min-h-[150px] overflow-hidden bg-[#e3f2e6] sm:h-44 sm:min-h-0"><Image src={image || "/images/login-cover-v2.png"} alt={title} fill className="object-cover transition-transform duration-500 ease-out group-hover:scale-[1.06] motion-reduce:transform-none" /><span className="absolute left-2 top-2 max-w-[calc(100%-1rem)] truncate rounded-full bg-white/95 px-2 py-1 text-[10px] font-bold text-[#256441] shadow-sm sm:left-3 sm:top-3 sm:px-3 sm:py-1.5 sm:text-xs">{data.status}</span></div><div className="min-w-0 p-3.5 sm:p-5"><p className="text-[10px] font-bold uppercase tracking-wider text-[#708078] sm:text-xs">{isAnimal ? "Adoção" : "Doação de item"}</p><h3 className="mt-0.5 truncate text-base font-extrabold transition-colors group-hover:text-[#256441] sm:mt-1 sm:text-xl">{title}</h3><p className="mt-0.5 truncate text-xs text-[#526057] sm:mt-1 sm:text-sm">{detail}</p><div className="mt-3 grid gap-1.5 border-t border-[#e7eee9] pt-3 sm:mt-5 sm:grid-cols-[1fr_auto] sm:gap-2 sm:pt-4"><button type="button" onClick={() => onEdit(publication)} className="rounded-lg bg-[#e3f2e6] px-2 py-2 text-[11px] font-bold text-[#256441] transition hover:bg-[#d7eeda] sm:px-4 sm:py-2.5 sm:text-sm">Editar</button><button type="button" onClick={() => onRemove(publication)} className="rounded-lg px-2 py-1.5 text-[11px] font-bold text-red-700 transition hover:bg-red-50 sm:px-3 sm:py-2.5 sm:text-sm" aria-label={`Excluir ${title}`}>Excluir</button></div></div></article>;
}
