import { postType } from "@/types";
import Link from "next/link";


interface BlogCardProps {
  post: postType;
  formatDate: (date: string, arg1: boolean, arg2: boolean) => string;
}

export default function BlogCard({ post, formatDate }: BlogCardProps) {
  return (
    <article key={post.slug}>
      <Link
        href={`/posts/${post.slug}`}
        className="flex items-center transition-all duration-300 gap-x-8 py-4 ps-4 hover:bg-[#f0f5fe] hover:dark:bg-[#0e121f] rounded-xl hover:text-[#3E69F4]"
      >
        <span className="text-neutral-500 text-sm font-medium dark:text-neutral-400">
          {formatDate(post.metadata.createdAt, false, false)}
        </span>
        <span>{post.metadata.title}</span>
      </Link>
    </article>
  );
}
