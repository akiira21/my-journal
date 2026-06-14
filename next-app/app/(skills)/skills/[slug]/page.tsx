import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getAllSkillSlugs } from "@/lib/skills";
import { getSkillBySlug, getRelatedSkills } from "@/lib/skills/server";
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
    return { title: "Skill Not Found" };
  }

  return {
    title: `${skill.meta.title} — Skill`,
    description: skill.meta.description,
  };
}

export default async function SkillSlugPage({
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

  return (
    <div className="w-full max-w-[1400px] mx-auto overflow-visible">
      <SkillDetailPage
        meta={skill.meta}
        prompt={skill.prompt}
        sourceCode={skill.sourceCode}
        related={related}
      />
    </div>
  );
}
