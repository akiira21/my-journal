"use client";

import React from "react";
import LLMInfo from "./llm-info";
import LLMInput from "./llm-input";
import CanvasLoadingBorder from "@/components/canvas-loading-border";
import Link from "next/link";
import { formatDate } from "@/lib/utils";

type ChatMessage = {
  role: "user" | "assistant";
  content: string;
  created_at: string;
  sources?: ChatSource[];
};

type ChatSource = {
  post_slug: string;
  title: string;
  score: number;
};

type SessionResponse = {
  session_id: string;
  messages: ChatMessage[];
};

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || process.env.API_URL || "http://localhost:8080";
const SESSION_STORAGE_KEY = "assistant_chat_session_id";

export default function LLMSearch() {
  const [searchQuery, setSearchQuery] = React.useState("");
  const [sessionID, setSessionID] = React.useState("");
  const [messages, setMessages] = React.useState<ChatMessage[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const chatScrollRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const initSession = async () => {
      try {
        const storedSession = window.localStorage.getItem(SESSION_STORAGE_KEY) || "";
        const createRes = await fetch(`${API_BASE_URL}/api/v1/chat/sessions`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(storedSession ? { session_id: storedSession } : {}),
        });

        if (!createRes.ok) {
          const details = await createRes.text();
          throw new Error(
            `Session init failed (${createRes.status}): ${details || createRes.statusText}`
          );
        }

        const created = (await createRes.json()) as { session_id: string };
        const newSessionID = created.session_id;

        setSessionID(newSessionID);
        window.localStorage.setItem(SESSION_STORAGE_KEY, newSessionID);

        const historyRes = await fetch(
          `${API_BASE_URL}/api/v1/chat/sessions/${newSessionID}`
        );

        if (!historyRes.ok) {
          return;
        }

        const history = (await historyRes.json()) as SessionResponse;
        setMessages(history.messages || []);
      } catch (sessionError) {
        console.error("assistant session init failed", sessionError);
        setError(
          sessionError instanceof Error
            ? sessionError.message
            : "Unable to start chat session right now."
        );
      }
    };

    initSession();
  }, []);

  React.useEffect(() => {
    if (chatScrollRef.current) {
      chatScrollRef.current.scrollTop = chatScrollRef.current.scrollHeight;
    }
  }, [messages, loading]);

  const handleSearchResult = async (query: string) => {
    if (!query.trim() || !sessionID || loading) {
      return;
    }

    const userMessage: ChatMessage = {
      role: "user",
      content: query.trim(),
      created_at: new Date().toISOString(),
    };

    const assistantPlaceholder: ChatMessage = {
      role: "assistant",
      content: "",
      created_at: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userMessage, assistantPlaceholder]);
    setSearchQuery("");
    setError(null);
    setLoading(true);

    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/chat/stream`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          session_id: sessionID,
          message: query.trim(),
        }),
      });

      if (!response.ok || !response.body) {
        throw new Error("Streaming unavailable");
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      const handleEvent = (eventChunk: string) => {
        const lines = eventChunk.split("\n");
        let eventName = "message";
        const dataLines: string[] = [];

        lines.forEach((line) => {
          if (line.startsWith("event:")) {
            eventName = line.replace("event:", "").trim();
          }
          if (line.startsWith("data:")) {
            dataLines.push(line.replace("data:", "").trim());
          }
        });

        if (!dataLines.length) {
          return;
        }

        const rawData = dataLines.join("\n");
        let parsed: any = {};

        try {
          parsed = JSON.parse(rawData);
        } catch {
          return;
        }

        if (eventName === "message" && parsed.content) {
          setMessages((prev) => {
            const updated = [...prev];
            const idx = updated.length - 1;
            if (idx >= 0 && updated[idx].role === "assistant") {
              updated[idx] = {
                ...updated[idx],
                content: (updated[idx].content || "") + parsed.content,
              };
            }
            return updated;
          });
        }

        if (eventName === "sources" && Array.isArray(parsed.sources)) {
          setMessages((prev) => {
            const updated = [...prev];
            const idx = updated.length - 1;
            if (idx >= 0 && updated[idx].role === "assistant") {
              updated[idx] = {
                ...updated[idx],
                sources: parsed.sources,
              };
            }
            return updated;
          });
        }

        if (eventName === "error") {
          throw new Error(parsed.error || "Streaming failed");
        }
      };

      while (true) {
        const { value, done } = await reader.read();
        if (done) {
          break;
        }

        buffer += decoder.decode(value, { stream: true });
        const events = buffer.split("\n\n");
        buffer = events.pop() || "";

        events.forEach((eventChunk) => {
          if (eventChunk.trim()) {
            handleEvent(eventChunk);
          }
        });
      }
    } catch {
      try {
        const fallback = await fetch(`${API_BASE_URL}/api/v1/chat/message`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            session_id: sessionID,
            message: query.trim(),
          }),
        });

        if (!fallback.ok) {
          throw new Error("Fallback chat failed");
        }

        const fallbackData = (await fallback.json()) as {
          message: string;
          sources?: ChatSource[];
        };

        setMessages((prev) => {
          const updated = [...prev];
          const idx = updated.length - 1;
          if (idx >= 0 && updated[idx].role === "assistant") {
            updated[idx] = {
              ...updated[idx],
              content: fallbackData.message,
              sources: fallbackData.sources || [],
            };
          }
          return updated;
        });
      } catch {
        setMessages((prev) => prev.slice(0, -1));
        setError("Unable to get assistant response. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <CanvasLoadingBorder loading={loading}>
      <div className="h-full w-full bg-background flex flex-col">
        <div ref={chatScrollRef} className="max-h-96 overflow-y-auto px-3 py-3 space-y-3">
          {messages.length === 0 ? (
            <LLMInfo setSearchQuery={setSearchQuery} />
          ) : (
            messages.map((message, index) => {
              const isUser = message.role === "user";

              return (
                <div
                  key={`${message.role}-${index.toString()}`}
                  className={`rounded-md px-3 py-2 text-sm ${
                    isUser
                      ? "bg-zinc-100 dark:bg-zinc-900 ml-8"
                      : "border border-zinc-200 dark:border-zinc-800 mr-8"
                  }`}
                >
                  <div className="text-[11px] uppercase tracking-wide text-zinc-500 dark:text-zinc-400 mb-1">
                    {isUser ? "You" : "Assistant"}
                  </div>
                  <p className="whitespace-pre-wrap leading-6">{message.content || "..."}</p>
                  <div className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-2">
                    {formatDate(message.created_at, false, true)}
                  </div>

                  {!isUser && message.sources && message.sources.length > 0 && (
                    <div className="mt-2 pt-2 border-t border-zinc-200 dark:border-zinc-800 space-y-1">
                      {message.sources.slice(0, 3).map((source, sourceIndex) => (
                        <Link
                          key={`${source.post_slug}-${sourceIndex.toString()}`}
                          href={`/posts/${source.post_slug}`}
                          className="block text-xs text-blue-600 dark:text-blue-400 hover:underline"
                        >
                          {source.title}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              );
            })
          )}

          {error && (
            <div className="text-xs text-red-500 border border-red-300 dark:border-red-800 rounded-md px-3 py-2">
              {error}
            </div>
          )}
        </div>

        <LLMInput
          handleSearchResult={handleSearchResult}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          loading={loading}
          disabled={!sessionID}
        />
      </div>
    </CanvasLoadingBorder>
  );
}
