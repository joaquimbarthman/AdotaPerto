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
    <html lang="pt-BR" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var saved=localStorage.getItem('adotaperto-theme');var dark=saved?saved==='dark':window.matchMedia('(prefers-color-scheme: dark)').matches;var root=document.documentElement;root.dataset.theme=dark?'dark':'light';root.classList.toggle('theme-dark',dark);root.style.colorScheme=dark?'dark':'light';}catch(e){document.documentElement.dataset.theme='light';}})();`,
          }}
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
