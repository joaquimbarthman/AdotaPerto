import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "AdotaPerto",
  description: "Uma rede de apoio ao bem-estar animal.",
  icons: {
    icon: "/icons/brand-paw.svg",
    shortcut: "/icons/brand-paw.svg",
    apple: "/icons/brand-paw.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  );
}
