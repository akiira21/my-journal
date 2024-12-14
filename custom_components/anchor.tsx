"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface AnchorProps {
  href: string;
  text: string;
  className?: string;
}

const XAnchor = () => (
  <div>
    <Link
      href={"https://x.com/meArun_Kumar_"}
      className="inline-flex items-center gap-x-2 text-[#3E69F4] hover:text-primary"
      target="_blank"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="lucide lucide-twitter"
      >
        <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z" />
      </svg>

      <span>@meArun_Kumar_</span>
    </Link>
  </div>
);

const GitHubAnchor = () => (
  <div>
    <Link
      href={"https://github.com/Arun-Kumar21"}
      className="inline-flex items-center gap-x-2 text-[#3E69F4] hover:text-primary"
      target="_blank"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="lucide lucide-github"
      >
        <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
        <path d="M9 18c-4.51 2-5-2-7-2" />
      </svg>

      <span>Github</span>
    </Link>
  </div>
);

const ForwardAnchor = ({ text, href, className }: AnchorProps) => (
  <div>
    <Link
      href={href}
      className={cn(
        "inline-flex items-center gap-x-1 hover:text-[#3E69F4] text-[#969EB0] group font-medium",
        className
      )}
      target="_blank"
    >
      <span>{text}</span>
      <ArrowRight
        size={18}
        className="group-hover:translate-x-1 transition-transform duration-300 ease-in-out"
      />
    </Link>
  </div>
);

const BackwardAnchor = ({ text, href, className }: AnchorProps) => (
  <div>
    <Link
      href={href}
      className={cn(
        "inline-flex items-center gap-x-1 hover:text-[#3E69F4] dark:hover:text-[#3E69F4] text-[#969EB0] group font-medium",
        className
      )}
    >
      <ArrowLeft
        size={14}
        className="group-hover:-translate-x-1 transition-transform duration-300 ease-in-out"
      />
      <span>{text}</span>
    </Link>
  </div>
);

const PageAnchor = ({ text, href, className }: AnchorProps) => (
  <div>
    <Link href={href} target="_blank">
      <Button
        variant={"link"}
        className={cn(
          "hover:text-[#3E69F4] text-[#969EB0] font-medium p-0",
          className
        )}
      >
        {text}
      </Button>
    </Link>
  </div>
);

export { XAnchor, GitHubAnchor, ForwardAnchor, BackwardAnchor, PageAnchor };
