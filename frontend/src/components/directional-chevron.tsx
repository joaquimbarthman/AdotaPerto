export function DirectionalChevron({ direction = "left", className = "" }: { direction?: "left" | "right" | "down"; className?: string }) {
  const rotation = direction === "right" ? "rotate-180" : direction === "down" ? "-rotate-90" : "";

  return (
    <span aria-hidden="true" className={`relative inline-flex size-4 shrink-0 self-center items-center justify-center align-middle font-sans text-lg font-semibold leading-none ${rotation} ${className}`}>
      &lt;
    </span>
  );
}
