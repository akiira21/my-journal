"use client";

import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Folder, MoveRight, Send, Sparkles } from "lucide-react";
import React from "react";
import CommandMenuButton from "./buttons/command-menu-button";
import Link from "next/link";
import { GITHUB, GMAIL, PORTFOLIO, XPROFILE } from "@/personal-links";

const CommandMenu = () => {
  const [open, setOpen] = React.useState(false);

  React.useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((open) => !open);
      }
    };
    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  return (
    <div className="flex">
      <span onClick={() => setOpen(!open)}>
        <CommandMenuButton open={open} />
      </span>
      <CommandDialog open={open} onOpenChange={setOpen}>
        <CommandInput placeholder="Type a command or search..." />
        <CommandList>
          <CommandEmpty>No results found.</CommandEmpty>
          <CommandGroup heading="Tools">
            <CommandItem className="flex items-center justify-between bg-[#f0f5fe] dark:bg-[#0e121f] text-[#4A72F4] cursor-pointer">
              <div className="flex items-center gap-x-4">
                <Sparkles />
                <span>Ask me anything</span>
              </div>

              <span className="text-emerald-500 text-xs font-medium p-1 rounded">
                Experimental
              </span>
            </CommandItem>
          </CommandGroup>
          <CommandGroup heading="Navigation">
            {navigationRoutes.map((route) => (
              <CommandItem key={route.label}>
                <Link
                  href={route.path}
                  className="flex gap-x-4 items-center w-full"
                >
                  <MoveRight />
                  <span>{route.label}</span>
                </Link>
              </CommandItem>
            ))}
          </CommandGroup>

          <CommandGroup heading="Links">
            {socialRoutes.map((route) => (
              <CommandItem key={route.label}>
                <Link
                  href={route.path}
                  className="flex gap-x-4 items-center w-full"
                  target="_blank"
                >
                  {route.icon}
                  <span>{route.label}</span>
                </Link>
              </CommandItem>
            ))}
          </CommandGroup>
        </CommandList>
      </CommandDialog>
    </div>
  );
};

export default CommandMenu;

const navigationRoutes = [
  {
    label: "Home",
    path: "/",
  },
  {
    label: "Design System",
    path: "/design",
  },
];

const socialRoutes = [
  {
    label: "Twitter",
    path: XPROFILE,
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="lucide lucide-twitter"
      >
        <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z" />
      </svg>
    ),
  },
  {
    label: "GitHub",
    path: GITHUB,
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="lucide lucide-github"
      >
        <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
        <path d="M9 18c-4.51 2-5-2-7-2" />
      </svg>
    ),
  },
  {
    label: "Contact",
    path: GMAIL,
    icon: <Send />,
  },
  {
    label: "Work",
    path: PORTFOLIO,
    icon: <Folder />,
  },
];
