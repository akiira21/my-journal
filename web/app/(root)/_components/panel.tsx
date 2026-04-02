import { cn } from "@/lib/utils";

function Panel({
  className,
  ...props
}: React.ComponentProps<"section">) {
  return (
    <section
      data-slot="panel"
      className={cn(
        "screen-line-top screen-line-bottom border-x border-line",
        className
      )}
      {...props}
    />
  );
}

function PanelHeader({
  className,
  ...props
}: React.ComponentProps<"header">) {
  return (
    <header
      data-slot="panel-header"
      className={cn("screen-line-bottom px-4 py-4 sm:px-6", className)}
      {...props}
    />
  );
}

function PanelTitle({
  className,
  ...props
}: React.ComponentProps<"h2">) {
  return (
    <h2
      data-slot="panel-title"
      className={cn("text-2xl font-semibold tracking-tight", className)}
      {...props}
    />
  );
}

function PanelContent({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="panel-content"
      className={cn("px-4 pb-4 sm:px-6", className)}
      {...props}
    />
  );
}

export { Panel, PanelHeader, PanelTitle, PanelContent };
