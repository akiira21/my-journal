"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import { LoaderCircleIcon, SendIcon, SparklesIcon, UserIcon, PlusIcon, HistoryIcon, ChevronDownIcon, ChevronUpIcon, XIcon } from "lucide-react";

import { apiFetch, apiStream } from "@/lib/api";
import type { ChatMessage, ChatSessionResponse, ChatSource, PostsPageResponse } from "@/lib/blog-types";
import { Button } from "@/components/ui/button";
import { Code } from "@/components/posts/code-block";

const SESSION_STORAGE_KEY = "journal-assistant-session-id";
const SOURCES_STORAGE_KEY = "journal-assistant-sources";

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

function getStoredSources(): ChatSource[] {
  try {
    const raw = window.localStorage.getItem(SOURCES_STORAGE_KEY);
    if (raw) {
      return JSON.parse(raw) as ChatSource[];
    }
  } catch {
    // ignore parse errors
  }
  return [];
}

function setStoredSources(sources: ChatSource[]) {
  try {
    window.localStorage.setItem(SOURCES_STORAGE_KEY, JSON.stringify(sources));
  } catch {
    // ignore storage errors
  }
}

/* ------------------------------------------------------------------ */
/*  Rich markdown renderer — same style as post MDX                    */
/* ------------------------------------------------------------------ */

