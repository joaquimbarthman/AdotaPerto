"use client";

import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";

import Link from "next/link";
import type { Overview } from "./types";
export type { Overview } from "./types";
import { DashboardIcon } from "./admin-ui";
import { AdminOverview } from "./admin-overview";

export type Props = {
  data: Overview | null;
  error: string | null;
  access: number | null;
  loading: boolean;
  refresh: () => void;
  seedContent: () => Promise<void>;
  seeding: boolean;
  seedMessage: string | null;
  seedError: boolean;
};

export function AdminDashboard(props: Props) {
  const {
  data,
  error,
  access,
  loading,
  refresh,
  seedContent,
  seeding,
  seedMessage,
  seedError,
} = props;
  return (
    <div className="admin-shell min-h-screen">
      <SiteHeader />
      <main className="mx-auto max-w-300 px-4 pb-28 pt-7 sm:px-6 lg:px-12 lg:pb-14 lg:pt-10">
        <Link href="/" className="admin-back-button">
          <svg
            viewBox="0 0 20 20"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <path d="m12.5 15-5-5 5-5" />
          </svg>
          <span>Voltar ao site</span>
        </Link>
        <header className="admin-hero">
          <div className="relative z-10 max-w-2xl">
            <div className="admin-eyebrow">
              <DashboardIcon name="shield" />
              Área administrativa
            </div>
            <h1>Visão geral do sistema</h1>
            <p>
              Acompanhe o crescimento da comunidade, as publicações e as
              solicitações em um só lugar.
            </p>
          </div>
          <div className="admin-hero-decoration" aria-hidden="true">
            <span />
            <span />
            <span />
          </div>
          {data && (
            <button
              onClick={refresh}
              disabled={loading}
              className="admin-refresh-button"
            >
              <DashboardIcon name="refresh" />
              <span>Atualizar dados</span>
            </button>
          )}
        </header>

        {loading && (
          <div role="status" className="admin-card admin-loading">
            <span className="admin-loader" />
            <div>
              <strong>Preparando seu painel</strong>
              <p>Buscando as informações mais recentes do sistema…</p>
            </div>
          </div>
        )}
        {!loading && error && (
          <section role="alert" className="admin-card admin-error-state">
            <span className="admin-error-icon">!</span>
            <div>
              <h2>
                {access === 403
                  ? "Acesso restrito"
                  : access === 401
                    ? "Autenticação necessária"
                    : "Painel indisponível"}
              </h2>
              <p>{error}</p>
              <div className="mt-5 flex flex-wrap gap-3">
                {access === 401 ? (
                  <Link href="/login" className="admin-primary-link">
                    Entrar na conta
                  </Link>
                ) : (
                  access !== 403 && (
                    <button onClick={refresh} className="admin-primary-link">
                      Tentar novamente
                    </button>
                  )
                )}
                <Link href="/" className="admin-secondary-link">
                  Voltar ao início
                </Link>
              </div>
            </div>
          </section>
        )}

        {data && !loading && <AdminOverview data={data} seedContent={seedContent} seeding={seeding} seedMessage={seedMessage} seedError={seedError} />}
      </main>
      <SiteFooter />
    </div>
  );
}
