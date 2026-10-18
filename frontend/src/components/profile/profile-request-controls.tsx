"use client";

export function RequestDirectionTabs({
  value,
  options,
  onChange,
}: {
  value: string;
  options: { id: string; label: string; count: number }[];
  onChange: (id: string) => void;
}) {
  return (
    <div
      className="flex w-fit flex-wrap items-center gap-1.5 sm:gap-2"
      role="tablist"
      aria-label="Direção da solicitação"
    >
      {options.map((option) => (
        <button
          key={option.id}
          type="button"
          role="tab"
          aria-selected={value === option.id}
          onClick={() => onChange(option.id)}
          className={`group inline-flex min-h-8 items-center gap-1 rounded-lg px-2.5 py-1 text-xs font-semibold transition sm:min-h-9 sm:gap-1.5 sm:px-3 sm:py-1.5 sm:text-sm ${value === option.id ? "bg-[#e3f2e6] text-[#256441]" : "text-[#526057] hover:bg-[#e8f7eb] hover:text-[#256441]"}`}
        >
          <span>{option.label}</span>
          <span className="rounded-full bg-[#256441]/10 px-1.5 py-0.5 text-[10px] font-bold text-[#256441] sm:text-[11px]">
            {option.count}
          </span>
        </button>
      ))}
    </div>
  );
}

export function RequestTypePicker({
  value,
  onChange,
  animalCount,
  itemCount,
}: {
  value: "animais" | "itens";
  onChange: (value: "animais" | "itens") => void;
  animalCount: number;
  itemCount: number;
}) {
  const options = [
    { id: "animais" as const, title: "Animais", count: animalCount },
    { id: "itens" as const, title: "Itens", count: itemCount },
  ];
  return (
    <div
      className="flex flex-wrap items-center gap-1.5 sm:gap-2"
      role="tablist"
      aria-label="Tipo de solicitação"
    >
      {options.map((option) => (
        <button
          key={option.id}
          type="button"
          role="tab"
          aria-selected={value === option.id}
          onClick={() => onChange(option.id)}
          className={`group inline-flex min-h-8 items-center gap-1 rounded-lg px-2.5 py-1 text-xs font-semibold transition sm:min-h-9 sm:gap-1.5 sm:px-3 sm:py-1.5 sm:text-sm ${value === option.id ? "bg-[#e3f2e6] text-[#256441]" : "text-[#526057] hover:bg-[#e8f7eb] hover:text-[#256441]"}`}
        >
          <span>{option.title}</span>
          <span className="rounded-full bg-[#256441]/10 px-1.5 py-0.5 text-[10px] font-bold text-[#256441] sm:text-[11px]">
            {option.count}
          </span>
        </button>
      ))}
    </div>
  );
}
