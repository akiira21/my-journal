import type { SkillMeta } from "./types";

// Import all skill components and metadata
import { meta as animatedButtonMeta } from "./animated-button/meta";
import AnimatedButtonComponent from "./animated-button/component";

export const skillModules: Array<{
  meta: SkillMeta;
  component: React.ComponentType<Record<string, unknown>>;
  componentPath: string;
}> = [
  {
    meta: animatedButtonMeta,
    component: AnimatedButtonComponent,
    componentPath: "lib/skills/animated-button/component.tsx",
  },
];

export const categories = Array.from(
  new Set(skillModules.map((s) => s.meta.category))
).sort();

export function getAllSkillSlugs(): string[] {
  return skillModules.map((s) => s.meta.slug);
}

export function getAllSkillMeta(): SkillMeta[] {
  return skillModules.map((s) => s.meta);
}
