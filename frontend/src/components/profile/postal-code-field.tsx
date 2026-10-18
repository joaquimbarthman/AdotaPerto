"use client";

type Props = {
  cep: string;
  setCep: (value: string) => void;
  cepStatus: "idle" | "loading" | "success" | "error";
  setCepStatus: (value: "idle" | "loading" | "success" | "error") => void;
  inputClass: string;
};

export function PostalCodeField({ cep, setCep, cepStatus, setCepStatus, inputClass }: Props) {
  return (        <label className="sm:max-w-60">
          <span className="mb-2 block text-sm font-bold text-[#253129]">
            CEP
          </span>
          <div className="relative">
            <input
              name="cep"
              required
              minLength={9}
              inputMode="numeric"
              value={cep}
              maxLength={9}
              aria-invalid={cepStatus === "error"}
              onChange={(event) => {
                const digits = event.target.value
                  .replace(/\D/g, "")
                  .slice(0, 8);
                const formatted =
                  digits.length > 5
                    ? `${digits.slice(0, 5)}-${digits.slice(5)}`
                    : digits;
                if (formatted !== cep) {
                  setCep(formatted);
                  setCepStatus("idle");
                }
              }}
              placeholder="00000-000"
              autoComplete="postal-code"
              className={`${inputClass} pr-10 ${cepStatus === "error" ? "border-red-300" : ""}`}
            />
            {cepStatus === "loading" && (
              <span
                className="absolute right-3 top-1/2 size-4 -translate-y-1/2 animate-spin rounded-full border-2 border-[#b8d8c1] border-t-[#256441]"
                aria-label="Buscando CEP"
              />
            )}
            {cepStatus === "success" && (
              <svg
                viewBox="0 0 24 24"
                className="absolute right-3 top-1/2 size-5 -translate-y-1/2 text-[#256441]"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.4"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-label="CEP encontrado"
              >
                <circle cx="12" cy="12" r="9" />
                <path d="m8 12 2.6 2.6L16.5 9" />
              </svg>
            )}
          </div>
        </label>
  );
}
