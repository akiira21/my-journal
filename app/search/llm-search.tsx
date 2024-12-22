"use client";

import React from "react";
import LLMInfo from "./llm-info";
import LLMInput from "./llm-input";
import CanvasLoadingBorder from "@/components/canvas-loading-border";
import { AnimatePresence, motion } from "framer-motion";

export default function LLMSearch() {
  const [searchQuery, setSearchQuery] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const [searchData, setSearchData] = React.useState([]);

  React.useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Enter" && searchQuery.trim().length > 0) {
        handleSearchResult(searchQuery);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [searchQuery]);

  const handleSearchResult = (searchQuery: string) => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
    }, 3000);
  };

  return (
    <CanvasLoadingBorder loading={loading}>
      <div className="h-full w-full bg-background flex flex-col">
        <AnimatePresence mode="wait">
          {!loading && searchData.length === 0 ? (
            <motion.div
              key="llm-info"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{
                duration: 0.3,
                ease: "easeInOut",
                height: {
                  duration: 0.4,
                },
                opacity: {
                  duration: 0.25,
                },
              }}
              className="overflow-hidden"
            >
              <LLMInfo setSearchQuery={setSearchQuery} />
            </motion.div>
          ) : null}
        </AnimatePresence>

        <LLMInput
          handleSearchResult={handleSearchResult}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          loading={loading}
        />
      </div>
    </CanvasLoadingBorder>
  );
}
