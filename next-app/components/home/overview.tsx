import { personalConfig } from "@/lib/personal-data";

import { Panel, PanelContent } from "@/components/home/panel";
import {
  IntroItem,
  IntroItemContent,
  IntroItemIcon,
  IntroItemLink,
} from "@/components/home/intro-item";

function IconLocation() {
  return (
    <svg viewBox="0 0 24 24" className="size-4" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 22s7-4.35 7-11a7 7 0 10-14 0c0 6.65 7 11 7 11z" />
      <path d="M12 13.5a2.5 2.5 0 100-5 2.5 2.5 0 000 5z" />
    </svg>
  );
}

function IconMail() {
  return (
    <svg viewBox="0 0 24 24" className="size-4" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 6h16v12H4z" />
      <path d="M4 7l8 6 8-6" />
    </svg>
  );
}

function IconUser() {
  return (
    <svg viewBox="0 0 24 24" className="size-4" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 12a4 4 0 100-8 4 4 0 000 8z" />
      <path d="M5 21a7 7 0 0114 0" />
    </svg>
  );
}

function IconClock() {
  return (
    <svg viewBox="0 0 24 24" className="size-4" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 22a10 10 0 100-20 10 10 0 000 20z" />
      <path d="M12 6v6l3 2" />
    </svg>
  );
}

function currentTimeIn(timezone: string) {
  return new Intl.DateTimeFormat("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
    timeZone: timezone,
  }).format(new Date());
}

export function Overview() {
  const { about } = personalConfig;
  const locationQuery = encodeURIComponent(about.location);
  const nowText = `${currentTimeIn(about.timezone)} IST`;

  return (
    <Panel className="after:content-none">
      <h2 className="sr-only">Overview</h2>
      <PanelContent className="space-y-2.5">
        <div className="grid gap-x-4 gap-y-2.5 sm:grid-cols-2">
          <IntroItem>
            <IntroItemIcon>
              <IconLocation />
            </IntroItemIcon>
            <IntroItemContent>
              <IntroItemLink
                href={`https://www.google.com/maps/search/?api=1&query=${locationQuery}`}
                aria-label={`Location: ${about.location}`}
              >
                {about.location}
              </IntroItemLink>
            </IntroItemContent>
          </IntroItem>

          <IntroItem>
            <IntroItemIcon>
              <IconClock />
            </IntroItemIcon>
            <IntroItemContent aria-label={`Current local time: ${nowText}`}>
              {nowText}
            </IntroItemContent>
          </IntroItem>

          <IntroItem>
            <IntroItemIcon>
              <IconMail />
            </IntroItemIcon>
            <IntroItemContent>
              <IntroItemLink href={`mailto:${about.email}`} aria-label={`Send email to ${about.email}`}>
                {about.email}
              </IntroItemLink>
            </IntroItemContent>
          </IntroItem>

          <IntroItem>
            <IntroItemIcon>
              <IconUser />
            </IntroItemIcon>
            <IntroItemContent aria-label={`Pronouns: ${about.pronoun}`}>
              {about.pronoun}
            </IntroItemContent>
          </IntroItem>
        </div>
      </PanelContent>
    </Panel>
  );
}