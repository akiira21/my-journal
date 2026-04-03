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
        <div className="border-y border-line p-4">
          <ul className="list-disc space-y-2 pl-5 font-mono text-sm leading-7 text-muted-foreground marker:text-foreground/50">
            {about.description.map((line) => (
              <li key={line}>{line}</li>
            ))}
          </ul>
        </div>
      </PanelContent>
    </Panel>
  );
}