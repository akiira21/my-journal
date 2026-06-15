import { cache } from "react";
import { compileMDX } from "next-mdx-remote/rsc";

import { skillModules } from "./registry";
import type { SkillModule, SkillMeta } from "./types";
import { skillMdxComponents } from "@/components/skills/skill-mdx-components";

function loadSkillSource(componentPath: string): string {
  try {
    const fs = require("fs");
    const path = require("path");
    const fullPath = path.join(/*turbopackIgnore: true*/ process.cwd(), componentPath);
    return fs.readFileSync(fullPath, "utf-8");
  } catch {
    return "// Source code not available";
  }
}

function loadSkillPrompt(slug: string): string {
  try {
    const fs = require("fs");
    const path = require("path");
    const fullPath = path.join(/*turbopackIgnore: true*/ process.cwd(), "lib/skills", slug, "prompt.md");
    return fs.readFileSync(fullPath, "utf-8");
  } catch {
    return "# Prompt not available";
  }
}

function loadSkillContent(slug: string): string {
  try {
    const fs = require("fs");
    const path = require("path");
    const fullPath = path.join(/*turbopackIgnore: true*/ process.cwd(), "lib/skills", slug, "content.mdx");
    return fs.readFileSync(fullPath, "utf-8");
  } catch {
    return "";
  }
}

const compileSkillMdxCached = cache(async (source: string) => {
  return compileMDX({
    source,
    options: {
      parseFrontmatter: false,
      blockJS: false,
    },
    components: skillMdxComponents,
  });
});

export async function compileSkillContent(source: string) {
  const { content } = await compileSkillMdxCached(source);
  return content;
}

export function getSkillBySlug(slug: string): SkillModule | null {
  const found = skillModules.find((s) => s.meta.slug === slug);
  if (!found) return null;

  return {
    meta: found.meta,
    component: found.component,
    prompt: loadSkillPrompt(slug),
    sourceCode: loadSkillSource(found.componentPath),
    content: loadSkillContent(slug),
  };
}

export function getRelatedSkills(slug: string): SkillMeta[] {
  const skill = getSkillBySlug(slug);
  if (!skill || !skill.meta.relatedSlugs) return [];

  return skill.meta.relatedSlugs
    .map((s) => skillModules.find((m) => m.meta.slug === s)?.meta)
    .filter(Boolean) as SkillMeta[];
}
