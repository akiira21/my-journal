import { cn } from "@/lib/utils";

type SandpackTabsType = "preview" | "console";

interface SandpackTabsProps {
  activeTab: SandpackTabsType;
  setActiveTab: (tab: SandpackTabsType) => void;
}

const SandpackTabs = ({ activeTab, setActiveTab }: SandpackTabsProps) => {
  return (
    <div className="flex w-full items-center gap-4 px-2 font-medium text-sm">
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

export default SandpackTabs;
