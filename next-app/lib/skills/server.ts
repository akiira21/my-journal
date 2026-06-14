import { skillModules } from "./registry";
import type { SkillModule, SkillMeta } from "./types";

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

export function getSkillBySlug(slug: string): SkillModule | null {
  const found = skillModules.find((s) => s.meta.slug === slug);
  if (!found) return null;

  return {
    meta: found.meta,
    component: found.component,
    prompt: loadSkillPrompt(slug),
    sourceCode: loadSkillSource(found.componentPath),
  };
}

export function getRelatedSkills(slug: string): SkillMeta[] {
  const skill = getSkillBySlug(slug);
  if (!skill || !skill.meta.relatedSlugs) return [];

  return skill.meta.relatedSlugs
    .map((s) => skillModules.find((m) => m.meta.slug === s)?.meta)
    .filter(Boolean) as SkillMeta[];
}
