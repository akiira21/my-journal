import { AboutSection } from "@/components/home/about-section";
import { ParabolaHat } from "@/components/parabola-hat";
import { GitHubContributions } from "@/components/home/github-contributions";
import { Overview } from "@/components/home/overview";
import { ProfileHeader } from "@/components/home/profile-header";
import { SocialLinks } from "@/components/home/social-links";
import { TechStack } from "@/components/home/tech-stack";

export default function Home() {
  return (
    <section className="mx-auto w-full max-w-3xl space-y-0 pt-0 pb-0">
      <div className="screen-line-top screen-line-bottom border-x border-line px-4 py-8 sm:py-12">
        <ParabolaHat className="text-foreground" />
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
