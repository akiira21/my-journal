import type { SkillMeta } from "../types";

export const meta: SkillMeta = {
  slug: "animated-button",
  title: "Animated Monochrome Button",
  description:
    "A button with a shimmering silver gradient background that flows continuously. Includes hover lift, press scale, and focus ring. Perfect for primary CTAs in a professional, Apple-style design.",
  category: "Feedback",
  tags: ["animation", "gradient", "button", "hover", "cta", "monochrome"],
  difficulty: "beginner",
  blogPostSlug: "micro-interactions-for-buttons",
  relatedSlugs: ["glassmorphism-card"],
  playgroundParams: [
    {
      name: "speed",
      type: "slider",
      label: "Animation Speed",
      min: 1,
      max: 10,
      step: 0.5,
      default: 3,
    },
    {
      name: "size",
      type: "select",
      label: "Size",
      options: ["sm", "md", "lg"],
      default: "md",
    },
    {
      name: "showGlow",
      type: "toggle",
      label: "Glow Shadow",
      default: true,
    },
    {
      name: "borderRadius",
      type: "select",
      label: "Radius",
      options: ["sm", "md", "lg", "xl", "full"],
      default: "xl",
    },
  ],
};
