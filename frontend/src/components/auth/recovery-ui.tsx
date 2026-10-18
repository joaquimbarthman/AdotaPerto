import Link from "next/link";
import { Notification } from "@/components/notification";


export function PageHeading({
  title,
  description,
}: {
  title: string;
  description: React.ReactNode;
}) {
  return (
    <header className="mb-6">
      <h1 className="text-[30px] font-extrabold leading-10 tracking-[-0.02em]">
        {title}
      </h1>
      <p className="mt-2 leading-6 text-[#4d5b53]">{description}</p>
    </header>
  );
}

export function StatusMessage({ message }: { message: string | null }) {
  return message ? <Notification text={message} /> : null;
}

export function PrimaryButton({
  loading,
  label,
  loadingLabel,
}: {
  loading: boolean;
  label: string;
  loadingLabel: string;
}) {
  return (
    <button
      type="submit"
      disabled={loading}
      className="w-full rounded-xl bg-[#0f5d39] px-6 py-3.5 text-sm font-semibold text-white shadow-sm transition-all hover:-translate-y-0.5 hover:bg-[#0b482c] hover:shadow-md active:scale-[0.99] disabled:opacity-60"
    >
      {loading ? loadingLabel : label}
    </button>
  );
}

export function BackToLogin() {
  return (
    <p className="mt-7 border-t border-[#e1e8e2] pt-6 text-center text-sm text-[#4d5b53]">
      Lembrou sua senha?{" "}
      <Link
        href="/login"
        className="font-semibold text-[#0f5d39] hover:underline"
      >
        Voltar para o login
      </Link>
    </p>
  );
}
