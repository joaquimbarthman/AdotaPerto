import type { Metadata } from "next";

export const metadata: Metadata = { title: "Adoção" };

export default function AdoptionLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return children;
}
