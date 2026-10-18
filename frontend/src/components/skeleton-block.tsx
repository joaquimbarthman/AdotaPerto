export function Block({ className = "" }: { className?: string }) {
  return (
    <div
      aria-hidden="true"
      className={`skeleton-shimmer overflow-hidden rounded-lg ${className}`}
    />
  );
}
