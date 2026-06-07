"use client";

import { useEffect, useState, useCallback } from "react";
import { ArrowRightIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Panel, PanelContent, PanelHeader, PanelTitle } from "@/components/home/panel";
import { personalConfig } from "@/lib/personal-data";

/* ── Data ─────────────────────────────────────────────────────── */

const services = [
  {
    id: "web",
    title: "Web Development",
    color: "rose",
    description:
      "I build responsive, fast, and beautifully animated websites using Next.js, React, and Tailwind CSS. Every interface is crafted with accessibility and performance in mind.",
    commands: [
      { prompt: "~/project", cmd: "npx create-next-app@latest client-site", output: "✔ Creating Next.js app...\n✔ Built in 3.4s" },
      { prompt: "~/project", cmd: "npm install framer-motion tailwind-merge", output: "added 42 packages in 2.1s" },
      { prompt: "~/project", cmd: "npm run build", output: "✓ Route (app) size: 89 kB\n✓ Lighthouse: 98/100" },
    ],
  },
  {
    id: "backend",
    title: "Full-Stack Systems",
    color: "fuchsia",
    description:
      "End-to-end backend architecture with Go, Python FastAPI, and Node.js. I design clean REST APIs, manage PostgreSQL and Redis, and deploy cloud-native systems.",
    commands: [
      { prompt: "~/api", cmd: "go mod init api-server", output: "go: creating new go.mod" },
      { prompt: "~/api", cmd: "go get -u github.com/gin-gonic/gin", output: "go: added gin v1.9.1" },
      { prompt: "~/api", cmd: "go run cmd/server/main.go", output: "[GIN] Listening on :8080\n✓ PostgreSQL connected\n✓ Redis pool ready" },
    ],
  },
  {
    id: "ai",
    title: "AI Integration",
    color: "purple",
    description:
      "I implement RAG pipelines, semantic search, and streaming chat assistants using OpenAI embeddings and vector databases. Turn your data into intelligent products.",
    commands: [
      { prompt: "~/ai", cmd: "pip install openai pgvector", output: "Successfully installed openai-1.35.0" },
      { prompt: "~/ai", cmd: "python scripts/generate_embeddings.py", output: "Processing 1,247 chunks...\n✓ 1,247 embeddings stored" },
      { prompt: "~/ai", cmd: "curl /api/v1/chat -d '{\"q\":\"What is RAG?\"}'", output: '{"sources":3,"answer":"Retrieval-Augmented Generation..."}' },
    ],
  },
  {
    id: "perf",
    title: "Performance & SEO",
    color: "teal",
    description:
      "I optimize Core Web Vitals, implement ISR and edge caching, and configure structured data for maximum search visibility. Fast sites rank better and convert more.",
    commands: [
      { prompt: "~/site", cmd: "npm run lighthouse", output: "Performance: 98\nAccessibility: 100\nBest Practices: 100\nSEO: 100" },
      { prompt: "~/site", cmd: "vercel --prod", output: "✓ Production: https://site.vercel.app\n✓ ISR enabled (revalidate: 3600)" },
      { prompt: "~/site", cmd: "wrangler pages deploy dist", output: "✓ Published to Cloudflare Pages\n✓ Edge cache: 45ms avg" },
    ],
  },
];

const colorMap: Record<string, { text: string; bg: string; activeBg: string }> = {
  rose:    { text: "text-rose-500", bg: "bg-rose-500", activeBg: "bg-rose-500/10" },
  fuchsia: { text: "text-fuchsia-500", bg: "bg-fuchsia-500", activeBg: "bg-fuchsia-500/10" },
  purple:  { text: "text-purple-500", bg: "bg-purple-500", activeBg: "bg-purple-500/10" },
  teal:    { text: "text-teal-500", bg: "bg-teal-500", activeBg: "bg-teal-500/10" },
};

/* ── Animated Terminal sub-component ──────────────────────────── */

