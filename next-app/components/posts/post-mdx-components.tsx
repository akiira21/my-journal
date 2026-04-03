import type { ReactNode } from "react";
import Link from "next/link";

import { PostLightboxImage } from "@/components/posts/post-lightbox-image";
import { Code } from "@/components/posts/code-block";
import { TypographyH3, TypographyInlineCode as SharedTypographyInlineCode } from "@/components/typography";

type OrderedListProps = {
  items?: Array<string | number>;
  children?: ReactNode;
};

function OrderedList({ items, children }: OrderedListProps) {
  const normalizedItems = Array.isArray(items) ? items : [];

  return (
    <div className="my-4 border border-line rounded-md overflow-hidden">
      <ol className="divide-y divide-line">
        {normalizedItems.length > 0
          ? normalizedItems.map((item, index) => (
              <li key={`ordered-${index}-${String(item)}`} className="flex items-start gap-3 px-4 py-3 text-sm leading-6">
                <span className="flex-shrink-0 w-6 h-6 flex items-center justify-center rounded bg-muted font-mono text-xs font-medium text-muted-foreground">
                  {index + 1}
                </span>
                <span className="text-foreground/90 pt-0.5">{item}</span>
              </li>
            ))
          : children}
      </ol>
    </div>
  );
}

type UnorderedListProps = {
  items?: Array<string | number>;
  children?: ReactNode;
};

function UnorderedList({ items, children }: UnorderedListProps) {
  const normalizedItems = Array.isArray(items) ? items : [];

  return (
    <div className="my-4 border border-line rounded-md overflow-hidden">
      <ul className="divide-y divide-line">
        {normalizedItems.length > 0
          ? normalizedItems.map((item, index) => (
              <li key={`unordered-${index}-${String(item)}`} className="flex items-start gap-3 px-4 py-3 text-sm leading-6">
                <span className="flex-shrink-0 w-1.5 h-1.5 mt-2 rounded-full bg-primary/60" />
                <span className="text-foreground/90">{item}</span>
              </li>
            ))
          : children}
      </ul>
    </div>
  );
}

type CalloutProps = {
  type?: "info" | "warning" | "success" | "error";
  title?: string;
  children?: ReactNode;
};

function Callout({ type = "info", title, children }: CalloutProps) {
  const styles = {
    info: {
      border: "border-l-blue-500",
      bg: "bg-blue-500/5",
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
    },
    warning: {
      border: "border-l-amber-500",
      bg: "bg-amber-500/5",
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
      ),
    },
    success: {
      border: "border-l-emerald-500",
      bg: "bg-emerald-500/5",
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
    },
    error: {
      border: "border-l-rose-500",
      bg: "bg-rose-500/5",
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
    },
  }[type];

  const label = title ?? type.charAt(0).toUpperCase() + type.slice(1);

  return (
    <div className={`my-6 border border-line border-l-4 ${styles.border} ${styles.bg} rounded-r-md`}>
      <div className="flex items-center gap-2 px-4 py-2 border-b border-line/50 bg-background/50">
        <span className="text-muted-foreground">{styles.icon}</span>
        <span className="font-mono text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
          {label}
        </span>
      </div>
      <div className="px-4 py-3 text-sm leading-6 text-foreground/90">
        {children}
      </div>
    </div>
  );
}

function TypographyInlineCode({ children }: { children: ReactNode }) {
  return (
    <code className="px-1.5 py-0.5 mx-0.5 font-mono text-xs bg-muted border border-line rounded text-foreground/90">
      {children}
    </code>
  );
}

function VideoPlayer({ src, title }: { src: string; title?: string }) {
  if (!src) {
    return null;
  }

  return (
    <div className="my-6 border border-line">
      <div className="flex items-center justify-between px-3 py-2 border-b border-line bg-muted/40">
        <span className="font-mono text-[11px] uppercase tracking-wider text-muted-foreground">
          Video
        </span>
        {title && (
          <span className="text-xs text-muted-foreground truncate max-w-[200px]">
            {title}
          </span>
        )}
      </div>
      <video controls className="h-auto w-full" src={src} title={title} />
    </div>
  );
}

type NumericalTableProps = {
  data?: Array<Array<string | number>>;
  children?: ReactNode;
  headers?: Array<string>;
};

