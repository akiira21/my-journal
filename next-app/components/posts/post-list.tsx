"use client";

import { useEffect, useMemo, useState } from "react";

import { apiFetch } from "@/lib/api";
import type { PostSummary, PostsPageResponse } from "@/lib/blog-types";

import { PostItem } from "@/components/posts/post-item";
import { PostsPagination } from "@/components/posts/posts-pagination";

type PostListProps = {
  posts: PostSummary[];
};

type PostsPageContentProps = {
  currentPage: number;
  query: string;
};

const PAGE_SIZE = 20;

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

export function PostsPageContent({ currentPage, query }: PostsPageContentProps) {
  const [data, setData] = useState<PostsPageResponse>({
    posts: [],
    total: 0,
    page: currentPage,
    page_size: PAGE_SIZE,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function loadPosts() {
      setIsLoading(true);
      setError(null);

      try {
        const trimmedQuery = query.trim();

        if (trimmedQuery.length > 0) {
          const offset = (currentPage - 1) * PAGE_SIZE;
          const posts = await apiFetch<PostSummary[]>(
            `/posts/search?q=${encodeURIComponent(trimmedQuery)}&limit=${PAGE_SIZE}&offset=${offset}`,
          );

          if (cancelled) {
            return;
          }

          const inferredTotal = posts.length === PAGE_SIZE ? offset + posts.length + 1 : offset + posts.length;

          setData({
            posts,
            total: inferredTotal,
            page: currentPage,
            page_size: PAGE_SIZE,
          });
          return;
        }

        const response = await apiFetch<PostsPageResponse>(`/posts?page=${currentPage}&page_size=${PAGE_SIZE}`);

        if (!cancelled) {
          setData(response);
        }
      } catch {
        if (!cancelled) {
          setData({
            posts: [],
            total: 0,
            page: currentPage,
            page_size: PAGE_SIZE,
          });
          setError("Failed to load posts from server.");
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    }

    void loadPosts();

    return () => {
      cancelled = true;
    };
  }, [currentPage, query]);

  const totalPages = useMemo(() => {
    const safePageSize = data.page_size > 0 ? data.page_size : PAGE_SIZE;
    return Math.max(1, Math.ceil(data.total / safePageSize));
  }, [data.page_size, data.total]);

  if (isLoading) {
    return (
      <div className="screen-line-top screen-line-bottom p-4">
        <p className="font-mono text-sm text-muted-foreground">Loading posts...</p>
      </div>
    );
  }

  return (
    <>
      {error ? (
        <div className="screen-line-top screen-line-bottom p-4">
          <p className="font-mono text-sm text-destructive">{error}</p>
        </div>
      ) : null}
      <PostList posts={data.posts} />
      <PostsPagination currentPage={currentPage} totalPages={totalPages} query={query} />
    </>
  );
}
