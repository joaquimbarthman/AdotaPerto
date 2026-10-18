"use client";

import type { Dispatch, SetStateAction } from "react";

type Props = {
  showDeleteConfirmation: boolean;
  setShowDeleteConfirmation: Dispatch<SetStateAction<boolean>>;
  deleteConfirmation: string;
  setDeleteConfirmation: Dispatch<SetStateAction<string>>;
  loading: boolean;
  handleAccountDeletion: () => void;
  onClearStatus: () => void;
};

export function AccountDeletion({ showDeleteConfirmation, setShowDeleteConfirmation, deleteConfirmation, setDeleteConfirmation, loading, handleAccountDeletion, onClearStatus }: Props) {
  return (      <section className="mt-8 max-w-3xl rounded-xl border border-red-200 bg-white p-5">
        <h3 className="text-sm font-bold text-red-800">Excluir conta</h3>
        <p className="mt-1 text-sm leading-6 text-[#5b675f]">
          A exclusão é permanente e remove seus dados e publicações. Essa ação
          não pode ser desfeita.
        </p>
        {!showDeleteConfirmation ? (
          <button
            type="button"
            onClick={() => {
              onClearStatus();
              setShowDeleteConfirmation(true);
            }}
            className="mt-4 min-h-11 rounded-lg border border-red-700 px-4 py-2 text-sm font-bold text-red-700 transition hover:bg-red-700 hover:text-white"
          >
            Excluir minha conta
          </button>
        ) : (
          <div className="mt-4 space-y-4">
            <label className="block max-w-md">
              <span className="text-sm font-semibold text-[#253129]">
                Para confirmar, escreva <strong>DELETAR</strong>
              </span>
              <input
                type="text"
                value={deleteConfirmation}
                onChange={(event) => setDeleteConfirmation(event.target.value)}
                autoComplete="off"
                autoCapitalize="none"
                spellCheck={false}
                autoFocus
                required
                onKeyDown={(event) => {
                  if (event.key === "Enter") event.preventDefault();
                }}
                className="mt-2 w-full rounded-lg border border-[#c0c9bf] px-3 py-2.5 text-sm text-[#121e17] outline-none focus:border-red-600 focus:ring-2 focus:ring-red-600/15"
              />
            </label>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                disabled={loading}
                onClick={() => {
                  setShowDeleteConfirmation(false);
                  setDeleteConfirmation("");
                }}
                className="min-h-10 rounded-lg border border-[#86a590] px-4 py-2 text-sm font-bold text-[#256441] transition hover:bg-[#e8f7eb] disabled:opacity-60"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleAccountDeletion}
                disabled={loading || deleteConfirmation !== "DELETAR"}
                className="min-h-10 rounded-lg bg-red-700 px-4 py-2 text-sm font-bold text-white transition hover:bg-red-800 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {loading ? "Excluindo conta..." : "Confirmar exclusão"}
              </button>
            </div>
          </div>
        )}
      </section>
  );
}
