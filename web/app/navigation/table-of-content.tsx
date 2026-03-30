"use client";
import React from "react";
import { motion, AnimatePresence } from "framer-motion";

interface TableOfContentProps {
  sections: any[];
}

export default function TableOfContent({ sections }: TableOfContentProps) {
  const [activeSection, setActiveSection] = React.useState<string>("");
  const [isExpanded, setIsExpanded] = React.useState(false);
  const [selectedIndex, setSelectedIndex] = React.useState(0);
  const [contentHeight, setContentHeight] = React.useState(0);
  const audioContextRef = React.useRef<AudioContext | null>(null);
  const contentRef = React.useRef<HTMLDivElement>(null);

  // Calculate collapsed width based on content
  const getCollapsedWidth = () => {
    if (!currentSection) return "200px";

    const title = formatTitle(currentSection.title);
    // Estimate width: padding (48px) + dot (8px) + title + press T (60px) + arrow (16px) + margin (20px)
    const estimatedWidth = Math.max(200, title.length * 7 + 152);
    return `${Math.min(estimatedWidth, 320)}px`; // Cap at 320px
  };

  // Improved height calculation
  React.useEffect(() => {
    if (isExpanded) {
      // Calculate estimated height immediately for smooth animation start
      const calculateEstimatedHeight = () => {
        const headerHeight = 52; // Header + margin bottom (16px + 24px + 12px)
        const instructionsHeight = 40; // Instructions text + margin bottom (12px + 16px + 12px)
        const footerHeight = 60; // Footer with padding and border (16px + 12px + 16px + 16px)
        const containerPadding = 32; // 16px top + 16px bottom

        // Calculate sections height
        const maxVisibleSections = 6;
        const sectionHeight = 44; // py-2.5 = 10px top + 10px bottom + content height ~24px
        const sectionGap = 4; // space-y-1
        const visibleSections = Math.min(sections.length, maxVisibleSections);
        const sectionsHeight =
          visibleSections * sectionHeight + (visibleSections - 1) * sectionGap;

        const totalHeight =
          headerHeight +
          instructionsHeight +
          sectionsHeight +
          footerHeight +
          containerPadding;
        return Math.max(totalHeight, 320); // Minimum height
      };

      const estimatedHeight = calculateEstimatedHeight();
      setContentHeight(estimatedHeight);

      // Fine-tune with actual DOM measurement
      const timer = setTimeout(() => {
        if (contentRef.current) {
          const actualHeight = contentRef.current.scrollHeight;
          const finalHeight = Math.max(actualHeight + 20, estimatedHeight); // Add 20px buffer
          setContentHeight(finalHeight);
        }
      }, 100);

      return () => clearTimeout(timer);
    }
  }, [isExpanded, sections.length]);

  // Initialize audio context
  React.useEffect(() => {
    const initAudio = () => {
      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext ||
          (window as any).webkitAudioContext)();
      }
    };

    const handleFirstInteraction = () => {
      initAudio();
      document.removeEventListener("click", handleFirstInteraction);
      document.removeEventListener("keydown", handleFirstInteraction);
    };

    document.addEventListener("click", handleFirstInteraction);
    document.addEventListener("keydown", handleFirstInteraction);

    return () => {
      document.removeEventListener("click", handleFirstInteraction);
      document.removeEventListener("keydown", handleFirstInteraction);
    };
  }, []);

  // Play click sound
  const playClickSound = React.useCallback(
    (frequency = 800, duration = 100) => {
      if (!audioContextRef.current) return;

      try {
        const oscillator = audioContextRef.current.createOscillator();
        const gainNode = audioContextRef.current.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(audioContextRef.current.destination);

        oscillator.frequency.setValueAtTime(
          frequency,
          audioContextRef.current.currentTime
        );
        oscillator.type = "sine";

        gainNode.gain.setValueAtTime(0.1, audioContextRef.current.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(
          0.01,
          audioContextRef.current.currentTime + duration / 1000
        );

        oscillator.start(audioContextRef.current.currentTime);
        oscillator.stop(audioContextRef.current.currentTime + duration / 1000);
      } catch (error) {
        console.log("Audio not available");
      }
    },
    []
  );

  React.useEffect(() => {
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
        const newIndex = sections.findIndex(
          (section) => section.id === newActiveSection
        );
        if (newIndex !== -1) {
          setSelectedIndex(newIndex);
        }
      }
    };

    handleScroll();
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [sections, activeSection]);

  // Global keyboard shortcuts
  React.useEffect(() => {
    const handleGlobalKeyDown = (event: KeyboardEvent) => {
      // Toggle TOC with 'T' key
      if (event.key.toLowerCase() === "t") {
        // Only if not typing in an input/textarea
        const activeElement = document.activeElement;
        const isTyping =
          activeElement &&
          (activeElement.tagName === "INPUT" ||
            activeElement.tagName === "TEXTAREA" ||
            activeElement.getAttribute("contenteditable") === "true");

        if (!isTyping) {
          event.preventDefault();
          setIsExpanded(!isExpanded);
          playClickSound(isExpanded ? 400 : 600, 80);
        }
        return;
      }

      // Handle navigation when expanded (only arrow keys and Enter/Space)
      if (isExpanded) {
        switch (event.code) {
          case "Escape":
            event.preventDefault();
            setIsExpanded(false);
            playClickSound(400, 120);
            break;

          case "ArrowUp":
            event.preventDefault();
            setSelectedIndex((prev) => {
              const newIndex = prev > 0 ? prev - 1 : sections.length - 1;
              playClickSound(700, 60);
              return newIndex;
            });
            break;

          case "ArrowDown":
            event.preventDefault();
            setSelectedIndex((prev) => {
              const newIndex = prev < sections.length - 1 ? prev + 1 : 0;
              playClickSound(700, 60);
              return newIndex;
            });
            break;

          case "Enter":
          case "Space":
            event.preventDefault();
            if (sections[selectedIndex]) {
              scrollToSection(sections[selectedIndex].id);
              playClickSound(900, 100);
            }
            break;

          default:
            break;
        }
      }
    };

    window.addEventListener("keydown", handleGlobalKeyDown);
    return () => window.removeEventListener("keydown", handleGlobalKeyDown);
  }, [isExpanded, selectedIndex, sections, playClickSound]);

  // Close expanded view when clicking outside
  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (isExpanded && !target.closest(".dynamic-island")) {
        setIsExpanded(false);
        playClickSound(400, 120);
      }
    };

    if (isExpanded) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isExpanded, playClickSound]);

  const scrollToSection = (id: string) => {
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
  };

  const getCurrentSection = () => {
    return sections.find((section) => section.id === activeSection);
  };

  const currentSection = getCurrentSection();

  const formatTitle = (title: string) => {
    const words = title.split(" ");
    if (words.length <= 4) return title;
    return words.slice(0, 4).join(" ") + "...";
  };

  const handleToggle = () => {
    setIsExpanded(!isExpanded);
    playClickSound(isExpanded ? 400 : 600, 80);
  };

  const handleSectionClick = (id: string) => {
    scrollToSection(id);
    playClickSound(900, 100);
  };

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50">
      <AnimatePresence>
        {currentSection && (
          <motion.div
            initial={{ opacity: 0, y: 100, scale: 0.8 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 100, scale: 0.8 }}
            transition={{
              type: "spring",
              stiffness: 400,
              damping: 35,
              duration: 0.6,
            }}
            className="dynamic-island"
            tabIndex={0}
            role="navigation"
            aria-label="Table of contents navigation"
          >
            <motion.div
              animate={{
                borderRadius: isExpanded ? "16px" : "20px",
                width: isExpanded ? "380px" : getCollapsedWidth(),
                height: isExpanded ? contentHeight : 44,
              }}
              transition={{
                type: "spring",
                stiffness: 300,
                damping: 35,
                duration: 0.7,
              }}
              className="bg-black/80 dark:bg-white/10 backdrop-blur-xl border border-white/10 shadow-2xl overflow-hidden relative"
            >
              {/* Collapsed state - show current section */}
              <motion.div
                animate={{
                  opacity: isExpanded ? 0 : 1,
                  scale: isExpanded ? 0.95 : 1,
                }}
                transition={{
                  duration: isExpanded ? 0.15 : 0.3,
                  ease: "easeInOut",
                  delay: isExpanded ? 0 : 0.2,
                }}
                onClick={handleToggle}
                className="absolute inset-0 px-6 py-3 cursor-pointer hover:bg-black/90 dark:hover:bg-white/20 transition-colors duration-300 flex items-center"
                style={{ pointerEvents: isExpanded ? "none" : "auto" }}
              >
                <div className="flex items-center space-x-3 w-full min-w-0">
                  <motion.div
                    className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0"
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{
                      duration: 2,
                      repeat: Number.POSITIVE_INFINITY,
                      ease: "easeInOut",
                    }}
                  />

                  <span className="text-white dark:text-white text-sm font-medium truncate flex-1 min-w-0">
                    {formatTitle(currentSection.title)}
                  </span>

                  {/* Keyboard shortcut hint */}
                  <div className="flex items-center space-x-2 flex-shrink-0">
                    <span className="text-white/40 text-xs">Press</span>
                    <kbd className="px-1.5 py-0.5 text-xs text-white/60 bg-white/10 rounded border border-white/20">
                      T
                    </kbd>
                  </div>

                  <motion.div
                    className="w-4 h-4 text-white/60 flex-shrink-0"
                    whileHover={{ scale: 1.1 }}
                    transition={{ type: "spring", stiffness: 400 }}
                  >
                    <svg
                      viewBox="0 0 16 16"
                      fill="currentColor"
                      className="w-full h-full"
                    >
                      <path d="M3.5 6.5L8 11L12.5 6.5L11.5 5.5L8 9L4.5 5.5L3.5 6.5Z" />
                    </svg>
                  </motion.div>
                </div>
              </motion.div>

              {/* Expanded state - show all sections */}
              <motion.div
                animate={{
                  opacity: isExpanded ? 1 : 0,
                  scale: isExpanded ? 1 : 0.95,
                }}
                transition={{
                  duration: isExpanded ? 0.4 : 0.15,
                  ease: "easeInOut",
                  delay: isExpanded ? 0.2 : 0,
                }}
                className="absolute inset-0 w-full h-full"
                style={{ pointerEvents: isExpanded ? "auto" : "none" }}
              >
                <div
                  ref={contentRef}
                  className="p-4 w-full h-full flex flex-col min-h-0"
                >
                  {/* Header */}
                  <motion.div
                    animate={{
                      opacity: isExpanded ? 1 : 0,
                      y: isExpanded ? 0 : -10,
                    }}
                    transition={{
                      duration: 0.3,
                      delay: isExpanded ? 0.35 : 0,
                      ease: "easeOut",
                    }}
                    className="flex items-center justify-between mb-4 flex-shrink-0"
                  >
                    <h3 className="text-white font-semibold text-sm">
                      Table of Contents
                    </h3>
                    <motion.button
                      onClick={handleToggle}
                      className="w-6 h-6 text-white/60 hover:text-white/80 transition-colors rounded-full hover:bg-white/10 flex items-center justify-center flex-shrink-0"
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      aria-label="Close table of contents"
                    >
                      <svg
                        viewBox="0 0 16 16"
                        fill="currentColor"
                        className="w-4 h-4"
                      >
                        <path d="M12.854 4.854a.5.5 0 0 0-.708-.708L8 8.293 3.854 4.146a.5.5 0 1 0-.708.708L7.293 9l-4.147 4.146a.5.5 0 0 0 .708.708L8 9.707l4.146 4.147a.5.5 0 0 0 .708-.708L8.707 9l4.147-4.146z" />
                      </svg>
                    </motion.button>
                  </motion.div>

                  {/* Keyboard instructions */}
                  <motion.div
                    animate={{
                      opacity: isExpanded ? 1 : 0,
                      y: isExpanded ? 0 : -10,
                    }}
                    transition={{
                      duration: 0.3,
                      delay: isExpanded ? 0.4 : 0,
                      ease: "easeOut",
                    }}
                    className="mb-3 flex-shrink-0"
                  >
                    <p className="text-white/40 text-xs leading-relaxed">
                      Use ↑↓ arrows to navigate • Enter to select • Press{" "}
                      <kbd className="px-1 py-0.5 text-xs bg-white/10 rounded border border-white/20">
                        T
                      </kbd>{" "}
                      to toggle • Esc to close
                    </p>
                  </motion.div>

                  {/* Sections list - This is the key change */}
                  <div className="flex-1 min-h-0 flex flex-col">
                    <div className="flex-1 overflow-y-auto overflow-x-hidden">
                      <div className="space-y-1 pb-2">
                        {sections.map((section, index) => (
                          <motion.div
                            key={section.id}
                            animate={{
                              opacity: isExpanded ? 1 : 0,
                              x: isExpanded ? 0 : -20,
                            }}
                            transition={{
                              duration: 0.3,
                              delay: isExpanded ? 0.45 + index * 0.03 : 0,
                              ease: "easeOut",
                            }}
                          >
                            <motion.button
                              onClick={() => handleSectionClick(section.id)}
                              className={`w-full text-left px-3 py-2.5 rounded-lg transition-all duration-200 flex items-center space-x-3 group ${
                                activeSection === section.id
                                  ? "bg-blue-500/20 text-blue-400"
                                  : selectedIndex === index
                                  ? "bg-white/10 text-white"
                                  : "text-white/80 hover:text-white hover:bg-white/10"
                              }`}
                              whileHover={{ scale: 1.02 }}
                              whileTap={{ scale: 0.98 }}
                              aria-label={`Navigate to ${section.title}`}
                            >
                              <div
                                className={`w-1.5 h-1.5 rounded-full transition-all duration-200 flex-shrink-0 ${
                                  activeSection === section.id
                                    ? "bg-blue-400"
                                    : selectedIndex === index
                                    ? "bg-white/80"
                                    : "bg-white/40 group-hover:bg-white/60"
                                }`}
                              />

                              <span className="text-sm font-medium flex-1 text-left leading-tight min-w-0 break-words">
                                {section.title}
                              </span>

                              <div
                                className={`w-3 h-3 transition-all duration-200 flex-shrink-0 ${
                                  activeSection === section.id
                                    ? "text-blue-400"
                                    : selectedIndex === index
                                    ? "text-white/80"
                                    : "text-white/40 group-hover:text-white/60"
                                }`}
                              >
                                <svg
                                  viewBox="0 0 16 16"
                                  fill="currentColor"
                                  className="w-full h-full"
                                >
                                  <path d="M8 3.5L12.5 8L8 12.5L7.086 11.586L10.172 8.5H3.5V7.5H10.172L7.086 4.414L8 3.5Z" />
                                </svg>
                              </div>
                            </motion.button>
                          </motion.div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Footer info */}
                  <motion.div
                    animate={{
                      opacity: isExpanded ? 1 : 0,
                      y: isExpanded ? 0 : 10,
                    }}
                    transition={{
                      duration: 0.3,
                      delay: isExpanded ? 0.5 + sections.length * 0.03 : 0,
                      ease: "easeOut",
                    }}
                    className="mt-4 pt-3 border-t border-white/10 flex-shrink-0"
                  >
                    <p className="text-white/50 text-xs text-center">
                      {sections.length} sections • Click or use keyboard to
                      navigate
                    </p>
                  </motion.div>
                </div>
              </motion.div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
