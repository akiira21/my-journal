"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";

import { CommandMenu } from "@/components/command-menu";
import { ModeToggle } from "@/components/mode-toggle";
import { personalConfig } from "@/lib/personal-data";
import { cn } from "@/lib/utils";
import { GitHubStars } from "./github-stars/github-stars";

function isActivePath(pathname: string, href: string): boolean {
  if (!href.startsWith("/")) return false;
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}

function MobileMenu({
  isOpen,
  onClose,
  navItems,
  pathname,
}: {
  isOpen: boolean;
  onClose: () => void;
  navItems: { label: string; href: string }[];
  pathname: string;
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 sm:hidden">
      <div
        className="absolute inset-0 bg-background/60"
        onClick={onClose}
      />
      <div className="absolute right-0 top-0 h-full w-64 border-l border-line bg-background p-4">
        <div className="flex items-center justify-between mb-6">
          <span className="font-pixel text-sm tracking-tight">Menu</span>
          <button
            onClick={onClose}
            className="rounded-md border border-line p-2 text-muted-foreground hover:text-foreground"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        <nav className="flex flex-col gap-0.5">
          {navItems.map((item) => {
            const active = isActivePath(pathname, item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onClose}
                className={cn(
                  "rounded-md px-3 py-2.5 font-mono text-sm transition-colors",
                  active
                    ? "text-foreground"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                {active && (
                  <span className="mr-2 inline-block h-1 w-1 rounded-full bg-foreground" />
                )}
                {item.label}
              </Link>
            );
          })}
        </nav>
      </div>
    </div>
  );
}

export function MainNavbar() {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = personalConfig.navigation.filter(
    (item) => item.href !== "/#about"
  );

  const isCraftSlug = pathname.startsWith("/craft/") && pathname !== "/craft/";

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-40 bg-background">
        <div className={cn(
          "screen-line-bottom mx-auto flex h-12 w-full items-center border-x border-line px-3 sm:px-4",
          isCraftSlug ? "max-w-[1400px]" : "max-w-3xl"
        )}>
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 pr-2">
            <Image
              src="/logo.svg"
              alt=""
              width={16}
              height={16}
              className="h-4 w-auto dark:invert"
              priority
              loading="eager"
            />
            <span className="hidden font-pixel text-sm tracking-tight sm:inline">
              {personalConfig.siteName}
            </span>
            <span className="font-pixel text-sm tracking-tight sm:hidden">
              {personalConfig.about.name.split(" ")[0]}&apos;s {personalConfig.siteName.toLowerCase()}
            </span>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden items-center gap-1 sm:flex">
            {navItems.map((item) => {
              const active = isActivePath(pathname, item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "px-2.5 py-1.5 font-mono text-sm transition-colors",
                    active
                      ? "text-foreground"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>

          {/* Right side */}
          <div className="ml-auto flex items-center gap-1.5">
            <div className="hidden sm:block">
              <GitHubStars repo={personalConfig.repo} />
            </div>

            <CommandMenu />

            <div className="hidden sm:block">
              <ModeToggle />
            </div>

            {/* Mobile theme toggle */}
            <div className="sm:hidden">
              <ModeToggle />
            </div>

            {/* Mobile hamburger */}
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="flex items-center justify-center rounded-md border border-line p-2 text-muted-foreground hover:text-foreground sm:hidden"
            >
              <Menu className="h-4 w-4" />
            </button>
          </div>
        </div>
      </header>

      <MobileMenu
        isOpen={mobileMenuOpen}
        onClose={() => setMobileMenuOpen(false)}
        navItems={navItems}
        pathname={pathname}
      />
    </>
  );
}
