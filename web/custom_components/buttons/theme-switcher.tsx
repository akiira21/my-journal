"use client";

import React from "react";
import { MoonIcon, SunMediumIcon } from "lucide-react";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";

const ThemeSwitcher = () => {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  const isDark = resolvedTheme === "dark";

  const handleThemeToggle = () => {
    setTheme(isDark ? "light" : "dark");
  };

  return (
    <Button
      onClick={handleThemeToggle}
      variant="ghost"
      size="icon-sm"
      className="border border-line/80 bg-background/70 text-muted-foreground hover:bg-muted/60 hover:text-foreground"
      aria-label="Toggle theme"
    >
      {mounted && isDark ? (
        <SunMediumIcon className="size-4" />
      ) : (
        <MoonIcon className="size-4" />
      )}
    </Button>
  );
};

export default ThemeSwitcher;
