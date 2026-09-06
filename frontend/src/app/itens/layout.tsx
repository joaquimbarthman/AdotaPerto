import type { Metadata } from "next";

export const metadata: Metadata = { title: "Itens" };

export default function ItemsLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return children;
}
