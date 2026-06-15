"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import type { ReactNode } from "react";
import {
  Copy,
  Check,
  Wand2,
  ArrowLeft,
  ArrowUpRight,
  Sparkles,
  ChevronRight,
  ChevronDown,
  Code2,
  Eye,
} from "lucide-react";
import type { SkillMeta } from "@/lib/skills/types";
import { cn } from "@/lib/utils";
import { Highlight, themes } from "prism-react-renderer";
import { useTheme } from "@/components/theme-provider";

import { SandpackCanvas } from "./sandpack-canvas";

const customLightTheme = {
  ...themes.github,
  plain: {
    ...themes.github.plain,
    backgroundColor: "hsl(var(--muted))",
    color: "hsl(var(--foreground))",
  },
};

const customDarkTheme = {
  ...themes.oneDark,
  plain: {
    ...themes.oneDark.plain,
    backgroundColor: "hsl(var(--muted))",
  },
};

function useCopy() {
  const [copied, setCopied] = useState(false);
  const copy = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  };
  return { copied, copy };
}

function DifficultyBadge({ level }: { level: string }) {
  const colors: Record<string, string> = {
    beginner: "text-emerald-600 bg-emerald-500/10 border-emerald-500/20",
    intermediate: "text-amber-600 bg-amber-500/10 border-amber-500/20",
    advanced: "text-rose-600 bg-rose-500/10 border-rose-500/20",
  };
  return (
    <span className={cn("inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-mono font-medium uppercase tracking-wider", colors[level] ?? colors.beginner)}>
      {level}
    </span>
  );
}

