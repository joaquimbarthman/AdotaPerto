export function DistanceFilter({
  value,
  onChange,
}: {
  value: number;
  onChange: (value: number) => void;
}) {
  const progress = ((value - 1) / 99) * 100;
  return (
    <div className="pt-4">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-[13px] font-semibold tracking-[0.04em] text-[#4d5b53]">
          Distância
        </h3>
        <output className="rounded-full bg-[#e8f7eb] px-2.5 py-1 text-[11px] font-semibold text-[#256441]">
          Até {value} km
        </output>
      </div>
      <input
        type="range"
        min="1"
        max="100"
        value={value}
        onChange={(event) => onChange(Number(event.target.value))}
        className="filter-range w-full"
        style={{
          background: `linear-gradient(to right, #256441 0 ${progress}%, #d6e6db ${progress}% 100%)`,
        }}
        aria-label="Distância máxima"
      />
      <div className="mt-1.5 flex justify-between text-[10px] font-medium text-[#7b8980]">
        <span>1 km</span>
        <span>100 km</span>
      </div>
    </div>
  );
}
