import { motion } from "framer-motion";
import { CornerDownRight, Sparkles } from "lucide-react";

export default function LLMInput({
  searchQuery,
  setSearchQuery,
  handleSearchResult,
  loading,
}: {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  handleSearchResult: (query: string) => void;
  loading: boolean;
}) {
  return (
    <div className="flex h-12 items-center bg-background px-3 py-2 text-sm border-t">
      <Sparkles className="mr-2 h-4 w-4 shrink-0 text-[#3E69F4]" />
      <input
        type="text"
        className={
          "flex w-full rounded-md bg-transparent p-0 placeholder:text-muted-foreground focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50"
        }
        placeholder="Ask me anything about my posts..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        disabled={loading}
      />
      {searchQuery.length > 0 && (
        <motion.div
          className={`flex gap-x-2 text-xs hover:text-[#3E69F4] cursor-pointer ${
            loading ? "hidden" : ""
          }`}
          animate={{ y: 0, opacity: 1 }}
          initial={{ y: -20, opacity: 0 }}
          exit={{ y: -20, opacity: 0 }}
          onClick={() => handleSearchResult(searchQuery)}
        >
          <CornerDownRight size={14} />
          <span>Send</span>
        </motion.div>
      )}
    </div>
  );
}
