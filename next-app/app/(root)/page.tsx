import { AboutSection } from "@/components/home/about-section";
import { AppleHelloEnglishEffect } from "@/components/apple-hello-effect/apple-hello-effect";
import { GitHubContributions } from "@/components/home/github-contributions";
import { Overview } from "@/components/home/overview";
import { ProfileHeader } from "@/components/home/profile-header";
import { SocialLinks } from "@/components/home/social-links";
import { TechStack } from "@/components/home/tech-stack";

export default function Home() {
  return (
    <section className="mx-auto w-full max-w-3xl space-y-0 pt-0 pb-0">
      <div className="screen-line-top screen-line-bottom border-x border-line px-4 py-12">
        <AppleHelloEnglishEffect className="h-18 w-full text-foreground" speed={1.1} />
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
