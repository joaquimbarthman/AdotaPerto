import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Ajudar",
  description: "Publique um animal ou doe itens para ajudar pessoas e pets perto de você.",
};

export default function DonationsLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return children;
}
