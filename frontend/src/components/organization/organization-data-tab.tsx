"use client";

import type { DashboardProps } from "./dashboard-props";
import { box, button, input } from "./styles";

export function OrganizationDataTab({ dashboard, canManage, busy, saveOrganization, setLogoFile }: Pick<DashboardProps, "dashboard" | "canManage" | "busy" | "saveOrganization" | "setLogoFile">) {
  return (
        <section className={`${box} mt-6 max-w-3xl`}>
          <h2 className="text-lg font-bold">Dados da organização</h2>
          <form
            key={JSON.stringify(dashboard.organization)}
            onSubmit={saveOrganization}
            className="mt-5 grid gap-4 sm:grid-cols-2"
          >
            <Field
              label="Nome"
              name="name"
              value={dashboard.organization.name}
              required
              disabled={!canManage}
            />
            <Field
              label="CNPJ"
              name="cnpj"
              value={dashboard.organization.cnpj}
              disabled={!canManage}
            />
            <Field
              label="Telefone"
              name="phone"
              value={dashboard.organization.phone}
              disabled={!canManage}
            />
            <Field
              label="Site"
              name="website"
              value={dashboard.organization.website}
              type="url"
              disabled={!canManage}
            />
            <Field
              label="Instagram"
              name="instagram"
              value={dashboard.organization.instagram}
              disabled={!canManage}
            />
            <label className="sm:col-span-2 text-sm font-semibold">
              Descrição
              <textarea
                name="description"
                defaultValue={dashboard.organization.description || ""}
                disabled={!canManage}
                rows={5}
                maxLength={2000}
                className={`${input} mt-1 resize-y`}
              />
            </label>
            <label className="sm:col-span-2 text-sm font-semibold">
              Logo
              <input
                type="file"
                accept="image/png,image/jpeg,image/webp"
                disabled={!canManage}
                onChange={(event) =>
                  setLogoFile(event.target.files?.[0] || null)
                }
                className={`${input} mt-1`}
              />
            </label>
            {canManage && (
              <button
                disabled={busy}
                className={`${button} sm:col-span-2 sm:justify-self-start`}
              >
                {busy ? "Salvando..." : "Salvar dados"}
              </button>
            )}
          </form>
          {!canManage && (
            <p className="mt-4 text-sm text-[#68726b]">
              Somente responsáveis e gestores podem editar esses dados.
            </p>
          )}
        </section>
  );
}

function Field({
  label,
  name,
  value,
  required,
  disabled,
  type = "text",
}: {
  label: string;
  name: string;
  value: string | null;
  required?: boolean;
  disabled?: boolean;
  type?: string;
}) {
  return (
    <label className="text-sm font-semibold">
      {label}
      <input
        name={name}
        type={type}
        defaultValue={value || ""}
        required={required}
        disabled={disabled}
        maxLength={name === "name" ? 160 : 255}
        className={`${input} mt-1`}
      />
    </label>
  );
}

