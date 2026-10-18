import { DashboardIcon } from "./admin-ui";
import type { Overview } from "./types";

export function RecentUsersTable({ data }: { data: Overview }) {
  return (
    <section className="admin-card mt-6 overflow-hidden p-0">
      <div className="flex items-center justify-between gap-4 px-5 py-5 sm:px-6">
        <div>
          <p className="admin-section-kicker">Comunidade</p>
          <h2 className="admin-card-title mt-1">Cadastros recentes</h2>
          <p className="admin-muted mt-1 text-xs">
            As últimas oito contas cadastradas.
          </p>
        </div>
        <span className="admin-panel-icon hidden sm:grid">
          <DashboardIcon name="users" />
        </span>
      </div>
      {data.recentUsers.length === 0 ? (
        <p className="admin-muted px-6 pb-6 text-sm">
          Nenhum usuário cadastrado.
        </p>
      ) : (
        <div className="admin-table-wrap overflow-x-auto">
          <table className="admin-table w-full text-left text-sm">
            <caption className="sr-only">
              Usuários cadastrados recentemente
            </caption>
            <thead>
              <tr>
                {["Nome", "Localização", "Perfil", "Cadastro"].map((label) => (
                  <th scope="col" key={label}>
                    {label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {data.recentUsers.map((person) => (
                <tr key={person.id}>
                  <td data-label="Nome">
                    <span className="admin-avatar">
                      {person.name.charAt(0).toUpperCase()}
                    </span>
                    <strong>{person.name}</strong>
                  </td>
                  <td data-label="Localização" className="admin-muted">
                    {[person.city, person.state].filter(Boolean).join(" / ") ||
                      "Não informada"}
                  </td>
                  <td data-label="Perfil">
                    <span
                      className={
                        person.role?.split(",").includes("admin")
                          ? "admin-role-badge admin-role-manager"
                          : "admin-role-badge"
                      }
                    >
                      {person.role?.split(",").includes("admin")
                        ? "Administrador"
                        : "Usuário"}
                    </span>
                  </td>
                  <td
                    data-label="Cadastro"
                    className="admin-muted whitespace-nowrap"
                  >
                    {new Date(person.createdAt).toLocaleDateString("pt-BR")}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
