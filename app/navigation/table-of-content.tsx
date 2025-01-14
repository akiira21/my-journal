"use client";

import Link from "next/link";
import React from "react";
import { motion } from "framer-motion";
import ProgressBar from "./progressbar";

interface TableOfContentProps {
  sections: any[];
}

export default function TableOfContent({ sections }: TableOfContentProps) {
  const [activeSection, setActiveSection] = React.useState<string>("");

  React.useEffect(() => {
    const findActiveSection = () => {
      let closestSection = { id: "", distance: Infinity };
      const scrollTop = window.scrollY;
      const windowHeight = window.innerHeight;
      const buffer = windowHeight * 0.1;

      sections.forEach((section) => {
        const element = document.getElementById(section.id);
        if (element) {
          const rect = element.getBoundingClientRect();
          const absoluteTop = rect.top + scrollTop;
          const distance = Math.abs(scrollTop - absoluteTop + buffer);

          if (distance < closestSection.distance) {
            closestSection = { id: section.id, distance };
          }
        }
      });

      return closestSection.id;
    };

    const handleScroll = () => {
      const newActiveSection = findActiveSection();
      if (newActiveSection !== activeSection) {
        setActiveSection(newActiveSection);
      }
    };

    handleScroll();
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [sections, activeSection]);

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      const offset = window.innerHeight * 0.07;
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - offset;

      window.scrollTo({
        top: offsetPosition,
        behavior: "smooth",
      });
    }
  };

  const formatTitle = (title: string) => {
    const words = title.split(" ");
    if (words.length <= 3) return title;

    return (
      <>
        {words.slice(0, 3).join(" ")}
        <br />
        {words.slice(3).join(" ")}
      </>
    );
  };

  return (
    <div className="relative">
      <ProgressBar />
      <motion.div
        initial={{ opacity: 0, x: -100 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5 }}
        className="fixed z-50 top-1/3 left-3 -translate-y-1/3 lg:block hidden"
      >
        <nav aria-label="Table of contents">
          <ul className="space-y-1">
            {sections.map((section) => (
              <li key={section.id}>
                <Link
                  href={`#${section.id}`}
                  onClick={(e) => {
                    e.preventDefault();
                    scrollToSection(section.id);
                  }}
                  className={`block py-1 px-2 text-sm rounded transition-colors font-medium max-w-[200px] leading-tight ${
                    activeSection === section.id
                      ? "text-[#4A72F4]"
                      : "hover:text-zinc-900 dark:hover:text-zinc-200 text-zinc-600 dark:text-zinc-400"
                  }`}
                >
                  {formatTitle(section.title)}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </motion.div>
    </div>
  );
}
