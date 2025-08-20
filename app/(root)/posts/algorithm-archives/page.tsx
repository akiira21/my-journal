import { TypographyH4, TypographyP } from "@/custom_components/typography";
import { getBlogPosts } from "@/lib/mdx";
import { BackwardAnchor } from "@/custom_components/anchor";
import SortedPosts from "../../_components/sorted-posts";
import Link from "next/link";

export default function AlgorithmPostsPage() {   
  const posts = getBlogPosts();
  const dsaPosts = posts.filter(post => post.metadata.isDsaBlog)

  const seriesMap = new Map<string, typeof dsaPosts>();
  
  series.forEach(seriesName => {
    const seriesPosts = dsaPosts.filter(post => post.metadata.series === seriesName);
    seriesMap.set(seriesName, seriesPosts);
  });

  return (
    <div className="pt-[15vh] max-w-3xl mx-auto md:px-4">
      <BackwardAnchor
          text="Home"
          href="/"
          className="text-xs text-neutral-600 dark:text-zinc-400 mb-6"
        /> 

      <TypographyH4>Algorithm Archives</TypographyH4>
      <div className="my-4 max-w-xl">
        {series.map(seriesName => {
          const seriesPosts = seriesMap.get(seriesName) || [];
          if (seriesPosts.length === 0) return null;
          
          return (
            <div key={`series-${seriesName}`}>
              <div className="flex items-center justify-between">
                <TypographyP>{seriesName}</TypographyP>
                <Link 
                    href={`/posts/algorithm-archives/${seriesName}`}
                    className="text-sm text-zinc-700 hover:text-zinc-900  dark:text-zinc-300 dark:hover:text-zinc-100"
                  >
                    View all
                </Link>
              </div>
              <SortedPosts posts={seriesPosts} reverse/>
            </div>
          );
        })}
      </div>
    </div>
  );
}

const series = [
  "Arrays",
  "Strings",
  "Linked Lists",
  "Stacks & Queues",
  "Hashing",
  "Recursion & Backtracking",
  "Trees",
  "Graphs",
  "Dynamic Programming",
  "Greedy Algorithms",
  "Advanced Topics",
]
