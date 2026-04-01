import TableOfContent from "@/app/navigation/table-of-content";
import { BackwardAnchor } from "@/custom_components/anchor";
import {
  TypographyBlockquote,
  TypographyH2,
  TypographyH4,
  TypographyH3,
  TypographyP,
} from "@/custom_components/typography";
import { getPostBySlug, getRelatedPosts } from "@/lib/mdx";
import { formatDate } from "@/lib/utils";
import Link from "next/link";

export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}) {
  const post = await getPostBySlug(params.slug);

  if (!post) return { title: "No post found" };

  const { title, description, createdAt } = post.metadata;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: "article",
      createdAt,
      url: `https://blog.arun.space/posts/${params.slug}`,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
  };
}

export default async function PostPage({
  params,
}: {
  params: { slug: string };
}) {
  const post = await getPostBySlug(params.slug);
  if (!post) {
    return (
      <div className="mt-[25vh] max-w-2xl mx-auto">
        <BackwardAnchor
          text="Home"
          href="/"
          className="text-xs text-neutral-600 dark:text-zinc-400"
        />
        <TypographyH3 className="my-4">No post found</TypographyH3>
      </div>
    );
  }

  const readTime = post.readTime;
  const relatedPosts = await getRelatedPosts(params.slug, 5);

  return (
    <>
      <TableOfContent sections={post.sections} />
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
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
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

        <article className="w-full h-full">{post.content}</article>

        {relatedPosts.length > 0 && (
          <section className="mt-14 border-t border-zinc-200 dark:border-zinc-800 pt-8">
            <TypographyH4 className="text-lg mb-4">You can also read</TypographyH4>
            <div className="space-y-4">
              {relatedPosts.map((relatedPost) => (
                <Link
                  key={relatedPost.id}
                  href={`/posts/${relatedPost.slug}`}
                  className="block rounded-lg border border-zinc-200 dark:border-zinc-800 p-4 transition-colors hover:bg-zinc-50 dark:hover:bg-zinc-900/50"
                >
                  <TypographyP className="text-sm font-semibold leading-6 text-zinc-900 dark:text-zinc-100">
                    {relatedPost.title}
                  </TypographyP>
                  {relatedPost.description && (
                    <TypographyP className="text-sm text-zinc-600 dark:text-zinc-400 mt-1 line-clamp-2">
                      {relatedPost.description}
                    </TypographyP>
                  )}
                </Link>
              ))}
            </div>
          </section>
        )}
      </div>
    </>
  );
}
