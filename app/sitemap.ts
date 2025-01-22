import { POSTS } from "@/lib/constants";
import { getBlogPosts } from "@/lib/mdx";

export const baseUrl = "https://www.blog.arun.space";

export default async function sitemap() {
  const blogs = getBlogPosts().map((post) => ({
    url: `${baseUrl}/posts/${post.slug}`,
    lastModified: post.metadata.createdAt,
  }));

  const routes = POSTS.map((post) => ({
    url: `${baseUrl}/${post.href}`,
    lastModified: new Date().toISOString().split("T")[0],
  }));

  return [...blogs, ...routes];
}
