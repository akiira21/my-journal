"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";

import { CommandMenu } from "@/components/command-menu";
import { ModeToggle } from "@/components/mode-toggle";
import { personalConfig } from "@/lib/personal-data";
import { cn } from "@/lib/utils";
import { GitHubStars } from "./github-stars/github-stars";

function isActivePath(pathname: string, href: string): boolean {
  if (!href.startsWith("/")) {
    return false;
  }

  if (href === "/") {
    return pathname === "/";
  }

  return pathname === href || pathname.startsWith(`${href}/`);
}

export function MainNavbar() {
  const pathname = usePathname();
  const mobileNavigation = personalConfig.navigation.filter((item) => item.href === "/posts" || item.href === "/assistant");
  const desktopNavigation = personalConfig.navigation.filter((item) => item.href !== "/#about");

  return (
    <header className="fixed top-0 left-0 right-0 z-50 border-b border-border/70 bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/80">
      <div className="mx-auto flex h-12 w-full max-w-3xl items-center border-l border-r border-border/70 px-2 sm:px-5">
        <Link href="/" className="mr-2 flex items-center gap-2 pr-1 sm:pr-3">
          <Image
            src="/logo.svg"
            alt="Logo"
            width={18}
            height={20}
            className="h-4.5 w-auto dark:invert"
            priority
            loading="eager"
          />
          <span className="hidden font-medium tracking-tight sm:inline">{personalConfig.siteName}</span>
        </Link>

        <nav className="flex items-center gap-3 pr-2 sm:hidden">
          {mobileNavigation.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "font-mono text-xs transition-colors",
                isActivePath(pathname, item.href)
                  ? "text-foreground"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <nav className="hidden items-center gap-4 pr-3 sm:flex">
          {desktopNavigation.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "font-mono text-sm transition-colors",
                isActivePath(pathname, item.href)
                  ? "text-foreground"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="ml-auto flex items-center gap-1.5 sm:gap-2">
          <CommandMenu />

          <div className="hidden sm:block">
            <GitHubStars repo={personalConfig.repo} />
          </div>

          <ModeToggle />
        </div>
      </div>
    </header>
  );
}