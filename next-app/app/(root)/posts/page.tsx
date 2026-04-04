import type { Metadata } from "next";
import { Suspense } from "react";

import { PostsPageContent } from "@/components/posts/post-list";
import { PostSearchInput } from "@/components/posts/post-search-input";

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

export default async function PostsPage(props: { searchParams: SearchParams }) {
  const searchParams = await props.searchParams;
  const requestedPage = Number(searchParams.page ?? "1");
  const currentPage = Number.isFinite(requestedPage) && requestedPage > 0 ? requestedPage : 1;
  const query = (searchParams.q ?? "").trim();

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
        <PostsPageContent currentPage={currentPage} query={query} />
      </div>
    </section>
  );
}
