import Image from "next/image";

export function SectionIcon({ src }: { src: string }) {
  return (
    <Image
      src={src}
      alt=""
      width={24}
      height={24}
      className="size-6 object-contain"
    />
  );
}
export function DonationTip({
  icon,
  title,
  children,
}: {
  icon: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <li className="flex items-start gap-3 py-4">
      <span className="mt-0.5 grid size-6 shrink-0 place-items-center text-[#256441]">
        <Image
          src={icon}
          alt=""
          width={22}
          height={22}
          className="max-h-5.5 max-w-5.5 object-contain"
        />
      </span>
      <span>
        <strong className="mb-0.5 block text-[#253129]">{title}</strong>
        {children}
      </span>
    </li>
  );
}
