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
        <Card className="h-full rounded-none border-line bg-background/80 shadow-none transition-colors hover:bg-muted/30">
          <div className="flex h-full flex-col gap-4 p-4">
            <div className="flex flex-wrap items-center justify-between gap-2 font-mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
              <span>{formatDate(post.metadata.createdAt, false, false)}</span>
              {post.metadata.readTimeMinutes && (
                <span>{post.metadata.readTimeMinutes} min</span>
              )}
            </div>

            <h3 className="text-balance text-lg font-semibold tracking-tight transition-colors group-hover:text-foreground/70">
              {post.metadata.title}
            </h3>

            {post.metadata.description && (
              <p className="line-clamp-3 text-sm leading-6 text-muted-foreground">
                {post.metadata.description}
              </p>
            )}

            {categories.length > 0 && (
              <div className="mt-auto flex flex-wrap gap-2">
                {categories.map((category: string) => (
                  <span
                    key={category}
                    className="border border-line bg-background px-2 py-0.5 font-mono text-[11px] uppercase tracking-[0.08em] text-muted-foreground"
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
