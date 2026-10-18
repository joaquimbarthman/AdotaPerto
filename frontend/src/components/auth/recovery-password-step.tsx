import { AuthField } from "@/components/auth-field";
import { PageHeading, StatusMessage, PrimaryButton } from "./recovery-ui";
import type { Props } from "./password-recovery-form";

export function RecoveryPasswordStep(props: Props) {
 const { loading, message, handlePassword } = props;
 return (

        <section className="mt-7">
          <PageHeading
            title="Crie uma nova senha"
            description={
              "Use pelo menos 8 caracteres. Evite senhas usadas em outros servi\u00e7os."
            }
          />
          <StatusMessage message={message} />
          <form onSubmit={handlePassword} className="space-y-5">
            <AuthField
              label="Nova senha"
              icon="/icons/password.svg"
              name="password"
              type="password"
              placeholder={"M\u00ednimo de 8 caracteres"}
              autoComplete="new-password"
              minLength={8}
              required
              autoFocus
            />
            <AuthField
              label="Confirmar nova senha"
              icon="/icons/password.svg"
              name="confirmation"
              type="password"
              placeholder="Digite a senha novamente"
              autoComplete="new-password"
              minLength={8}
              required
            />
            <PrimaryButton
              loading={loading}
              label="Redefinir senha"
              loadingLabel="Redefinindo..."
            />
          </form>
        </section>
      
 );
}
