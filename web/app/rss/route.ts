import { getBlogPosts } from "@/lib/mdx";
import { baseUrl } from "../sitemap";

export async function GET() {
  const allBlogs = await getBlogPosts();

  const itemsXml = allBlogs
    .sort((a, b) => {
      if (new Date(a.metadata.createdAt) > new Date(b.metadata.createdAt)) {
        return -1;
      }

      return 1;
    })
    .map(
      (post) => `<item>
  <title>${post.metadata.title}</title>
  <link>${baseUrl}/posts/${post.slug}</link>
  <description>${post.metadata.description || ""}</description>
  <pubDate>${new Date(post.metadata.createdAt).toUTCString()}</pubDate>
</item>`
    )
    .join("");

  const rssFeed = `<?xml version="1.0" encoding="UTF-8" ?>
<rss version="2.0">
<channel>
  <title>Arun Kumar's Blog</title>
  <link>${baseUrl}</link>
  <description>This is my blog's RSS feed</description>
  ${itemsXml}
</channel>
</rss>`;

  return new Response(rssFeed, {
    headers: {
      "Content-Type": "application/xml",
    },
  });
}
