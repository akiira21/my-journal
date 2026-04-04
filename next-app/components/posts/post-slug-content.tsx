import Link from "next/link";
import { compileMDX } from "next-mdx-remote/rsc";
import rehypeKatex from "rehype-katex";
import remarkMath from "remark-math";

import { apiFetch } from "@/lib/api";
import { postMdxComponents } from "@/components/posts/post-mdx-components";
import { TableOfContent } from "@/components/posts/table-of-content";

type PostDetail = {
  id: string;
  slug: string;
  title: string;
  description?: string | null;
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

  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(date);
}

export async function PostSlugContent({ slug }: PostSlugContentProps) {
  let post: PostDetail | null = null;
  let relatedPosts: RelatedPost[] = [];
  let loadError: string | null = null;

  try {
    const encodedSlug = encodeURIComponent(slug);
    post = await apiFetch<PostDetail>(`/posts/${encodedSlug}?content=true`);
    relatedPosts = await apiFetch<RelatedPost[]>(`/posts/${encodedSlug}/related?limit=5`).catch(() => []);
  } catch (error) {
    if (error instanceof Error && error.message) {
      loadError = `Failed to load this post from server. ${error.message}`;
    } else {
      loadError = "Failed to load this post from server.";
    }
  }

  if (!post || !post.content) {
    return (
      <section className="mx-auto w-full max-w-3xl pt-0 pb-0">
        <div className="screen-line-top screen-line-bottom border-x border-y border-line px-4 py-4">
          <h1 className="text-xl font-semibold tracking-tight">Post not available</h1>
        </div>

        <div className="screen-line-bottom border-x border-b border-line px-4 py-4">
          <p className="font-mono text-sm text-destructive">{loadError ?? "Post content is missing."}</p>
          <Link
            href="/posts"
            className="mt-3 inline-block border border-line px-3 py-1 font-mono text-xs uppercase text-muted-foreground hover:text-foreground"
          >
            Back to posts
          </Link>
        </div>
      </section>
    );
  }

  const sections = extractSections(post.content);

  const { content } = await compileMDX({
    source: post.content,
    options: {
      parseFrontmatter: false,
      mdxOptions: {
        remarkPlugins: [remarkMath],
        rehypePlugins: [rehypeKatex],
      },
    },
    components: postMdxComponents,
  });

  return (
    <>
      <TableOfContent sections={sections} />
      <section className="mx-auto w-full max-w-3xl pt-0 pb-0">
        <div className="screen-line-top screen-line-bottom border-x border-y border-line px-4 py-4">
          <h1 className="text-3xl leading-tight font-semibold tracking-tight text-balance">{post.title}</h1>
        </div>

        <div className="screen-line-bottom border-x border-b border-line px-4 py-3">
          <div className="flex flex-wrap items-center gap-2 font-mono text-xs text-muted-foreground">
            <span>{formatDate(post.published_at)}</span>
            <span className="text-foreground/30">•</span>
            <span>{post.read_time_minutes ?? 1} min read</span>
          </div>
        </div>

        {post.tags && post.tags.length > 0 ? (
          <div className="screen-line-bottom border-x border-b border-line px-4 py-3">
            <div className="flex flex-wrap gap-2">
              {post.tags.map((tag) => (
                <span key={tag} className="border border-line px-2 py-0.5 font-mono text-[10px] uppercase text-muted-foreground">
                  {tag}
                </span>
              ))}
            </div>
          </div>
        ) : null}

        <article className="border-x border-line px-4 py-6">{content}</article>

        {relatedPosts.length > 0 ? (
          <div className="screen-line-top border-x border-b border-line px-4 py-4">
            <h2 className="mb-3 font-mono text-xs uppercase tracking-wider text-muted-foreground">Related Posts</h2>
            <div className="flex flex-wrap gap-2">
              {relatedPosts.map((related) => (
                <Link
                  key={related.id}
                  href={`/posts/${related.slug}`}
                  className="inline-flex items-center border border-line px-2.5 py-1 font-mono text-[11px] uppercase tracking-wide text-muted-foreground transition-colors hover:bg-accent/40 hover:text-foreground"
                >
                  {related.title}
                </Link>
              ))}
            </div>
          </div>
        ) : null}
      </section>
    </>
  );
}
