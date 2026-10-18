import { Block } from "./skeleton-block";

export function ProfileSkeleton() {
  return (
    <main className="mx-auto max-w-300 px-5 pb-24 pt-8 sm:px-10 lg:px-20">
      <section className="flex flex-col items-center gap-5 rounded-2xl bg-white p-5 sm:flex-row sm:items-start sm:p-6">
        <Block className="size-28 shrink-0 rounded-full sm:size-32" />
        <div className="w-full flex-1 space-y-3 pt-2">
          <Block className="mx-auto h-8 w-48 sm:mx-0" />
          <Block className="mx-auto h-4 w-64 max-w-full sm:mx-0" />
          <Block className="mx-auto h-4 w-full max-w-xl sm:mx-0" />
          <Block className="mx-auto h-4 w-4/5 max-w-lg sm:mx-0" />
        </div>
      </section>
      <div className="mt-10 grid items-start gap-8 lg:grid-cols-[230px_1fr] lg:gap-12">
        <nav className="flex min-w-0 max-w-full gap-2 overflow-hidden pb-2 lg:flex-col">
          {Array.from({ length: 6 }, (_, index) => (
            <Block
              key={index}
              className="h-12 min-w-36 flex-1 lg:w-full lg:flex-none"
            />
          ))}
        </nav>
        <section className="min-h-105 rounded-xl bg-white p-5 sm:p-7">
          <div className="mb-7 space-y-3">
            <Block className="h-7 w-48" />
            <Block className="h-4 w-72 max-w-full" />
          </div>
          <div className="grid gap-5 sm:grid-cols-2">
            {Array.from({ length: 6 }, (_, index) => (
              <div
                key={index}
                className={`space-y-2 ${index === 5 ? "sm:col-span-2" : ""}`}
              >
                <Block className="h-4 w-28" />
                <Block
                  className={index === 5 ? "h-28 w-full" : "h-12 w-full"}
                />
              </div>
            ))}
          </div>
          <div className="mt-8 flex justify-end gap-3 border-t border-[#d7e6da] pt-5">
            <Block className="h-12 w-28" />
            <Block className="h-12 w-40" />
          </div>
        </section>
      </div>
    </main>
  );
}
