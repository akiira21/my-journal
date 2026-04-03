"use client";

import { LoaderIcon } from "lucide-react";
import { use } from "react";

import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import type { Activity } from "@/data/github-contributions";
import { GITHUB_USERNAME } from "@/data/github-contributions";

const LEVEL_STYLE: Record<number, string> = {
  0: "bg-muted/60",
  1: "bg-emerald-200 dark:bg-emerald-950",
  2: "bg-emerald-300 dark:bg-emerald-900",
  3: "bg-emerald-400 dark:bg-emerald-800",
  4: "bg-emerald-500 dark:bg-emerald-700",
};

function prettyDate(date: string) {
  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(date));
}

export function GitHubContributionGraph({
  contributions,
}: {
  contributions: Promise<Activity[]>;
}) {
  const data = use(contributions);
  const total = data.reduce((sum, item) => sum + item.count, 0);
  const weeks = toWeekColumns(data).slice(-53);
  const monthMarks = getMonthMarks(weeks);
  const columnWidth = 14;
  const graphWidth = weeks.length * columnWidth;

  return (
    <div className="p-4">
      <div className="overflow-x-auto pb-2">
        <div className="inline-block min-w-max" style={{ width: graphWidth }}>
          <div className="relative mb-2 h-3 text-[10px] text-muted-foreground">
            {monthMarks.map((mark) => (
              <span
                key={`${mark.label}-${mark.weekIndex}`}
                className="absolute"
                style={{ left: mark.weekIndex * columnWidth }}
              >
                {mark.label}
              </span>
            ))}
          </div>

          <div className="inline-flex gap-1">
            {weeks.map((week, weekIndex) => (
              <div key={`week-${weekIndex}`} className="grid grid-rows-7 gap-1">
              {week.map((activity, dayIndex) => (
                <Tooltip key={activity ? `${activity.date}-${dayIndex}` : `empty-${weekIndex}-${dayIndex}`}>
                  <TooltipTrigger asChild>
                    <div
                      className={`h-2.5 w-2.5 rounded-xs border border-line/70 ${activity ? (LEVEL_STYLE[activity.level] ?? LEVEL_STYLE[0]) : "border-transparent bg-transparent"}`}
                    />
                  </TooltipTrigger>
                  {activity ? (
                    <TooltipContent>
                      <p>
                        {activity.count} contribution{activity.count === 1 ? "" : "s"} on {prettyDate(activity.date)}
                      </p>
                    </TooltipContent>
                  ) : null}
                </Tooltip>
              ))}
            </div>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-3 flex flex-wrap items-center justify-between gap-2 text-xs text-muted-foreground">
        <p>
          {total.toLocaleString("en")} contributions in the last year on{" "}
          <a
            className="underline underline-offset-4 transition-colors hover:text-foreground"
            href={`https://github.com/${GITHUB_USERNAME}`}
            target="_blank"
            rel="noopener"
          >
            GitHub
          </a>
          .
        </p>

        <div className="flex items-center gap-1">
          <span>Less</span>
          <span className="h-2.5 w-2.5 rounded-xs border border-line/70 bg-muted/60" />
          <span className="h-2.5 w-2.5 rounded-xs border border-line/70 bg-emerald-300 dark:bg-emerald-900" />
          <span className="h-2.5 w-2.5 rounded-xs border border-line/70 bg-emerald-500 dark:bg-emerald-700" />
          <span>More</span>
        </div>
      </div>
    </div>
  );
}

function toWeekColumns(data: Activity[]) {
  if (data.length === 0) {
    return [] as Array<Array<Activity | null>>;
  }

  const firstDate = new Date(`${data[0].date}T00:00:00`);
  const leadingEmpty = firstDate.getDay();
  const padded: Array<Activity | null> = [...Array.from({ length: leadingEmpty }).map(() => null), ...data];
  const trailingEmpty = (7 - (padded.length % 7)) % 7;
  for (let i = 0; i < trailingEmpty; i += 1) {
    padded.push(null);
  }

  const weeks: Array<Array<Activity | null>> = [];

  for (let index = 0; index < padded.length; index += 7) {
    weeks.push(padded.slice(index, index + 7));
  }

  return weeks;
}

function getMonthMarks(weeks: Array<Array<Activity | null>>) {
  const marks: Array<{ label: string; weekIndex: number }> = [];
  let previousMonth = -1;

  weeks.forEach((week, weekIndex) => {
    const firstNonNull = week.find((day) => day !== null);

    if (!firstNonNull) {
      return;
    }

    const date = new Date(`${firstNonNull.date}T00:00:00`);
    const month = date.getMonth();

    if (weekIndex === 0 || month !== previousMonth) {
      marks.push({
        label: date.toLocaleString("en-US", { month: "short" }),
        weekIndex,
      });
      previousMonth = month;
    }
  });

  return marks;
}

export function GitHubContributionFallback() {
  return (
    <div className="flex h-32 w-full items-center justify-center">
      <LoaderIcon className="animate-spin text-muted-foreground" />
    </div>
  );
}
