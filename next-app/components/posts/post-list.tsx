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
    <div className="mx-auto w-full max-w-full pt-4">
      <div className="grid grid-cols-1 border-y border-line sm:grid-cols-2 sm:gap-x-3 sm:[&>*:nth-child(odd)]:border-r sm:[&>*:nth-child(odd)]:border-line sm:[&>*:nth-child(odd)]:pr-3 sm:[&>*:nth-child(even)]:border-l sm:[&>*:nth-child(even)]:border-line sm:[&>*:nth-child(even)]:pl-3">
        {posts.map((post, index) => (
          <PostItem key={post.id} post={post} shouldPreloadImage={index === 0} />
        ))}
      </div>
    </div>
  );
}
