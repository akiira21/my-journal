import { postType } from "@/types";
import BlogCard from "./blog-card";
import { formatDate } from "@/lib/utils";

export default function SortedPosts({ posts }: { posts: postType[] }) {
  return (
    <div>
      {posts
        .sort((a, b) => {
          if (new Date(a.metadata.createdAt) > new Date(b.metadata.createdAt)) {
            return -1;
          }
          return 1;
        })
        .map((post) => (
          <BlogCard key={post.slug} post={post} formatDate={formatDate} />
        ))}
    </div>
  );
}
