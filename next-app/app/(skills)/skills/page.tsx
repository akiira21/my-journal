import type { Metadata } from "next";
import { Suspense } from "react";
import { getAllSkillMeta, categories } from "@/lib/skills";
import { SkillsPageContent } from "@/components/skills/skills-gallery";

const title = "Skills";
const description = "A collection of UI design patterns, component blueprints, and LLM prompts for building beautiful interfaces.";

export const metadata: Metadata = {
  title,
  description,
  alternates: {
    canonical: "/skills",
  },
};

export default function SkillsPage() {
  const skills = getAllSkillMeta();

  return (
    <section className="w-full mx-auto max-w-3xl space-y-0 pt-0 pb-0 border-x border-line">
      <div className="screen-line-top screen-line-bottom border-x border-y border-line px-4 py-4">
        <h1 className="text-3xl leading-none font-pixel tracking-tight">{title}</h1>
      </div>

      <div className="screen-line-bottom border-x border-b border-line px-4 py-4">
        <p className="font-mono text-sm text-muted-foreground">{description}</p>
      </div>

      <div className="border-x border-line px-2 pb-2">
        <SkillsPageContent skills={skills} categories={categories} />
      </div>
    </section>
  );
}
