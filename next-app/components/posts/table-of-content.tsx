"use client";

import React, { useEffect, useState, useCallback } from "react";
import { cn } from "@/lib/utils";

interface Section {
  id: string;
  title: string;
  level?: number;
}

interface TableOfContentProps {
  sections: Section[];
}

function formatTitle(title: string): string {
  const words = title.split(" ");
  if (words.length <= 4) return title;
  return words.slice(0, 4).join(" ") + "...";
}

export function TableOfContent({ sections }: TableOfContentProps) {
  const [activeSection, setActiveSection] = useState<string>("");
  const [isExpanded, setIsExpanded] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);

  // Find active section on scroll
  useEffect(() => {
    const findActiveSection = () => {
      let closestSection = { id: "", distance: Number.POSITIVE_INFINITY };
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
        const newIndex = sections.findIndex((s) => s.id === newActiveSection);
        if (newIndex !== -1) {
          setSelectedIndex(newIndex);
        }
      }
    };

    handleScroll();
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [sections, activeSection]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Toggle with 'T' key
      if (event.key.toLowerCase() === "t") {
        const activeElement = document.activeElement;
        const isTyping =
          activeElement &&
          (activeElement.tagName === "INPUT" ||
            activeElement.tagName === "TEXTAREA" ||
            activeElement.getAttribute("contenteditable") === "true");

        if (!isTyping) {
          event.preventDefault();
          setIsExpanded(!isExpanded);
        }
        return;
      }

      if (isExpanded) {
        switch (event.code) {
          case "Escape":
            event.preventDefault();
            setIsExpanded(false);
            break;
          case "ArrowUp":
            event.preventDefault();
            setSelectedIndex((prev) => (prev > 0 ? prev - 1 : sections.length - 1));
            break;
          case "ArrowDown":
            event.preventDefault();
            setSelectedIndex((prev) => (prev < sections.length - 1 ? prev + 1 : 0));
            break;
          case "Enter":
          case "Space":
            event.preventDefault();
            if (sections[selectedIndex]) {
              scrollToSection(sections[selectedIndex].id);
            }
            break;
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isExpanded, selectedIndex, sections]);

  // Close on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (isExpanded && !target.closest(".toc-container")) {
        setIsExpanded(false);
      }
    };

    if (isExpanded) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isExpanded]);

  const scrollToSection = useCallback((id: string) => {
    const element = document.getElementById(id);
    if (element) {
      const offset = 80;
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - offset;

      window.scrollTo({
        top: offsetPosition,
        behavior: "smooth",
      });

      setTimeout(() => {
        setIsExpanded(false);
      }, 200);
    }
  }, []);

  const getCurrentSection = useCallback(() => {
    return sections.find((section) => section.id === activeSection);
  }, [sections, activeSection]);

  const currentSection = getCurrentSection();

  const getCollapsedWidth = () => {
    const sectionToUse = currentSection || sections[0];
    if (!sectionToUse) return "200px";
    const title = formatTitle(sectionToUse.title);
    const estimatedWidth = Math.max(200, title.length * 7 + 100);
    return `${Math.min(estimatedWidth, 320)}px`;
  };

  if (sections.length === 0) return null;

  // Use first section as default if no section is active
  const displaySection = currentSection || sections[0];

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 toc-container">
      <div
        className={cn(
          "bg-background/95 backdrop-blur-xl border border-line shadow-2xl overflow-hidden transition-all duration-300 ease-out",
          "dark:bg-background/80",
          isExpanded ? "w-[380px] rounded-xl" : "rounded-2xl"
        )}
        style={{
          width: isExpanded ? "380px" : getCollapsedWidth(),
          minHeight: isExpanded ? "400px" : "44px",
          maxHeight: isExpanded ? "70vh" : "44px",
        }}
      >
        {/* Collapsed state */}
        <div
          onClick={() => setIsExpanded(true)}
          className={cn(
            "absolute inset-0 px-4 py-3 cursor-pointer hover:bg-accent/50 transition-colors flex items-center",
            isExpanded ? "opacity-0 pointer-events-none" : "opacity-100"
          )}
        >
          <div className="flex items-center space-x-3 w-full min-w-0">
            <div className="w-2 h-2 bg-primary rounded-full flex-shrink-0 animate-pulse" />
            <span className="text-sm font-medium truncate flex-1 min-w-0">
              {displaySection ? formatTitle(displaySection.title) : "Table of Contents"}
            </span>
            <span className="text-[10px] text-muted-foreground uppercase tracking-wider flex-shrink-0">
              Press T
            </span>
            <svg
              viewBox="0 0 16 16"
              fill="currentColor"
              className="w-4 h-4 text-muted-foreground flex-shrink-0"
            >
              <path d="M3.5 6.5L8 11L12.5 6.5L11.5 5.5L8 9L4.5 5.5L3.5 6.5Z" />
            </svg>
          </div>
        </div>

        {/* Expanded state */}
        <div
          className={cn(
            "absolute inset-0 w-full h-full p-4 flex flex-col transition-opacity duration-300",
            isExpanded ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
          )}
        >
          {/* Header */}
          <div className="flex items-center justify-between mb-3 flex-shrink-0 border-b border-line pb-3">
            <h3 className="font-semibold text-sm">Table of Contents</h3>
            <button
              onClick={() => setIsExpanded(false)}
              className="w-6 h-6 text-muted-foreground hover:text-foreground transition-colors rounded hover:bg-accent flex items-center justify-center"
              aria-label="Close table of contents"
            >
              <svg viewBox="0 0 16 16" fill="currentColor" className="w-4 h-4">
                <path d="M12.854 4.854a.5.5 0 0 0-.708-.708L8 8.293 3.854 4.146a.5.5 0 1 0-.708.708L7.293 9l-4.147 4.146a.5.5 0 0 0 .708.708L8 9.707l4.146 4.147a.5.5 0 0 0 .708-.708L8.707 9l4.147-4.146z" />
              </svg>
            </button>
          </div>

          {/* Instructions */}
          <p className="text-muted-foreground text-xs mb-3 flex-shrink-0">
            Use ↑↓ arrows to navigate • Enter to select • Esc to close
          </p>

          {/* Sections list */}
          <div className="flex-1 overflow-y-auto min-h-0">
            <div className="space-y-1">
              {sections.map((section, index) => (
                <button
                  key={section.id}
                  onClick={() => scrollToSection(section.id)}
                  onMouseEnter={() => setSelectedIndex(index)}
                  className={cn(
                    "w-full text-left px-3 py-2 transition-colors flex items-center space-x-3 group rounded-md",
                    activeSection === section.id
                      ? "bg-accent text-accent-foreground"
                      : selectedIndex === index
                      ? "bg-muted"
                      : "hover:bg-accent/50"
                  )}
                >
                  <div
                    className={cn(
                      "w-1.5 h-1.5 rounded-full flex-shrink-0",
                      activeSection === section.id
                        ? "bg-primary"
                        : "bg-muted-foreground/40 group-hover:bg-muted-foreground/60"
                    )}
                  />
                  <span className="text-sm flex-1 text-left leading-tight min-w-0 break-words">
                    {section.title}
                  </span>
                  {activeSection === section.id && (
                    <svg
                      viewBox="0 0 16 16"
                      fill="currentColor"
                      className="w-3 h-3 flex-shrink-0"
                    >
                      <path d="M8 3.5L12.5 8L8 12.5L7.086 11.586L10.172 8.5H3.5V7.5H10.172L7.086 4.414L8 3.5Z" />
                    </svg>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Footer */}
          <div className="mt-3 pt-3 border-t border-line flex-shrink-0">
            <p className="text-muted-foreground text-xs text-center">
              {sections.length} sections
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
