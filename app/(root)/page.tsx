import { GradientButton } from "@/custom_components/buttons/buttons";
import { TypographyH2 } from "@/custom_components/typography";
import { MoveUpRight } from "lucide-react";
import Link from "next/link";
import LatestPosts from "./_components/latest-posts";
import { PORTFOLIO } from "@/personal-links";

export default function HomePage() {
  return (
    <div className="pt-[15vh] max-w-3xl mx-auto px-4">
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

      <div className="my-4">
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
          <LatestPosts />
        </div>
      </div>
    </div>
  );
}
