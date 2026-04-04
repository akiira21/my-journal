"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { LoaderCircleIcon, SendIcon, SparklesIcon, UserIcon } from "lucide-react";

import { apiFetch, apiStream } from "@/lib/api";
import type { ChatMessage, ChatSessionResponse, ChatSource } from "@/lib/blog-types";
import { Button } from "@/components/ui/button";

const SESSION_STORAGE_KEY = "journal-assistant-session-id";

type UiMessage = {
  id: string;
  role: "user" | "assistant";
  content: string;
  sources?: ChatSource[];
};

function dedupeSources(sources: ChatSource[]): ChatSource[] {
  const byPost = new Map<string, ChatSource>();
  for (const source of sources) {
    if (!byPost.has(source.post_id)) {
      byPost.set(source.post_id, source);
    }
  }
  return [...byPost.values()];
}

function toUiMessages(messages: ChatMessage[]): UiMessage[] {
  return messages.map((message, index) => ({
    id: `${message.role}-${index}-${message.created_at ?? "no-date"}`,
    role: message.role,
    content: message.content,
  }));
}

function parseSSEPayload(chunk: string): { event: string; data: unknown } | null {
  const lines = chunk
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);

  if (lines.length === 0) {
    return null;
  }

  const eventLine = lines.find((line) => line.startsWith("event:"));
  const dataLine = lines.find((line) => line.startsWith("data:"));

  if (!dataLine) {
    return null;
  }

  const event = eventLine?.slice(6).trim() ?? "message";
  const dataRaw = dataLine.slice(5).trim();

  try {
    return {
      event,
      data: JSON.parse(dataRaw),
    };
  } catch {
    return null;
  }
}

type AssistantChatClientProps = {
  assistantName: string;
};

