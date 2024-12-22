"use client";

import React, { useState, useEffect } from "react";
import { motion, useAnimation } from "framer-motion";

export default function AnimatedProgressBar() {
  const [scrollYProgress, setScrollYProgress] = useState(0);
  const [isMounted, setIsMounted] = useState(false);
  const controls = useAnimation();

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (!isMounted) return;

    const calculateScrollYProgress = () => {
      try {
        const totalHeight =
          document.documentElement.scrollHeight - window.innerHeight;
        const currentScroll = window.scrollY;
        const progress = (currentScroll / totalHeight) * 100;
        const clampedProgress = Math.min(100, Math.max(0, progress));
        setScrollYProgress(clampedProgress);

        // Wrap the animation controls in a try-catch and add a small delay
        setTimeout(() => {
          try {
            if (progress < 10) {
              controls.start("hidden").catch(() => {});
            } else if (progress >= 10 && progress <= 95) {
              controls.start("visible").catch(() => {});
            } else {
              controls.start("exit").catch(() => {});
            }
          } catch (error) {
            console.error("Animation control error:", error);
          }
        }, 0);
      } catch (error) {
        console.error("Scroll calculation error:", error);
      }
    };

    // Add a small initial delay before adding the scroll listener
    const timeoutId = setTimeout(() => {
      window.addEventListener("scroll", calculateScrollYProgress);
      calculateScrollYProgress();
    }, 10);

    return () => {
      clearTimeout(timeoutId);
      window.removeEventListener("scroll", calculateScrollYProgress);
    };
  }, [controls, isMounted]);

  const variants = {
    hidden: { opacity: 0, y: -20 },
    visible: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: 20 },
  };

  // Don't render anything during SSR or before mounting
  if (!isMounted) {
    return null;
  }

  return (
    <motion.div
      className="z-50 fixed top-1/3 left-2 h-72"
      initial="hidden"
      animate={controls}
      variants={variants}
      transition={{ duration: 0.3, ease: "easeOut" }}
    >
      <div className="h-full w-[2px] bg-zinc-300 rounded-full overflow-hidden">
        <motion.div
          className="w-full bg-zinc-700 dark:bg-zinc-200"
          style={{ height: `${scrollYProgress}%` }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
        />
      </div>
    </motion.div>
  );
}
