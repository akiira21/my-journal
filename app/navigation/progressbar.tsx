"use client";

import React, { useState, useEffect } from "react";
import { motion, useAnimation } from "framer-motion";

export default function AnimatedProgressBar() {
  const [scrollYProgress, setScrollYProgress] = useState(0);
  const controls = useAnimation();

  useEffect(() => {
    const calculateScrollYProgress = () => {
      const totalHeight =
        document.documentElement.scrollHeight - window.innerHeight;
      const currentScroll = window.scrollY;
      const progress = (currentScroll / totalHeight) * 100;
      setScrollYProgress(Math.min(100, Math.max(0, progress)));

      if (progress < 10) {
        controls.start("hidden");
      } else if (progress >= 10 && progress <= 95) {
        controls.start("visible");
      } else {
        controls.start("exit");
      }
    };

    window.addEventListener("scroll", calculateScrollYProgress);
    calculateScrollYProgress();

    return () => window.removeEventListener("scroll", calculateScrollYProgress);
  }, [controls]);

  const variants = {
    hidden: { opacity: 0, y: -20 },
    visible: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: 20 },
  };

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
