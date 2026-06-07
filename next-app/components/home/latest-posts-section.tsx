import Link from "next/link";

import { Panel, PanelContent, PanelHeader, PanelTitle } from "@/components/home/panel";
import { apiFetchServer } from "@/lib/api-server";
import type { PostsPageResponse } from "@/lib/blog-types";

function formatDate(value: string | null): string {
  if (!value) return "Unpublished";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Unpublished";
  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date);
}

export async function LatestPostsSection() {
  let posts: PostsPageResponse["posts"] = [];

  try {
    const data = await apiFetchServer<PostsPageResponse>("/posts?page=1&page_size=4", {
      next: { revalidate: 3600, tags: ["posts-list"] },
    });
    posts = data.posts ?? [];
  } catch {
    // If the backend is unreachable, render an empty state
    posts = [];
  }

  if (posts.length === 0) {
    return null;
  }

  return (
    <Panel>
      <PanelHeader className="flex items-center justify-between">
        <PanelTitle>Latest Posts</PanelTitle>
        <Link
          href="/posts"
          className="font-mono text-xs text-muted-foreground transition-colors hover:text-foreground"
        >
          View all →
        </Link>
      </PanelHeader>

      <PanelContent className="p-0">
        <div className="divide-y divide-line">
          {posts.map((post) => (
            <Link
              key={post.id}
              href={`/posts/${post.slug}`}
              className="group flex items-start justify-between gap-4 border-line p-4 transition-colors hover:bg-accent/35 sm:items-center"
            >
              <div className="flex flex-col gap-1">
                <h3 className="line-clamp-2 text-sm leading-snug font-pixel transition-colors group-hover:text-foreground sm:text-base">
                  {post.title}
                </h3>
                <div className="flex flex-wrap items-center gap-2 font-mono text-xs text-muted-foreground">
                  <time dateTime={post.published_at ?? undefined}>
                    {formatDate(post.published_at)}
                  </time>
                  <span className="text-foreground/30">•</span>
                  <span>{post.read_time_minutes ?? 1} min read</span>
                  {post.categories.length > 0 && (
                    <>
                      <span className="text-foreground/30">•</span>
                      <span className="truncate">{post.categories.join(", ")}</span>
                    </>
                  )}
                </div>
              </div>

              <span className="shrink-0 text-muted-foreground transition-colors group-hover:text-foreground">
                →
              </span>
            </Link>
          ))}
        </div>
      </PanelContent>
    </Panel>
  );
}
