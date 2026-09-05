export function EmptyState({ message, description }: { message: string; description?: string }) {
  return <div className="grid min-h-36 place-items-center rounded-2xl border-2 border-dashed border-[#b8c9bd] bg-white/30 px-6 py-10 text-center">
    <div><p className="text-sm font-semibold text-[#404942] sm:text-base">{message}</p>{description && <p className="mt-2 text-sm text-[#68726b]">{description}</p>}</div>
  </div>;
}
