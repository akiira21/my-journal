"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";

interface CategoryTabsProps {
  categories: string[];
}

const colors = [
  "bg-pink-300",
  "bg-green-300",
  "bg-yellow-300",
  "bg-red-300",
  "bg-purple-300",
];

export default function CategoryTabs({ categories }: CategoryTabsProps) {
  const searchParams = useSearchParams();
  const [activeCategory, setActiveCategory] = useState<string | null>(
    searchParams.get("category") || null
  );
  const [indicatorStyle, setIndicatorStyle] = useState<{
    width: number;
    left: number;
  }>({ width: 0, left: 0 });

  useEffect(() => {
    if (!activeCategory && categories.length > 0) {
      setActiveCategory?.(categories[0]);
    }
  }, [activeCategory, categories, setActiveCategory]);

  useEffect(() => {
    if (activeCategory) {
      const url = new URL(window.location.href);
      url.searchParams.set("category", activeCategory);
      window.history.pushState({}, "", url.toString());
    }
  }, [activeCategory]);

  useEffect(() => {
    if (activeCategory) {
      const activeIndex = categories.indexOf(activeCategory);
      const activeElement = document.getElementById(`category-${activeIndex}`);

      if (activeElement) {
        const width = activeElement.offsetWidth;
        const left = categories.slice(0, activeIndex).reduce((acc, _, idx) => {
          const el = document.getElementById(`category-${idx}`);
          return acc + (el?.offsetWidth || 0) + 8;
        }, 0);

        setIndicatorStyle({ width, left });
      }
    }
  }, [activeCategory, categories]);

  return (
    <div className="flex items-center space-x-2 flex-wrap space-y-4 md:space-y-0">
      <div className="relative flex space-x-4">
        {categories.map((category, index) => (
          <button
            key={category}
            id={`category-${index}`}
            onClick={() => setActiveCategory?.(category)}
            className={`relative whitespace-nowrap px-3 py-2 rounded-full text-xs font-medium transition-colors duration-200 z-10 ${
              category === activeCategory
                ? "text-black font-semibold"
                : "text-gray-600 hover:text-gray-800"
            }`}
          >
            {category}
          </button>
        ))}

        {/* Sliding background indicator */}
        {activeCategory && indicatorStyle.width > 0 && (
          <div
            className={`absolute top-0 h-full rounded-full transition-all duration-300 ease-in-out ${
              colors[categories.indexOf(activeCategory) % colors.length]
            }`}
            style={{
              width: `${indicatorStyle.width}px`,
              left: `${
                indicatorStyle.left -
                12 / (categories.indexOf(activeCategory) * 2 || 1)
              }px`,
            }}
          />
        )}
      </div>

      <Link href={"/categories"}>
        <button className="whitespace-nowrap px-3 py-2 rounded-full text-xs font-medium bg-gray-300 text-black">
          All Categories
        </button>
      </Link>
    </div>
  );
}
