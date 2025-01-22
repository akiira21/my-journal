import { BackwardAnchor } from "@/custom_components/anchor";
import { TypographyH3 } from "@/custom_components/typography";
import { getCategories } from "@/lib/mdx";
import CategoryPosts from "../_components/category-post";

export default function CategoriesPage() {
  const categories = getCategories();

  return (
    <div className="max-w-2xl mx-auto mt-[25vh]">
      <BackwardAnchor
        text="Home"
        href="/"
        className="text-xs text-neutral-600 dark:text-zinc-400"
      />
      <TypographyH3 className="my-4">Categories</TypographyH3>

      {categories.map((category, index) => (
        <div key={category + index.toString} className="max-w-xl my-6">
          <CategoryPosts category={category} />
        </div>
      ))}
    </div>
  );
}
