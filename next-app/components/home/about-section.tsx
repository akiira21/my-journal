import { Panel, PanelContent, PanelHeader, PanelTitle } from "@/components/home/panel";
import { personalConfig } from "@/lib/personal-data";

export function AboutSection() {
  const { about } = personalConfig;

  return (
    <Panel id="about">
      <PanelHeader>
        <PanelTitle>About</PanelTitle>
      </PanelHeader>

      <PanelContent className="p-0">
        <div className="border-y border-line p-4 space-y-3">
          {about.description.map((paragraph, i) => (
            <p
              key={i}
              className="font-mono text-xs leading-6 text-muted-foreground"
            >
              {paragraph}
            </p>
          ))}
        </div>
      </PanelContent>
    </Panel>
  );
}
