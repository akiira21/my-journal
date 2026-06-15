import { cn } from "@/lib/utils";

interface SeparatorProps {
  className?: string;
}

export function Separator({ className }: SeparatorProps) {
  return (
    <div className={cn("py-8 flex items-center justify-center", className)}>
      <div className="flex items-center gap-3">
        <div className="h-px w-10 bg-line" />
        <div className="h-2 w-2 rotate-45 border border-line bg-foreground/5" />
        <div className="h-px w-10 bg-line" />
      </div>
    </div>
  );
}
