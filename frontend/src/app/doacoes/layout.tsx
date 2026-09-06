import type { Metadata } from "next";

export const metadata: Metadata = { title: "Ajudar" };

export default function DonationsLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return children;
}
