import { AboutSection } from "@/components/home/about-section";
import { PixelSphereRaster } from "@/components/pixel-sphere-raster";
import { GitHubContributions } from "@/components/home/github-contributions";
import { Overview } from "@/components/home/overview";
import { ProfileHeader } from "@/components/home/profile-header";
import { SocialLinks } from "@/components/home/social-links";
import { TechStack } from "@/components/home/tech-stack";

export default function Home() {
  return (
    <section className="mx-auto w-full max-w-3xl space-y-0 pt-0 pb-0">
      <div className="screen-line-top screen-line-bottom border-x border-line px-4 py-8 sm:py-12">
        <div className="relative">
          {/* Scribble text with arrow pointing to cube */}
          <svg
            className="absolute -top-10 left-0 h-32 w-64 text-foreground sm:left-4"
            viewBox="0 0 260 120"
            fill="none"
          >
            {/* Arrow from end of text toward cube */}
            <path
              d="M175 42 C 200 44, 220 50, 245 65"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              fill="none"
              opacity="0.55"
              strokeDasharray="3 2"
            />
            <path
              d="M238 60 L 245 65 L 237 70"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              fill="none"
              opacity="0.55"
            />
            {/* Text rotated slightly like handwritten */}
            <text
              x="10"
              y="38"
              fill="currentColor"
              fontSize="16"
              fontFamily="var(--font-geist-pixel-circle, monospace)"
              opacity="0.9"
              transform="rotate(-4, 10, 38)"
            >
              Math, not pixels
            </text>
          </svg>
          <PixelSphereRaster className="text-foreground" />
        </div>
      </div>

      <ProfileHeader />
      <Overview />
      <SocialLinks />
      <GitHubContributions />
      <TechStack />
      <AboutSection />
    </section>
  );
}
