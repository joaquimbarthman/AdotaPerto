import type { Metadata } from "next";
import "./globals.css";
import { NotificationProvider } from "@/components/notification";

export const metadata: Metadata = {
  title: {
    default: "AdotaPerto",
    template: "%s | AdotaPerto",
  },
  description: "Uma rede de apoio ao bem-estar animal.",
  icons: {
    icon: "/icons/adotaperto-heart.png",
    shortcut: "/icons/adotaperto-heart.png",
    apple: "/icons/adotaperto-heart.png",
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
      <body><NotificationProvider />{children}</body>
    </html>
  );
}
