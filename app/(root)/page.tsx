import { GradientButton } from "@/custom_components/buttons/buttons";
import { TypographyH2 } from "@/custom_components/typography";
import { MoveUpRight } from "lucide-react";
import Link from "next/link";

export default function HomePage() {
  return (
    <div className="pt-[15vh]">
      <div>
        <TypographyH2 className="leading-normal font-medium inline">
          Hi 👋🏻 I'm Arun Kumar, and this is my journal.
        </TypographyH2>{" "}
        <TypographyH2 className="leading-normal inline">
          I'm passionate about sharing my knowledge and learning in Mathematics,
          Machine Learning, React, and sometimes other topics that inspire me.
        </TypographyH2>
      </div>

      <div className="my-4">
        <GradientButton>
          <Link
            href="https://arun-kumar.vercel.app/"
            target="_blank"
            className="flex gap-x-2 items-center"
          >
            About me
            <MoveUpRight size={12} />
          </Link>
        </GradientButton>
      </div>
    </div>
  );
}
