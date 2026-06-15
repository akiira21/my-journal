import type { ReactNode } from "react";

export const skillMdxComponents = {
  p: ({ children }: { children: ReactNode }) => (
    <p className="text-sm text-muted-foreground leading-relaxed">
      {children}
    </p>
  ),
  strong: ({ children }: { children: ReactNode }) => (
    <strong className="text-foreground">{children}</strong>
  ),
  ul: ({ children }: { children: ReactNode }) => (
    <ul className="list-disc pl-4 space-y-1 text-muted-foreground">
      {children}
    </ul>
  ),
  ol: ({ children }: { children: ReactNode }) => (
    <ol className="list-decimal pl-4 space-y-1 text-muted-foreground">
      {children}
    </ol>
  ),
  li: ({ children }: { children: ReactNode }) => (
    <li className="text-sm text-muted-foreground leading-relaxed">{children}</li>
  ),
  code: ({ children }: { children: ReactNode }) => (
    <code className="text-xs bg-muted/60 px-1 rounded text-foreground/90">
      {children}
    </code>
  ),
  h2: ({ children }: { children: ReactNode }) => (
    <h2 className="text-sm font-pixel leading-snug tracking-tight text-foreground/90 mt-6 mb-2">
      {children}
    </h2>
  ),
  h3: ({ children }: { children: ReactNode }) => (
    <h3 className="text-xs font-pixel leading-snug tracking-tight text-muted-foreground mt-4 mb-1">
      {children}
    </h3>
  ),
  blockquote: ({ children }: { children: ReactNode }) => (
    <blockquote className="border-l-2 border-line pl-3 py-1 my-3 text-sm italic text-muted-foreground/80">
      {children}
    </blockquote>
  ),
  hr: () => (
    <div className="my-4 border-t border-line/50" aria-hidden="true" />
  ),
  a: ({ children, href }: { children: ReactNode; href?: string }) => {
    const safeHref = href ?? "#";
    const isExternal = /^https?:\/\//i.test(safeHref);
    if (isExternal) {
      return (
        <a
          href={safeHref}
          target="_blank"
          rel="noreferrer noopener"
          className="text-primary underline underline-offset-4 decoration-primary/30 hover:decoration-primary transition-all font-medium"
        >
          {children}
        </a>
      );
    }
    return (
      <a href={safeHref} className="text-primary underline underline-offset-4 decoration-primary/30 hover:decoration-primary transition-all font-medium">
        {children}
      </a>
    );
  },
};
