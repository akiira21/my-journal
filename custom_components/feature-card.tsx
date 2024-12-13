"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";

interface BlogCardProps {
  title: string;
  description: string;
  gradientClass: string;
}

type ArticlesType = {
  title: string;
  description: string;
  gradientClass: "gradient-1" | "gradient-2" | "gradient-3";
}[];

function BlogCard({ title, description, gradientClass }: BlogCardProps) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div
      className="relative group"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <motion.div
        className={`absolute inset-0 rounded-lg ${gradientClass} shadow-animation`}
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{
          opacity: isHovered ? 1 : 0,
          scale: isHovered ? 1.05 : 0.95,
          filter: `blur(${isHovered ? 20 : 0}px)`,
        }}
        transition={{ duration: 0.3 }}
      />
      <Card className="relative border-1 px-4 py-6 transition-all duration-500 hover:shadow-lg bg-white bg-background dark:bg-[#0f1117] rounded-lg hover:scale-[101%]">
        <h2 className="font-semibold mb-2 bg-gradient-to-r from-blue-400 via-pink-300 to-orange-300 bg-clip-text text-transparent w-fit">
          {title}
        </h2>
        <p className="text-gray-600 dark:text-gray-300 leading-relaxed text-sm">
          {description}
        </p>
      </Card>
    </div>
  );
}

export default function BlogList() {
  const articles: ArticlesType = [];

  return (
    <div className="max-w-3xl space-y-6">
      {articles.map((article, index) => (
        <BlogCard
          key={index}
          title={article.title}
          description={article.description}
          gradientClass={article.gradientClass}
        />
      ))}
      <style jsx global>{`
        @keyframes gradient-animation {
          0% {
            background-position: 0% 50%;
          }
          50% {
            background-position: 100% 50%;
          }
          100% {
            background-position: 0% 50%;
          }
        }
        @keyframes shadow-move {
          0% {
            box-shadow: 0 0 20px 10px rgba(0, 0, 0, 0.1);
            transform: translateX(-5px) translateY(-5px);
          }
          50% {
            box-shadow: 0 0 25px 15px rgba(0, 0, 0, 0.1);
            transform: translateX(5px) translateY(5px);
          }
          100% {
            box-shadow: 0 0 20px 10px rgba(0, 0, 0, 0.1);
            transform: translateX(-5px) translateY(-5px);
          }
        }
        .gradient-1,
        .gradient-2,
        .gradient-3 {
          background-size: 200% 200%;
          animation: gradient-animation 15s ease infinite;
        }
        .shadow-animation {
          animation: shadow-move 10s ease-in-out infinite;
        }
        .gradient-1 {
          background-image: linear-gradient(
            45deg,
            rgba(159, 122, 234, 0.3),
            rgba(236, 72, 153, 0.3),
            rgba(99, 102, 241, 0.3)
          );
        }
        .gradient-2 {
          background-image: linear-gradient(
            45deg,
            rgba(249, 115, 22, 0.3),
            rgba(239, 68, 68, 0.3),
            rgba(139, 92, 246, 0.3)
          );
        }
        .gradient-3 {
          background-image: linear-gradient(
            45deg,
            rgba(236, 72, 153, 0.3),
            rgba(139, 92, 246, 0.3),
            rgba(59, 130, 246, 0.3)
          );
        }
        .dark .shadow-animation {
          box-shadow: 0 0 20px 10px rgba(255, 255, 255, 0.1);
        }
      `}</style>
    </div>
  );
}
