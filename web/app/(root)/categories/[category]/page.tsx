import { BackwardAnchor } from "@/custom_components/anchor";
import CategoryPosts from "../../_components/category-post";

export function generateMetadata({ params }: { params: { category: string } }) {
  const category = decodeURIComponent(params.category);

  return {
    title: category.toUpperCase(),
    description: `All posts related to ${category}`,
  };
}

export default function CategoryPage({
  params,
}: {
  params: { category: string };
}) {
  const category = decodeURIComponent(params.category);

  return (
    <div className="max-w-2xl mx-auto mt-[25vh]">
      <BackwardAnchor
        text="Home"
        href="/"
        className="text-xs text-neutral-600 dark:text-zinc-400"
      />
      <div className="my-4">
        <CategoryPosts category={category} />
      </div>
    </div>
  );
}
