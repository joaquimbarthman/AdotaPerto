import Image from "next/image";


export function sizeName(size?: string) {
  if (!size) return "Médio";
  const sizes: Record<string, string> = {
    P: "Pequeno",
    M: "Médio",
    G: "Grande",
  };
  return sizes[size] || size;
}
export function Stat({
  icon,
  label,
  value,
}: {
  icon: string;
  label: string;
  value?: string;
}) {
  return (
    <div className="flex items-center gap-3">
      <span className="grid size-10 shrink-0 place-items-center rounded-full bg-[#e3f2e6]">
        <Image src={icon} alt="" width={20} height={20} />
      </span>
      <span className="min-w-0">
        <small className="block truncate text-xs font-medium text-[#404942]">
          {label}
        </small>
        <strong
          title={value}
          className="block truncate text-sm font-semibold tracking-wider"
        >
          {value || "Não informado"}
        </strong>
      </span>
    </div>
  );
}
export function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-sm font-semibold text-[#121e17]">{label}</dt>
      <dd className="mt-1 leading-6 text-[#404942]">{value}</dd>
    </div>
  );
}
export function InfoCard({
  title,
  icon,
  items,
}: {
  title: string;
  icon: string;
  items: string[];
}) {
  if (items.length === 0) return null;

  return (
    <section className="rounded-xl bg-white p-6 shadow-[0_4px_6px_rgba(38,51,43,0.05)]">
      <h2 className="mb-4 flex items-center gap-2 text-sm font-semibold tracking-wider">
        <Image src={icon} alt="" width={20} height={20} />
        {title}
      </h2>
      <ul className="space-y-3">
        {items.map((item) => (
          <li
            key={item}
            className="flex items-start gap-3 text-sm text-[#404942]"
          >
            <Image
              src="/icons/check-detail.svg"
              alt=""
              width={17}
              height={13}
              className="mt-1"
            />
            {item}
          </li>
        ))}
      </ul>
    </section>
  );
}
