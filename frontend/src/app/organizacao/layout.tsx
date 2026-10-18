import type { Metadata } from "next";

export const metadata: Metadata = { title: "Painel da organização", robots: { index: false, follow: false } };

export default function OrganizationLayout({ children }: { children: React.ReactNode }) {
  return children;
}