function MarkdownContent({ content }: { content: string }) {
  return (
    <div className="max-w-none overflow-x-hidden wrap-break-word text-sm leading-7 text-foreground/95">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          p: ({ children }) => <p className="mb-3 last:mb-0">{children}</p>,
          ul: ({ children }) => <ul className="mb-3 ml-5 list-disc space-y-1">{children}</ul>,
          ol: ({ children }) => <ol className="mb-3 ml-5 list-decimal space-y-1">{children}</ol>,
          a: ({ children, href }) => (
            <a
              href={href}
              target="_blank"
              rel="noreferrer noopener"
              className="underline decoration-muted-foreground/60 underline-offset-4 transition-colors hover:text-foreground"
            >
              {children}
            </a>
          ),
          code: ({ children, className }) => {
            const isBlock = Boolean(className);
            if (isBlock) {
              return (
                <code className="block overflow-x-auto border border-line bg-muted/30 px-3 py-2 font-mono text-xs">
                  {children}
                </code>
              );
            }

            return <code className="bg-muted/40 px-1 py-0.5 font-mono text-xs">{children}</code>;
          },
          pre: ({ children }) => <pre className="mb-3 overflow-x-auto">{children}</pre>,
          table: ({ children }) => (
            <div className="mb-3 overflow-x-auto">
              <table className="w-full min-w-max border-collapse border border-line text-xs">{children}</table>
            </div>
          ),
          th: ({ children }) => <th className="border border-line px-2 py-1 text-left">{children}</th>,
          td: ({ children }) => <td className="border border-line px-2 py-1">{children}</td>,
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}

export function AssistantChatClient({ assistantName }: AssistantChatClientProps) {
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [messages, setMessages] = useState<UiMessage[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isStreaming, setIsStreaming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const messagesViewportRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const init = async () => {
      try {
        const stored = window.localStorage.getItem(SESSION_STORAGE_KEY);

        const session = await apiFetch<{ session_id: string }>("/chat/sessions", {
          method: "POST",
          data: stored ? { session_id: stored } : {},
        });

        const nextSessionId = session.session_id;
        setSessionId(nextSessionId);
        window.localStorage.setItem(SESSION_STORAGE_KEY, nextSessionId);

        const existing = await apiFetch<ChatSessionResponse>(`/chat/sessions/${nextSessionId}`).catch(() => null);

        if (existing) {
          setMessages(toUiMessages(existing.messages));
        }
      } catch {
        setError("Failed to initialize assistant session.");
      } finally {
        setIsLoading(false);
      }
    };

    void init();
  }, []);

  useEffect(() => {
    const viewport = messagesViewportRef.current;
    if (!viewport) {
      return;
    }

    viewport.scrollTo({
      top: viewport.scrollHeight,
      behavior: "smooth",
    });
  }, [messages, isStreaming]);

  const canSend = useMemo(() => {
    return Boolean(sessionId) && inputValue.trim().length > 0 && !isStreaming;
  }, [inputValue, isStreaming, sessionId]);

  const latestContextSources = useMemo(() => {
    for (let index = messages.length - 1; index >= 0; index -= 1) {
      const message = messages[index];
      if (message.role === "assistant" && message.sources && message.sources.length > 0) {
        return dedupeSources(message.sources);
      }
    }
    return [] as ChatSource[];
  }, [messages]);

  const onSendMessage = async () => {
    if (!canSend || !sessionId) {
      return;
    }

    const userMessage = inputValue.trim();
    const assistantMessageId = `assistant-${Date.now()}`;

    setInputValue("");
    setError(null);
    setIsStreaming(true);

    setMessages((prev) => [
      ...prev,
      { id: `user-${Date.now()}`, role: "user", content: userMessage },
      { id: assistantMessageId, role: "assistant", content: "" },
    ]);

    try {
      const response = await apiStream("/chat/stream", {
        method: "POST",
        body: JSON.stringify({
          session_id: sessionId,
          message: userMessage,
        }),
      });

      if (!response.body) {
        throw new Error("Missing response stream body.");
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) {
          break;
        }

        buffer += decoder.decode(value, { stream: true });
        const chunks = buffer.split("\n\n");
        buffer = chunks.pop() ?? "";

        for (const chunk of chunks) {
          const payload = parseSSEPayload(chunk);
          if (!payload) {
            continue;
          }

          if (payload.event === "message") {
            const data = payload.data as { content?: string };
            if (!data.content) {
              continue;
            }

            setMessages((prev) =>
              prev.map((message) =>
                message.id === assistantMessageId
                  ? { ...message, content: `${message.content}${data.content}` }
                  : message,
              ),
            );
          }

          if (payload.event === "sources") {
            const data = payload.data as { sources?: ChatSource[] };
            const uniqueSources = dedupeSources(data.sources ?? []);
            setMessages((prev) =>
              prev.map((message) =>
                message.id === assistantMessageId
                  ? { ...message, sources: uniqueSources }
                  : message,
              ),
            );
          }

          if (payload.event === "error") {
            throw new Error("Assistant streaming returned an error.");
          }
        }
      }
    } catch {
      setError("Failed to receive assistant response.");
    } finally {
      setIsStreaming(false);
    }
  };

  return (
    <div className="flex h-full min-h-0 flex-1 flex-col overflow-hidden border-x border-line">
      <div className="screen-line-bottom border-b border-line bg-muted/30 p-3">
        <div className="mb-1 inline-flex items-center gap-2 border border-line px-2 py-0.5 font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
          <SparklesIcon className="size-3.5 text-violet-500" />
          Context Mode
        </div>
        <p className="font-mono text-xs text-muted-foreground/90">
          Ask about posts, architecture decisions, and concepts from this journal.
        </p>

        {latestContextSources.length > 0 ? (
          <div className="mt-2 flex flex-wrap items-center gap-2">
            <span className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">Using:</span>
            {latestContextSources.map((source, index) => (
              <Link
                key={`context-${source.post_id}-${index}`}
                href={`/posts/${source.post_slug}`}
                className="border border-line px-2 py-0.5 font-mono text-[10px] text-muted-foreground transition-colors hover:text-foreground"
              >
                {source.title}
              </Link>
            ))}
          </div>
        ) : null}
      </div>

      <div ref={messagesViewportRef} className="min-h-0 flex-1 space-y-0 overflow-y-auto overflow-x-hidden overscroll-contain">
        {isLoading ? (
          <div className="screen-line-bottom flex items-center gap-2 px-4 py-4 font-mono text-sm text-muted-foreground">
            <LoaderCircleIcon className="size-4 animate-spin" />
            Initializing assistant...
          </div>
        ) : messages.length === 0 ? (
          <div className="screen-line-bottom px-4 py-5 font-mono text-sm text-muted-foreground">
            No messages yet. Start by asking about a post idea or topic.
          </div>
        ) : (
          messages.map((message) => (
            <div
              key={message.id}
              className={`screen-line-bottom px-4 py-4 ${
                message.role === "user"
                  ? "border-l-2 border-l-blue-500"
                  : "border-l-2 border-l-transparent"
              }`}
            >
              <div className="mb-2 flex items-center gap-2 font-mono text-[11px] uppercase tracking-wider text-muted-foreground">
                {message.role === "assistant" ? (
                  <SparklesIcon className="size-4.5 text-violet-500" />
                ) : (
                  <UserIcon className="size-3.5 text-blue-500" />
                )}
                <span>{message.role === "assistant" ? assistantName : "You"}</span>
              </div>

              {message.role === "assistant" ? (
                <MarkdownContent content={message.content || "..."} />
              ) : (
                <p className="whitespace-pre-wrap wrap-break-word font-mono text-sm leading-7 text-foreground/95">
                  {message.content || "..."}
                </p>
              )}

            </div>
          ))
        )}
      </div>

      <div className="mt-auto shrink-0 border-t border-line bg-background">
        <div className="border-l-2 border-l-transparent px-3 py-2 focus-within:border-l-blue-500">
          <div className="flex items-end gap-2">
            <textarea
              placeholder={`Message ${assistantName}...`}
              className="max-h-36 min-h-12 w-full resize-none bg-transparent px-1 py-1 font-mono text-sm leading-6 text-foreground outline-none placeholder:text-muted-foreground"
              value={inputValue}
              onChange={(event) => setInputValue(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter" && !event.shiftKey) {
                  event.preventDefault();
                  void onSendMessage();
                }
              }}
              disabled={Boolean(!sessionId || isStreaming)}
              suppressHydrationWarning
            />

            <Button
              variant="ghost"
              size="icon"
              className="shrink-0 rounded-none border border-line"
              title="Send message"
              aria-label="Send message"
              onClick={() => void onSendMessage()}
              disabled={!canSend}
            >
              {isStreaming ? <LoaderCircleIcon className="size-4 animate-spin" /> : <SendIcon className="size-4" />}
            </Button>
          </div>
        </div>

        {error ? <p className="px-4 py-2 font-mono text-xs text-destructive">{error}</p> : null}
      </div>
    </div>
  );
}
