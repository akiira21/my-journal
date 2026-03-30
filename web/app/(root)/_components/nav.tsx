"use client";

import { useTheme } from "next-themes";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Navbar() {
  const pathname = usePathname();

  const { theme, setTheme } = useTheme();
  const isDark = theme === "dark";

  const handleThemeToggle = () => {
    setTheme(isDark ? "light" : "dark");
  };

  return (
      <div className="flex flex-col items-end gap-2 w-full  py-4 px-4 md:px-8">
        <div className="flex items-center gap-x-4 text-sm italic">
          {navLinks.map((link) => (
            <Link
              key={`navlink-${link.label}`}
              href={link.path}
              className={`${
                pathname === link.path ? "underline" : ""
              } hover:text-zinc-700 dark:hover:text-zinc-300`}
            >
              {link.label}
            </Link>
          ))}
        </div>
      <button className="text-xs italic" onClick={handleThemeToggle}>
        {theme === "dark" ? (
          <span>Turn on the lights</span>
        ) : (
          <span>Turn off the lights</span>
        )}
      </button>
      </div>
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
