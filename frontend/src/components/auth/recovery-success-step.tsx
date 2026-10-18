import Image from "next/image";
import type { Props } from "./password-recovery-form";

export function RecoverySuccessStep(props: Props) {
 const { onLogin } = props;
 return (

        <section className="mt-10 text-center">
          <div className="mx-auto grid size-16 place-items-center rounded-full bg-[#e3f2e6]">
            <Image src="/icons/check.svg" alt="" width={28} height={28} />
          </div>
          <h1 className="mt-5 text-[30px] font-extrabold tracking-[-0.02em]">
            Senha redefinida
          </h1>
          <p className="mt-2 leading-6 text-[#4d5b53]">
            Sua nova senha j&aacute; est&aacute; ativa. Agora voc&ecirc; pode
            entrar novamente na sua conta.
          </p>
          <button
            type="button"
            onClick={() => onLogin()}
            className="mt-7 w-full rounded-xl bg-[#0f5d39] px-6 py-3.5 text-sm font-semibold text-white transition hover:bg-[#0b482c]"
          >
            Ir para o login
          </button>
        </section>
      
 );
}
