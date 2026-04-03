import type { ReactNode } from "react";
import Link from "next/link";

import { PostLightboxImage } from "@/components/posts/post-lightbox-image";
import { TypographyH3, TypographyInlineCode as SharedTypographyInlineCode } from "@/components/typography";

type OrderedListProps = {
  items?: Array<string | number>;
  children?: ReactNode;
};

function OrderedList({ items, children }: OrderedListProps) {
  const normalizedItems = Array.isArray(items) ? items : [];

  return (
    <ol className="my-4 ml-6 list-decimal space-y-2 text-sm leading-7 text-foreground/95">
      {normalizedItems.length > 0
        ? normalizedItems.map((item, index) => <li key={`ordered-${index}-${String(item)}`}>{item}</li>)
        : children}
    </ol>
  );
}

type UnorderedListProps = {
  items?: Array<string | number>;
  children?: ReactNode;
};

function UnorderedList({ items, children }: UnorderedListProps) {
  const normalizedItems = Array.isArray(items) ? items : [];

  return (
    <ul className="my-4 ml-6 list-disc space-y-2 text-sm leading-7 text-foreground/95">
      {normalizedItems.length > 0
        ? normalizedItems.map((item, index) => <li key={`unordered-${index}-${String(item)}`}>{item}</li>)
        : children}
    </ul>
  );
}

type CalloutProps = {
  type?: "info" | "warning" | "success" | "error";
  title?: string;
  children?: ReactNode;
};

function Callout({ type = "info", title, children }: CalloutProps) {
  const tone = {
    info: "border-sky-500/70 bg-sky-500/8 text-sky-100",
    warning: "border-amber-500/70 bg-amber-500/10 text-amber-100",
    success: "border-emerald-500/70 bg-emerald-500/10 text-emerald-100",
    error: "border-rose-500/70 bg-rose-500/10 text-rose-100",
  }[type];

  const label = (title ?? type).toUpperCase();

  return (
    <div className={`relative my-4 border-y ${tone}`}>
      <span className="pointer-events-none absolute top-0 left-0 -translate-x-1/2 -translate-y-1/2 font-mono text-xs text-current">+</span>
      <span className="pointer-events-none absolute top-0 right-0 translate-x-1/2 -translate-y-1/2 font-mono text-xs text-current">+</span>
      <span className="pointer-events-none absolute bottom-0 left-0 -translate-x-1/2 translate-y-1/2 font-mono text-xs text-current">+</span>
      <span className="pointer-events-none absolute right-0 bottom-0 translate-x-1/2 translate-y-1/2 font-mono text-xs text-current">+</span>

      <div className="flex items-center gap-2 border-b border-current/25 py-2 font-mono text-[11px] tracking-[0.14em] uppercase opacity-90">
        <span>{label}</span>
      </div>
      <div className="py-2 text-sm leading-7 text-foreground/95">{children}</div>
    </div>
  );
}

function TypographyInlineCode({ children }: { children: ReactNode }) {
  return <SharedTypographyInlineCode className="font-mono text-[0.8rem]">{children}</SharedTypographyInlineCode>;
}

function VideoPlayer({ src, title }: { src: string; title?: string }) {
  if (!src) {
    return null;
  }

  return (
    <div className="my-4 overflow-hidden rounded-lg border border-line">
      <video controls className="h-auto w-full" src={src} title={title} />
    </div>
  );
}

type NumericalTableProps = {
  data?: Array<Array<string | number>>;
  children?: ReactNode;
};

