import { cn } from "@/lib/utils";
import React from "react";

interface TypographyProps {
  children: React.ReactNode;
  className?: string;
  id?: string;
}

const TypographyH1 = ({ children, className }: TypographyProps) => {
  return (
    <h1
      className={cn(
        "scroll-m-20 text-4xl tracking-tight lg:text-5xl",
        className
      )}
    >
      {children}
    </h1>
  );
};

const TypographyH2 = ({ children, className }: TypographyProps) => {
  return (
    <h2 className={cn("scroll-m-20 pb-2 text-3xl tracking-tight", className)}>
      {children}
    </h2>
  );
};

const TypographyH3 = ({ children, className }: TypographyProps) => {
  return (
    <h3 className={cn("scroll-m-20 text-2xl tracking-tight", className)}>
      {children}
    </h3>
  );
};

const TypographyH4 = ({ children, className, id }: TypographyProps) => {
  return (
    <h4 className={cn("scroll-m-20 text-xl tracking-tight", className)} id={id}>
      {children}
    </h4>
  );
};

const TypographyP = ({ children, className }: TypographyProps) => {
  return <div className={cn("leading-7", className)}>{children}</div>;
};

const TypographyBlockquote = ({ children, className }: TypographyProps) => {
  return (
    <blockquote className={cn("mt-6 border-l-2 pl-4 italic", className)}>
      {children}
    </blockquote>
  );
};

const TypographyInlineCode = ({ children, className }: TypographyProps) => {
  return (
    <code
      className={cn(
        "relative rounded-md inline-block border bg-[#f8f9fd] dark:bg-[#0f1117] font-mono mx-1 text-sm p-1 text-[#3E69F4]",
        className
      )}
    >
      {children}
    </code>
  );
};

const TypographyMono = ({ children, className }: TypographyProps) => {
  return <p className={cn("font-mono", className)}>{children}</p>;
};

const TypographyLarge = ({ className, children }: TypographyProps) => {
  return <p className={cn("text-lg font-semibold", className)}>{children}</p>;
};

const TypographySmall = ({ className, children }: TypographyProps) => {
  return (
    <p className={cn("text-sm font-medium leading-none", className)}>
      {children}
    </p>
  );
};

const TypographyMuted = ({ children, className }: TypographyProps) => {
  return (
    <p className={cn("text-sm text-muted-foreground", className)}>{children}</p>
  );
};

const TypographyTextGradient = ({ children, className }: TypographyProps) => {
  return (
    <p
      className={cn(
        "bg-gradient-to-r from-fuchsia-400 via-indigo-300 to-primary text-transparent bg-clip-text inline-block",
        className
      )}
    >
      {children}
    </p>
  );
};

export {
  TypographyH1,
  TypographyH2,
  TypographyH3,
  TypographyH4,
  TypographyP,
  TypographyBlockquote,
  TypographyInlineCode,
  TypographyLarge,
  TypographySmall,
  TypographyMuted,
  TypographyMono,
  TypographyTextGradient,
};
