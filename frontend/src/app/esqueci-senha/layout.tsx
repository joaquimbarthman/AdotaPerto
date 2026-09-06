import type { Metadata } from "next";

export const metadata: Metadata = { title: "Recuperar senha" };

export default function ForgotPasswordLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return children;
}
