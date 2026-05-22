import type { Metadata } from "next";

import { apiFetchServer } from "@/lib/api-server";
import { PostSlugContent } from "@/components/posts/post-slug-content";

export const revalidate = 3600;

type PostSlug = {
  slug: string;
};

type PostSummary = {
  slug: string;
  title: string;
};

export async function generateStaticParams() {
  try {
    const posts = await apiFetchServer<PostSummary[]>("/posts?page=1&page_size=100", {
      next: { tags: ["posts"] },
    });
    return posts.map((post) => ({ slug: post.slug }));
  } catch {
    return [];
  }
}

export async function generateMetadata(
  props: { params: Promise<{ slug: string }> },
): Promise<Metadata> {
  const params = await props.params;

  try {
    const encodedSlug = encodeURIComponent(params.slug);
    const post = await apiFetchServer<{ title: string }>(`/posts/${encodedSlug}`, {
      next: { tags: [`post-${params.slug}`] },
    });

    return {
      title: post.title,
      alternates: {
        canonical: `/posts/${params.slug}`,
      },
    };
  } catch {
    return {
      title: params.slug.replace(/-/g, " "),
      alternates: {
        canonical: `/posts/${params.slug}`,
      },
    };
  }
}

export default async function PostPage(props: { params: Promise<{ slug: string }> }) {
  const params = await props.params;
  return <PostSlugContent slug={params.slug} />;
}
