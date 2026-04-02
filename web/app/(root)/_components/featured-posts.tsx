import { TypographyH4 } from "@/custom_components/typography";
import BlogCard from "./blog-card";
import { postType } from "@/types";
import { formatDate } from "@/lib/utils";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function FeaturedPosts({
  featuredPosts,
}: {
  featuredPosts: postType[];
}) {
  return (
    <section className="space-y-4">
      <div className="flex w-full items-center justify-between gap-4">
        <div className="space-y-1">
          <p className="text-[11px] font-medium uppercase tracking-[0.24em] text-slate-500 dark:text-white/45">
            Highlighted
          </p>
          <TypographyH4 className="font-semibold text-slate-900 dark:text-white">
            Featured Posts
          </TypographyH4>
        </div>

        <Button
          asChild
          variant="ghost"
          size="sm"
          className="rounded-full border border-white/10 bg-white/60 px-3 text-xs font-medium text-slate-600 shadow-none backdrop-blur-md hover:bg-white/80 hover:text-slate-900 dark:bg-white/5 dark:text-white/70 dark:hover:bg-white/10 dark:hover:text-white"
        >
          <Link href="/posts/featured">View all</Link>
        </Button>
      </div>
      <div className="space-y-4">
        {featuredPosts
          .sort((a, b) => {
            if (
              new Date(a.metadata.createdAt) > new Date(b.metadata.createdAt)
            ) {
              return -1;
            }
            return 1;
          })
          .map((post) => (
            <BlogCard key={post.slug} post={post} formatDate={formatDate} />
          ))}
      </div>
    </section>
  );
}
