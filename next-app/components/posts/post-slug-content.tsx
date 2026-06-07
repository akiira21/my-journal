import Link from "next/link";
import { cache } from "react";
import { compileMDX } from "next-mdx-remote/rsc";
import rehypeKatex from "rehype-katex";
import remarkMath from "remark-math";
import { Inter } from "next/font/google";
import { Calendar, Clock, ArrowLeft, Tag } from "lucide-react";

import { apiFetchServer } from "@/lib/api-server";
import { postMdxComponents } from "@/components/posts/post-mdx-components";
import { TableOfContent } from "@/components/posts/table-of-content";
import { SharePreviewSection } from "@/components/posts/share-preview-section";

const inter = Inter({
  variable: "--font-post-body",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});

type PostDetail = {
  id: string;
  slug: string;
  title: string;
  description?: string | null;
  cover_url?: string | null;
  content?: string | null;
  categories?: string[];
  tags?: string[];
  published_at?: string | null;
  read_time_minutes?: number | null;
};

type RelatedPost = {
  id: string;
  slug: string;
  title: string;
  description?: string | null;
  score: number;
};

type Section = {
  id: string;
  title: string;
};

type PostSlugContentProps = {
  slug: string;
};

function generateId(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-")
    .trim();
}

function extractSections(content: string): Section[] {
  const sections: Section[] = [];
  const headingRegex = /^(#{1,3})\s+(.+)$/gm;
  let match: RegExpExecArray | null;

  while ((match = headingRegex.exec(content)) !== null) {
    const title = match[2]?.trim();
    if (!title) {
      continue;
    }

    sections.push({ id: generateId(title), title });
  }

  return sections;
}

function formatDate(value?: string | null): string {
  if (!value) {
    return "Unpublished";
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "Unpublished";
  }

  return new Intl.DateTimeFormat("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  }).format(date);
}

const compileMdxCached = cache(async (source: string) => {
  return compileMDX({
    source,
    options: {
      parseFrontmatter: false,
      blockJS: false,
      mdxOptions: {
        remarkPlugins: [remarkMath],
        rehypePlugins: [rehypeKatex],
      },
    },
    components: postMdxComponents,
  });
});

export async function PostSlugContent({ slug }: PostSlugContentProps) {
  let post: PostDetail | null = null;
  let relatedPosts: RelatedPost[] = [];
  let loadError: string | null = null;

  try {
    const encodedSlug = encodeURIComponent(slug);
    const cacheTag = `post-${slug}`;

    const [postResult, relatedResult] = await Promise.allSettled([
      apiFetchServer<PostDetail>(`/posts/${encodedSlug}?content=true`, {
        next: { tags: [cacheTag, "posts"] },
      }),
      apiFetchServer<RelatedPost[]>(`/posts/${encodedSlug}/related?limit=5`, {
        next: { tags: [cacheTag, "posts-related"] },
      }),
    ]);

    if (postResult.status === "fulfilled") {
      post = postResult.value;
    } else {
      loadError =
        postResult.reason instanceof Error
          ? `Failed to load this post from server. ${postResult.reason.message}`
          : "Failed to load this post from server.";
    }

    if (relatedResult.status === "fulfilled") {
      // Deduplicate by slug (safety net in case backend returns duplicates)
      const seen = new Set<string>();
      relatedPosts = relatedResult.value.filter((r) => {
        if (seen.has(r.slug)) {
          return false;
        }
        seen.add(r.slug);
        return true;
      });
    }
  } catch (error) {
    if (error instanceof Error && error.message) {
      loadError = `Failed to load this post from server. ${error.message}`;
    } else {
      loadError = "Failed to load this post from server.";
    }
  }

  if (!post || !post.content) {
    return (
      <section className="mx-auto w-full max-w-3xl px-5 pt-12 pb-12">
        <div className="rounded-xl border border-line bg-muted/10 px-6 py-10 text-center">
          <h1 className="text-xl font-pixel tracking-tight text-foreground">Post not available</h1>
          <p className="mt-2 text-sm text-muted-foreground">{loadError ?? "Post content is missing."}</p>
          <Link
            href="/posts"
            className="mt-5 inline-flex items-center gap-1.5 rounded-lg border border-line bg-background px-4 py-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Back to posts
          </Link>
        </div>
      </section>
    );
  }

  const sections = extractSections(post.content);

  const { content } = await compileMdxCached(post.content);

  return (
    <>
      <article
        className={`${inter.variable} mx-auto w-full max-w-3xl`}
        style={{
          fontFamily: "var(--font-geist-sans), system-ui, sans-serif",
        } as React.CSSProperties}
      >
        {/* Minimal back link */}
        <div className="px-6 pt-6 pb-2">
          <Link
            href="/posts"
            className="group inline-flex items-center gap-1.5 text-[13px] text-muted-foreground/70 transition-colors hover:text-foreground"
          >
            <ArrowLeft className="h-3 w-3 transition-transform group-hover:-translate-x-0.5" />
            <span className="font-mono uppercase tracking-wider">All posts</span>
          </Link>
        </div>

        {/* Magazine Hero Header */}
        <header className="px-6 pb-7 pt-1">
          {/* Title — pixel font */}
          <h1
            className="text-balance text-[2rem] font-pixel leading-[1.1] tracking-tight text-foreground sm:text-[2.4rem]"
          >
            {post.title}
          </h1>

          {/* Subtitle / description */}
          {post.description && (
            <p className="mt-3.5 max-w-2xl text-sm leading-relaxed text-muted-foreground/80" style={{ fontFamily: "var(--font-geist-sans), system-ui, sans-serif" }}>
              {post.description}
            </p>
          )}

          {/* Academic-style metadata row */}
          <div className="mt-6 flex flex-wrap items-center gap-x-4 gap-y-2 border-t border-line pt-4 text-[13px] text-muted-foreground/70">
            <div className="flex items-center gap-1.5">
              <Calendar className="h-3.5 w-3.5" />
              <span className="font-mono">{formatDate(post.published_at)}</span>
            </div>
            <span className="hidden sm:block h-3 w-px bg-line" />
            <div className="flex items-center gap-1.5">
              <Clock className="h-3.5 w-3.5" />
              <span className="font-mono">{post.read_time_minutes ?? 1} min read</span>
            </div>
            {post.categories && post.categories.length > 0 && (
              <>
                <span className="hidden sm:block h-3 w-px bg-line" />
                <span className="inline-flex items-center rounded-md border border-line bg-muted/60 px-2 py-0.5 font-mono text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
                  {post.categories[0]}
                </span>
              </>
            )}
            {post.tags && post.tags.length > 0 && (
              <>
                <span className="hidden sm:block h-3 w-px bg-line" />
                <div className="flex items-center gap-2">
                  <Tag className="h-3 w-3 text-muted-foreground/40" />
                  {post.tags.map((tag, i) => (
                    <span key={tag} className="flex items-center gap-2">
                      <span className="font-mono text-[11px] text-muted-foreground/60">
                        {tag}
                      </span>
                      {i < (post.tags?.length ?? 0) - 1 && (
                        <span className="text-muted-foreground/20">·</span>
                      )}
                    </span>
                  ))}
                </div>
              </>
            )}
          </div>
        </header>

        {/* Content with magazine styling */}
        <div className="px-6 pb-12">
          <div className="drop-cap prose-magazine">{content}</div>
        </div>

        {/* Share Section */}
        <div className="px-6">
          <SharePreviewSection
            title={post.title}
            description={post.description}
            coverUrl={post.cover_url}
            slug={post.slug}
          />
        </div>

        {/* Related Posts — journal references style */}
        {relatedPosts.length > 0 && (
          <div className="mx-6 mb-8 border-t border-line pt-5">
            <h2
              className="mb-3 font-pixel text-[11px] font-semibold uppercase tracking-[0.15em] text-muted-foreground/60"
            >
              Related Reading
            </h2>
            <div className="flex flex-col gap-2">
              {relatedPosts.map((related) => (
                <Link
                  key={related.id}
                  href={`/posts/${related.slug}`}
                  className="group flex items-start gap-3 py-1.5 transition-colors"
                >
                  <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-primary/40 transition-colors group-hover:bg-primary" />
                  <div>
                    <span className="text-[13px] font-pixel text-foreground/85 transition-colors group-hover:text-foreground">
                      {related.title}
                    </span>
                    {related.description && (
                      <p className="mt-0.5 line-clamp-1 text-[11px] text-muted-foreground/60" style={{ fontFamily: "var(--font-geist-sans), system-ui, sans-serif" }}>
                        {related.description}
                      </p>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Bottom navigation */}
        <div className="mx-6 mb-10 border-t border-line pt-5">
          <Link
            href="/posts"
            className="group inline-flex items-center gap-2 text-[13px] text-muted-foreground/60 transition-colors hover:text-foreground"
          >
            <ArrowLeft className="h-3.5 w-3.5 transition-transform group-hover:-translate-x-0.5" />
            <span
              className="font-mono uppercase tracking-wider"
            >
              Back to all posts
            </span>
          </Link>
        </div>
      </article>

      <TableOfContent sections={sections} />
    </>
  );
}
