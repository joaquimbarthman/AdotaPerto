import { PageHeading, StatusMessage, PrimaryButton, BackToLogin } from "./recovery-ui";
import type { Props } from "./password-recovery-form";

export function RecoveryCodeStep(props: Props) {
 const { email, otp, setOtp, loading, message, codeInputs, updateCode, handleCodeKey, handleCode, sendCode } = props;
 return (

        <section className="mt-7">
          <PageHeading
            title={"Digite o c\u00f3digo"}
            description={
              email ? (
                <>
                  Enviamos um c&oacute;digo para o e-mail vinculado à sua conta:{" "}
                  <strong className="font-semibold text-[#243129]">
                    {email}
                  </strong>
                  . Ele expira em 10 minutos.
                </>
              ) : (
                "Preparando o envio para o e-mail vinculado à sua conta..."
              )
            }
          />
          <StatusMessage message={message} />
          <form onSubmit={handleCode}>
            <div
              className="flex justify-center gap-3"
              onPaste={(event) => {
                const digits = event.clipboardData
                  .getData("text")
                  .replace(/\D/g, "")
                  .slice(0, 4)
                  .split("");
                if (digits.length) {
                  event.preventDefault();
                  setOtp([
                    digits[0] || "",
                    digits[1] || "",
                    digits[2] || "",
                    digits[3] || "",
                  ]);
                  codeInputs.current[Math.min(digits.length, 4) - 1]?.focus();
                }
              }}
            >
              {otp.map((digit, index) => (
                <input
                  key={index}
                  ref={(element) => {
                    codeInputs.current[index] = element;
                  }}
                  value={digit}
                  onChange={(event) => updateCode(index, event.target.value)}
                  onKeyDown={(event) => handleCodeKey(index, event)}
                  inputMode="numeric"
                  pattern="[0-9]"
                  maxLength={1}
                  aria-label={`D\u00edgito ${index + 1} do c\u00f3digo`}
                  autoFocus={index === 0}
                  className="size-14 rounded-xl border border-[#c8d2ca] bg-[#fbfdfb] text-center text-2xl font-bold text-[#121e17] outline-none transition focus:border-[#0f5d39] focus:ring-4 focus:ring-[#0f5d39]/10 sm:size-16"
                />
              ))}
            </div>
            <div className="mt-6">
              <PrimaryButton
                loading={loading}
                label="Continuar"
                loadingLabel="Validando..."
              />
            </div>
          </form>
          <p className="mt-5 text-center text-sm text-[#4d5b53]">
            N&atilde;o recebeu?{" "}
            <button
              type="button"
              disabled={loading}
              onClick={() => sendCode(email)}
              className="font-semibold text-[#0f5d39] hover:underline disabled:opacity-60"
            >
              Reenviar c&oacute;digo
            </button>
          </p>
          <BackToLogin />
        </section>
      
 );
}
