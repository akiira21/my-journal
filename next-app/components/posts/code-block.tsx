"use client";

import * as React from "react";
import { Highlight, themes, type Language } from "prism-react-renderer";
import { Check, Copy } from "lucide-react";
import { useTheme } from "@/components/theme-provider";
import { cn } from "@/lib/utils";

interface CodeBlockProps {
  children: React.ReactNode;
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

  // Use dark theme by default, or light theme if explicitly in light mode
  const theme = mounted && resolvedTheme === "light" ? customLightTheme : customDarkTheme;

  return (
    <div className="group relative my-6 border border-line">
      {/* Header with language and copy button - no rounded corners */}
      <div className="flex items-center justify-between border-b border-line bg-muted/40 px-4 py-2">
        <span className="font-mono text-[11px] font-medium uppercase tracking-[0.12em] text-muted-foreground">
          {language ?? "CODE"}
        </span>
        <button
          onClick={copyToClipboard}
          className="flex items-center gap-1.5 text-muted-foreground transition-colors hover:text-foreground"
          aria-label={hasCopied ? "Copied!" : "Copy code"}
        >
          {hasCopied ? (
            <>
              <Check className="h-3.5 w-3.5 text-green-500" />
              <span className="font-mono text-[10px] uppercase tracking-wider">Copied</span>
            </>
          ) : (
            <>
              <Copy className="h-3.5 w-3.5" />
              <span className="font-mono text-[10px] uppercase tracking-wider opacity-0 transition-opacity group-hover:opacity-100">
                Copy
              </span>
            </>
          )}
        </button>
      </div>

      {/* Code with syntax highlighting - no rounded corners */}
      <div className="relative">
        <Highlight theme={theme} code={code} language={normalizedLang}>
          {({ className: highlightClassName, style, tokens, getLineProps, getTokenProps }) => (
            <pre
              className={cn(
                highlightClassName,
                "overflow-x-auto p-4 text-xs leading-6 [&::-webkit-scrollbar]:h-1.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-muted-foreground/20"
              )}
              style={{
                ...style,
                backgroundColor: "hsl(var(--muted))",
                margin: 0,
              }}
            >
              {tokens.map((line, i) => (
                <div key={i} {...getLineProps({ line })} className="table-row">
                  {/* Line numbers */}
                  <span className="table-cell select-none pr-4 text-right font-mono text-[10px] text-muted-foreground/40 w-8">
                    {i + 1}
                  </span>
                  {/* Code line */}
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

// Inline code component - sharp edges
function InlineCode({ children }: { children: React.ReactNode }) {
  return (
    <code className="border border-line bg-muted/50 px-1.5 py-0.5 font-mono text-[0.8rem]">
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