function AnimatedTerminal({ commands, color }: { commands: typeof services[0]["commands"]; color: string }) {
  const theme = colorMap[color];
  const [mounted, setMounted] = useState(false);
  const [visibleLines, setVisibleLines] = useState(0);
  const [typedChars, setTypedChars] = useState(0);
  const [showCursor, setShowCursor] = useState(true);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Reset animation when commands change
  useEffect(() => {
    setVisibleLines(0);
    setTypedChars(0);
    setShowCursor(true);
  }, [commands]);

  // Typewriter effect
  useEffect(() => {
    if (!mounted || visibleLines >= commands.length) return;

    const currentLine = commands[visibleLines];
    const fullText = currentLine.cmd;

    if (typedChars < fullText.length) {
      const timer = setTimeout(() => setTypedChars(c => c + 1), 25);
      return () => clearTimeout(timer);
    }

    // Line complete — show output, then move to next line
    const timer = setTimeout(() => {
      setVisibleLines(l => l + 1);
      setTypedChars(0);
    }, 700);
    return () => clearTimeout(timer);
  }, [mounted, visibleLines, typedChars, commands]);

  // Blinking cursor
  useEffect(() => {
    if (!mounted) return;
    const interval = setInterval(() => setShowCursor(s => !s), 530);
    return () => clearInterval(interval);
  }, [mounted]);

  if (!mounted) {
    return (
      <div className="flex h-56 flex-col rounded-lg border border-line bg-[#0a0a0a]">
        <div className="flex items-center gap-1.5 border-b border-line/50 px-3 py-2">
          <span className="size-2.5 rounded-full bg-[#ff5f56]" />
          <span className="size-2.5 rounded-full bg-[#ffbd2e]" />
          <span className="size-2.5 rounded-full bg-[#27c93f]" />
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-56 flex-col overflow-hidden rounded-lg border border-line bg-[#0a0a0a] font-mono text-xs">
      {/* Terminal header */}
      <div className="flex shrink-0 items-center gap-1.5 border-b border-line/50 px-3 py-2">
        <span className="size-2.5 rounded-full bg-[#ff5f56]" />
        <span className="size-2.5 rounded-full bg-[#ffbd2e]" />
        <span className="size-2.5 rounded-full bg-[#27c93f]" />
        <span className="ml-2 text-[10px] text-muted-foreground/40">terminal — zsh</span>
      </div>

      {/* Terminal body */}
      <div className="flex-1 space-y-3 overflow-y-auto p-3">
        {commands.map((line, lineIndex) => {
          const isVisible = lineIndex < visibleLines;
          const isCurrent = lineIndex === visibleLines;

          if (!isVisible && !isCurrent) return null;

          const displayCmd = isCurrent ? line.cmd.slice(0, typedChars) : line.cmd;
          const showOutput = isVisible;

          return (
            <div key={lineIndex} className="space-y-1">
              <div className="flex items-center gap-2">
                <span className={`${theme.text}`}>➜</span>
                <span className="text-muted-foreground/50">{line.prompt}</span>
                <span className="text-foreground/90">
                  {displayCmd}
                  {isCurrent && (
                    <span
                      className={`ml-0.5 inline-block h-3.5 w-px align-middle ${
                        showCursor ? "bg-foreground/80" : "bg-transparent"
                      }`}
                    />
                  )}
                </span>
              </div>
              {showOutput && (
                <div className="animate-in fade-in slide-in-from-top-1 pl-5 text-muted-foreground/50 duration-300 whitespace-pre-wrap">
                  {line.output}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ── Main section ─────────────────────────────────────────────── */

export function ContactSection() {
  const { about } = personalConfig;
  const [active, setActive] = useState(services[0]);

  const handleHover = useCallback((service: typeof services[0]) => {
    setActive(service);
  }, []);

  return (
    <Panel>
      <PanelHeader>
        <PanelTitle>Work With Me</PanelTitle>
      </PanelHeader>

      <PanelContent>
        <div className="flex flex-col gap-6 lg:flex-row">
          {/* ── Left: Service list (single column) ── */}
          <div className="flex shrink-0 flex-col divide-y divide-line lg:w-52">
            {services.map((service) => {
              const theme = colorMap[service.color];
              const isActive = active.id === service.id;

              return (
                <button
                  key={service.id}
                  onMouseEnter={() => handleHover(service)}
                  className={`relative cursor-pointer py-4 pr-4 pl-4 text-left transition-colors ${
                    isActive ? theme.activeBg : "hover:bg-accent/10"
                  }`}
                >
                  {/* Full-height left border */}
                  <span
                    className={`absolute inset-y-0 left-0 w-0.5 transition-all duration-300 ${
                      isActive ? `${theme.bg} opacity-100` : "bg-transparent opacity-0"
                    }`}
                  />
                  <span
                    className={`font-mono text-sm transition-colors duration-200 ${
                      isActive ? "font-medium text-foreground" : "text-muted-foreground"
                    }`}
                  >
                    {service.title}
                  </span>
                </button>
              );
            })}
          </div>

          {/* ── Right: Description + Terminal ── */}
          <div className="flex flex-1 flex-col">
            {/* Description */}
            <div className="border-b border-line pb-5">
              <p className="font-mono text-sm leading-relaxed text-muted-foreground">
                {active.description}
              </p>
            </div>

            {/* Terminal */}
            <div className="pt-5">
              <AnimatedTerminal
                key={active.id}
                commands={active.commands}
                color={active.color}
              />
            </div>
          </div>
        </div>

        {/* CTA row */}
        <div className="mt-8 flex flex-col items-start gap-3 border-t border-line pt-5 sm:flex-row sm:items-center sm:justify-between">
          <p className="font-mono text-xs text-muted-foreground">
            Currently accepting new projects. Typical turnaround: 2–6 weeks.
          </p>
          <Button asChild variant="outline" size="sm" className="font-mono text-xs">
            <a href={`mailto:${about.email}`}>
              Get in Touch
              <ArrowRightIcon className="ml-1.5 size-3.5" />
            </a>
          </Button>
        </div>
      </PanelContent>
    </Panel>
  );
}
