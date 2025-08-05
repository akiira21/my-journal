import { postType } from "@/types";
import Link from "next/link";

interface BlogCardProps {
  post: postType;
  formatDate: (date: string, arg1: boolean, arg2: boolean) => string;
}

export default function BlogCard({ post, formatDate }: BlogCardProps) {


  const colorTagMap:any = {
    "ML" : "bg-rose-200",
    "Maths" : "bg-emerald-200",
    "Algo" : "bg-pink-200" ,
    "React" : "bg-cyan-300",
    "Exp" : "bg-purple-200",
    "DL" : "bg-lime-200",
    "Euler": "bg-teal-200",
  }

  return (
    <article key={post.slug}>
      <Link
        href={`/posts/${post.slug}`}
        className="flex items-center transition-all duration-300 py-4 px-4 hover:bg-[#f0f5fe] hover:dark:bg-[#0e121f] rounded-xl hover:text-[#3E69F4]"
      >
        <div className="flex items-center justify-between w-full">
          <div className="flex items-center gap-x-8">
            <span className="text-neutral-500 text-sm font-medium dark:text-neutral-400">
            {formatDate(post.metadata.createdAt, false, false)}
            </span>
            <span className="max-w-[60%] sm:max-w-[70%] md:max-w-[80%] text-wrap truncate">{post.metadata.title}</span> 
          </div>
            <p className={`rounded-xl text-sm text-zinc-700 px-3 py-1 shadow-sm flex items-center justify-center w-16 ${colorTagMap[post.metadata.tag]}`}>
            {post.metadata.tag}
            </p>
        </div>
      </Link>
    </article>
  );
}