function NumericalTable({ data, children, headers }: NumericalTableProps) {
  const rows = Array.isArray(data) ? data : [];

  if (rows.length === 0) {
    return children ? <div className="my-4">{children}</div> : null;
  }

  return (
    <div className="my-6 overflow-x-auto border border-line rounded-md">
      <table className="w-full text-sm">
        {headers && headers.length > 0 && (
          <thead>
            <tr className="bg-muted/50 border-b border-line">
              {headers.map((header, index) => (
                <th
                  key={`header-${index}`}
                  className="px-4 py-2.5 text-left font-mono text-xs font-medium uppercase tracking-wider text-muted-foreground"
                >
                  {header}
                </th>
              ))}
            </tr>
          </thead>
        )}
        <tbody className="divide-y divide-line">
          {rows.map((row, rowIndex) => (
            <tr key={`row-${rowIndex}`} className="hover:bg-muted/30 transition-colors">
              {row.map((cell, cellIndex) => (
                <td
                  key={`cell-${rowIndex}-${cellIndex}`}
                  className={`px-4 py-3 ${cellIndex === 0 ? "font-mono text-xs" : "text-foreground/90"}`}
                >
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



// Generate ID from heading text
function generateId(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-");
}

// Get text content from React children
function getTextContent(children: ReactNode): string {
  if (typeof children === "string") return children;
  if (Array.isArray(children)) {
    return children.map(getTextContent).join("");
  }
  return "";
}

export const postMdxComponents = {
  h1: ({ children }: { children: ReactNode }) => {
    const id = generateId(getTextContent(children));
    return (
      <TypographyH3 id={id} className="mt-10 mb-4 pb-2 border-b border-line">
        {children}
      </TypographyH3>
    );
  },
  h2: ({ children }: { children: ReactNode }) => {
    const id = generateId(getTextContent(children));
    return (
      <h2 id={id} className="mt-10 mb-4 text-xl leading-tight font-semibold tracking-tight pb-2 border-b border-line">
        {children}
      </h2>
    );
  },
  h3: ({ children }: { children: ReactNode }) => {
    const id = generateId(getTextContent(children));
    return (
      <h3 id={id} className="mt-8 mb-3 text-lg leading-tight font-medium tracking-tight text-foreground/90">
        {children}
      </h3>
    );
  },
  p: ({ children }: { children: ReactNode }) => (
    <p className="my-4 text-sm leading-7 text-foreground/90">
      {children}
    </p>
  ),
  blockquote: ({ children }: { children: ReactNode }) => (
    <blockquote className="my-6 border-l-4 border-primary/30 bg-muted/30 pl-4 pr-4 py-3 text-sm text-foreground/80 italic">
      {children}
    </blockquote>
  ),
  ul: ({ children }: { children: ReactNode }) => (
    <ul className="my-4 ml-5 space-y-2 text-sm leading-7">
      {children}
    </ul>
  ),
  ol: ({ children }: { children: ReactNode }) => (
    <ol className="my-4 ml-5 space-y-2 text-sm leading-7">
      {children}
    </ol>
  ),
  li: ({ children }: { children: ReactNode }) => (
    <li className="flex items-start gap-2">
      <span className="mt-2 w-1 h-1 rounded-full bg-primary/60 flex-shrink-0" />
      <span className="text-foreground/90">{children}</span>
    </li>
  ),
  hr: () => <div className="my-8 border-t border-line" />,
  a: ({ children, href }: { children: ReactNode; href?: string }) => {
    const safeHref = href ?? "#";
    const isExternal = /^https?:\/\//i.test(safeHref);

    const linkClassName = "text-primary underline underline-offset-4 decoration-primary/30 hover:decoration-primary transition-all font-medium";

    if (isExternal) {
      return (
        <a
          href={safeHref}
          target="_blank"
          rel="noreferrer noopener"
          className={linkClassName}
        >
          {children}
          <svg className="inline-block w-3 h-3 ml-0.5 -mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
          </svg>
        </a>
      );
    }

    return (
      <Link href={safeHref} className={linkClassName}>
        {children}
      </Link>
    );
  },
  img: ({ src, alt, width, height, className }: { src?: string; alt?: string; width?: number; height?: number; className?: string }) => {
    if (!src) return null;
    // Handle both string and expression formats
    const srcString = typeof src === "string" ? src : String(src);
    const altString = alt ?? "image";
    const widthNum = typeof width === "number" ? width : 1200;
    const heightNum = typeof height === "number" ? height : 800;
    return <PostLightboxImage src={srcString} alt={altString} width={widthNum} height={heightNum} />;
  },
  code: Code,
  pre: ({ children }: { children: ReactNode }) => <pre className="my-4 overflow-x-auto">{children}</pre>,

  // Legacy MDX component compatibility with new style mapping.
  Link: ({ children, href, className, ...props }: { children?: ReactNode; href?: string; className?: string; [key: string]: unknown }) => {
    const safeHref = href ?? "#";
    const isExternal = /^https?:\/\//i.test(safeHref);
    const defaultClass = "text-primary underline underline-offset-4 decoration-primary/30 hover:decoration-primary transition-all font-medium";

    if (isExternal) {
      return (
        <a
          href={safeHref}
          className={className ?? defaultClass}
          target={(props.target as string) ?? "_blank"}
          rel={(props.rel as string) ?? "noreferrer noopener"}
        >
          {children}
        </a>
      );
    }

    return (
      <Link href={safeHref} className={className ?? defaultClass}>
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
