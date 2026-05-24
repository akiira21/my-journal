"use client";

import React, { useEffect, useState, useCallback, useMemo } from "react";

interface Section {
  id: string;
  title: string;
  level?: number;
}

interface TableOfContentProps {
  sections: Section[];
}

/* ------------------------------------------------------------------ */
/*  Helpers                                                           */
/* ------------------------------------------------------------------ */

function formatTitle(title: string): string {
  const words = title.split(" ");
  if (words.length <= 6) return title;
  return words.slice(0, 6).join(" ") + "…";
}

/** Calculate overall page scroll progress (0 = top, 1 = bottom). */
function calcScrollProgress(): number {
  const scrollTop = window.scrollY;
  const docHeight = document.documentElement.scrollHeight - window.innerHeight;
  if (docHeight <= 0) return 0;
  return Math.min(1, Math.max(0, scrollTop / docHeight));
}

/* ------------------------------------------------------------------ */
/*  Mini circle progress SVG                                          */
/* ------------------------------------------------------------------ */

function CircleProgress({
  progress,
  size = 28,
  stroke = 3,
}: {
  progress: number; // 0‑1
  size?: number;
  stroke?: number;
}) {
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const dashoffset = circumference * (1 - progress);

  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      className="flex-shrink-0"
      style={{ transform: "rotate(-90deg)" }}
    >
      {/* track */}
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke="currentColor"
        strokeWidth={stroke}
        className="text-foreground/15 dark:text-white/15"
      />
      {/* progress */}
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke="currentColor"
        strokeWidth={stroke}
        strokeLinecap="round"
        strokeDasharray={circumference}
        strokeDashoffset={dashoffset}
        className="text-primary transition-[stroke-dashoffset] duration-300 ease-out"
      />
      {/* centre dot */}
      <circle
        cx={size / 2}
        cy={size / 2}
        r={3.5}
        className="fill-foreground/60 dark:fill-white/60"
      />
    </svg>
  );
}

/* ------------------------------------------------------------------ */
/*  Component                                                         */
/* ------------------------------------------------------------------ */

