import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "AdotaPerto",
  description: "Uma rede de apoio ao bem-estar animal.",
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
