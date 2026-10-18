import { DirectionalChevron } from "@/components/directional-chevron";
import Link from "next/link";

export function StatePage({ title, message }: { title: string; message: string }) {
  return (
    <div className="grid min-h-screen place-items-center bg-[#eefdf1] p-6 text-center">
      <div>
        <h1 className="text-2xl font-bold">{title}</h1>
        <p className="mt-2 text-[#526057]">{message}</p>
        <Link
          href="/perfil#solicitacoes"
          className="mt-5 inline-flex items-center gap-1 rounded-xl bg-[#256441] px-5 py-3 font-semibold text-white"
        >
          <DirectionalChevron />
          Voltar
        </Link>
      </div>
    </div>
  );
}
