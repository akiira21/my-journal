import { postType } from "@/types";
import BlogCard from "./blog-card";
import { formatDate } from "@/lib/utils";

export default function SortedPosts({ posts, reverse }: { posts: postType[], reverse?: boolean }) {
  return (
    <div>
      {posts
      .sort((a, b) => {
        const dateA = new Date(a.metadata.createdAt);
        const dateB = new Date(b.metadata.createdAt);
        
        if (reverse) {
        return dateA > dateB ? 1 : -1;
        } else {
        return dateA > dateB ? -1 : 1;
        }
      })
      .map((post) => (
        <BlogCard key={post.slug} post={post} formatDate={formatDate} />
      ))}
    </div>
  );
}
