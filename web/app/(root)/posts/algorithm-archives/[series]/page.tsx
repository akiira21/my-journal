import { TypographyH4 } from "@/custom_components/typography";
import { getBlogPosts } from "@/lib/mdx";
import { BackwardAnchor } from "@/custom_components/anchor";
import SortedPosts from "@/app/(root)/_components/sorted-posts";

export default function SeriesPostsPage({params}: {params: {series: string}}) {   
    const series = params.series;
    const posts = getBlogPosts();
    const seriesPosts = posts.filter(post => post.metadata.series === series);

  return (
    <div className="pt-[15vh] max-w-3xl mx-auto md:px-4">
      <BackwardAnchor
          text="Back"
          href="/posts/algorithm-archives"
          className="text-xs text-neutral-600 dark:text-zinc-400 mb-6"
        /> 

      <TypographyH4>{series}</TypographyH4>
      <div className="my-4 max-w-xl">
        <SortedPosts posts={seriesPosts} reverse/>
      </div>
    </div>
  );
}