import {
  BackwardAnchor,
  ForwardAnchor,
  PageAnchor,
} from "@/custom_components/anchor";
import { Callout } from "@/custom_components/callouts";
import CodeBlock from "@/custom_components/code-block";
import LightboxImage from "@/custom_components/Image";
import { OrderedList, UnorderedList } from "@/custom_components/list";
import NumericalTable from "@/custom_components/numerical-table";
import {
  TypographyBlockquote,
  TypographyH4,
  TypographyP,
} from "@/custom_components/typography";
import Image from "next/image";
import Link from "next/link";
import { ReactNode } from "react";
import { TypographyInlineCode } from "@/custom_components/typography";
import VideoPlayer from "@/custom_components/video-player";

interface CodeProps {
  children: ReactNode;
  className?: string;
  metastring?: string;
  title?: string;
}

// Utility function to parse metadata from metastring
const parseMetadata = (metastring?: string) => {
  if (!metastring) return { title: undefined, highlights: [] };

  // Extract title
  const titleMatch =
    metastring.match(/title="([^"]*)"/) ||
    metastring.match(/title='([^']*)'/) ||
    metastring.match(/title=([^\s]*)/);
  const title = titleMatch ? titleMatch[1] : undefined;

  // Extract highlighted lines
  const highlights = metastring
    .split(" ")
    .filter((str) => str.startsWith("{") && str.endsWith("}"))
    .map((str) => str.slice(1, -1))
    .flatMap((range) => {
      if (range.includes("-")) {
        const [start, end] = range.split("-").map(Number);
        return Array.from({ length: end - start + 1 }, (_, i) => start + i);
      }
      return [Number(range)];
    });

  return { title, highlights };
};

// Component for inline code
const InlineCode: React.FC<{ children: ReactNode }> = ({ children }) => (
  <code className="bg-zinc-100 dark:bg-zinc-800 px-1 py-0.5 rounded text-sm">
    {children}
  </code>
);

// Component for code blocks
const CodeBlockWrapper: React.FC<CodeProps> = ({
  children,
  className,
  metastring,
}) => {
  const language = className?.replace("language-", "");
  const { title, highlights } = parseMetadata(metastring);

  return (
    <div className="my-4">
      <CodeBlock
        codeString={(children as string)?.trim() || ""}
        language={language || ""}
        metastring={metastring}
        title={title}
        highlightedLines={highlights}
      />
    </div>
  );
};

const Heading: React.FC<{ children: ReactNode }> = ({ children }) => {
  const id = children
    ?.toString()
    .toLowerCase()
    .replace(/[^\w\s-]/g, "") // Remove special characters
    .replace(/\s+/g, "-") // Replace spaces with hyphens
    .replace(/-+/g, "-") // Remove consecutive hyphens
    .trim();
  return (
    <TypographyH4
      id={id}
      className="text-lg my-4 text-zinc-800 dark:text-zinc-300 content-heading"
    >
      {children}
    </TypographyH4>
  );
};

const Paragraph: React.FC<{ children: ReactNode }> = ({ children }) => (
  <TypographyP className="text-zinc-700 leading-relaxed tracking-wide dark:text-zinc-400">
    {children}
  </TypographyP>
);

const Blockquote: React.FC<{ children: ReactNode }> = ({ children }) => (
  <TypographyBlockquote className="my-2">{children}</TypographyBlockquote>
);

const Code = ({ children }: { children: any }) => {
  const { props } = children;
  const language = props?.className?.replace("language-", "");

  return language ? (
    <CodeBlockWrapper {...props} />
  ) : (
    <InlineCode>{props.children}</InlineCode>
  );
};

const MdxImage = (props: any) => {
  return (
    <div className="my-4">
      <LightboxImage
        src={props.src}
        alt={props.alt}
        width={props.width || 800}
        height={props.height || 400}
      />
    </div>
  );
};

// MDX components mapping
export const mdxComponents = {
  h1: Heading,
  p: Paragraph,
  pre: Code,
  img: MdxImage,
  blockquote: Blockquote,
  NumericalTable,
  OrderedList,
  UnorderedList,
  Callout,
  Link,
  ForwardAnchor,
  PageAnchor,
  BackwardAnchor,
  Image,
  TypographyInlineCode,
  VideoPlayer
};
