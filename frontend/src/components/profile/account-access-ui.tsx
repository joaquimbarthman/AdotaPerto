"use client";

import Image from "next/image";
import type { ReactNode } from "react";
import { createPortal } from "react-dom";

export function AccessRow({
  icon,
  title,
  value,
  onEdit,
}: {
  icon: string;
  title: string;
  value: string;
  onEdit: () => void;
}) {
  return (
    <div className="flex items-center gap-3 bg-[#f7fcf8] p-3.5 sm:gap-4 sm:p-5">
      <div className="flex min-w-0 flex-1 items-center gap-3 sm:gap-4">
        <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-[#e3f2e6] sm:size-11 sm:rounded-xl">
          <Image src={icon} alt="" width={18} height={18} />
        </span>
        <div className="min-w-0">
          <p className="text-sm font-bold text-[#253129]">{title}</p>
          <p className="mt-1 truncate text-sm text-[#5b675f]">{value}</p>
        </div>
      </div>
      <button
        type="button"
        onClick={onEdit}
        className="shrink-0 rounded-lg border border-[#256441] px-3 py-2 text-xs font-bold text-[#256441] transition hover:bg-[#256441] hover:text-white sm:px-5 sm:py-2.5 sm:text-sm"
      >
        Alterar
      </button>
    </div>
  );
}

export function AccountModal({
  title,
  description,
  icon,
  onClose,
  children,
}: {
  title: string;
  description?: string;
  icon: string;
  onClose: () => void;
  children: ReactNode;
}) {
  return createPortal(
    <div
      className="fixed inset-0 z-50 grid place-items-center overflow-y-auto bg-[#0b1510]/65 p-3 backdrop-blur-sm sm:p-6"
      role="dialog"
      aria-modal="true"
      aria-labelledby="account-modal-title"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div className="account-modal-card my-auto w-full max-w-130 overflow-hidden rounded-3xl border border-white/10 bg-white shadow-[0_24px_80px_rgba(5,20,11,0.32)]">
        <header className="account-modal-header flex items-center gap-4 border-b border-[#d7e6da] bg-linear-to-br from-[#f7fcf8] to-[#eef8f0] px-5 py-5 text-left sm:px-7 sm:py-6">
          <span className="account-modal-icon grid size-11 shrink-0 place-items-center rounded-xl border border-[#cfe3d4] bg-white shadow-sm">
            <Image src={icon} alt="" width={21} height={21} />
          </span>
          <div>
            <h3
              id="account-modal-title"
              className="text-xl font-extrabold leading-7 tracking-[-0.01em] text-[#18271e] sm:text-2xl sm:leading-8"
            >
              {title}
            </h3>
            {description && (
              <p className="mt-1 text-sm leading-5 text-[#5b675f]">
                {description}
              </p>
            )}
          </div>
        </header>
        <div className="max-h-[min(72vh,680px)] overflow-y-auto p-5 sm:p-7">
          {children}
        </div>
      </div>
    </div>,
    document.body,
  );
}
