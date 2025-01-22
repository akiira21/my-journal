import { BackwardAnchor } from "@/custom_components/anchor";
import CategoryPosts from "../../_components/category-post";
import { getBlogPosts } from "@/lib/mdx";

export async function generateStaticParams() {
  const posts = getBlogPosts();

  return posts.map((post) => ({
    category: post.metadata.categories.forEach((category: string) => category),
  }));
}

export function generateMetadata({ params }: { params: { category: string } }) {
  const category = params.category;

  return {
    title: category.toLocaleUpperCase(),
    description: `All posts related to ${category}`,
  };
}

export default function CategoryPage({
  params,
}: {
  params: { category: string };
}) {
  const { category } = params;
  const formattedCategory = category
    .replace(/\s+/g, "-")
    .replace(/^\w/, (c) => c.toUpperCase());

  return (
    <div className="max-w-2xl mx-auto mt-[25vh]">
      <BackwardAnchor
        text="Home"
        href="/"
        className="text-xs text-neutral-600 dark:text-zinc-400"
      />
      <div className="my-4">
        <CategoryPosts category={formattedCategory} />
      </div>
    </div>
  );
}
