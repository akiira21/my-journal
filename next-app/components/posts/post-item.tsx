import Link from "next/link";
import Image from "next/image";

import type { PostSummary } from "@/lib/blog-types";
import { cn } from "@/lib/utils";

function formatDate(value: string | null): string {
  if (!value) {
    return "Unpublished";
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "Unpublished";
  }

  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(date);
}

type PostItemProps = {
  post: PostSummary;
  shouldPreloadImage?: boolean;
};

const FALLBACK_GRADIENTS = [
  "from-sky-500/80 via-blue-500/70 to-indigo-500/80",
  "from-emerald-500/80 via-teal-500/70 to-cyan-500/80",
  "from-amber-500/80 via-orange-500/70 to-red-500/80",
  "from-fuchsia-500/80 via-pink-500/70 to-rose-500/80",
  "from-violet-500/80 via-purple-500/70 to-indigo-500/80",
];

function gradientForSlug(slug: string): string {
  const total = [...slug].reduce((sum, char) => sum + char.charCodeAt(0), 0);
  return FALLBACK_GRADIENTS[total % FALLBACK_GRADIENTS.length] ?? FALLBACK_GRADIENTS[0];
}

export function PostItem({ post, shouldPreloadImage }: PostItemProps) {
  const gradientClass = gradientForSlug(post.slug);

  return (
    <Link
      href={`/posts/${post.slug}`}
      className={cn(
        "group flex h-full flex-col gap-2 border-b border-line p-2 transition-[background-color] ease-out hover:bg-accent/35",
      )}
    >
      <div className="relative select-none">
        {post.cover_url ? (
          <Image
            src={post.cover_url}
            alt={post.title}
            width={1200}
            height={630}
            quality={100}
            priority={shouldPreloadImage}
            unoptimized
            className="aspect-1200/630 w-full rounded-xl object-cover"
          />
        ) : (
          <div className={cn("aspect-1200/630 w-full rounded-xl bg-linear-to-br", gradientClass)} />
        )}

        <div className="pointer-events-none absolute inset-0 rounded-xl ring-1 ring-black/10 ring-inset dark:ring-white/10" />

        {post.featured ? (
          <span className="absolute top-1.5 right-1.5 border border-white/45 bg-black/25 px-2 py-0.5 font-mono text-[10px] uppercase tracking-wider text-white">
            Featured
          </span>
        ) : null}
      </div>

      <div className="flex flex-col gap-1 p-2">
        <h3 className="line-clamp-2 text-lg leading-snug font-medium text-balance transition-colors group-hover:text-foreground">
          {post.title}
        </h3>

        <dl>
          <dt className="sr-only">Published on</dt>
          <dd className="font-mono text-sm text-muted-foreground">
            <time dateTime={post.published_at ?? undefined}>{formatDate(post.published_at)}</time>
            <span className="mx-2 text-foreground/30">•</span>
            <span>{post.read_time_minutes ?? 1} min read</span>
          </dd>
        </dl>
        </div>
    </Link>
  );
}
