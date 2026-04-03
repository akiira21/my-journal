import { unstable_cache } from "next/cache";

import { personalConfig } from "@/lib/personal-data";

export type Activity = {
  date: string;
  count: number;
  level: number;
};

type GitHubContributionsResponse = {
  contributions?: Activity[];
};

function resolveGitHubUsername() {
  const raw = personalConfig.about.github.trim();

  if (!raw) {
    return "";
  }

  if (raw.startsWith("http://") || raw.startsWith("https://")) {
    try {
      const url = new URL(raw);
      return url.pathname.split("/").filter(Boolean)[0] ?? "";
    } catch {
      return "";
    }
  }

  return raw.replace(/^@/, "");
}

export const GITHUB_USERNAME = resolveGitHubUsername();

export const getGitHubContributions = unstable_cache(
  async () => {
    const apiBase = process.env.GITHUB_CONTRIBUTIONS_API_URL;

    if (!apiBase || !GITHUB_USERNAME) {
      return [] as Activity[];
    }

    try {
      const response = await fetch(`${apiBase}/v4/${GITHUB_USERNAME}?y=last`, {
        next: { revalidate: 86400 },
      });

      if (!response.ok) {
        return [] as Activity[];
      }

      const data = (await response.json()) as GitHubContributionsResponse;
      return data.contributions ?? [];
    } catch {
      return [] as Activity[];
    }
  },
  ["github-contributions", GITHUB_USERNAME],
  { revalidate: 86400 },
);
