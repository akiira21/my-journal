import BlogCard from "./blog-card";
import { postType } from "@/types";
import { formatDate } from "@/lib/utils";
import { TypographyH4 } from "@/custom_components/typography";
import Link from "next/link";

export default function DsaPosts({
  dsaPosts,
}: {
  dsaPosts: postType[];
}) {
  return (
    <>
      <div className="flex items-center justify-between pe-6">
        <TypographyH4>Algorithm Archives</TypographyH4>
        <Link 
            href="/posts/algorithm-archives" 
            className="text-sm text-zinc-700 hover:text-zinc-900  dark:text-zinc-300 dark:hover:text-zinc-100"
          >
            View all
        </Link>
      </div>
      <div className="my-4">
        {dsaPosts
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
    </>
  );
}
