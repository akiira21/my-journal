"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import ThemeSwitcher from "@/custom_components/buttons/theme-switcher";
import CommandMenu from "@/custom_components/command-menu";
import Logo from "@/custom_components/logo";
import { TypographyH4 } from "@/custom_components/typography";
import Link from "next/link";

const MainNav = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [navTitle, setNavTitle] = useState<string>("");

  const activePage = window.location.pathname;

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 0);
    };

    const header = document.getElementById("post-header");
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting && activePage.startsWith("/posts")) {
          setNavTitle(header?.textContent ?? "");
        } else {
          setNavTitle("");
        }
      },
      { threshold: 0 }
    );

    if (header) {
      observer.observe(header);
    }

    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
      observer.disconnect();
      setNavTitle("");
    };
  }, [activePage]);

  return (
    <nav
      className={`
        fixed top-0 left-0 right-0 w-full backdrop-blur-md
        transition-all duration-300 ease-in-out z-50 bg-[#f6f9fe9a] dark:bg-[#090a0f9a]
        ${isScrolled ? "border-b h-14" : "h-20"}
      `}
    >
      <div className="max-w-3xl w-full flex items-center justify-between p-4 mx-auto h-full">
        <div className="flex items-center gap-x-6">
          <motion.div
            animate={{
              scale: isScrolled ? 0.75 : 1,
            }}
            transition={{
              type: "spring",
              stiffness: 260,
              damping: 20,
            }}
          >
            <Link href={"/"}>
              <Logo width={32} height={32} />
            </Link>
          </motion.div>

          <AnimatePresence mode="wait">
            {navTitle && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{
                  type: "spring",
                  stiffness: 260,
                  damping: 20,
                }}
              >
                <TypographyH4>{navTitle}</TypographyH4>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="flex gap-x-2">
          <CommandMenu />
          <ThemeSwitcher />
        </div>
      </div>
    </nav>
  );
};

export default MainNav;
