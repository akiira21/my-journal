import { TypographyH4 } from "@/custom_components/typography";
import BlogCard from "./blog-card";
import { postType } from "@/types";
import { formatDate } from "@/lib/utils";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Panel, PanelContent, PanelHeader, PanelTitle } from "./panel";

export default function LatestPosts({
  latestPosts,
}: {
  latestPosts: postType[];
}) {
  return (
    <Panel id="latest-posts" className="border-t-0">
      <PanelHeader className="flex w-full items-center justify-between gap-3">
        <div>
          <TypographyH4 className="font-mono text-[11px] font-medium uppercase tracking-[0.22em] text-muted-foreground">
            Recent
          </TypographyH4>
          <PanelTitle className="mt-1">
            Latest Posts
            <span className="ml-2 align-middle text-sm font-medium text-muted-foreground">
              ({latestPosts.length})
            </span>
          </PanelTitle>
        </div>

        <Button
          asChild
          variant="ghost"
          size="sm"
          className="rounded-none border border-line px-3 text-xs font-medium uppercase tracking-[0.12em]"
        >
          <Link href="/posts">View all</Link>
        </Button>
      </PanelHeader>

      <PanelContent className="relative py-4">
        <div className="pointer-events-none absolute inset-0 -z-10 hidden grid-cols-2 gap-4 sm:grid">
          <div className="border-r border-line" />
          <div className="border-l border-line" />
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
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
      </PanelContent>
    </Panel>
  );
}
