"use client";
import React, { useState } from "react";
import { Highlight, Prism } from "prism-react-renderer";
import { Check, Copy } from 'lucide-react';

interface CodeBlockProps {
  codeString: string;
  language: string;
  metastring?: string;
  title?: string;
  highlightedLines?: number[];
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
  highlightedLines = [],
}) => {
  const [copied, setCopied] = React.useState(false);
  const metaHighlight = calculateLinesToHighlight(metastring);
  
  const isLineHighlighted = (index: number) => {
    return metaHighlight(index) || highlightedLines.includes(index + 1);
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(codeString);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy code:", err);
    }
  };

  const handleClick = () => {
    copyToClipboard();
  };

  return (
    <div className="w-full border border-border bg-card rounded-lg overflow-hidden shadow-sm">
      {title && (
        <div className="flex items-center justify-between border-b border-border bg-muted px-4 py-3">
          <h3 className="text-sm font-medium text-muted-foreground font-mono">{title}</h3>
          <button
            onClick={handleClick}
            className="p-2 text-muted-foreground hover:text-foreground transition-colors rounded-md hover:bg-accent"
            aria-label={copied ? "Copied!" : "Copy code"}
          >
            {copied ? (
              <Check size={16} className="text-green-600 dark:text-green-400" />
            ) : (
              <Copy size={16} />
            )}
          </button>
        </div>
      )}
      <Highlight
        theme={{
          plain: {
            color: "hsl(var(--foreground))",
            backgroundColor: "hsl(var(--card))",
          },
          styles: [
            // Comments - muted
            {
              types: ["comment", "prolog", "doctype", "cdata"],
              style: {
                color: "hsl(var(--muted-foreground))",
                fontStyle: "italic",
              },
            },
            {
              types: ["namespace"],
              style: {
                opacity: 0.7,
              },
            },
            // Strings - green
            {
              types: ["string", "attr-value"],
              style: {
                color: "#16a34a", // green-600
              },
            },
            // Punctuation and operators
            {
              types: ["punctuation", "operator"],
              style: {
                color: "hsl(var(--foreground))",
              },
            },
            // Numbers, booleans, constants - blue
            {
              types: ["entity", "url", "symbol", "number", "boolean", "variable", "constant", "property", "regex", "inserted"],
              style: {
                color: "#2563eb", // blue-600
              },
            },
            // Keywords - darker blue
            {
              types: ["atrule", "keyword", "attr-name"],
              style: {
                color: "#1d4ed8", // blue-700
              },
            },
            // Functions - purple
            {
              types: ["function", "deleted", "tag"],
              style: {
                color: "#9333ea", // purple-600
              },
            },
            {
              types: ["function-variable"],
              style: {
                color: "#9333ea", // purple-600
              },
            },
            // Tags and selectors - teal
            {
              types: ["tag", "selector"],
              style: {
                color: "#0d9488", // teal-600
              },
            },
          ],
        }}
        prism={Prism}
        code={codeString}
        language={language}
      >
        {({ style, tokens, getLineProps, getTokenProps }) => (
          <pre
            className="p-2 font-mono text-sm leading-relaxed whitespace-pre-wrap break-words bg-card text-card-foreground"
            style={{
              backgroundColor: "transparent",
            }}
          >
            {tokens.map((line, lineIndex) => {
              const isHighlighted = isLineHighlighted(lineIndex);
              const { key, ...lineProps } = getLineProps({
                line,
                key: lineIndex,
              });
              
              return (
                <div
                  key={`line-${lineIndex}`}
                  {...lineProps}
                  className={`rounded-sm ${
                    isHighlighted
                      ? "bg-blue-50 dark:bg-blue-950/30 border-l-2 border-blue-500 dark:border-blue-400 pl-2 -ml-2"
                      : ""
                  }`}
                >
                  <span className="select-none inline-block w-8 text-right text-muted-foreground mr-4 text-xs">
                    {String(lineIndex + 1)}
                  </span>
                  <span className="inline">
                    {line.map((token, tokenIndex) => {
                      const { key: tokenKey, ...tokenProps } = getTokenProps({
                        token,
                        key: tokenIndex,
                      });
                      
                      // Enhanced dark mode colors
                      const getDarkModeColor = (tokenTypes: string[]) => {
                        if (tokenTypes.includes('comment') || tokenTypes.includes('prolog') || tokenTypes.includes('doctype') || tokenTypes.includes('cdata')) {
                          return '#9ca3af'; // gray-400
                        }
                        if (tokenTypes.includes('string') || tokenTypes.includes('attr-value')) {
                          return '#22c55e'; // green-500
                        }
                        if (tokenTypes.includes('number') || tokenTypes.includes('boolean') || tokenTypes.includes('constant') || tokenTypes.includes('variable') || tokenTypes.includes('property')) {
                          return '#3b82f6'; // blue-500
                        }
                        if (tokenTypes.includes('keyword') || tokenTypes.includes('atrule') || tokenTypes.includes('attr-name')) {
                          return '#60a5fa'; // blue-400
                        }
                        if (tokenTypes.includes('function') || tokenTypes.includes('tag')) {
                          return '#a855f7'; // purple-500
                        }
                        if (tokenTypes.includes('selector')) {
                          return '#14b8a6'; // teal-500
                        }
                        return tokenProps.style?.color || 'inherit';
                      };
                      
                      const darkModeColor = getDarkModeColor(token.types);
                      
                      return (
                        <span
                          key={`token-${lineIndex}-${tokenIndex}`}
                          {...tokenProps}
                          className="dark:text-[var(--dark-token-color)] text-xs"
                          style={{
                            ...tokenProps.style,
                            '--dark-token-color': darkModeColor,
                          } as React.CSSProperties}
                        />
                      );
                    })}
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

