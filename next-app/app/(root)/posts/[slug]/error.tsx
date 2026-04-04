"use client";

import Link from "next/link";

export default function PostSlugError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <section className="mx-auto w-full max-w-3xl pt-0 pb-0">
      <div className="screen-line-top screen-line-bottom border-x border-y border-line px-4 py-4">
        <h1 className="text-xl font-semibold tracking-tight">Something went wrong</h1>
      </div>

      <div className="screen-line-bottom border-x border-b border-line px-4 py-4 space-y-3">
        <p className="font-mono text-sm text-destructive">{error.message || "Failed to load this post."}</p>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={reset}
            className="border border-line px-3 py-1 font-mono text-xs uppercase text-muted-foreground transition-colors hover:text-foreground"
          >
            Retry
          </button>
          <Link
            href="/posts"
            className="border border-line px-3 py-1 font-mono text-xs uppercase text-muted-foreground transition-colors hover:text-foreground"
          >
            Back to posts
          </Link>
        </div>
      </div>
    </section>
  );
}
