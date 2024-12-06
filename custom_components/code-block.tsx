"use client";

import React from "react";
import { Highlight, Prism, themes } from "prism-react-renderer";
import { cn } from "@/lib/utils";
import { IconButton } from "./buttons/buttons";
import { Check, Copy } from "lucide-react";

interface CodeBlockProps {
  codeString: string;
  language: string;
  metastring?: string;
  title?: string;
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
}) => {
  const [copied, setCopied] = React.useState(false);
  const highlightLine = calculateLinesToHighlight(metastring);

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
    <div className="w-full border rounded-md">
      {title && (
        <div className="flex items-center justify-between rounded-t-lg border border-b bg-[#f6f9fe] px-4 py-2">
          <h3 className="text-sm font-medium text-gray-900">{title}</h3>
          <button onClick={handleClick}>
            <IconButton className="hover:shadow-[0_0_16px_rgba(59,130,246,0.6)]">
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
        theme={themes.vsLight}
        prism={Prism}
        code={codeString}
        language={language}
      >
        {({ className, style, tokens, getLineProps, getTokenProps }) => (
          <pre
            className={cn(
              "overflow-x-auto p-4 bg-[#f6f9fe] font-mono text-sm",
              !title && "rounded-lg",
              title && "rounded-b-lg",
              className
            )}
            style={style}
          >
            {tokens.map((line, i) => {
              const isHighlighted = highlightLine(i);
              return (
                <div
                  key={i}
                  {...getLineProps({ line, key: i })}
                  className={cn(
                    "flex",
                    isHighlighted && "bg-blue-100 -mx-4 px-4"
                  )}
                >
                  <span className="mr-4 select-none text-gray-400">
                    {String(i + 1).padStart(2, " ")}
                  </span>
                  <span>
                    {line.map((token, key) => (
                      <span key={key} {...getTokenProps({ token, key })} />
                    ))}
                  </span>
                </div>
              );
            })}
          </pre>
        )}
      </Highlight>
    </div>
  );
};

export default CodeBlock;
