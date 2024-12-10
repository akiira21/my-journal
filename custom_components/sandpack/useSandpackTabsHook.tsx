"use client";

import React from "react";
import { cn } from "@/lib/utils";

type SandpackTabsType = "preview" | "console";

interface SandpackTabsProps {
  activeTab: SandpackTabsType;
  setActiveTab: (tab: SandpackTabsType) => void;
}

export const useSandpackTabsHook = () => {
  const [activeTab, setActiveTab] = React.useState<SandpackTabsType>("preview");

  const SandpackTabs = () => {
    return (
      <div className="flex w-full items-center gap-4 px-2 text-sm">
        <button
          className={cn(
            "hover:text-primary text-muted-foreground",
            activeTab === "preview" && "text-[#3579F6] hover:text-[#3579F6] "
          )}
          onClick={() => setActiveTab("preview")}
        >
          Preview
        </button>
        <button
          className={cn(
            "hover:text-primary text-muted-foreground",
            activeTab === "console" && "text-[#3579F6] hover:text-[#3579F6] "
          )}
          onClick={() => setActiveTab("console")}
        >
          console
        </button>
      </div>
    );
  };

  return {
    activeTab,
    SandpackTabs,
  };
};
