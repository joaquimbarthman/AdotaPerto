export const box = "rounded-2xl border border-[#d7e6da] bg-white p-5 shadow-sm sm:p-6";
export const input =
  "min-h-11 w-full rounded-lg border border-[#c8d2ca] bg-white px-3 py-2 text-sm outline-none focus:border-[#256441]";
export const button =
  "min-h-11 rounded-lg bg-[#256441] px-4 py-2 text-sm font-bold text-white disabled:opacity-50";

export function roleLabel(role: string) {
  return role === "owner"
    ? "Responsável"
    : role === "admin"
      ? "Gestor"
      : "Membro";
}

