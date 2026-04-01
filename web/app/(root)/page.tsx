import { TypographyH2 } from "@/custom_components/typography";
import FeaturedPosts from "./_components/featured-posts";
import { getBlogPosts } from "@/lib/mdx";
import LatestPosts from "./_components/latest-posts";
import AsymmetricGaussianPlot from "./_components/gaussian-sketch";

export default async function HomePage() {
  const posts = await getBlogPosts();

  const featuredPosts = posts.filter((post) => post.metadata.featured);
  const latestPosts = [...posts].slice(0, 3);

  return (
    <>
      <AsymmetricGaussianPlot />

      <div>
        <TypographyH2 className="italic">Arun Kumar&apos;s Journal</TypographyH2>
        <p className="italic mt-2">A journal of things I learn and build.</p>
        <p>It covers topics like math, computer science, and machine learning.</p>
      </div>

      <div className="max-w-xl mb-32">
        <div className="my-12">
          {featuredPosts.length > 0 && (
            <FeaturedPosts featuredPosts={featuredPosts} />
          )}
        </div>

        <div className="my-12">
          <LatestPosts latestPosts={latestPosts} />
        </div>
      </div>
    </>
  );
}
