import { TypographyH4 } from "@/custom_components/typography";
import BlogCard from "./blog-card";
import { postType } from "@/types";
import { formatDate } from "@/lib/utils";
import Link from "next/link";

export default function ChessPosts({
  chessPosts,
}: {
  chessPosts: postType[];
}) {
  return (
    <>
      <div className="flex items-center justify-between pe-6">
        <TypographyH4 className="font-medium">Chess Engine Dev Logs</TypographyH4>
        <Link 
            href="/posts/chess-engine" 
            className="text-sm text-zinc-700 hover:text-zinc-900  dark:text-zinc-300 dark:hover:text-zinc-100"
          >
            View all
        </Link>
      </div>
      <div className="my-4">
        {chessPosts
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

