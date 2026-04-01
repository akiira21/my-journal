import { compileMDX } from "next-mdx-remote/rsc";
import rehypeKatex from "rehype-katex";
import { mdxComponents } from "./mdx-components";
import { remarkMeta } from "./remark-meta";
import remarkMath from "remark-math";
import { postType } from "@/types";

type ApiPostSummary = {
  id: string;
  slug: string;
  title: string;
  description?: string | null;
  categories?: string[];
  tags?: string[];
  featured?: boolean;
  view_count?: number;
  read_time_minutes?: number | null;
  published_at?: string | null;
};

type ApiPost = ApiPostSummary & {
  content?: string;
  content_url?: string;
  created_at?: string;
  updated_at?: string;
};

type ApiListResponse = {
  posts: ApiPostSummary[];
  total: number;
  page: number;
  page_size: number;
};

export type ApiRelatedPost = {
  id: string;
  slug: string;
  title: string;
  description?: string | null;
  score: number;
};

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || process.env.API_URL || "http://localhost:8080";

async function fetchFromAPI<T>(path: string): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    next: { revalidate: 60 },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch ${path}: ${response.status}`);
  }

  return (await response.json()) as T;
}

function mapApiPostToPostType(post: ApiPostSummary): postType {
  const createdAt = post.published_at || new Date().toISOString();

  return {
    slug: post.slug,
    content: "",
    metadata: {
      id: post.id,
      slug: post.slug,
      title: post.title,
      description: post.description || "",
      categories: post.categories || [],
      tags: post.tags || [],
      tag: post.tags?.[0] || "",
      featured: post.featured || false,
      viewCount: post.view_count || 0,
      readTimeMinutes: post.read_time_minutes || null,
      createdAt,
      updatedAt: createdAt,
    },
  };
}

export async function getBlogPosts(pageSize = 100) {
  try {
    const response = await fetchFromAPI<ApiListResponse>(
      `/api/v1/posts?page=1&page_size=${pageSize}`
    );
    return response.posts.map(mapApiPostToPostType);
  } catch {
    return [];
  }
}

export async function getPostBySlug(slug: string) {
  try {
    const post = await fetchFromAPI<ApiPost>(`/api/v1/posts/${slug}?content=true`);
    if (!post.content) {
      return null;
    }

    const { content: mdxContent } = await compileMDX({
      source: post.content,
      options: {
        parseFrontmatter: true,
        mdxOptions: {
          remarkPlugins: [remarkMath],
          rehypePlugins: [remarkMeta, rehypeKatex],
        },
      },
      // @ts-ignore
      components: {
        ...mdxComponents,
      },
    });

    const createdAt = post.published_at || post.created_at || new Date().toISOString();
    const updatedAt = post.updated_at || createdAt;

    return {
      metadata: {
        id: post.id,
        slug: post.slug,
        title: post.title,
        description: post.description || "",
        categories: post.categories || [],
        tags: post.tags || [],
        featured: post.featured || false,
        viewCount: post.view_count || 0,
        readTimeMinutes: post.read_time_minutes || null,
        createdAt,
        updatedAt,
      },
      content: mdxContent,
      readTime: post.read_time_minutes || calculateReadingTime(post.content),
      sections: extractMDXSections(post.content),
    };
  } catch {
    return null;
  }
}

export async function getCategories() {
  const posts = await getBlogPosts();
  const categories = new Set<string>();

  posts.forEach((post) => {
    (post.metadata.categories || []).forEach((category: string) => {
      categories.add(category);
    });
  });

  return Array.from(categories).sort((a, b) => a.localeCompare(b));
}

export async function getPostsByCategory(category: string) {
  try {
    const posts = await fetchFromAPI<ApiPostSummary[]>(
      `/api/v1/posts/category/${encodeURIComponent(category)}?page=1&page_size=100`
    );

    return posts.map(mapApiPostToPostType);
  } catch {
    return [];
  }
}

export async function getRelatedPosts(slug: string, limit = 5) {
  try {
    return await fetchFromAPI<ApiRelatedPost[]>(
      `/api/v1/posts/${encodeURIComponent(slug)}/related?limit=${limit}`
    );
  } catch {
    return [];
  }
}

export function calculateReadingTime(content: string) {
  const wordsPerMinute = 100;
  const textLength = content.split(" ").length;

  return Math.ceil(textLength / wordsPerMinute);
}

export function extractMDXSections(content: string) {
  const patterns = {
    markdownHeading: /^(#{1,6})\s+(.+)$/gm,
    jsxSection: /<Section[^>]*>[\s\S]*?<\/Section>/g,
    htmlHeading: /<h[1-6][^>]*>(.*?)<\/h[1-6]>/g,
    customHeading: /<Heading[^>]*>(.*?)<\/Heading>/g,
  };

  const sections = [] as any[];

  const generateId = (text: string) => {
    return text
      .toLowerCase()
      .replace(/[^\w\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-")
      .trim();
  };

  let match;
  while ((match = patterns.markdownHeading.exec(content)) !== null) {
    const [, level, title] = match;
    sections.push({
      type: "markdown",
      level: level.length,
      title: title.trim(),
      id: generateId(title),
      position: match.index,
    });
  }

  while ((match = patterns.jsxSection.exec(content)) !== null) {
    const section = match[0];
    const idMatch = section.match(/id=["']([^"']+)["']/);
    const titleMatch = section.match(/title=["']([^"']+)["']/);

    sections.push({
      type: "jsx",
      title: titleMatch ? titleMatch[1] : null,
      id: idMatch ? idMatch[1] : generateId(titleMatch ? titleMatch[1] : ""),
      position: match.index,
      rawContent: section,
    });
  }

  while ((match = patterns.htmlHeading.exec(content)) !== null) {
    const title = match[1].replace(/<[^>]+>/g, "").trim();
    sections.push({
      type: "html",
      title,
      id: generateId(title),
      position: match.index,
    });
  }

  while ((match = patterns.customHeading.exec(content)) !== null) {
    const heading = match[0];
    const idMatch = heading.match(/id=["']([^"']+)["']/);
    const titleMatch = heading.match(/title=["']([^"']+)["']/);

    sections.push({
      type: "custom",
      title: titleMatch ? titleMatch[1] : match[1],
      id: idMatch
        ? idMatch[1]
        : generateId(titleMatch ? titleMatch[1] : match[1]),
      position: match.index,
    });
  }

  sections.sort((a, b) => a.position - b.position);

  return sections;
}

