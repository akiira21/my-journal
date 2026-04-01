import { postType } from "@/types";
import Link from "next/link";

interface BlogCardProps {
  post: postType;
  formatDate: (date: string, arg1: boolean, arg2: boolean) => string;
}

export default function BlogCard({ post, formatDate }: BlogCardProps) {
  return (
    <article key={post.slug}>
      <div className="flex items-center justify-between w-full py-2 gap-x-3">
        <div className="flex items-center gap-x-8 min-w-0">
          <span className="text-neutral-500 text-sm font-medium dark:text-neutral-400 shrink-0">
            {formatDate(post.metadata.createdAt, false, false)}
          </span>
          <Link
            href={`/posts/${post.slug}`}
            className="flex items-center transition-all duration-300 max-w-xl border-b hover:border-zinc-500 dark:hover:border-zinc-400"
          >
            <span className="text-wrap">{post.metadata.title}</span>
          </Link>
        </div>
        {post.metadata.readTimeMinutes && (
          <span className="text-xs text-zinc-500 dark:text-zinc-400 shrink-0">
            {post.metadata.readTimeMinutes} min
          </span>
        )}
      </div>
    </article>
  );
}
