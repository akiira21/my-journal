import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getAllSkillSlugs } from "@/lib/skills";
import { getSkillBySlug, getRelatedSkills, compileSkillContent } from "@/lib/skills/server";
import { SkillDetailPage } from "@/components/skills/skill-detail-page";

export async function generateStaticParams() {
  const slugs = getAllSkillSlugs();
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const skill = getSkillBySlug(slug);
  if (!skill) {
    return { title: "Craft Not Found" };
  }

  return {
    title: `${skill.meta.title} — Craft`,
    description: skill.meta.description,
  };
}

export default async function CraftSlugPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const skill = getSkillBySlug(slug);

  if (!skill) {
    notFound();
  }

  const related = getRelatedSkills(slug);
  const compiledContent = skill.content
    ? await compileSkillContent(skill.content)
    : null;

  return (
    <div className="w-full max-w-[1400px] mx-auto overflow-visible">
      <SkillDetailPage
        meta={skill.meta}
        prompt={skill.prompt}
        sourceCode={skill.sourceCode}
        related={related}
        compiledContent={compiledContent}
      />
    </div>
  );
}
