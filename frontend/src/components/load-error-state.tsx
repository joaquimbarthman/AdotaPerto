export function LoadErrorState({ message = "Não foi possível carregar as informações." }: { message?: string }) {
  return <div role="alert" className="load-error-state grid min-h-36 place-items-center rounded-2xl border-2 border-dashed px-6 py-10 text-center">
    <p className="text-sm font-semibold sm:text-base">{message}</p>
  </div>;
}
