import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { compileMDX } from "next-mdx-remote/rsc";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";

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

function extractSections(content: string): Section[] {
  const sections: Section[] = [];
  
  // Match markdown headings (## Heading)
  const headingRegex = /^(#{1,6})\s+(.+)$/gm;
  let match;
  
  while ((match = headingRegex.exec(content)) !== null) {
    const level = match[1].length;
    const title = match[2].trim();
    
    // Only include h2 and h3 for TOC
    if (level <= 3) {
      const id = title
        .toLowerCase()
        .replace(/[^\w\s-]/g, "")
        .replace(/\s+/g, "-");
      
      sections.push({ id, title });
    }
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

async function getPostBySlug(slug: string): Promise<PostDetail | null> {
  try {
    return await apiFetch<PostDetail>(`/posts/${encodeURIComponent(slug)}?content=true`);
  } catch {
    return null;
  }
}

async function getRelatedPosts(slug: string): Promise<RelatedPost[]> {
  try {
    return await apiFetch<RelatedPost[]>(`/posts/${encodeURIComponent(slug)}/related?limit=5`);
  } catch {
    return [];
  }
}

export async function generateMetadata(
  props: { params: Promise<{ slug: string }> },
): Promise<Metadata> {
  const params = await props.params;
  const post = await getPostBySlug(params.slug);

  if (!post) {
    return {
      title: "Post Not Found",
    };
  }

  return {
    title: post.title,
    description: post.description ?? "",
    alternates: {
      canonical: `/posts/${post.slug}`,
    },
  };
}

export default async function PostPage(props: { params: Promise<{ slug: string }> }) {
  const params = await props.params;
  const post = await getPostBySlug(params.slug);

  if (!post || !post.content) {
    notFound();
  }

  const relatedPosts = await getRelatedPosts(post.slug);
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