function ChatMarkdownContent({ content }: { content: string }) {
  return (
    <div className="max-w-none overflow-x-hidden wrap-break-word text-sm leading-7 text-foreground/95">
      <ReactMarkdown
        remarkPlugins={[remarkGfm, remarkMath]}
        rehypePlugins={[rehypeKatex]}
        components={{
          h1: ({ children }) => (
            <h1 className="mt-6 mb-3 text-lg font-pixel leading-tight tracking-tight text-foreground">
              {children}
            </h1>
          ),
          h2: ({ children }) => (
            <h2 className="mt-5 mb-2.5 text-base font-pixel leading-snug tracking-tight text-foreground">
              {children}
            </h2>
          ),
          h3: ({ children }) => (
            <h3 className="mt-4 mb-2 text-sm font-pixel leading-snug tracking-tight text-foreground/90">
              {children}
            </h3>
          ),
          p: ({ children }) => (
            <p className="my-3 text-[0.9375rem] leading-[1.75] text-foreground/80">
              {children}
            </p>
          ),
          blockquote: ({ children }) => (
            <blockquote className="my-4 border-l-2 border-primary/30 bg-muted/20 pl-4 py-1 pr-2 text-sm italic text-foreground/70">
              {children}
            </blockquote>
          ),
          hr: () => (
            <div className="my-5 border-t border-line" aria-hidden="true" />
          ),
          ul: ({ children }) => (
            <ul className="my-4 ml-0 list-none space-y-2">
              {children}
            </ul>
          ),
          ol: ({ children }) => (
            <ol className="my-4 ml-0 list-none space-y-2">
              {children}
            </ol>
          ),
          li: ({ children }) => (
            <li className="flex items-start gap-3 text-[0.9375rem] leading-[1.75] text-foreground/75">
              <span className="flex-shrink-0 mt-[0.55rem] h-[5px] w-[5px] rounded-full bg-foreground/30" />
              <span>{children}</span>
            </li>
          ),
          a: ({ children, href }) => {
            const safeHref = href ?? "#";
            const isExternal = /^https?:\/\//i.test(safeHref);
            return (
              <a
                href={safeHref}
                target={isExternal ? "_blank" : undefined}
                rel={isExternal ? "noreferrer noopener" : undefined}
                className="text-primary underline underline-offset-4 decoration-primary/30 hover:decoration-primary transition-all font-medium"
              >
                {children}
              </a>
            );
          },
          code: Code,
          pre: ({ children }) => <pre className="my-4 overflow-x-auto">{children}</pre>,
          table: ({ children }) => (
            <div className="my-4 overflow-x-auto border border-line rounded-md">
              <table className="w-full text-sm">
                {children}
              </table>
            </div>
          ),
          thead: ({ children }) => (
            <thead className="bg-muted/50 border-b border-line">
              {children}
            </thead>
          ),
          th: ({ children }) => (
            <th className="px-4 py-2.5 text-left font-mono text-xs font-medium uppercase tracking-wider text-muted-foreground">
              {children}
            </th>
          ),
          td: ({ children }) => (
            <td className="px-4 py-3 text-foreground/90 border-t border-line">
              {children}
            </td>
          ),
          tr: ({ children }) => (
            <tr className="hover:bg-muted/30 transition-colors">
              {children}
            </tr>
          ),
          strong: ({ children }) => (
            <strong className="font-semibold text-foreground">{children}</strong>
          ),
          em: ({ children }) => (
            <em className="italic text-foreground/80">{children}</em>
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

function extractMentions(text: string): string[] {
  const matches = text.match(/@([a-z0-9-]+)/g);
  if (!matches) return [];
  return matches.map((m) => m.slice(1)); // Remove the leading "@"
}

/* ------------------------------------------------------------------ */
/*  Mention helpers                                                   */
/* ------------------------------------------------------------------ */

function getMentionContext(
  text: string,
  cursorPos: number,
): { start: number; query: string } | null {
  const beforeCursor = text.slice(0, cursorPos);
  const match = beforeCursor.match(/@([a-zA-Z0-9-]*)$/);
  if (!match) return null;
  return { start: beforeCursor.length - match[0].length, query: match[1] };
}

/* ------------------------------------------------------------------ */
/*  Assistant Chat Client                                              */
/* ------------------------------------------------------------------ */

type AssistantChatClientProps = {
  assistantName: string;
};

export function AssistantChatClient({ assistantName }: AssistantChatClientProps) {
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [messages, setMessages] = useState<UiMessage[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isStreaming, setIsStreaming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const messagesViewportRef = useRef<HTMLDivElement | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const historyDropdownRef = useRef<HTMLDivElement | null>(null);

  // Mention autocomplete state
  const [showMentions, setShowMentions] = useState(false);
  const [mentionQuery, setMentionQuery] = useState("");
  const [mentionIndex, setMentionIndex] = useState(0);
  const [mentionStartPos, setMentionStartPos] = useState(0);
  const [allPosts, setAllPosts] = useState<{ slug: string; title: string }[]>([]);

  // History dropdown state
  const [showHistory, setShowHistory] = useState(false);
  const [historySessions, setHistorySessions] = useState<{
    session_id: string;
    first_message: string;
    message_count: number;
    last_message_at: string;
  }[]>([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);

  // Collapsible context section
  const [showContextDetails, setShowContextDetails] = useState(false);

  // Collapsible entire header on small screens
  const [headerCollapsed, setHeaderCollapsed] = useState(false);

  // Load header collapsed state from localStorage after mount
  useEffect(() => {
    const stored = window.localStorage.getItem("journal-assistant-header-collapsed");
    if (stored === "true") {
      setHeaderCollapsed(true);
    }
  }, []);

  // Load post list for mentions
  useEffect(() => {
    apiFetch<PostsPageResponse>("/posts?page=1&page_size=100")
      .then((d) => setAllPosts(d.posts.map((p) => ({ slug: p.slug, title: p.title }))))
      .catch(() => {});
  }, []);

  // Load session and restore persisted sources on mount
  useEffect(() => {
    const init = async () => {
      try {
        const stored = window.localStorage.getItem(SESSION_STORAGE_KEY);
        const storedSources = getStoredSources();

        const session = await apiFetch<ChatSessionResponse>("/chat/sessions", {
          method: "POST",
          data: stored ? { session_id: stored } : {},
        });

        const nextSessionId = session.session_id;
        setSessionId(nextSessionId);
        window.localStorage.setItem(SESSION_STORAGE_KEY, nextSessionId);

        if (session.messages && session.messages.length > 0) {
          const uiMessages = toUiMessages(session.messages);

          // Restore sources to the most recent assistant message
          if (storedSources.length > 0) {
            for (let i = uiMessages.length - 1; i >= 0; i--) {
              if (uiMessages[i].role === "assistant") {
                uiMessages[i].sources = storedSources;
                break;
              }
            }
          }

          setMessages(uiMessages);
        }
      } catch (error) {
        setError(
          error instanceof Error
            ? error.message
            : "Failed to initialize assistant session.",
        );
      } finally {
        setIsLoading(false);
      }
    };

    void init();
  }, []);

  // Auto-scroll to bottom
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

  // Persist header collapsed state
  useEffect(() => {
    window.localStorage.setItem("journal-assistant-header-collapsed", String(headerCollapsed));
  }, [headerCollapsed]);

  // Close history dropdown on click outside
  useEffect(() => {
    if (!showHistory) return;
    const handleClick = (event: MouseEvent) => {
      const target = event.target as Node;
      if (historyDropdownRef.current && !historyDropdownRef.current.contains(target)) {
        setShowHistory(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [showHistory]);

  // Persist latest sources whenever messages change
  useEffect(() => {
    for (let i = messages.length - 1; i >= 0; i--) {
      const message = messages[i];
      if (message.role === "assistant" && message.sources && message.sources.length > 0) {
        setStoredSources(dedupeSources(message.sources));
        break;
      }
    }
  }, [messages]);

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

  // Mention dropdown items
  const filteredPosts = useMemo(() => {
    if (!mentionQuery) return allPosts.slice(0, 6);
    const q = mentionQuery.toLowerCase();
    return allPosts
      .filter(
        (p) =>
          p.slug.toLowerCase().includes(q) || p.title.toLowerCase().includes(q),
      )
      .slice(0, 6);
  }, [allPosts, mentionQuery]);

  const selectMention = (post: { slug: string; title: string }) => {
    const ta = textareaRef.current;
    if (!ta) return;
    const cursorPos = ta.selectionStart;
    const before = inputValue.slice(0, mentionStartPos);
    const after = inputValue.slice(cursorPos);
    const newValue = `${before}@${post.slug} ${after}`;
    setInputValue(newValue);
    setShowMentions(false);
    // Move cursor after inserted mention
    requestAnimationFrame(() => {
      const pos = before.length + post.slug.length + 2; // +2 for @ and space
      ta.setSelectionRange(pos, pos);
      ta.focus();
    });
  };

  const handleNewSession = () => {
    if (isStreaming || isLoading) return;

    setError(null);
    setShowHistory(false);

    window.localStorage.removeItem(SESSION_STORAGE_KEY);
    window.localStorage.removeItem(SOURCES_STORAGE_KEY);

    const newSessionId = crypto.randomUUID();
    setSessionId(newSessionId);
    window.localStorage.setItem(SESSION_STORAGE_KEY, newSessionId);
    setMessages([]);
  };

  const loadHistory = async () => {
    if (isLoadingHistory) return;
    setIsLoadingHistory(true);
    try {
      const data = await apiFetch<{ sessions: typeof historySessions }>("/chat/history");
      setHistorySessions(data.sessions ?? []);
      setShowHistory(true);
    } catch {
      // ignore
    } finally {
      setIsLoadingHistory(false);
    }
  };

  const loadSessionFromHistory = async (sid: string) => {
    setShowHistory(false);
    setIsLoading(true);
    setError(null);
    try {
      window.localStorage.removeItem(SOURCES_STORAGE_KEY);
      const session = await apiFetch<ChatSessionResponse>("/chat/sessions", {
        method: "POST",
        data: { session_id: sid },
      });

      const nextSessionId = session.session_id;
      setSessionId(nextSessionId);
      window.localStorage.setItem(SESSION_STORAGE_KEY, nextSessionId);

      if (session.messages && session.messages.length > 0) {
        setMessages(toUiMessages(session.messages));
      } else {
        setMessages([]);
      }
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Failed to load session.",
      );
    } finally {
      setIsLoading(false);
    }
  };

  const onSendMessage = async () => {
    if (!canSend || !sessionId) {
      return;
    }

    const userMessage = inputValue.trim();
    const mentionedPosts = extractMentions(userMessage);
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
          mentioned_posts: mentionedPosts,
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
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Failed to receive assistant response.",
      );
    } finally {
      setIsStreaming(false);
    }
  };

  return (
    <div className="flex h-full min-h-0 flex-1 flex-col overflow-hidden border-x border-line">
      {/* ── Header ── */}
      <div className="screen-line-bottom relative shrink-0 border-b border-line bg-muted/30 px-4 py-3">
        {/* Top row: badge + actions */}
        <div className="flex items-center justify-between gap-3">
          <div className="inline-flex items-center gap-1.5 rounded-md border border-line bg-background/60 px-2 py-1">
            <SparklesIcon className="size-3 text-violet-500" />
            <span className="font-mono text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
              Context Mode
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setHeaderCollapsed((p) => !p)}
              className="inline-flex items-center gap-1 rounded-md border border-line bg-background/60 px-2 py-1 font-mono text-[10px] font-medium uppercase tracking-wider text-muted-foreground transition-colors hover:bg-muted/50 hover:text-foreground"
              title={headerCollapsed ? "Expand header" : "Collapse header"}
            >
              {headerCollapsed ? (
                <ChevronDownIcon className="size-3" />
              ) : (
                <ChevronUpIcon className="size-3" />
              )}
              <span className="hidden sm:inline">{headerCollapsed ? "Show" : "Hide"}</span>
            </button>
            <button
              onClick={() => {
                if (showHistory) {
                  setShowHistory(false);
                } else {
                  void loadHistory();
                }
              }}
              disabled={isLoading || isStreaming || isLoadingHistory}
              className="inline-flex items-center gap-1 rounded-md border border-line bg-background/60 px-2 py-1 font-mono text-[10px] font-medium uppercase tracking-wider text-muted-foreground transition-colors hover:bg-muted/50 hover:text-foreground disabled:opacity-40"
              title="View conversation history"
            >
              <HistoryIcon className="size-3" />
              <span className="hidden sm:inline">History</span>
            </button>
            <button
              onClick={handleNewSession}
              disabled={isStreaming}
              className="inline-flex items-center gap-1 rounded-md border border-line bg-background/60 px-2 py-1 font-mono text-[10px] font-medium uppercase tracking-wider text-muted-foreground transition-colors hover:bg-muted/50 hover:text-foreground disabled:opacity-40"
              title="Start a new conversation"
            >
              <PlusIcon className="size-3" />
              <span className="hidden sm:inline">New</span>
            </button>
          </div>
        </div>

        {/* History dropdown */}
        {showHistory && (
          <div ref={historyDropdownRef} className="absolute right-4 top-12 z-50 w-72 max-h-60 overflow-y-auto rounded-lg border border-line bg-background shadow-xl">
            <div className="flex items-center justify-between px-3 py-2 border-b border-line/50">
              <span className="font-mono text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
                Previous Conversations
              </span>
              <button
                type="button"
                onClick={() => setShowHistory(false)}
                className="rounded p-1 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                title="Close"
              >
                <XIcon className="size-3.5" />
              </button>
            </div>
            {historySessions.length === 0 ? (
              <div className="px-3 py-2 text-sm text-muted-foreground">
                No previous conversations.
              </div>
            ) : (
              historySessions.map((session) => (
                <button
                  key={session.session_id}
                  type="button"
                  onClick={() => void loadSessionFromHistory(session.session_id)}
                  className="w-full text-left px-3 py-2 text-sm hover:bg-muted transition-colors border-b border-line/50 last:border-0"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="truncate font-medium text-foreground">
                      {session.first_message || "Untitled"}
                    </span>
                    <span className="shrink-0 font-mono text-[10px] text-muted-foreground">
                      {session.message_count} msg
                    </span>
                  </div>
                  <div className="mt-0.5 font-mono text-[10px] text-muted-foreground/60">
                    {session.last_message_at
                      ? new Date(session.last_message_at).toLocaleString()
                      : "No messages"}
                  </div>
                </button>
              ))
            )}
          </div>
        )}

        {/* Collapsible header content */}
        {!headerCollapsed && (
          <>
            {/* Description */}
            <p className="mt-2 text-[13px] leading-relaxed text-muted-foreground/80">
              Ask about posts, architecture decisions, and concepts from this journal.
            </p>

            {/* Hint */}
            <div className="mt-1.5 flex items-center gap-1.5">
              <span className="text-[11px] text-muted-foreground/50">Tip:</span>
              <span className="text-[11px] text-muted-foreground/60">
                Mention a post with
              </span>
              <code className="rounded border border-line bg-muted/50 px-1.5 py-0.5 font-mono text-[10px] text-foreground/70">
                @post-slug
              </code>
            </div>

            {/* Sources — collapsible */}
            {latestContextSources.length > 0 ? (
              <div className="mt-2.5 border-t border-line/50 pt-2">
                <button
                  type="button"
                  onClick={() => setShowContextDetails((p) => !p)}
                  className="flex w-full items-center justify-between gap-2"
                >
                  <span className="font-mono text-[10px] font-medium uppercase tracking-wider text-muted-foreground/60">
                    Using {latestContextSources.length} source{latestContextSources.length > 1 ? "s" : ""}
                  </span>
                  {showContextDetails ? (
                    <ChevronUpIcon className="size-3 text-muted-foreground/50" />
                  ) : (
                    <ChevronDownIcon className="size-3 text-muted-foreground/50" />
                  )}
                </button>
                {showContextDetails && (
                  <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
                    {latestContextSources.map((source, index) => (
                      <Link
                        key={`context-${source.post_id}-${index}`}
                        href={`/posts/${source.post_slug}`}
                        className="rounded-sm border border-line bg-background/50 px-2 py-0.5 font-mono text-[10px] text-muted-foreground transition-colors hover:border-foreground/20 hover:text-foreground"
                      >
                        {source.title}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            ) : null}
          </>
        )}
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
                <ChatMarkdownContent content={message.content || "..."} />
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
          <div className="relative flex items-end gap-2">
            {/* Mention autocomplete dropdown */}
            {showMentions && filteredPosts.length > 0 && (
              <div className="absolute bottom-full left-0 z-50 mb-1.5 w-full max-h-44 overflow-y-auto rounded-lg border border-line bg-background shadow-xl">
                {filteredPosts.map((post, i) => (
                  <button
                    key={post.slug}
                    type="button"
                    onMouseEnter={() => setMentionIndex(i)}
                    onClick={() => selectMention(post)}
                    className={`w-full text-left px-3 py-2 text-sm transition-colors ${
                      i === mentionIndex
                        ? "bg-muted text-foreground"
                        : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
                    }`}
                  >
                    <span className="font-medium">{post.title}</span>
                    <span className="ml-2 font-mono text-[10px] text-muted-foreground/50">
                      @{post.slug}
                    </span>
                  </button>
                ))}
              </div>
            )}

            <textarea
              ref={textareaRef}
              placeholder={`Message ${assistantName}...`}
              className="max-h-36 min-h-12 w-full resize-none bg-transparent px-1 py-1 font-mono text-sm leading-6 text-foreground outline-none placeholder:text-muted-foreground"
              value={inputValue}
              onChange={(event) => {
                const value = event.target.value;
                const cursorPos = event.target.selectionStart;
                setInputValue(value);

                const ctx = getMentionContext(value, cursorPos);
                if (ctx) {
                  setShowMentions(true);
                  setMentionQuery(ctx.query);
                  setMentionStartPos(ctx.start);
                  setMentionIndex(0);
                } else {
                  setShowMentions(false);
                }
              }}
              onKeyDown={(event) => {
                if (showMentions) {
                  if (event.key === "ArrowDown") {
                    event.preventDefault();
                    setMentionIndex((p) =>
                      Math.min(filteredPosts.length - 1, p + 1),
                    );
                    return;
                  }
                  if (event.key === "ArrowUp") {
                    event.preventDefault();
                    setMentionIndex((p) => Math.max(0, p - 1));
                    return;
                  }
                  if (event.key === "Enter" || event.key === "Tab") {
                    event.preventDefault();
                    if (filteredPosts[mentionIndex]) {
                      selectMention(filteredPosts[mentionIndex]);
                    }
                    return;
                  }
                  if (event.key === "Escape") {
                    setShowMentions(false);
                    return;
                  }
                }

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
