import { apiFetch } from "@/lib/api";
import type { PostsPageResponse } from "@/lib/blog-types";

const baseUrl = process.env.NEXT_PUBLIC_APP_URL

export async function GET() {
  try {
    const response = await apiFetch<PostsPageResponse>("/posts?page=1&page_size=100");
    const posts = response.posts || [];

    const itemsXml = posts
      .sort((a, b) => {
        const dateA = new Date(a.published_at || 0).getTime();
        const dateB = new Date(b.published_at || 0).getTime();
        return dateB - dateA;
      })
      .map(
        (post) => `<item>
  <title>${escapeXml(post.title)}</title>
  <link>${baseUrl}/posts/${post.slug}</link>
  <description>${escapeXml(post.description || "")}</description>
  <pubDate>${new Date(post.published_at || Date.now()).toUTCString()}</pubDate>
  <guid>${baseUrl}/posts/${post.slug}</guid>
</item>`
      )
      .join("");

    const rssFeed = `<?xml version="1.0" encoding="UTF-8" ?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
<channel>
  <title>Arun Kumar's Blog</title>
  <link>${baseUrl}</link>
  <description>Thoughts, stories, and reflections from a wandering mind.</description>
  <language>en</language>
  <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
  <atom:link href="${baseUrl}/rss" rel="self" type="application/rss+xml"/>
  ${itemsXml}
</channel>
</rss>`;

    return new Response(rssFeed, {
      headers: {
        "Content-Type": "application/xml",
        "Cache-Control": "public, max-age=3600",
      },
    });
  } catch (error) {
    return new Response(
      `<?xml version="1.0" encoding="UTF-8" ?>
<rss version="2.0">
<channel>
  <title>Arun Kumar's Blog</title>
  <link>${baseUrl}</link>
  <description>Error loading RSS feed</description>
</channel>
</rss>`,
      {
        headers: {
          "Content-Type": "application/xml",
        },
      }
    );
  }
}

function escapeXml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}
