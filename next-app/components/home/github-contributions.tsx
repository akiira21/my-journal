import { Suspense } from "react";

import { getGitHubContributions } from "@/data/github-contributions";

import { Panel, PanelHeader, PanelTitle } from "./panel";
import {
  GitHubContributionFallback,
  GitHubContributionGraph,
} from "./github-contribution-graph";

export function GitHubContributions() {
  const contributions = getGitHubContributions();

  return (
    <Panel>
      <PanelHeader>
        <PanelTitle className="text-xl">GitHub Contributions</PanelTitle>
      </PanelHeader>

      <div className="border-y border-line">
        <Suspense fallback={<GitHubContributionFallback />}>
          <GitHubContributionGraph contributions={contributions} />
        </Suspense>
      </div>
    </Panel>
  );
}
