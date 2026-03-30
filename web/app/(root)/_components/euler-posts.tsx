import { TypographyH4 } from "@/custom_components/typography";
import { postType } from "@/types";
import Link from "next/link";
import SortedPosts from "./sorted-posts";

export default function EulerPosts({
  eulerPosts,
}: {
  eulerPosts: postType[];
}) {
  return (
    <>
      <div className="flex items-center justify-between pe-6">
        <TypographyH4 className="font-medium">Euler Problems</TypographyH4>
        <Link 
            href="/posts/euler-problems" 
            className="text-sm text-zinc-700 hover:text-zinc-900  dark:text-zinc-300 dark:hover:text-zinc-100"
          >
            View all
        </Link>
      </div>
      <div className="my-4">
        <SortedPosts posts={eulerPosts.splice(0,5)}/>
     </div>
    </>
  );
}

