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
        I built this AI-powered search tool to explore innovative ways for
        readers to connect with my content. It&apos;s still in the early stages of
        development, so I&apos;d love to hear your feedback on how I can improve it.
      </TypographyP>

      <TypographyP>
        Feel free to ask me anything about my posts, and I&apos;ll do my best to
        provide you with relevant information. I hope you enjoy using this tool
        as much as I enjoyed building it!
      </TypographyP>

      <FeaturedQueries setSearchQuery={setSearchQuery} />

      <TypographyP className="text-muted-foreground">
        Results are sadly not guaranteed to be 100% accurate but I&apos;m working on
        improving the quality of the search results.
      </TypographyP>

      <TypographyP>
        Have fun exploring! <br />- Arun
      </TypographyP>
    </div>
  );
}
