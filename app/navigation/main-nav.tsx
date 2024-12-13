"use client";

import { useState, useEffect } from "react";
import ThemeSwitcher from "@/custom_components/buttons/theme-switcher";
import CommandMenu from "@/custom_components/command-menu";
import Logo from "@/custom_components/logo";

const MainNav = () => {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 0);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <nav
      className={`
        fixed top-0 left-0 right-0 w-full backdrop-blur-lg 
        transition-all duration-300 ease-in-out z-50
        ${isScrolled ? "border-b h-14" : "h-20"}
      `}
    >
      <div className="max-w-3xl w-full flex items-center justify-between p-4 mx-auto h-full">
        <Logo width={32} height={32} />

        <div className="flex gap-x-2">
          <CommandMenu />
          <ThemeSwitcher />
        </div>
      </div>
    </nav>
  );
};

export default MainNav;
