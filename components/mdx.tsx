import { TypographyH4, TypographyP } from "@/custom_components/typography";
import { MDXRemote } from "next-mdx-remote/rsc";

interface CustomMdxProps {
  source: any;
  components?: any;
}

let components = {
  h1: ({ children }: { children: React.ReactNode }) => (
    <TypographyH4 className="text-lg my-2 text-zinc-800 dark:text-zinc-300">
      {children}
    </TypographyH4>
  ),
  p: ({ children }: { children: React.ReactNode }) => (
    <TypographyP className="text-sm my-1 text-zinc-700 leading-relaxed tracking-wide dark:text-zinc-400">
      {children}
    </TypographyP>
  ),
};

export default function CustomMdx(props: CustomMdxProps) {
  return (
    <MDXRemote
      {...props}
      components={{ ...components, ...(props.components || {}) }}
    />
  );
}
