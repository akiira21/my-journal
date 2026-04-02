"use client";

import { useTheme } from "next-themes";
import Link from "next/link";
import { usePathname } from "next/navigation";
import CommandMenu from "@/custom_components/command-menu";
import { useEffect, useState } from "react";

export default function Navbar() {
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);

  const { theme, setTheme } = useTheme();
  const isDark = theme === "dark";

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleThemeToggle = () => {
    setTheme(isDark ? "light" : "dark");
  };

  return (
    <header className="sticky top-0 z-50 max-w-screen overflow-x-hidden bg-background/95 px-2 pt-2 backdrop-blur supports-[backdrop-filter]:bg-background/75">
      <div className="screen-line-top screen-line-bottom mx-auto flex h-12 items-center justify-between gap-3 border-x border-line px-3 md:max-w-3xl">
        <Link href="/" className="text-sm font-semibold tracking-tight">
          Arun Kumar
        </Link>

        <nav className="hidden items-center gap-4 sm:flex">
          {navLinks.map((link) => (
            <Link
              key={`navlink-${link.label}`}
              href={link.path}
              className={`text-xs font-medium uppercase tracking-[0.2em] transition-colors ${
                pathname === link.path
                  ? "text-foreground"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <CommandMenu />
          <button
            className="rounded-md border border-line px-2 py-1 text-[11px] font-medium uppercase tracking-[0.14em] text-muted-foreground transition-colors hover:text-foreground"
            onClick={handleThemeToggle}
            aria-label="Toggle theme"
          >
            {mounted && theme === "dark" ? "Light" : "Dark"}
          </button>
        </div>
      </div>
    </header>
  );
}

const navLinks = [
  {
    label: "Home",
    path: "/",
  },
  {
    label: "About",
    path: "/about",
  },
  {
    label: "Posts",
    path: "/posts",
  },
];
