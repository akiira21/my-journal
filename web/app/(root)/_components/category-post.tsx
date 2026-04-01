import { TypographyH4, TypographyP } from "@/custom_components/typography";
import { getPostsByCategory } from "@/lib/mdx";
import { formatDate } from "@/lib/utils";
import Link from "next/link";

interface CategoryPostsProps {
  category: string;
}

export default async function CategoryPosts({ category }: CategoryPostsProps) {
  const posts = await getPostsByCategory(category);

  if (posts.length === 0) {
    return (
      <>
        <TypographyH4>{category}</TypographyH4>

        <div className="my-2">
          <TypographyP>No post found with {category} category</TypographyP>
        </div>
      </>
    );
  }

  return (
    <>
      <TypographyH4 className="text-lg my-4 text-zinc-800 dark:text-zinc-300 content-heading">
        {category}
      </TypographyH4>
      <div className="my-2">
        {posts
          .sort((a, b) => {
            if (
              new Date(a.metadata.createdAt) > new Date(b.metadata.createdAt)
            ) {
              return -1;
            }
            return 1;
          })
          .map((post) => (
            <article key={post.slug}>
              <Link
                href={`/posts/${post.slug}`}
                className="flex items-center justify-between transition-all duration-300 gap-x-8 py-4 ps-4 pe-3 hover:bg-[#f0f5fe] hover:dark:bg-[#0e121f] rounded-xl hover:text-[#3E69F4]"
              >
                <div className="flex items-center gap-x-8">
                  <span className="text-neutral-500 text-sm font-medium dark:text-neutral-400">
                    {formatDate(post.metadata.createdAt, false, false)}
                  </span>
                  <span>{post.metadata.title}</span>
                </div>
                {post.metadata.readTimeMinutes && (
                  <span className="text-xs text-zinc-500 dark:text-zinc-400">
                    {post.metadata.readTimeMinutes} min
                  </span>
                )}
              </Link>
            </article>
          ))}
      </div>
    </>
  );
}
