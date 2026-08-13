export function DirectionalChevron({ direction = "left", className = "" }: { direction?: "left" | "right" | "down"; className?: string }) {
  const rotation = direction === "right" ? "rotate-180" : direction === "down" ? "-rotate-90" : "";
  const alignment = direction === "down" ? "" : "-translate-y-px";

  return (
    <span aria-hidden="true" className={`relative inline-flex size-4 shrink-0 self-center items-center justify-center align-middle font-sans text-lg font-semibold leading-[1] ${alignment} ${rotation} ${className}`}>
      &lt;
    </span>
  );
}
