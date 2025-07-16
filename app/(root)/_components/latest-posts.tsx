import { TypographyH3 } from "@/custom_components/typography";
import BlogCard from "./blog-card";
import { postType } from "@/types";
import { formatDate } from "@/lib/utils";

export default function LatestPosts({
  latestPosts,
}: {
  latestPosts: postType[];
}) {
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
            <BlogCard key={post.slug} post={post} formatDate={formatDate} />
          ))}
      </div>
    </>
  );
}
