import BlogCard from "./blog-card";
import { postType } from "@/types";
import { formatDate } from "@/lib/utils";
import { TypographyH4 } from "@/custom_components/typography";

export default function DsaPosts({
  dsaPosts,
}: {
  dsaPosts: postType[];
}) {
  return (
    <>
      <TypographyH4>Algorithm Archives</TypographyH4>
      <div className="my-4">
        {dsaPosts
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
