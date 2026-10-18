import type { ReactNode } from "react";

export function FormSection({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <section className="request-form-section border-b border-[#ddece0] py-5 first:pt-0 last:border-0 last:pb-0 sm:py-8">
      <h2 className="mb-3 text-base font-semibold sm:mb-6 sm:text-2xl">
        {title}
      </h2>
      <div className="space-y-4 sm:space-y-7">{children}</div>
    </section>
  );
}

export function RadioQuestion({
  legend,
  name,
  options,
  value,
  onChange,
}: {
  legend: string;
  name: string;
  options: string[];
  value?: string;
  onChange?: (value: string) => void;
}) {
  return (
    <fieldset>
      <legend className="mb-2 text-xs font-semibold leading-4 tracking-[0.01em] sm:mb-3 sm:text-sm">
        {legend}
      </legend>
      <div className="grid grid-cols-2 gap-1.5 sm:flex sm:flex-wrap sm:gap-2">
        {options.map((option) => (
          <label
            key={option}
            className="flex min-h-10 min-w-0 cursor-pointer items-center gap-1.5 rounded-lg border border-[#d7e6da] bg-[#f7fcf8] px-2.5 py-2 text-[11px] leading-4 text-[#404942] transition hover:border-[#86a590] has-[:checked]:border-[#2f7650] has-[:checked]:bg-[#e3f2e6] has-[:checked]:font-semibold has-[:checked]:text-[#194b30] sm:min-h-11 sm:gap-2.5 sm:px-3.5 sm:py-2.5 sm:text-sm"
          >
            <input
              type="radio"
              name={name}
              value={option}
              checked={value === undefined ? undefined : value === option}
              onChange={(event) => onChange?.(event.target.value)}
              required
              className="size-3.5 shrink-0 accent-[#2f7650] sm:size-4"
            />
            {option}
          </label>
        ))}
      </div>
    </fieldset>
  );
}

export function CheckboxQuestion({
  legend,
  name,
  options,
}: {
  legend: string;
  name: string;
  options: string[];
}) {
  return (
    <fieldset>
      <legend className="mb-3 text-sm font-semibold">{legend}</legend>
      <div className="grid gap-2 sm:flex sm:flex-wrap">
        {options.map((option) => (
          <label
            key={option}
            className="flex min-h-11 cursor-pointer items-center gap-2.5 rounded-lg border border-[#d7e6da] bg-white px-3.5 py-2.5 text-sm text-[#404942] transition hover:border-[#86a590] has-[:checked]:border-[#2f7650] has-[:checked]:bg-[#e3f2e6] has-[:checked]:font-semibold"
          >
            <input
              type="checkbox"
              name={name}
              value={option}
              className="size-4 rounded accent-[#2f7650]"
            />
            {option}
          </label>
        ))}
      </div>
    </fieldset>
  );
}

export function SelectQuestion({
  label,
  name,
  options,
}: {
  label: string;
  name: string;
  options: string[];
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-semibold">{label}</span>
      <select
        name={name}
        defaultValue=""
        required
        className="h-12 w-full rounded-lg border border-[#bfc9bf] bg-white px-4 text-sm outline-none transition focus:border-[#2f7650] focus:ring-4 focus:ring-[#2f7650]/10"
      >
        <option value="" disabled>
          Selecione uma op&ccedil;&atilde;o
        </option>
        {options.map((option) => (
          <option key={option}>{option}</option>
        ))}
      </select>
    </label>
  );
}

export function NumberQuestion({
  label,
  name,
  min,
  max,
}: {
  label: string;
  name: string;
  min: number;
  max: number;
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-semibold">{label}</span>
      <input
        type="number"
        name={name}
        min={min}
        max={max}
        required
        inputMode="numeric"
        className="h-12 w-full max-w-48 rounded-lg border border-[#bfc9bf] bg-white px-4 outline-none transition focus:border-[#2f7650] focus:ring-4 focus:ring-[#2f7650]/10"
      />
    </label>
  );
}

export function TextQuestion({
  label,
  name,
  placeholder,
  rows,
  required = true,
}: {
  label: string;
  name: string;
  placeholder: string;
  rows: number;
  required?: boolean;
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-semibold">{label}</span>
      <textarea
        name={name}
        rows={rows}
        required={required}
        maxLength={2000}
        placeholder={placeholder}
        className="w-full resize-y rounded-lg border border-[#bfc9bf] bg-white px-4 py-3 text-sm leading-6 outline-none transition placeholder:text-[#7b857e] focus:border-[#2f7650] focus:ring-4 focus:ring-[#2f7650]/10"
      />
    </label>
  );
}
