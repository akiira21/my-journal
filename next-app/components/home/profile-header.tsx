import Image from "next/image";

import { TextFlip } from "@/components/text-flip/text-flip";
import { personalConfig } from "@/lib/personal-data";

function VerifiedIcon() {
  return (
    <svg
      aria-label="Verified"
      viewBox="0 0 24 24"
      className="size-4.5 text-sky-500"
      fill="currentColor"
    >
      <path d="M22 12l-2.3 2.6.3 3.4-3.3.7L15 22l-3-1.4L9 22l-1.7-3.3-3.3-.7.3-3.4L2 12l2.3-2.6-.3-3.4 3.3-.7L9 2l3 1.4L15 2l1.7 3.3 3.3.7-.3 3.4L22 12z" />
      <path
        d="M9.4 12.7l1.8 1.8 3.4-3.4"
        stroke="white"
        strokeWidth="2"
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function ProfileHeader() {
  const { about, avatar } = personalConfig;

  return (
    <section className="screen-line-top screen-line-bottom flex min-h-36 border-y border-line sm:min-h-40">
      <div className="shrink-0 border-r border-line">
        <div className="m-1.5">
          <Image
            className="size-24 rounded-full border border-line object-cover ring-1 ring-border ring-offset-2 ring-offset-background select-none sm:size-32"
            alt={`${about.name} avatar`}
            src={avatar}
            width={160}
            height={160}
            priority
          />
        </div>
      </div>

      <div className="flex min-w-0 flex-1 flex-col">
        <div className="flex grow items-end pb-1 pl-4">
          <div className="line-clamp-1 font-mono text-xs text-muted-foreground select-none max-sm:hidden">
            text-3xl font-medium
          </div>
        </div>

        <div className="border-t border-line">
          <div className="flex items-center gap-2 pl-4">
            <h1 className="-translate-y-px text-3xl font-semibold tracking-tight">
              {about.name}
            </h1>
            <VerifiedIcon />
          </div>

          <div className="h-12 border-t border-line py-1 pl-4 sm:h-10">
            <TextFlip
              className="font-mono text-sm text-balance text-muted-foreground"
              variants={{
                initial: { y: -10, opacity: 0 },
                animate: { y: -1, opacity: 1 },
                exit: { y: 10, opacity: 0 },
              }}
              interval={1.8}
            >
              {about.expertise}
            </TextFlip>
          </div>
        </div>
      </div>
    </section>
  );
}