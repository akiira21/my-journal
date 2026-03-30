import { getBlogPosts } from "@/lib/mdx";
import { formatDate } from "@/lib/utils";
import { TypographyP } from "@/custom_components/typography";
import BlogCard from "./blog-card";

export default function CategoriesBody({
  activeCategory,
}: {
  activeCategory: string;
}) {
  const posts = getBlogPosts();

  const categoryPosts = posts.filter((post) =>
    post.metadata.categories.includes(activeCategory)
  );

  if (categoryPosts.length === 0) {
    return <TypographyP>No posts found in this category.</TypographyP>;
  }

  return (
    <div>
      {categoryPosts.map((post) => (
        <BlogCard key={post.slug} post={post} formatDate={formatDate} />
      ))}
    </div>
  );
}