function NumericalTable({ data, children }: NumericalTableProps) {
  const rows = Array.isArray(data) ? data : [];

  if (rows.length === 0) {
    return children ? <div className="my-4">{children}</div> : null;
  }

  return (
    <div className="my-4 overflow-x-auto">
      <table className="w-full min-w-max border-collapse border border-line text-xs">
        <tbody>
          {rows.map((row, rowIndex) => (
            <tr key={`row-${rowIndex}`}>
              {row.map((cell, cellIndex) => (
                <td key={`cell-${rowIndex}-${cellIndex}`} className="border border-line px-2 py-1.5 font-mono">
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function InlineCode({ children }: { children: ReactNode }) {
  return <SharedTypographyInlineCode className="font-mono text-[0.8rem]">{children}</SharedTypographyInlineCode>;
}

type CodeElementProps = {
  children?: ReactNode;
  className?: string;
};

function extractLanguage(className?: string): string | null {
  if (!className) {
    return null;
  }

  const match = className.match(/language-([a-z0-9+#-]+)/i);
  return match?.[1]?.toUpperCase() ?? null;
}

function CodeBlock({ children, className }: CodeElementProps) {
  const language = extractLanguage(className);

  return (
    <code className="block border border-line bg-muted/25">
      <span className="flex items-center justify-between border-b border-line px-3 py-1.5 font-mono text-[10px] tracking-[0.12em] uppercase text-muted-foreground">
        <span>{language ?? "CODE"}</span>
      </span>
      <span className="block overflow-x-auto px-3 py-2 font-mono text-xs leading-6 text-foreground">{children}</span>
    </code>
  );
}

function Code({ children, className }: CodeElementProps) {
  if (className && className.includes("language-")) {
    return <CodeBlock className={className}>{children}</CodeBlock>;
  }

  return <InlineCode>{children}</InlineCode>;
}

export const postMdxComponents = {
  h1: ({ children }: { children: ReactNode }) => <TypographyH3 className="mt-8 mb-3">{children}</TypographyH3>,
  h2: ({ children }: { children: ReactNode }) => (
    <h2 className="mt-8 mb-3 text-2xl leading-tight font-semibold tracking-tight">{children}</h2>
  ),
  h3: ({ children }: { children: ReactNode }) => (
    <h3 className="mt-6 mb-2 text-xl leading-tight font-medium tracking-tight">{children}</h3>
  ),
  p: ({ children }: { children: ReactNode }) => <p className="my-3 text-sm leading-7 text-foreground/95">{children}</p>,
  blockquote: ({ children }: { children: ReactNode }) => (
    <blockquote className="my-4 border-l-2 border-line pl-4 text-sm text-muted-foreground">{children}</blockquote>
  ),
  ul: ({ children }: { children: ReactNode }) => <ul className="my-4 ml-6 list-disc space-y-2 text-sm leading-7">{children}</ul>,
  ol: ({ children }: { children: ReactNode }) => <ol className="my-4 ml-6 list-decimal space-y-2 text-sm leading-7">{children}</ol>,
  a: ({ children, href }: { children: ReactNode; href?: string }) => {
    const safeHref = href ?? "#";
    const isExternal = /^https?:\/\//i.test(safeHref);

    if (isExternal) {
      return (
        <a
          href={safeHref}
          target="_blank"
          rel="noreferrer noopener"
          className="underline decoration-muted-foreground/60 underline-offset-4 transition-colors hover:text-foreground"
        >
          {children}
        </a>
      );
    }

    return (
      <Link
        href={safeHref}
        className="underline decoration-muted-foreground/60 underline-offset-4 transition-colors hover:text-foreground"
      >
        {children}
      </Link>
    );
  },
  img: ({ src, alt }: { src?: string; alt?: string }) => (
    !src ? null : <PostLightboxImage src={src} alt={alt ?? "image"} width={1200} height={800} />
  ),
  code: Code,
  pre: ({ children }: { children: ReactNode }) => <pre className="my-4 overflow-x-auto">{children}</pre>,

  // Legacy MDX component compatibility with new style mapping.
  Link: ({ children, href, className, ...props }: { children?: ReactNode; href?: string; className?: string; [key: string]: unknown }) => {
    const safeHref = href ?? "#";
    const isExternal = /^https?:\/\//i.test(safeHref);

    if (isExternal) {
      return (
        <a
          href={safeHref}
          className={className ?? "underline decoration-muted-foreground/60 underline-offset-4 transition-colors hover:text-foreground"}
          target={(props.target as string) ?? "_blank"}
          rel={(props.rel as string) ?? "noreferrer noopener"}
        >
          {children}
        </a>
      );
    }

    return (
      <Link
        href={safeHref}
        className={className ?? "underline decoration-muted-foreground/60 underline-offset-4 transition-colors hover:text-foreground"}
      >
        {children}
      </Link>
    );
  },
  Callout,
  OrderedList,
  UnorderedList,
  NumericalTable,
  TypographyInlineCode,
  VideoPlayer,
  Image: ({ src, alt, width, height, caption }: { src?: string; alt?: string; width?: number; height?: number; caption?: string }) =>
    !src ? null : <PostLightboxImage src={src} alt={alt ?? "image"} width={width} height={height} caption={caption} />,
};
