type SkeletonVariant = "cards" | "detail" | "form" | "profile";

export function SkeletonLoader({ variant = "detail", fullScreen = false }: { variant?: SkeletonVariant; fullScreen?: boolean }) {
  const content = variant === "cards" ? <CardSkeletons /> : variant === "form" ? <FormSkeleton /> : variant === "profile" ? <ProfileSkeleton /> : <DetailSkeleton />;
  return <div role="status" aria-live="polite" aria-label="Carregando conteúdo" className={fullScreen ? "min-h-screen bg-[#eefdf1]" : "w-full"}>
    <span className="sr-only">Carregando...</span>
    {content}
  </div>;
}

function Block({ className = "" }: { className?: string }) {
  return <div aria-hidden="true" className={`skeleton-shimmer overflow-hidden rounded-lg ${className}`} />;
}

function CardSkeletons() {
  return <div className="grid grid-cols-2 gap-2.5 sm:gap-6 xl:grid-cols-3">{Array.from({ length: 6 }, (_, index) => <div key={index} className="overflow-hidden rounded-xl bg-white shadow-[0_4px_12px_rgba(38,51,43,0.05)]"><Block className="h-28 rounded-none sm:h-[210px]" /><div className="space-y-2 p-2.5 sm:space-y-4 sm:p-6"><Block className="h-4 w-3/4 sm:h-6" /><Block className="h-3 w-1/2 sm:h-4" /><div className="flex gap-1 sm:gap-2"><Block className="h-6 w-14 sm:h-7 sm:w-20" /><Block className="h-6 w-16 sm:h-7 sm:w-24" /></div><Block className="mt-2 h-3 w-4/5 sm:mt-5 sm:h-4" /></div></div>)}</div>;
}

function DetailSkeleton() {
  return <main className="mx-auto max-w-[1200px] px-5 py-8 sm:px-10 lg:px-20 lg:py-12"><Block className="mb-8 h-5 w-28" /><div className="grid items-start gap-6 lg:grid-cols-[2fr_1fr]"><div className="space-y-6"><Block className="h-[360px] sm:h-[480px]" /><section className="space-y-5 rounded-xl bg-white p-6 sm:p-10"><Block className="h-9 w-2/5" /><Block className="h-5 w-1/3" /><div className="grid gap-4 border-t border-[#d7e6da] pt-6 sm:grid-cols-3"><Block className="h-12" /><Block className="h-12" /><Block className="h-12" /></div></section><section className="space-y-3 rounded-xl bg-white p-6 sm:p-10"><Block className="h-7 w-1/3" /><Block className="h-4 w-full" /><Block className="h-4 w-5/6" /><Block className="h-4 w-2/3" /></section></div><aside className="space-y-6"><section className="space-y-4 rounded-xl bg-white p-6"><Block className="h-4 w-24" /><div className="flex gap-4"><Block className="size-16 rounded-full" /><div className="flex-1 space-y-3"><Block className="h-5 w-4/5" /><Block className="h-3 w-3/5" /></div></div></section><Block className="h-14 rounded-xl" /></aside></div></main>;
}

function FormSkeleton() {
  return <main className="mx-auto max-w-[1120px] px-5 py-10 sm:px-8 lg:px-16"><Block className="h-5 w-36" /><div className="mb-10 mt-7 space-y-3"><Block className="h-10 w-2/5" /><Block className="h-5 w-3/5" /></div><div className="grid items-start gap-8 lg:grid-cols-[minmax(0,1fr)_300px]"><div className="space-y-6">{Array.from({ length: 3 }, (_, section) => <section key={section} className="rounded-2xl bg-white p-6 sm:p-8"><Block className="mb-6 h-7 w-1/3" /><div className="grid gap-5 sm:grid-cols-2">{Array.from({ length: 4 }, (_, field) => <div key={field} className="space-y-2"><Block className="h-4 w-24" /><Block className="h-12 w-full" /></div>)}</div></section>)}</div><section className="space-y-4 rounded-2xl bg-white p-6"><Block className="h-6 w-2/3" /><Block className="h-4 w-full" /><Block className="h-4 w-5/6" /><Block className="h-12 w-full" /></section></div></main>;
}

function ProfileSkeleton() {
  return <main className="mx-auto max-w-[1200px] px-5 pb-24 pt-8 sm:px-10 lg:px-20">
    <section className="flex flex-col items-center gap-5 rounded-2xl bg-white p-5 sm:flex-row sm:items-start sm:p-6">
      <Block className="size-28 shrink-0 rounded-full sm:size-32" />
      <div className="w-full flex-1 space-y-3 pt-2"><Block className="mx-auto h-8 w-48 sm:mx-0" /><Block className="mx-auto h-4 w-64 max-w-full sm:mx-0" /><Block className="mx-auto h-4 w-full max-w-xl sm:mx-0" /><Block className="mx-auto h-4 w-4/5 max-w-lg sm:mx-0" /></div>
    </section>
    <div className="mt-10 grid items-start gap-8 lg:grid-cols-[230px_1fr] lg:gap-12">
      <nav className="flex min-w-0 max-w-full gap-2 overflow-hidden pb-2 lg:flex-col">{Array.from({ length: 6 }, (_, index) => <Block key={index} className="h-12 min-w-36 flex-1 lg:w-full lg:flex-none" />)}</nav>
      <section className="min-h-[420px] rounded-xl bg-white p-5 sm:p-7">
        <div className="mb-7 space-y-3"><Block className="h-7 w-48" /><Block className="h-4 w-72 max-w-full" /></div>
        <div className="grid gap-5 sm:grid-cols-2">{Array.from({ length: 6 }, (_, index) => <div key={index} className={`space-y-2 ${index === 5 ? "sm:col-span-2" : ""}`}><Block className="h-4 w-28" /><Block className={index === 5 ? "h-28 w-full" : "h-12 w-full"} /></div>)}</div>
        <div className="mt-8 flex justify-end gap-3 border-t border-[#d7e6da] pt-5"><Block className="h-12 w-28" /><Block className="h-12 w-40" /></div>
      </section>
    </div>
  </main>;
}
