import { postType } from "@/types";
import Link from "next/link";
import { Card } from "@/components/ui/card";

interface BlogCardProps {
  post: postType;
  formatDate: (date: string, arg1: boolean, arg2: boolean) => string;
}

export default function BlogCard({ post, formatDate }: BlogCardProps) {
  const categories = (post.metadata.categories ?? []).slice(0, 2);

  return (
    <article>
      <Link
        href={`/posts/${post.slug}`}
        className="group block h-full"
        aria-label={`Read ${post.metadata.title}`}
      >
        <Card className="relative h-full overflow-hidden border-white/10 bg-white/70 shadow-[0_16px_50px_rgba(15,23,42,0.08)] backdrop-blur-xl transition-all duration-300 hover:-translate-y-0.5 hover:border-sky-400/30 hover:bg-white/80 hover:shadow-[0_22px_60px_rgba(15,23,42,0.12)] dark:bg-white/5 dark:hover:bg-white/10">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(56,189,248,0.16),transparent_35%),radial-gradient(circle_at_bottom_left,rgba(99,102,241,0.12),transparent_32%)] opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

          <div className="relative flex h-full flex-col gap-4 p-5 sm:p-6">
            <div className="flex flex-wrap items-center gap-2 text-[11px] font-medium uppercase tracking-[0.22em] text-slate-500 dark:text-white/45">
              <span>{formatDate(post.metadata.createdAt, false, false)}</span>
              {post.metadata.readTimeMinutes && (
                <span className="rounded-full border border-white/10 bg-white/60 px-2.5 py-1 text-slate-600 backdrop-blur-md dark:bg-white/5 dark:text-white/70">
                  {post.metadata.readTimeMinutes} min read
                </span>
              )}
            </div>

            <div className="space-y-3">
              <div className="text-balance text-xl font-semibold leading-snug text-slate-900 transition-colors duration-300 group-hover:text-sky-700 dark:text-white dark:group-hover:text-sky-300 sm:text-[1.35rem]">
                {post.metadata.title}
              </div>

              {post.metadata.description && (
                <p className="text-sm leading-6 text-slate-600 dark:text-white/65">
                  {post.metadata.description}
                </p>
              )}
            </div>

            {categories.length > 0 && (
              <div className="flex flex-wrap gap-2 pt-1">
                {categories.map((category: string) => (
                  <span
                    key={category}
                    className="rounded-full border border-white/10 bg-white/60 px-2.5 py-1 text-[11px] font-medium text-slate-600 backdrop-blur-md dark:bg-white/5 dark:text-white/70"
                  >
                    {category}
                  </span>
                ))}
              </div>
            )}
          </div>
        </Card>
      </Link>
    </article>
  );
}
