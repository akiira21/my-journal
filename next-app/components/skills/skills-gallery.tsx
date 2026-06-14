"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { SearchIcon, XIcon, Wand2, ArrowRight } from "lucide-react";
import type { SkillMeta } from "@/lib/skills/types";
import { cn } from "@/lib/utils";

import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from "@/components/ui/input-group";

type SkillsPageContentProps = {
  skills: SkillMeta[];
  categories: string[];
};

function DifficultyBadge({ level }: { level: string }) {
  const colors: Record<string, string> = {
    beginner: "text-emerald-600 bg-emerald-500/10 border-emerald-500/20",
    intermediate: "text-amber-600 bg-amber-500/10 border-amber-500/20",
    advanced: "text-rose-600 bg-rose-500/10 border-rose-500/20",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-mono font-medium uppercase tracking-wider",
        colors[level] ?? colors.beginner
      )}
    >
      {level}
    </span>
  );
}

function SkillCard({ skill }: { skill: SkillMeta }) {
  return (
    <Link
      href={`/skills/${skill.slug}`}
      className="group flex flex-col p-4 transition-colors hover:bg-muted/30"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 space-y-1.5">
          <div className="flex items-center gap-2">
            <Wand2 className="h-3.5 w-3.5 text-muted-foreground" />
            <span className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
              {skill.category}
            </span>
          </div>

          <h2 className="text-base font-pixel leading-snug tracking-tight text-foreground transition-colors group-hover:text-primary">
            {skill.title}
          </h2>

          <p className="text-sm leading-relaxed text-muted-foreground line-clamp-2">
            {skill.description}
          </p>

          <div className="flex flex-wrap items-center gap-1.5 pt-1">
            <DifficultyBadge level={skill.difficulty} />
            {skill.tags.slice(0, 3).map((tag) => (
              <span
                key={tag}
                className="inline-flex items-center rounded border border-line px-1.5 py-0.5 text-[10px] font-mono text-muted-foreground"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>

        <div className="mt-0.5 shrink-0">
          <ArrowRight className="h-4 w-4 text-muted-foreground transition-all group-hover:translate-x-0.5 group-hover:text-foreground" />
        </div>
      </div>
    </Link>
  );
}

export function SkillsPageContent({ skills, categories }: SkillsPageContentProps) {
  const [query, setQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState<string | null>(null);

  const filteredSkills = useMemo(() => {
    const q = query.trim().toLowerCase();
    return skills.filter((skill) => {
      const matchesSearch =
        !q ||
        skill.title.toLowerCase().includes(q) ||
        skill.description.toLowerCase().includes(q) ||
        skill.tags.some((t) => t.toLowerCase().includes(q));

      const matchesCategory = !activeCategory || skill.category === activeCategory;

      return matchesSearch && matchesCategory;
    });
  }, [skills, query, activeCategory]);

  return (
    <div className="space-y-0">
      {/* Search bar */}
      <div className="border-b border-line">
        <InputGroup className="h-10 rounded-none border-x-0 border-y-0 bg-transparent shadow-none">
          <InputGroupAddon align="inline-start">
            <SearchIcon className="h-4 w-4 text-muted-foreground" />
          </InputGroupAddon>
          <InputGroupInput
            placeholder="Search skills..."
            value={query}
            className="font-mono text-sm"
            onChange={(event) => setQuery(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Escape") {
                setQuery("");
              }
            }}
          />
          <InputGroupAddon
            className="pr-2 data-[disabled=true]:hidden"
            align="inline-end"
            data-disabled={!query.length}
          >
            <InputGroupButton
              className="rounded-sm border-none"
              size="icon-xs"
              title="Clear"
              aria-label="Clear"
              onClick={() => setQuery("")}
            >
              <XIcon className="h-4 w-4" />
            </InputGroupButton>
          </InputGroupAddon>
        </InputGroup>
      </div>

      {/* Category filters */}
      <div className="border-b border-line px-3 py-2">
        <div className="flex flex-wrap items-center gap-1.5">
          <button
            onClick={() => setActiveCategory(null)}
            className={cn(
              "rounded border px-2 py-1 font-mono text-[11px] uppercase tracking-wider transition-colors",
              activeCategory === null
                ? "border-foreground/20 bg-foreground/5 text-foreground"
                : "border-line text-muted-foreground hover:border-foreground/20 hover:text-foreground"
            )}
          >
            All
          </button>
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() =>
                setActiveCategory(cat === activeCategory ? null : cat)
              }
              className={cn(
                "rounded border px-2 py-1 font-mono text-[11px] uppercase tracking-wider transition-colors",
                activeCategory === cat
                  ? "border-foreground/20 bg-foreground/5 text-foreground"
                  : "border-line text-muted-foreground hover:border-foreground/20 hover:text-foreground"
              )}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Results count */}
      <div className="border-b border-line px-3 py-1.5">
        <span className="font-mono text-[10px] text-muted-foreground">
          {filteredSkills.length} {filteredSkills.length === 1 ? "skill" : "skills"}
          {activeCategory && ` in ${activeCategory}`}
        </span>
      </div>

      {/* Skills grid */}
      <div className="grid grid-cols-1 border-y border-line sm:grid-cols-2 sm:gap-x-0">
        {filteredSkills.length === 0 ? (
          <div className="col-span-full p-8 text-center">
            <p className="font-mono text-sm text-muted-foreground">
              No skills found.
            </p>
          </div>
        ) : (
          filteredSkills.map((skill, index) => (
            <div
              key={skill.slug}
              className={cn(
                "border-b border-line",
                index % 2 === 0 && "sm:border-r"
              )}
            >
              <SkillCard skill={skill} />
            </div>
          ))
        )}
      </div>
    </div>
  );
}
