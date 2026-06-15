import { AboutSection } from "@/components/home/about-section";
import { ChangelogSection } from "@/components/home/changelog-section";
import { ContactSection } from "@/components/home/contact-section";
import { GitHubContributions } from "@/components/home/github-contributions";
import { LatestPostsSection } from "@/components/home/latest-posts-section";
import { Overview } from "@/components/home/overview";
import { PixelSphereRaster } from "@/components/pixel-sphere-raster";
import { ProfileHeader } from "@/components/home/profile-header";
import { Separator } from "@/components/home/separator";
import { SocialLinks } from "@/components/home/social-links";
import { TechStack } from "@/components/home/tech-stack";

export default function Home() {
  return (
    <section className="mx-auto w-full max-w-3xl space-y-0 pt-0 pb-0 border-x border-lines">
      <div className="screen-line-top screen-line-bottom border-x border-line px-4 py-8 sm:py-12">
        <div className="relative">
          <PixelSphereRaster className="text-foreground" />
        </div>
      </div>

      <ProfileHeader />
      <Overview />
      <SocialLinks />
      <Separator />
      <div style={{ contentVisibility: "auto", containIntrinsicSize: "auto 500px" }}>
        <LatestPostsSection />
      </div>
      <Separator />
      <div style={{ contentVisibility: "auto", containIntrinsicSize: "auto 400px" }}>
        <GitHubContributions />
      </div>
      <Separator />
      <div style={{ contentVisibility: "auto", containIntrinsicSize: "auto 300px" }}>
        <TechStack />
      </div>
      <Separator />
      <div style={{ contentVisibility: "auto", containIntrinsicSize: "auto 400px" }}>
        <AboutSection />
      </div>
      <Separator />
      <div style={{ contentVisibility: "auto", containIntrinsicSize: "auto 300px" }}>
        <ContactSection />
      </div>
      <Separator />
      <div style={{ contentVisibility: "auto", containIntrinsicSize: "auto 400px" }}>
        <ChangelogSection />
      </div>
    </section>
  );
}