export function SkillDetailPage({
  meta,
  prompt,
  sourceCode,
  related,
  compiledContent,
}: {
  meta: SkillMeta;
  prompt: string;
  sourceCode: string;
  related: SkillMeta[];
  compiledContent: ReactNode | null;
}) {
  const [activeTab, setActiveTab] = useState<"preview" | "code">("preview");
  const [promptExpanded, setPromptExpanded] = useState(false);
  const [mounted, setMounted] = useState(false);
  const { resolvedTheme } = useTheme();

  useEffect(() => {
    setMounted(true);
  }, []);

  const { copied: promptCopied, copy: copyPrompt } = useCopy();
  const { copied: codeCopied, copy: copyCode } = useCopy();

  const sandpackFiles = useMemo(() => ({
    "/App.tsx": sourceCode,
    "/index.tsx": `import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./styles.css";

const root = ReactDOM.createRoot(document.getElementById("root")!);
root.render(<App />);`,
    "/styles.css": `* { margin: 0; padding: 0; box-sizing: border-box; }
html, body, #root { height: 100%; width: 100%; }
#root { display: flex; flex-direction: column; }
body { background: #ffffff; }
@media (prefers-color-scheme: dark) {
  body { background: #0a0a0a; }
}`,
    "/index.html": `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<title>Preview</title>
<script src="https://cdn.tailwindcss.com"></script>
<script>
  tailwind.config = {
    darkMode: 'media',
    theme: { extend: {} }
  }
</script>
<style>
  html, body, #root { height: 100%; width: 100%; }
</style>
</head>
<body>
<div id="root"></div>
</body>
</html>`,
  }), [sourceCode]);

  return (
    <div className="relative flex flex-col lg:flex-row lg:h-[calc(100dvh-3rem)] border border-line overflow-visible">
      {/* LEFT SIDEBAR - Chat Panel */}
      <div className="flex flex-col lg:w-[380px] lg:min-w-[380px] xl:w-[420px] lg:overflow-hidden">
        {/* Header */}
        <div className="border-b border-line px-5 py-4">
          <div className="mb-3">
            <Link href="/craft" className="inline-flex items-center gap-1 font-mono text-xs text-muted-foreground transition-colors hover:text-foreground">
              <ArrowLeft className="h-3 w-3" />
              Craft
            </Link>
          </div>
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Sparkles className="h-3.5 w-3.5 text-muted-foreground" />
              <span className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">{meta.category}</span>
            </div>
            <h1 className="text-base font-pixel leading-tight tracking-tight text-foreground">{meta.title}</h1>
            <p className="text-sm leading-relaxed text-muted-foreground">{meta.description}</p>
            <div className="flex flex-wrap items-center gap-2">
              <DifficultyBadge level={meta.difficulty} />
              {meta.tags.map((tag) => (
                <span key={tag} className="inline-flex items-center rounded border border-line px-1.5 py-0.5 text-[10px] font-mono text-muted-foreground">{tag}</span>
              ))}
            </div>
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-5 space-y-6">
          {/* Skill Explanation */}
          <div className="space-y-3">
            <h2 className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">How it works</h2>
            <div className="space-y-2">
              {compiledContent ? (
                compiledContent
              ) : (
                <p className="text-sm text-muted-foreground leading-relaxed">
                  No detailed explanation available for this craft.
                </p>
              )}
            </div>
          </div>

          {/* Prompt Section */}
          <div className="space-y-2">
            <button onClick={() => setPromptExpanded(!promptExpanded)} className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-wider text-muted-foreground transition-colors hover:text-foreground">
              {promptExpanded ? <ChevronDown className="h-3 w-3" /> : <ChevronRight className="h-3 w-3" />}
              <Wand2 className="h-3 w-3" />
              LLM Prompt
            </button>
            {promptExpanded && (
              <div className="rounded-lg border border-line bg-muted/20 p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-mono text-[10px] text-muted-foreground">Prompt text</span>
                  <button onClick={() => copyPrompt(prompt)} className="flex items-center gap-1 rounded border border-line px-2 py-1 font-mono text-[10px] text-muted-foreground transition-colors hover:text-foreground">
                    {promptCopied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                    {promptCopied ? "Copied" : "Copy"}
                  </button>
                </div>
                <pre className="text-xs leading-relaxed text-muted-foreground whitespace-pre-wrap font-sans">{prompt}</pre>
              </div>
            )}
          </div>

          {/* Related Skills */}
          {related.length > 0 && (
            <div className="space-y-2">
              <span className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">Related Craft</span>
              <div className="space-y-1">
                {related.map((skill) => (
                  <Link key={skill.slug} href={`/craft/${skill.slug}`} className="group flex items-center justify-between rounded-lg border border-line bg-background p-2.5 transition-colors hover:bg-muted/30">
                    <div className="space-y-0.5">
                      <span className="block text-sm font-pixel text-foreground transition-colors group-hover:text-primary">{skill.title}</span>
                      <span className="block text-[10px] text-muted-foreground">{skill.category}</span>
                    </div>
                    <ArrowUpRight className="h-3.5 w-3.5 text-muted-foreground transition-colors group-hover:text-foreground" />
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* RIGHT PANEL — Desktop: stacked cards, Mobile: simple */}
      <div className="flex-1 flex flex-col min-h-[500px] lg:min-h-0 relative lg:absolute lg:top-0 lg:bottom-0 lg:left-[400px] xl:left-[440px] lg:w-[min(calc(100vw_-_400px),_calc(50vw_+_300px))] xl:w-[min(calc(100vw_-_440px),_calc(50vw_+_260px))] mt-4 lg:pl-4">
        {/* Back card — desktop only */}
        <div className="hidden lg:block absolute top-0 left-0 right-4 bottom-4 rounded-tl-[56px] border-2 border-line bg-muted/20 z-10" />
        {/* Front card (content) */}
        <div className="relative z-20 flex-1 flex flex-col bg-background lg:absolute lg:top-3 lg:left-3 lg:right-0 lg:bottom-0 lg:rounded-tl-[48px] lg:border-2 lg:border-line lg:shadow-[0_4px_16px_rgba(0,0,0,0.04)] dark:lg:shadow-[0_8px_32px_rgba(0,0,0,0.2)] p-4">
          {/* Canvas Header - Tabs */}
          <div className="flex items-center border-b border-line/25 bg-muted/5 px-4 py-2">
            <div className="flex items-center gap-1">
              {(
                [
                  { id: "preview" as const, label: "Preview", icon: <Eye className="h-3 w-3" />, fileName: "preview.tsx" },
                  { id: "code" as const, label: "Code", icon: <Code2 className="h-3 w-3" />, fileName: "component.tsx" },
                ] as const
              ).map((tab) => {
                const isActive = activeTab === tab.id;
                return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={cn(
                        "flex items-center gap-1 px-2 py-1 font-mono text-[11px] transition-colors rounded-full",
                        isActive
                          ? "text-foreground bg-muted/40 dark:bg-muted/60 border border-line/40 shadow-sm"
                          : "text-muted-foreground hover:text-foreground hover:bg-muted/20 dark:hover:bg-muted/30"
                      )}
                    >
                    {tab.icon}
                    <span className="hidden sm:inline">{tab.fileName}</span>
                    <span className="sm:hidden">{tab.label}</span>
                  </button>
                );
              })}
            </div>
            <div className="ml-auto flex items-center gap-1 px-2 py-1">
              {activeTab === "code" && (
                <button onClick={() => copyCode(sourceCode)} className="flex items-center gap-1 rounded-full border border-line/50 px-2 py-0.5 font-mono text-[10px] text-muted-foreground transition-colors hover:text-foreground">
                  {codeCopied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                  <span className="hidden sm:inline">{codeCopied ? "Copied" : "Copy"}</span>
                </button>
              )}
            </div>
          </div>

          {/* Canvas Content Area */}
          <div className="flex-1 overflow-hidden relative bg-muted/5 p-2 rounded-b-2xl">
            {/* Preview — always mounted, hidden via opacity to prevent re-render */}
            <div className={cn("absolute inset-0 h-full w-full rounded-2xl overflow-hidden", activeTab === "preview" ? "opacity-100 z-10" : "opacity-0 pointer-events-none z-0")}>
              <SandpackCanvas
                files={sandpackFiles}
                template="react-ts"
                activeFile="/App.tsx"
              />
            </div>

            {/* Code — always mounted */}
            <div className={cn("absolute inset-0 overflow-y-auto bg-background dark:bg-neutral-950 rounded-2xl", activeTab === "code" ? "opacity-100 z-10" : "opacity-0 pointer-events-none z-0")}>
              <Highlight
                theme={mounted && resolvedTheme === "light" ? customLightTheme : customDarkTheme}
                code={sourceCode}
                language="tsx"
              >
                {({ className: highlightClassName, style, tokens, getLineProps, getTokenProps }) => (
                  <pre
                    className={cn(highlightClassName, "overflow-x-auto p-4 text-xs leading-relaxed [&::-webkit-scrollbar]:h-1.5")}
                    style={{ ...style, backgroundColor: "transparent", margin: 0 }}
                  >
                    {tokens.map((line, i) => (
                      <div key={i} {...getLineProps({ line })} className="table-row">
                        <span className="table-cell select-none pr-4 text-right font-mono text-[10px] tabular-nums text-muted-foreground/25 w-8">
                          {i + 1}
                        </span>
                        <span className="table-cell">
                          {line.map((token, key) => (
                            <span key={key} {...getTokenProps({ token })} />
                          ))}
                        </span>
                      </div>
                    ))}
                  </pre>
                )}
              </Highlight>
            </div>


          </div>
        </div>
      </div>
    </div>
  );
}
