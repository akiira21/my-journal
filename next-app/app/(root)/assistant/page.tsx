import type { Metadata } from "next";

import { AssistantChatClient } from "@/components/assistant/chat-client";

const title = "AI Assistant";
const description = "A blog-aware assistant that answers using your published post knowledge.";

export const metadata: Metadata = {
  title,
  description,
  alternates: {
    canonical: "/assistant",
  },
};

export default function AssistantPage() {
  const assistantName = process.env.ASSISTANT_NAME ?? "Assistant";

  return (
    <section className="mx-auto flex h-[calc(100svh-3rem)] w-full max-w-3xl flex-col overflow-hidden">
      <div className="screen-line-top screen-line-bottom border-x border-y border-line px-4 py-4">
        <h1 className="text-3xl leading-none font-semibold tracking-tight">{title}</h1>
      </div>

      <div className="screen-line-bottom border-x border-b border-line px-4 py-4">
        <p className="font-mono text-sm text-muted-foreground">{description}</p>
      </div>

      <AssistantChatClient assistantName={assistantName} />
    </section>
  );
}
