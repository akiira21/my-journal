import { cn } from "@/lib/utils";

interface TypographyProps {
  text: String;
  className?: string;
}

const TypographyH1 = ({ text, className }: TypographyProps) => {
  return (
    <h1
      className={cn(
        "scroll-m-20 text-4xl tracking-tight lg:text-5xl",
        className
      )}
    >
      {text}
    </h1>
  );
};

const TypographyH2 = ({ text, className }: TypographyProps) => {
  return (
    <h2 className={cn("scroll-m-20 pb-2 text-3xl tracking-tight", className)}>
      {text}
    </h2>
  );
};

const TypographyH3 = ({ text, className }: TypographyProps) => {
  return (
    <h3 className={cn("scroll-m-20 text-2xl tracking-tight", className)}>
      {text}
    </h3>
  );
};

const TypographyH4 = ({ text, className }: TypographyProps) => {
  return (
    <h4 className={cn("scroll-m-20 text-xl tracking-tight", className)}>
      {text}
    </h4>
  );
};

const TypographyP = ({ text, className }: TypographyProps) => {
  return <p className={cn("leading-7", className)}>{text}</p>;
};

const TypographyBlockquote = ({ text, className }: TypographyProps) => {
  return (
    <blockquote className={cn("mt-6 border-l-2 pl-4 italic", className)}>
      {text}
    </blockquote>
  );
};

const TypographyInlineCode = ({ text, className }: TypographyProps) => {
  return (
    <code
      className={cn(
        "relative rounded-md inline-block border bg-muted font-mono mx-1 text-sm p-1 text-[#3E69F4] bg-[#F6F9FE]",
        className
      )}
    >
      {text}
    </code>
  );
};

const TypographyMono = ({ text, className }: TypographyProps) => {
  return <p className={cn("font-mono", className)}>{text}</p>;
};

const TypographyLarge = ({ className, text }: TypographyProps) => {
  return <p className={cn("text-lg font-semibold", className)}>{text}</p>;
};

const TypographySmall = ({ className, text }: TypographyProps) => {
  return (
    <p className={cn("text-sm font-medium leading-none", className)}>{text}</p>
  );
};

const TypographyMuted = ({ text, className }: TypographyProps) => {
  return (
    <p className={cn("text-sm text-muted-foreground", className)}>{text}</p>
  );
};

const TypographyTextGradient = ({ text, className }: TypographyProps) => {
  return (
    <p
      className={cn(
        "bg-gradient-to-r from-fuchsia-400 via-indigo-300 to-primary text-transparent bg-clip-text inline-block",
        className
      )}
    >
      {text}
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
