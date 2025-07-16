import { TypographyH2, TypographyH3 } from "@/custom_components/typography";
import LatestPosts from "./_components/latest-posts";
import CategoriesSection from "./_components/categories-section";
import { getBlogPosts } from "@/lib/mdx";

export default function HomePage() {
  const posts = getBlogPosts();

  return (
    <div className="pt-[15vh] max-w-3xl mx-auto md:px-4">
      <div>
        <TypographyH2 className="leading-normal font-medium inline">
          Hi 👋🏻 I&apos;m Arun Kumar, and this is my blog.
        </TypographyH2>
        <TypographyH2 className="leading-normal inline">
          {" "}
          I&apos;m passionate about sharing my knowledge and learning in
          Mathematics, Machine Learning, React, and sometimes other topics that
          inspire me.
        </TypographyH2>
      </div>

      <div className="my-8">
        {/* <GradientButton>
          <Link
            href={PORTFOLIO}
            target="_blank"
            className="flex gap-x-2 items-center group"
          >
            About me
            <MoveUpRight
              size={12}
              className="group-hover:rotate-45 transition-all duration-500"
            />
          </Link>
        </GradientButton> */}
        <div className="mt-12 max-w-xl">
          <LatestPosts latestPosts={posts.splice(0, 10)} />
        </div>
      </div>

      {/* <div className="mt-12">
        <TypographyH3 className="mb-4">Categories</TypographyH3>
        <CategoriesSection />
      </div> */}
    </div>
  );
}
