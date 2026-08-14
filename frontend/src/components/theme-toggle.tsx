"use client";

import { useEffect, useState } from "react";

export function ThemeToggle({ mobile = false }: { mobile?: boolean }) {
  const [theme, setTheme] = useState<"light" | "dark">("light");

  useEffect(() => {
    const currentTheme = document.documentElement.dataset.theme === "dark" ? "dark" : "light";
    const frame = requestAnimationFrame(() => setTheme(currentTheme));
    return () => cancelAnimationFrame(frame);
  }, []);

  function toggle() {
    const root = document.documentElement;
    const nextTheme = root.dataset.theme === "dark" ? "light" : "dark";
    root.dataset.theme = nextTheme;
    root.classList.toggle("theme-dark", nextTheme === "dark");
    root.style.colorScheme = nextTheme;
    setTheme(nextTheme);
    try {
      localStorage.setItem("adotaperto-theme", nextTheme);
    } catch {
      // O tema continua funcionando mesmo quando o armazenamento está bloqueado.
    }
  }

  if (mobile) {
    return <button type="button" onClick={toggle} className="mt-2 flex w-full items-center gap-3 rounded-lg bg-[#f7fcf8] px-4 py-3 text-sm font-semibold text-[#256441] transition hover:bg-[#e8f7eb]" aria-label={theme === "dark" ? "Ativar tema claro" : "Ativar tema escuro"}><ThemeIcon dark={theme === "dark"} />{theme === "dark" ? "Usar tema claro" : "Usar tema escuro"}</button>;
  }

  return <button type="button" onClick={toggle} className="relative z-10 grid size-10 place-items-center rounded-full text-[#404942] transition hover:bg-[#e1f2e5] hover:text-[#256441] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#256441]" aria-label={theme === "dark" ? "Ativar tema claro" : "Ativar tema escuro"} title={theme === "dark" ? "Tema claro" : "Tema escuro"}><ThemeIcon dark={theme === "dark"} /></button>;
}

function ThemeIcon({ dark }: { dark: boolean }) {
  return dark ? (
    <svg viewBox="0 0 24 24" className="pointer-events-none size-5" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true"><circle cx="12" cy="12" r="4" /><path d="M12 2v2m0 16v2M4.9 4.9l1.4 1.4m11.4 11.4 1.4 1.4M2 12h2m16 0h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" strokeLinecap="round" /></svg>
  ) : (
    <svg viewBox="0 0 24 24" className="pointer-events-none size-5" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true"><path d="M20.2 15.2A8.5 8.5 0 0 1 8.8 3.8 8.5 8.5 0 1 0 20.2 15.2Z" strokeLinecap="round" strokeLinejoin="round" /></svg>
  );
}
