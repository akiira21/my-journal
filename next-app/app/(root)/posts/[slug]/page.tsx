import type { Metadata } from "next";

import { PostSlugContent } from "@/components/posts/post-slug-content";

export const dynamic = "force-dynamic";

export async function generateMetadata(
  props: { params: Promise<{ slug: string }> },
): Promise<Metadata> {
  const params = await props.params;

  return {
    title: params.slug.replace(/-/g, " "),
    alternates: {
      canonical: `/posts/${params.slug}`,
    },
  };
}

export default async function PostPage(props: { params: Promise<{ slug: string }> }) {
  const params = await props.params;
  return <PostSlugContent slug={params.slug} />;
}
