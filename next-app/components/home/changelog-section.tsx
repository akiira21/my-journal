import { GitCommitHorizontalIcon } from "lucide-react";

import { Panel, PanelContent, PanelHeader, PanelTitle } from "@/components/home/panel";

const changelog = [
  {
    date: "May 2026",
    title: "Hybrid Search & Chat History",
    description: "BM25 + vector RRF fusion for better retrieval. Persistent chat sessions with IP-based reuse and history dropdown.",
    tag: "feat",
  },
  {
    date: "May 2026",
    title: "Floating TOC & Command Menu",
    description: "Redesigned table of contents as a Dynamic Island pill. Added search-driven command palette with debounced hybrid search.",
    tag: "ui",
  },
  {
    date: "Apr 2026",
    title: "Complete Design Overhaul",
    description: "Noisy dark/light themes, pixel fonts (Geist Pixel), 3D ASCII hero with scanline rasterization, and Apple-style image lightbox.",
    tag: "ui",
  },
  {
    date: "Apr 2026",
    title: "Admin Publish Pipeline",
    description: "Drag-and-drop MDX web UI for publishing posts. Background embedding worker with Redis job queue and automatic cache invalidation.",
    tag: "infra",
  },
];

const tagStyles: Record<string, string> = {
  feat: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
  ui: "bg-sky-500/10 text-sky-600 dark:text-sky-400",
  infra: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
};

export function ChangelogSection() {
  return (
    <Panel>
      <PanelHeader>
        <PanelTitle>Changelog</PanelTitle>
      </PanelHeader>

      <PanelContent className="p-0">
        <div className="divide-y divide-line">
          {changelog.map((item) => (
            <div
              key={item.title}
              className="flex items-start gap-3 border-line p-4 transition-colors hover:bg-accent/35"
            >
              <GitCommitHorizontalIcon className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
              <div className="flex flex-1 flex-col gap-1 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
                <div className="space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h4 className="font-mono text-sm font-medium">{item.title}</h4>
                    <span
                      className={`rounded px-1.5 py-0.5 font-mono text-[10px] uppercase tracking-wider ${tagStyles[item.tag] ?? tagStyles.feat}`}
                    >
                      {item.tag}
                    </span>
                  </div>
                  <p className="font-mono text-xs leading-relaxed text-muted-foreground">
                    {item.description}
                  </p>
                </div>
                <span className="shrink-0 font-mono text-xs text-muted-foreground/80">
                  {item.date}
                </span>
              </div>
            </div>
          ))}
        </div>
      </PanelContent>
    </Panel>
  );
}