export function TableOfContent({ sections }: TableOfContentProps) {
  const [activeSection, setActiveSection] = useState<string>("");
  const [isExpanded, setIsExpanded] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [progress, setProgress] = useState(0);

  /* ---- find active section & progress on scroll ---- */
  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY;
      const windowHeight = window.innerHeight;
      const buffer = windowHeight * 0.15;

      let closestId = "";
      let closestDist = Number.POSITIVE_INFINITY;

      sections.forEach((section) => {
        const el = document.getElementById(section.id);
        if (!el) return;
        const absTop = el.getBoundingClientRect().top + scrollTop;
        const dist = Math.abs(scrollTop - absTop + buffer);
        if (dist < closestDist) {
          closestDist = dist;
          closestId = section.id;
        }
      });

      if (closestId && closestId !== activeSection) {
        setActiveSection(closestId);
        const idx = sections.findIndex((s) => s.id === closestId);
        if (idx !== -1) setSelectedIndex(idx);
      }

      setProgress(calcScrollProgress());
    };

    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [sections, activeSection]);

  /* ---- keyboard shortcuts ---- */
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      // Toggle with 'T'
      if (e.key.toLowerCase() === "t") {
        const ae = document.activeElement;
        const typing =
          ae &&
          (ae.tagName === "INPUT" ||
            ae.tagName === "TEXTAREA" ||
            ae.getAttribute("contenteditable") === "true");
        if (!typing) {
          e.preventDefault();
          setIsExpanded((v) => !v);
        }
        return;
      }

      if (!isExpanded) return;

      switch (e.code) {
        case "Escape":
          e.preventDefault();
          setIsExpanded(false);
          break;
        case "ArrowUp":
          e.preventDefault();
          setSelectedIndex((p) => (p > 0 ? p - 1 : sections.length - 1));
          break;
        case "ArrowDown":
          e.preventDefault();
          setSelectedIndex((p) => (p < sections.length - 1 ? p + 1 : 0));
          break;
        case "Enter":
        case "Space":
          e.preventDefault();
          if (sections[selectedIndex]) scrollToSection(sections[selectedIndex].id);
          break;
      }
    };

    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isExpanded, selectedIndex, sections]);

  /* ---- click outside to close ---- */
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (isExpanded && !(e.target as HTMLElement).closest(".toc-island")) {
        setIsExpanded(false);
      }
    };
    if (isExpanded) document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, [isExpanded]);

  const scrollToSection = useCallback((id: string) => {
    const el = document.getElementById(id);
    if (el) {
      const offset = 80;
      window.scrollTo({
        top: el.getBoundingClientRect().top + window.scrollY - offset,
        behavior: "smooth",
      });
      setTimeout(() => setIsExpanded(false), 200);
    }
  }, []);

  /* ---- derived state ---- */
  const currentSection = useMemo(
    () => sections.find((s) => s.id === activeSection),
    [sections, activeSection],
  );

  const displaySection = currentSection || sections[0];

  const sectionIndex = useMemo(
    () => sections.findIndex((s) => s.id === activeSection),
    [sections, activeSection],
  );

  if (sections.length === 0) return null;

  /* ---------------------------------------------------------------- */
  /*  Render                                                          */
  /* ---------------------------------------------------------------- */

  return (
    <div className="toc-island fixed bottom-6 left-1/2 -translate-x-1/2 z-50">
      {/* ── Collapsed pill (Dynamic Island style) ── */}
      <div
        onClick={() => setIsExpanded(true)}
        className={`
          relative overflow-hidden cursor-pointer select-none
          flex items-center gap-2.5
          rounded-[2rem] px-4 py-2.5
          bg-white/80 dark:bg-black/60 backdrop-blur-xl
          border border-black/[0.08] dark:border-white/[0.08]
          shadow-[0_8px_32px_rgba(0,0,0,0.12),inset_0_1px_0_rgba(255,255,255,0.8)]
          dark:shadow-[0_8px_32px_rgba(0,0,0,0.35),inset_0_1px_0_rgba(255,255,255,0.08)]
          transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)]
          hover:bg-white/90 dark:hover:bg-black/70 hover:scale-[1.02]
          ${isExpanded ? "opacity-0 scale-95 pointer-events-none" : "opacity-100 scale-100"}
        `}
      >
        {/* Circle progress */}
        <CircleProgress
          progress={progress}
          size={28}
          stroke={3}
        />

        {/* Active section title */}
        <span className="text-[13px] font-medium text-foreground/90 whitespace-nowrap max-w-[220px] truncate">
          {displaySection ? formatTitle(displaySection.title) : "Table of Contents"}
        </span>

        {/* Chevron down */}
        <svg
          viewBox="0 0 16 16"
          fill="currentColor"
          className="w-3.5 h-3.5 text-foreground/40 flex-shrink-0 ml-0.5"
        >
          <path d="M3.5 6.5L8 11L12.5 6.5L11.5 5.5L8 9L4.5 5.5L3.5 6.5Z" />
        </svg>
      </div>

      {/* ── Expanded panel ── */}
      <div
        className={`
          absolute bottom-full left-1/2 -translate-x-1/2 mb-3
          overflow-hidden
          bg-white/85 dark:bg-black/70 backdrop-blur-2xl
          border border-black/[0.08] dark:border-white/[0.08]
          shadow-[0_16px_64px_rgba(0,0,0,0.15),inset_0_1px_0_rgba(255,255,255,0.9)]
          dark:shadow-[0_16px_64px_rgba(0,0,0,0.45),inset_0_1px_0_rgba(255,255,255,0.08)]
          transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)]
          origin-bottom
          ${
            isExpanded
              ? "opacity-100 scale-100 rounded-2xl w-[340px]"
              : "opacity-0 scale-90 rounded-[2rem] w-[280px] pointer-events-none"
          }
        `}
        style={{
          maxHeight: isExpanded ? "calc(100vh - 140px)" : "44px",
          minHeight: isExpanded ? "300px" : "44px",
        }}
      >
        {/* Header (visible in expanded mode) */}
        <div
          className={`
            flex items-center justify-between px-5 pt-4 pb-3
            transition-opacity duration-300 delay-100
            ${isExpanded ? "opacity-100" : "opacity-0"}
          `}
        >
          <div className="flex items-center gap-2.5">
            <CircleProgress
              progress={progress}
              size={28}
              stroke={3}
            />
            <div>
              <h3 className="text-[13px] font-semibold text-foreground/90">
                Reading
              </h3>
              <p className="text-[10px] text-foreground/40 font-medium">
                {sectionIndex + 1} / {sections.length} sections
              </p>
            </div>
          </div>

          <button
            onClick={() => setIsExpanded(false)}
            className="
              w-7 h-7 rounded-full
              flex items-center justify-center
              text-foreground/50 hover:text-foreground/90
              dark:text-white/50 dark:hover:text-white/90
              hover:bg-black/10 dark:hover:bg-white/10
              transition-colors
            "
            aria-label="Close table of contents"
          >
            <svg viewBox="0 0 16 16" fill="currentColor" className="w-3.5 h-3.5">
              <path d="M12.854 4.854a.5.5 0 0 0-.708-.708L8 8.293 3.854 4.146a.5.5 0 1 0-.708.708L7.293 9l-4.147 4.146a.5.5 0 0 0 .708.708L8 9.707l4.146 4.147a.5.5 0 0 0 .708-.708L8.707 9l4.147-4.146z" />
            </svg>
          </button>
        </div>

        {/* Sections list */}
        <div
          className={`
            px-3 pb-3 overflow-y-auto
            transition-opacity duration-300 delay-150
            dark:[&::-webkit-scrollbar-thumb]:bg-white/15
            [&::-webkit-scrollbar]:w-1 [&::-webkit-scrollbar-track]:bg-transparent
            [&::-webkit-scrollbar-thumb]:bg-black/15 dark:[&::-webkit-scrollbar-thumb]:bg-white/15
            [&::-webkit-scrollbar-thumb]:rounded-full
            ${isExpanded ? "opacity-100" : "opacity-0"}
          `}
          style={{
            maxHeight: isExpanded ? "calc(100vh - 220px)" : "0px",
            scrollbarWidth: "thin",
            scrollbarColor: "rgba(0,0,0,0.15) transparent",
          }}
        >
          <div className="space-y-0.5">
            {sections.map((section, index) => {
              const isActive = activeSection === section.id;
              const isSelected = selectedIndex === index;

              return (
                <button
                  key={section.id}
                  onClick={() => scrollToSection(section.id)}
                  onMouseEnter={() => setSelectedIndex(index)}
                  className={`
                    w-full text-left px-3 py-2 rounded-xl
                    flex items-center gap-3
                    transition-all duration-200
                    ${
                      isActive
                        ? "bg-black/[0.08] dark:bg-white/[0.12] text-foreground dark:text-white"
                        : isSelected
                        ? "bg-black/[0.04] dark:bg-white/[0.06] text-foreground/80 dark:text-white/80"
                        : "text-foreground/50 dark:text-white/50 hover:text-foreground/70 dark:hover:text-white/70 hover:bg-black/[0.03] dark:hover:bg-white/[0.04]"
                    }
                  `}
                >
                  {/* Section dot / progress */}
                  <div className="relative flex items-center justify-center w-5 h-5 flex-shrink-0">
                    {isActive ? (
                      <div className="w-2 h-2 rounded-full bg-primary shadow-[0_0_8px_rgba(59,130,246,0.4)] dark:shadow-[0_0_8px_rgba(59,130,246,0.5)]" />
                    ) : index < sectionIndex ? (
                      <div className="w-1.5 h-1.5 rounded-full bg-foreground/30 dark:bg-white/30" />
                    ) : (
                      <div className="w-1.5 h-1.5 rounded-full bg-foreground/15 dark:bg-white/15" />
                    )}
                  </div>

                  {/* Title */}
                  <span
                    className={`
                      text-[13px] leading-snug flex-1 min-w-0 truncate
                      ${isActive ? "font-medium" : "font-normal"}
                    `}
                  >
                    {section.title}
                  </span>

                  {/* Reading check for completed sections */}
                  {index < sectionIndex && (
                    <svg
                      viewBox="0 0 16 16"
                      fill="currentColor"
                      className="w-3 h-3 text-foreground/30 dark:text-white/25 flex-shrink-0"
                    >
                      <path d="M12.207 5.793l-5.5 5.5a.999.999 0 0 1-1.414 0l-2.5-2.5a.999.999 0 1 1 1.414-1.414L6 9.586l4.793-4.793a.999.999 0 1 1 1.414 1.414z" />
                    </svg>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Footer tip */}
        <div
          className={`
            px-5 pb-3 pt-2 text-center
            transition-opacity duration-300 delay-200
            ${isExpanded ? "opacity-100" : "opacity-0"}
          `}
        >
          <p className="text-[10px] text-foreground/30 dark:text-white/25 font-medium tracking-wide">
            Press T to toggle · ↑↓ navigate · Enter select
          </p>
        </div>
      </div>
    </div>
  );
}
