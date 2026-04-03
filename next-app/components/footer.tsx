import { HeartIcon, RssIcon } from "lucide-react";

import { personalConfig } from "@/lib/personal-data";

export function Footer() {
  const { about, repo } = personalConfig;
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t border-border/70 bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/80">
      <div className="mx-auto w-full max-w-3xl border-l border-r border-border/70 px-4 py-5 sm:px-6">
        <p className="text-center font-mono text-xs text-muted-foreground">
          Inspired by ncdai and his design language.
        </p>

        <p className="mt-2 text-center font-mono text-xs text-muted-foreground">
          Built by {about.name} with
          <HeartIcon className="mx-1 inline size-3.5 text-rose-500" fill="currentColor" />
          . Source code on{" "}
          <a
            className="underline underline-offset-4 transition-colors hover:text-foreground"
            href={repo}
            target="_blank"
            rel="noopener"
          >
            GitHub
          </a>
          .
        </p>

        <div className="mt-4 flex items-center justify-center gap-4 border-t border-line pt-3 text-muted-foreground">
          <a
            className="transition-colors hover:text-foreground"
            href={about.github}
            target="_blank"
            rel="noopener"
          >
            <GitHubIcon className="size-4" />
            <span className="sr-only">GitHub</span>
          </a>

          <span className="h-4 w-px bg-line" />

          <a
            className="transition-colors hover:text-foreground"
            href={about.X}
            target="_blank"
            rel="noopener"
          >
            <XIcon className="size-4" />
            <span className="sr-only">X</span>
          </a>

          <span className="h-4 w-px bg-line" />

          <a
            className="transition-colors hover:text-foreground"
            href="/rss"
            target="_blank"
            rel="noopener"
          >
            <RssIcon className="size-4" />
            <span className="sr-only">RSS</span>
          </a>
        </div>

        <p className="mt-3 text-center font-mono text-[11px] text-muted-foreground/90">
          © {currentYear} {personalConfig.copyrightName}
        </p>
      </div>
    </footer>
  );
}

function GitHubIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" className={className}>
      <path d="M12 .297a12 12 0 0 0-3.79 23.385c.6.113.82-.258.82-.577v-2.234c-3.338.726-4.042-1.416-4.042-1.416a3.184 3.184 0 0 0-1.335-1.756c-1.087-.745.084-.729.084-.729a2.52 2.52 0 0 1 1.838 1.236 2.556 2.556 0 0 0 3.495.998 2.565 2.565 0 0 1 .76-1.605c-2.665-.3-5.466-1.332-5.466-5.931a4.64 4.64 0 0 1 1.235-3.221 4.31 4.31 0 0 1 .117-3.176s1.008-.322 3.3 1.23a11.46 11.46 0 0 1 6 0c2.291-1.552 3.3-1.23 3.3-1.23.645 1.653.24 2.873.12 3.176a4.63 4.63 0 0 1 1.23 3.22c0 4.61-2.805 5.625-5.475 5.92a2.87 2.87 0 0 1 .81 2.22v3.293c0 .321.216.694.825.576A12.003 12.003 0 0 0 12 .297" />
    </svg>
  );
}

function XIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" className={className}>
      <path d="M18.244 2H21l-6.56 7.5L22 22h-5.95l-4.65-6.08L6.07 22H3.3l7.02-8.02L2 2h6.1l4.2 5.55L18.244 2zm-1.04 18h1.53L7.25 3.9H5.63L17.204 20z" />
    </svg>
  );
}