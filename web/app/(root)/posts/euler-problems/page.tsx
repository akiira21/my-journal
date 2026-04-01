import { TypographyH4 } from "@/custom_components/typography";
import { getBlogPosts } from "@/lib/mdx";
import { BackwardAnchor } from "@/custom_components/anchor";
import SortedPosts from "../../_components/sorted-posts";

export default async function EulerPostsPage() {
  const posts = await getBlogPosts();
  const eulerPosts = posts.filter((post) =>
    (post.metadata.tags || []).some(
      (tag: string) => tag.toLowerCase() === "euler"
    )
  );

  return (
    <div className="pt-[15vh] max-w-3xl mx-auto md:px-4">
      <BackwardAnchor
        text="Home"
        href="/"
        className="text-xs text-neutral-600 dark:text-zinc-400 mb-6"
      />

      <TypographyH4>Euler Problems</TypographyH4>
      <div className="my-4 max-w-xl">
        <SortedPosts posts={eulerPosts} />
      </div>
    </div>
  );
}
