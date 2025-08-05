import { TypographyH2, TypographyH3 } from "@/custom_components/typography";
import LatestPosts from "./_components/latest-posts";
import { getBlogPosts } from "@/lib/mdx";
import {
  GradientButton,
  SimpleButton,
} from "@/custom_components/buttons/buttons";
import Link from "next/link";
import { PORTFOLIO } from "@/personal-links";
import { MoveUpRight } from "lucide-react";
import DsaPosts from "./_components/dsa-posts";
import FeaturedPosts from "./_components/featured-posts";
import EulerPosts from "./_components/euler-posts";

export default function HomePage() {
  const posts = getBlogPosts();
  const featuredPosts = posts.filter((post) => post.metadata.featured)

  const dsaPosts = posts.filter((post, i) => post.metadata.isDsaBlog);
  const eulerPosts = posts.filter(post => post.metadata.tag == "Euler")

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
        <GradientButton>
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
        </GradientButton>
 
        <div className="mt-12 max-w-xl">
          <FeaturedPosts featuredPosts={featuredPosts} />
        </div>


        <div className="mt-12 max-w-xl">
          <LatestPosts latestPosts={posts.splice(0, 3)} />
        </div>


        {eulerPosts.length > 0 &&
        <div className="mt-12 max-w-xl">
          <EulerPosts eulerPosts={eulerPosts.splice(0, 10)}/>
        </div>}

        {dsaPosts.length > 0 &&  <div className="mt-12 max-w-xl">
          <DsaPosts dsaPosts={dsaPosts.splice(0, 10)} />
        </div>}
      </div>
    </div>
  );
}
