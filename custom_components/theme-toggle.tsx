"use client";

import React from "react";
import { motion } from "framer-motion";
import { useTheme } from "next-themes";

const ThemeToggle = () => {
  const { theme, setTheme } = useTheme();
  const isDark = theme === "dark";

  const handleThemeToggle = () => {
    setTheme(isDark ? "light" : "dark");
  };

  return (
    <button
      onClick={handleThemeToggle}
      className="w-10 h-10 p-2 flex items-center justify-center rounded-lg border transition-all duration-300 ease-in-out hover:shadow-[0_0_16px_rgba(59,130,246,0.6)] group hover:border-[rgba(59,131,246,0.57)] hover:border-2"
      aria-label="Toggle theme"
    >
      <motion.svg
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1"
        strokeLinecap="round"
        strokeLinejoin="round"
        initial={false}
        animate={isDark ? "dark" : "light"}
        variants={{
          dark: { rotate: 40 },
          light: { rotate: 90 },
        }}
        transition={{ duration: 0.3 }}
        className="group-hover:stroke-[rgb(59,130,246)]"
      >
        {/* Sun/Moon Center Circle */}
        <motion.circle
          cx="12"
          cy="12"
          r="3" // Reduced the radius of the sun
          // stroke="#90d5ff"
          fill="none"
          initial={false}
          animate={{
            opacity: isDark ? 0 : 1, // Visible in light theme
            scale: isDark ? 0 : 1, // Shrink in dark mode
          }}
          transition={{ duration: 0.3 }}
        />

        {/* Crescent Moon */}
        <motion.path
          d="M18 12A6 6 0 1 1 12 6a4 4 0 0 0 4 6z"
          // stroke="#90d5ff"
          fill="none"
          animate={{
            opacity: isDark ? 1 : 0, // Visible in dark theme
            scale: isDark ? 1.2 : 0, // Slightly larger in dark mode
          }}
          transition={{ duration: 0.3 }}
        />

        {/* Sun Rays */}
        {[0, 45, 90, 135, 180, 225, 270, 315].map((angle) => (
          <motion.line
            key={angle}
            x1="12"
            y1="2"
            x2="12"
            y2="4"
            // stroke="#90d5ff"
            strokeWidth="1"
            transform={`rotate(${angle} 12 12)`}
            initial={{ opacity: 0 }}
            animate={{ opacity: isDark ? 0 : 1 }} // Rays visible only in light theme
            transition={{ duration: 0.3 }}
          />
        ))}
      </motion.svg>
    </button>
  );
};

export default ThemeToggle;
