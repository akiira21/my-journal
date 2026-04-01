import { TypographyP } from "@/custom_components/typography";
import FeaturedQueries from "./featured-queries";

export default function LLMInfo({
  setSearchQuery,
}: {
  setSearchQuery: (query: string) => void;
}) {
  return (
    <div className="bg-background flex flex-col gap-y-3 p-4 pb-8 text-sm mb-4 text-zinc-800 dark:text-zinc-300 max-h-96 overflow-y-auto">
      <TypographyP>Dear reader,</TypographyP>

      <TypographyP>
        This assistant answers questions using semantic search over blog post
        embeddings and then responds with relevant context.
      </TypographyP>

      <TypographyP>
        Ask anything about articles, concepts, or implementation details from
        this journal.
      </TypographyP>

      <FeaturedQueries setSearchQuery={setSearchQuery} />

      <TypographyP className="text-muted-foreground">
        Responses can still be imperfect, so verify important details before
        using them directly in production.
      </TypographyP>

      <TypographyP>
        Have fun exploring! <br />- Arun
      </TypographyP>
    </div>
  );
}
