import { BackwardAnchor } from "@/custom_components/anchor";
import {
  TypographyBlockquote,
  TypographyH2,
  TypographyP,
} from "@/custom_components/typography";
import { calculateReadingTime, formatDate, getPostBySlug } from "@/lib/mdx";

export default async function PostPage({
  params,
}: {
  params: { slug: string };
}) {
  const post = await getPostBySlug(params.slug);
  if (!post) return <div>Loading</div>;
  const readTime = post.readTime;

  return (
    <div className="mt-[25vh] max-w-2xl mx-auto">
      <BackwardAnchor
        text="Home"
        href="/"
        className="text-xs text-neutral-600 dark:text-zinc-400"
      />

      <header className="my-4">
        <div id="post-header">
          <TypographyH2 className="italic">{post.metadata.title}</TypographyH2>
        </div>
        <div className="flex items-center gap-x-2">
          <TypographyP className="text-xs my-2 font-medium text-neutral-500 dark:text-zinc-400">
            {formatDate(post.metadata.createdAt, false, true)}
          </TypographyP>
          /
          <TypographyP className="text-xs my-2 font-medium text-neutral-500 dark:text-zinc-400">
            {readTime} min read
          </TypographyP>
          {post.metadata.updatedAt && (
            <TypographyBlockquote className="text-xs my-2 px-2 text-[#3E69F4]">
              Last Updated: {formatDate(post.metadata.updatedAt, false, true)}
            </TypographyBlockquote>
          )}
        </div>
      </header>

      <article className="prose dark:prose-dark">{post.content}</article>
    </div>
  );
}
