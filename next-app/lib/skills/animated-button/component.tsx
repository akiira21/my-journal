"use client";

import React, { useState } from "react";

export type AnimatedButtonProps = {
  speed?: number;
  size?: string;
  showGlow?: boolean;
  borderRadius?: string;
};

export default function AnimatedButton({
  speed = 3,
  size = "md",
  showGlow = true,
  borderRadius = "xl",
}: AnimatedButtonProps) {
  const sizeMap: Record<string, { px: string; py: string; text: string }> = {
    sm: { px: "16px", py: "8px", text: "13px" },
    md: { px: "24px", py: "12px", text: "14px" },
    lg: { px: "32px", py: "14px", text: "16px" },
  };

  const radiusMap: Record<string, string> = {
    sm: "6px",
    md: "10px",
    lg: "14px",
    xl: "18px",
    full: "9999px",
  };

  const s = sizeMap[size] ?? sizeMap.md;
  const r = radiusMap[borderRadius] ?? "18px";
  const duration = `${11 - speed}s`;

  return (
    <div className="flex h-full w-full items-center justify-center bg-white dark:bg-neutral-950 p-8"
      style={{
        margin: 30,
      }}
    >
      <button
        className="relative overflow-hidden font-semibold text-neutral-900 dark:text-white transition-all duration-200 hover:scale-105 active:scale-95"
        style={{
          height: "100%",
          // width: "100%",
         padding: `${s.py} ${s.px}`,
          fontSize: s.text,
          borderRadius: r,
          background: "linear-gradient(90deg, #e5e5e5, #f5f5f5, #ffffff, #d4d4d4, #e5e5e5)",
          backgroundSize: "300% 100%",
          animationName: "shimmer",
          animationDuration: duration,
          animationTimingFunction: "linear",
          animationIterationCount: "infinite",
          boxShadow: showGlow
            ? "0 0 30px rgba(0, 0, 0, 0.08), 0 4px 12px rgba(0,0,0,0.1)"
            : "0 4px 12px rgba(0,0,0,0.1)",
        }}
      >
        {/* Shine overlay */}
        <span
          className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 hover:opacity-100"
          style={{
            background:
              "linear-gradient(105deg, transparent 40%, rgba(255,255,255,0.6) 45%, rgba(255,255,255,0.7) 50%, rgba(255,255,255,0.6) 55%, transparent 60%)",
            backgroundSize: "200% 100%",
            animationName: "shine",
            animationDuration: duration,
            animationTimingFunction: "linear",
            animationIterationCount: "infinite",
          }}
        />
        <span className="relative z-10">Get Started</span>

        <style
          dangerouslySetInnerHTML={{
            __html: `
              @keyframes shimmer {
                0% { background-position: 0% 50%; }
                100% { background-position: 300% 50%; }
              }
              @keyframes shine {
                0% { background-position: 200% 0%; }
                100% { background-position: -200% 0%; }
              }
            `,
          }}
        />
      </button>
    </div>
  );
}
