import { TypographyH2 } from "@/custom_components/typography";
import FeaturedPosts from "./_components/featured-posts";
import { getBlogPosts } from "@/lib/mdx";
import LatestPosts from "./_components/latest-posts";
import { cn } from "@/lib/utils";

export default async function HomePage() {
  const posts = await getBlogPosts();

  const featuredPosts = posts.filter((post) => post.metadata.featured);
  const latestPosts = [...posts].slice(0, 3);

  return (
    <div className="mt-2 *:[[id]]:scroll-mt-20">
      <section className="screen-line-top screen-line-bottom border-x border-line">
        <div className="px-4 py-6 sm:px-6">
          <p className="font-mono text-xs uppercase tracking-[0.22em] text-muted-foreground">
            Personal Journal
          </p>
          <TypographyH2 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">
            Arun Kumar&apos;s Journal
          </TypographyH2>
          <p className="mt-3 max-w-2xl text-sm leading-7 text-muted-foreground sm:text-base">
            A concise stream of what I learn and build across mathematics,
            systems, and machine learning.
          </p>
        </div>
      </section>

      <SectionDivider />

      <div className="space-y-0">
        {featuredPosts.length > 0 && <FeaturedPosts featuredPosts={featuredPosts} />}
        <SectionDivider className="h-6" />
        <LatestPosts latestPosts={latestPosts} />
      </div>
    </div>
  );
}

function SectionDivider({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "relative flex h-8 w-full border-x border-line",
        "before:absolute before:-left-[100vw] before:-z-10 before:h-8 before:w-[200vw]",
        "before:bg-[repeating-linear-gradient(315deg,var(--pattern-foreground)_0,var(--pattern-foreground)_1px,transparent_0,transparent_50%)] before:bg-[size:10px_10px] before:[--pattern-foreground:hsl(var(--line))]",
        className
      )}
    />
  );
}
