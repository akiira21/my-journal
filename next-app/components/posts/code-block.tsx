"use client";

import * as React from "react";
import { Highlight, themes, type Language } from "prism-react-renderer";
import { Check, Copy } from "lucide-react";
import { useTheme } from "@/components/theme-provider";
import { cn } from "@/lib/utils";

interface CodeBlockProps {
  children?: React.ReactNode;
  className?: string;
}

// Map common language identifiers to prism-react-renderer languages
const languageMap: Record<string, Language> = {
  javascript: "javascript",
  js: "javascript",
  jsx: "jsx",
  typescript: "typescript",
  ts: "typescript",
  tsx: "tsx",
  python: "python",
  py: "python",
  bash: "bash",
  sh: "bash",
  shell: "bash",
  zsh: "bash",
  css: "css",
  scss: "scss",
  sass: "scss",
  html: "html",
  json: "json",
  yaml: "yaml",
  yml: "yaml",
  markdown: "markdown",
  md: "markdown",
  mdx: "markdown",
  rust: "rust",
  rs: "rust",
  go: "go",
  golang: "go",
  sql: "sql",
  graphql: "graphql",
  dockerfile: "docker",
  docker: "docker",
  vim: "vim",
  lua: "lua",
  java: "java",
  kotlin: "kotlin",
  kt: "kotlin",
  swift: "swift",
  c: "c",
  cpp: "cpp",
  "c++": "cpp",
  csharp: "csharp",
  cs: "csharp",
  php: "php",
  ruby: "ruby",
  rb: "ruby",
  perl: "perl",
  pl: "perl",
  rustlang: "rust",
  toml: "ini",
  ini: "ini",
};

function extractLanguage(className?: string): string | null {
  if (!className) return null;
  const match = className.match(/language-([a-z0-9+#-]+)/i);
  return match?.[1]?.toLowerCase() ?? null;
}

function normalizeLanguage(lang: string | null): Language {
  if (!lang) return "text";
  return languageMap[lang] ?? (lang as Language);
}

// Custom themes
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

function CodeBlock({ children, className }: CodeBlockProps) {
  const [hasCopied, setHasCopied] = React.useState(false);
  const [mounted, setMounted] = React.useState(false);
  const { resolvedTheme } = useTheme();

  React.useEffect(() => {
    setMounted(true);
  }, []);

  const language = extractLanguage(className);
  const normalizedLang = normalizeLanguage(language);
  const code = React.Children.toArray(children).join("").trimEnd();

  const copyToClipboard = async () => {
    await navigator.clipboard.writeText(code);
    setHasCopied(true);
    setTimeout(() => setHasCopied(false), 2000);
  };

  const theme = mounted && resolvedTheme === "light" ? customLightTheme : customDarkTheme;

  return (
    <div className="code-journal group relative my-8">
      {/* Journal-style header */}
      <div className="flex items-center justify-between border-b border-line/60 bg-muted/30 px-4 py-2.5">
        <div className="flex items-center gap-2.5">
          <span className="h-2 w-2 rounded-full bg-muted-foreground/20" />
          <span
            className="font-mono text-[10px] font-medium uppercase tracking-[0.12em] text-muted-foreground/60"
          >
            {language ?? "text"}
          </span>
        </div>
        <button
          onClick={copyToClipboard}
          className="flex items-center gap-1.5 text-muted-foreground/50 transition-colors hover:text-foreground/70"
          aria-label={hasCopied ? "Copied!" : "Copy code"}
        >
          {hasCopied ? (
            <Check className="h-3 w-3 text-emerald-500" />
          ) : (
            <Copy className="h-3 w-3" />
          )}
        </button>
      </div>

      {/* Code body */}
      <div className="relative">
        <Highlight theme={theme} code={code} language={normalizedLang}>
          {({ className: highlightClassName, style, tokens, getLineProps, getTokenProps }) => (
            <pre
              className={cn(
                highlightClassName,
                "overflow-x-auto p-4 text-[13px] leading-[1.7] [&::-webkit-scrollbar]:h-1.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-muted-foreground/15"
              )}
              style={{
                ...style,
                backgroundColor: "transparent",
                margin: 0,
              }}
            >
              {tokens.map((line, i) => (
                <div key={i} {...getLineProps({ line })} className="table-row">
                  <span
                    className="table-cell select-none pr-5 text-right font-mono text-[11px] tabular-nums text-muted-foreground/25 w-10"
                  >
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
  );
}

// Inline code — academic style
function InlineCode({ children }: { children?: React.ReactNode }) {
  return (
    <code
      className="rounded-sm bg-muted/60 px-[0.25em] py-[0.1em] font-mono text-[0.85em] text-foreground/80"
    >
      {children}
    </code>
  );
}

// Main code component that decides between block and inline
function Code({ children, className }: CodeBlockProps) {
  const isBlock = className && className.includes("language-");

  if (isBlock) {
    return <CodeBlock className={className}>{children}</CodeBlock>;
  }

  return <InlineCode>{children}</InlineCode>;
}

export { Code, CodeBlock, InlineCode };
