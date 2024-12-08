"use client";

import React, { useState } from "react";
import { Highlight, Prism } from "prism-react-renderer";
import { Check, Copy } from "lucide-react";

import { IconButton } from "./buttons/buttons";

interface CodeBlockProps {
  codeString: string;
  language: string;
  metastring?: string;
  title?: string;
  highlightedLines?: number[]; // New prop for highlighted lines
}

const calculateLinesToHighlight = (meta?: string) => {
  if (!meta) return () => false;
  const regex = /{([\d,-]+)}/;
  const match = regex.exec(meta);
  if (!match) return () => false;

  const lineNumbers = match[1]
    .split(",")
    .flatMap((line) =>
      line.includes("-")
        ? Array.from(
            { length: +line.split("-")[1] - +line.split("-")[0] + 1 },
            (_, i) => +line.split("-")[0] + i
          )
        : [+line]
    );
  return (index: number) => lineNumbers.includes(index + 1);
};

const CodeBlock: React.FC<CodeBlockProps> = ({
  codeString,
  language,
  metastring,
  title,
  highlightedLines = [], // Default to empty array
}) => {
  const [copied, setCopied] = React.useState(false);
  const [hoveredLine, setHoveredLine] = useState<number | null>(null);
  const metaHighlight = calculateLinesToHighlight(metastring);

  const isLineHighlighted = (index: number) => {
    return metaHighlight(index) || highlightedLines.includes(index + 1);
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(codeString);
      setCopied(true);
      setTimeout(() => setCopied(false), 5000);
    } catch (err) {
      console.error("Failed to copy code:", err);
    }
  };

  const handleClick = () => {
    copyToClipboard();
    setCopied(true);
    setTimeout(() => setCopied(false), 5000);
  };

  return (
    <div className="w-full border rounded-lg">
      {title && (
        <div className="flex items-center justify-between rounded-t-lg border border-b bg-background px-4 py-2">
          <h3 className="text-sm font-medium text-muted-foreground">{title}</h3>
          <button onClick={handleClick}>
            <IconButton className="hover:shadow-[0_0_16px_rgba(59,130,246,0.5)]">
              {copied ? (
                <Check
                  size={16}
                  className="text-green-500 transition-all duration-300"
                />
              ) : (
                <Copy size={16} />
              )}
            </IconButton>
          </button>
        </div>
      )}
      <Highlight
        theme={{
          plain: {},
          styles: [
            {
              types: ["prolog", "doctype", "cdata", "punctuation"],
              style: {
                color: "#4A72F4",
              },
            },
            {
              types: ["comment"],
              style: {
                color: "#6A737D",
              },
            },
            {
              types: ["namespace"],
              style: {
                opacity: 0.7,
              },
            },
            {
              types: ["string", "attr-value"],
              style: {
                color: "#4A72F4",
              },
            },
            {
              types: ["entity", "url"],
              style: {
                color: "#0550ae",
              },
            },
            {
              types: [
                "symbol",
                "number",
                "boolean",
                "variable",
                "constant",
                "property",
                "regex",
                "inserted",
              ],
              style: {
                color: "#116329",
              },
            },
            {
              types: ["atrule", "keyword", "attr-name"],
              style: {
                color: "#4A72F4",
              },
            },
            {
              types: ["function", "deleted", "tag"],
              style: {
                color: "#CF0082",
              },
            },
            {
              types: ["function-variable"],
              style: {
                color: "#953800",
              },
            },
            {
              types: ["tag", "selector"],
              style: {
                color: "#116329",
              },
            },
          ],
        }}
        prism={Prism}
        code={codeString}
        language={language}
      >
        {({ className, style, tokens, getLineProps, getTokenProps }) => (
          <div className="relative">
            <pre
              className={`overflow-x-auto bg-[#f6f9fe] dark:bg-[#0f1117] py-2 font-mono text-sm ${
                !title ? "rounded-lg" : "rounded-b-lg"
              }`}
              style={style}
            >
              {tokens.map((line, i) => {
                const isHighlighted = isLineHighlighted(i);
                const isHovered = hoveredLine === i;
                return (
                  <div
                    key={i}
                    {...getLineProps({ line, key: i })}
                    onMouseEnter={() => setHoveredLine(i)}
                    onMouseLeave={() => setHoveredLine(null)}
                    className="relative"
                  >
                    {/* Background div for full-width highlighting */}
                    <div
                      className={`absolute left-0 right-0 transition-colors duration-150 h-full ${
                        isHighlighted
                          ? "bg-[#ECF1FD] dark:bg-[#141926] border-l-2 border-[#3B82F6]"
                          : isHovered
                          ? "bg-[#ECF1FD] dark:bg-[#141926] "
                          : ""
                      }`}
                    />
                    {/* Content div */}
                    <div className="flex relative z-10 h-6">
                      <span className="select-none mr-2 text-gray-600 text-right px-4">
                        {String(i + 1)}
                      </span>
                      <span>
                        {line.map((token, key) => (
                          <span key={key} {...getTokenProps({ token, key })} />
                        ))}
                      </span>
                    </div>
                  </div>
                );
              })}
            </pre>
          </div>
        )}
      </Highlight>
    </div>
  );
};

export default CodeBlock;
