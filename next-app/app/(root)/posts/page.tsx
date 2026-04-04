import type { Metadata } from "next";
import { Suspense } from "react";

import { PostList } from "@/components/posts/post-list";
import { PostsPagination } from "@/components/posts/posts-pagination";
import { PostSearchInput } from "@/components/posts/post-search-input";
import { apiFetch } from "@/lib/api";
import type { PostSummary, PostsPageResponse } from "@/lib/blog-types";

const title = "Posts";
const description = "Writing about engineering, systems, and practical AI experiments.";

export const metadata: Metadata = {
  title,
  description,
  alternates: {
    canonical: "/posts",
  },
};

type SearchParams = Promise<{
  page?: string;
  q?: string;
}>;

const PAGE_SIZE = 20;

async function getPosts(page: number, q: string): Promise<PostsPageResponse> {
  const query = q.trim();
  if (query.length > 0) {
    const offset = (page - 1) * PAGE_SIZE;
    const posts = await apiFetch<PostSummary[]>(
      `/posts/search?q=${encodeURIComponent(query)}&limit=${PAGE_SIZE}&offset=${offset}`,
    );

    const inferredTotal = posts.length === PAGE_SIZE ? offset + posts.length + 1 : offset + posts.length;

    return {
      posts,
      total: inferredTotal,
      page,
      page_size: PAGE_SIZE,
    };
  }

  return apiFetch<PostsPageResponse>(`/posts?page=${page}&page_size=${PAGE_SIZE}`);
}

export default async function PostsPage(props: { searchParams: SearchParams }) {
  const searchParams = await props.searchParams;
  const requestedPage = Number(searchParams.page ?? "1");
  const currentPage = Number.isFinite(requestedPage) && requestedPage > 0 ? requestedPage : 1;
  const query = (searchParams.q ?? "").trim();

  let data: PostsPageResponse;
  try {
    data = await getPosts(currentPage, query);
  } catch {
    data = {
      posts: [],
      total: 0,
      page: currentPage,
      page_size: PAGE_SIZE,
    };
  }

  const safePageSize = data.page_size > 0 ? data.page_size : PAGE_SIZE;
  const totalPages = Math.max(1, Math.ceil(data.total / safePageSize));

  return (
    <section className="mx-auto w-full max-w-3xl space-y-0 pt-0 pb-0">
      <div className="screen-line-top screen-line-bottom border-x border-y border-line px-4 py-4">
        <h1 className="text-3xl leading-none font-semibold tracking-tight">{title}</h1>
      </div>

      <div className="screen-line-bottom border-x border-b border-line px-4 py-4">
        <p className="font-mono text-sm text-muted-foreground">{description}</p>
      </div>

      <div className="screen-line-top screen-line-bottom border-x border-b border-line px-2">
        <Suspense fallback={<div className="h-10" />}>
          <PostSearchInput />
        </Suspense>
      </div>

      <div className="border-x border-line px-2 pb-2 ">
        <PostList posts={data.posts} />
        <PostsPagination currentPage={currentPage} totalPages={totalPages} query={query} />
      </div>
    </section>
  );
}
