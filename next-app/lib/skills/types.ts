export type SkillDifficulty = "beginner" | "intermediate" | "advanced";

export type PlaygroundParamType = "slider" | "select" | "toggle" | "color" | "number";

export type PlaygroundParam = {
  name: string;
  type: PlaygroundParamType;
  label: string;
  default: string | number | boolean;
} & (
  | { type: "slider"; min: number; max: number; step?: number }
  | { type: "select"; options: string[] }
  | { type: "toggle" }
  | { type: "color" }
  | { type: "number"; min?: number; max?: number; step?: number }
);

export type SkillMeta = {
  slug: string;
  title: string;
  description: string;
  category: string;
  tags: string[];
  difficulty: SkillDifficulty;
  blogPostSlug?: string;
  relatedSlugs?: string[];
  playgroundParams?: PlaygroundParam[];
};

export type SkillModule = {
  meta: SkillMeta;
  component: React.ComponentType<Record<string, unknown>>;
  prompt: string;
  sourceCode: string;
};

export type SkillPlaygroundValues = Record<string, string | number | boolean>;
