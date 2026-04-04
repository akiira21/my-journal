export default function PostSlugLoading() {
  return (
    <section className="mx-auto w-full max-w-3xl pt-0 pb-0">
      <div className="screen-line-top screen-line-bottom border-x border-y border-line px-4 py-4">
        <div className="h-9 w-3/4 animate-pulse bg-muted/60" />
      </div>

      <div className="screen-line-bottom border-x border-b border-line px-4 py-3">
        <div className="h-4 w-44 animate-pulse bg-muted/50" />
      </div>

      <div className="screen-line-bottom border-x border-b border-line px-4 py-3">
        <div className="flex gap-2">
          <div className="h-5 w-16 animate-pulse bg-muted/50" />
          <div className="h-5 w-20 animate-pulse bg-muted/50" />
          <div className="h-5 w-14 animate-pulse bg-muted/50" />
        </div>
      </div>

      <div className="border-x border-line px-4 py-6 space-y-3">
        <div className="h-4 w-full animate-pulse bg-muted/40" />
        <div className="h-4 w-full animate-pulse bg-muted/40" />
        <div className="h-4 w-11/12 animate-pulse bg-muted/40" />
        <div className="h-4 w-10/12 animate-pulse bg-muted/40" />
        <div className="h-4 w-9/12 animate-pulse bg-muted/40" />
      </div>
    </section>
  );
}
