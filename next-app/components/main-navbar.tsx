import Link from "next/link";
import Image from "next/image";

import { CommandMenu } from "@/components/command-menu";
import { ModeToggle } from "@/components/mode-toggle";
import { personalConfig } from "@/lib/personal-data";
import { GitHubStars } from "./github-stars/github-stars";

export function MainNavbar() {
  return (
    <header className="sticky top-0 z-50 border-b border-border/70 bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/80">
      <div className="mx-auto flex h-12 w-full max-w-3xl items-center justify-between border-l border-r border-border/70 px-3 sm:px-5">
        <Link href="/" className="flex items-center gap-2 pr-3">
          <Image
            src="/logo.svg"
            alt="Logo"
            width={18}
            height={20}
            className="h-4.5 w-auto dark:invert"
            priority
            loading="eager"
          />
          <span className="font-medium tracking-tight">{personalConfig.siteName}</span>
        </Link>
        <nav className="hidden items-center gap-4 pr-3 sm:flex">
          {personalConfig.navigation.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="font-mono text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="ml-auto flex items-center gap-1.5 sm:gap-2">
          <CommandMenu />

          <GitHubStars repo={personalConfig.repo} />

          <ModeToggle />
        </div>
      </div>
    </header>
  );
}