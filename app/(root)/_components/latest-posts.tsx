import { TypographyH3 } from "@/custom_components/typography";
import { formatDate, getBlogPosts } from "@/lib/mdx";
import Link from "next/link";

export default function LatestPosts() {
  let latestPosts = getBlogPosts();

  return (
    <>
      <TypographyH3 className="font-medium">Recent</TypographyH3>
      <div className="my-4">
        {latestPosts
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
                className="flex items-center transition-all duration-300 gap-x-8 py-4 ps-4 hover:bg-[#f0f5fe] hover:dark:bg-[#0e121f] rounded-xl hover:text-[#3E69F4]"
              >
                <span className="text-neutral-500 text-sm font-medium dark:text-neutral-400">
                  {formatDate(post.metadata.createdAt, false, false)}
                </span>
                <span>{post.metadata.title}</span>
              </Link>
            </article>
          ))}
      </div>
    </>
  );
}
