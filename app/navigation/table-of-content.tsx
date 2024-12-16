"use client";

import Link from "next/link";
import React from "react";

interface Section {
  type: string;
  level?: number | null;
  title: string;
  id: string;
  position: number;
}

interface TableOfContentProps {
  sections: any[];
}

export default function TableOfContent({ sections }: TableOfContentProps) {
  const [activeSection, setActiveSection] = React.useState<string>("");

  React.useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveSection(entry.target.id);
          }
        });
      },
      { rootMargin: "-50% 0px -50% 0px" }
    );

    // Find all heading elements (h1, h2, h3, etc.)
    sections.forEach((section) => {
      const element = document.getElementById(section.id);
      if (element) {
        observer.observe(element);
      }
    });

    return () => {
      observer.disconnect();
    };
  }, [sections]);

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <div className={`top-1/2 -translate-y-1/2 bg-red-500 w-64 sticky z-50`}>
      heloo word
    </div>
  );
}
