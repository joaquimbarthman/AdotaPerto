import Image from "next/image";

export function YesNoUnknown({
  name,
  unknown = true,
}: {
  name: string;
  unknown?: boolean;
}) {
  return (
    <div className="donation-radio-group flex min-h-11 flex-wrap items-center gap-x-4 gap-y-1.5 rounded-lg border border-[#c5cec7] px-3 sm:min-h-12 sm:gap-x-5 sm:gap-y-2 sm:px-3.5">
      {["Sim", "Não", ...(unknown ? ["Não sei"] : [])].map((value) => (
        <label
          key={value}
          className="inline-flex items-center gap-1.5 text-xs font-normal sm:gap-2 sm:text-sm"
        >
          <input
            type="radio"
            name={name}
            value={value}
            required
            className="size-3.5 accent-[#256441] sm:size-4"
          />
          {value}
        </label>
      ))}
    </div>
  );
}

export function PawIcon() {
  return (
    <Image
      src="/icons/adocao.svg"
      alt=""
      width={24}
      height={24}
      className="size-5.5 object-contain"
    />
  );
}
export function HealthIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="size-6"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
    >
      <path d="M9 3h6v4h4v14H5V7h4V3Zm1 12h4m-2-2v4" />
    </svg>
  );
}
export function HeartIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="size-6"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
    >
      <path d="M20.8 5.8a5 5 0 0 0-7.1 0L12 7.5l-1.7-1.7a5 5 0 0 0-7.1 7.1L12 21l8.8-8.1a5 5 0 0 0 0-7.1Z" />
    </svg>
  );
}
export function StoryIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="size-5"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
    >
      <path d="M5 4h11a3 3 0 0 1 3 3v13H7a3 3 0 0 1-3-3V5a1 1 0 0 1 1-1Z" />
      <path d="M7 16h12M8 8h7M8 11h5" strokeLinecap="round" />
    </svg>
  );
}
