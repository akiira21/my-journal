import type { PostSummary } from "@/lib/blog-types";

import { PostItem } from "@/components/posts/post-item";

type PostListProps = {
  posts: PostSummary[];
};

export function PostList({ posts }: PostListProps) {
  if (posts.length === 0) {
    return (
      <div className="screen-line-top screen-line-bottom p-4">
        <p className="font-mono text-sm text-muted-foreground">No posts found for this page.</p>
      </div>
    );
  }

  return (
    <div className="pt-0">
      <div className="grid grid-cols-1 border-y border-line sm:grid-cols-2">
        {posts.map((post, index) => (
          <PostItem key={post.id} post={post} shouldPreloadImage={index <= 4} />
        ))}
      </div>
    </div>
  );
}
