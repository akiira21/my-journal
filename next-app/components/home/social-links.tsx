import type { ReactNode } from "react";
import { ArrowUpRightIcon } from "lucide-react";
import Image from "next/image";

import instagramIcon from "@/assets/icons/icons8-instagram-96.png";
import xIcon from "@/assets/icons/icons8-x-96.svg";

import { Panel } from "@/components/home/panel";
import { personalConfig } from "@/lib/personal-data";
import { cn } from "@/lib/utils";

type SocialItem = {
  icon: ReactNode;
  title: string;
  href: string;
};

function SocialLinkItem({ icon, title, href }: SocialItem) {
  return (
    <a
      className={cn(
        "flex cursor-pointer items-center gap-4 p-4 pr-2 transition-colors duration-200 ease-out hover:bg-accent/50",
        "max-md:nth-[2n+1]:screen-line-top max-md:nth-[2n+1]:screen-line-bottom",
        "md:nth-[3n+1]:screen-line-top md:nth-[3n+1]:screen-line-bottom",
      )}
      href={href}
      target="_blank"
      rel="noopener"
    >
      <span className="flex size-8 shrink-0 items-center justify-center text-foreground/85">{icon}</span>

      <h3 className="flex-1 text-lg font-medium tracking-tight">{title}</h3>

      <ArrowUpRightIcon className="size-4 text-muted-foreground" />
    </a>
  );
}

export function SocialLinks() {
  const links: SocialItem[] = [
    {
      icon: <GitHubIcon className="size-7" />,
      title: "GitHub",
      href: personalConfig.about.github,
    },
    {
      icon: (
        <Image
          className="size-8 select-none"
          src={xIcon}
          alt="X"
          width={32}
          height={32}
          unoptimized
        />
      ),
      title: "X",
      href: personalConfig.about.X,
    },
    {
      icon: (
        <Image
          className="size-8 select-none"
          src={instagramIcon}
          alt="Instagram"
          width={32}
          height={32}
          unoptimized
        />
      ),
      title: "Instagram",
      href: personalConfig.about.Instagram,
    },
  ];

  return (
    <Panel className="before:content-none after:content-none">
      <h2 className="sr-only">Social Links</h2>

      <div className="relative border-y border-line">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 md:[&>*:nth-child(1)]:border-r md:[&>*:nth-child(2)]:border-r">
          {links.map((link) => (
            <SocialLinkItem key={link.title} {...link} />
          ))}
        </div>
      </div>
    </Panel>
  );
}

function GitHubIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" className={className}>
      <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" />
    </svg>
  );
}