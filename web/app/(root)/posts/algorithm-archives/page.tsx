import { TypographyH4, TypographyP } from "@/custom_components/typography";
import { getBlogPosts } from "@/lib/mdx";
import { BackwardAnchor } from "@/custom_components/anchor";
import SortedPosts from "../../_components/sorted-posts";
import Link from "next/link";

export default async function AlgorithmPostsPage() {
  const posts = await getBlogPosts();

  const seriesMap = new Map<string, typeof posts>();

  ALGORITHM_SERIES.forEach((seriesName) => {
    const seriesPosts = posts.filter((post) =>
      (post.metadata.categories || []).some(
        (category: string) => category.toLowerCase() === seriesName.toLowerCase()
      )
    );
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
      <div className="my-4 max-w-xl space-y-8">
        {ALGORITHM_SERIES.map((seriesName) => {
          const seriesPosts = seriesMap.get(seriesName) || [];
          if (seriesPosts.length === 0) return null;

          return (
            <div key={`series-${seriesName}`}>
              <div className="flex items-center justify-between">
                <TypographyP>{seriesName}</TypographyP>
                <Link
                  href={`/posts/algorithm-archives/${encodeURIComponent(seriesName)}`}
                  className="text-sm text-zinc-700 hover:text-zinc-900 dark:text-zinc-300 dark:hover:text-zinc-100"
                >
                  View all
                </Link>
              </div>
              <SortedPosts posts={seriesPosts} reverse />
            </div>
          );
        })}
      </div>
    </div>
  );
}

const ALGORITHM_SERIES = [
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
];

