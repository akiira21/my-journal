"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import CommandMenu from "@/custom_components/command-menu";
import ThemeSwitcher from "@/custom_components/buttons/theme-switcher";

export default function Navbar() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-50 max-w-screen overflow-x-hidden bg-background/90 px-2 pt-2 backdrop-blur-lg supports-[backdrop-filter]:bg-background/70">
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
          <ThemeSwitcher />
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
