"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { X } from "lucide-react";

type PostLightboxImageProps = {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  caption?: string;
};

export function PostLightboxImage({
  src,
  alt,
  width = 1200,
  height = 800,
  caption,
}: PostLightboxImageProps) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open]);

  return (
    <figure className="my-6 w-full">
      {/* Thumbnail */}
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="group block w-full cursor-zoom-in overflow-hidden rounded-xl border border-line text-left"
      >
        <Image
          src={src}
          alt={alt}
          width={width}
          height={height}
          unoptimized
          className="h-auto w-full object-cover transition-transform duration-500 ease-out group-hover:scale-[1.02]"
        />
      </button>

      {caption ? (
        <figcaption className="mt-2.5 text-center font-mono text-[11px] text-muted-foreground/70">
          {caption}
        </figcaption>
      ) : null}

      {/* Lightbox Overlay */}
      {open && (
        <div
          className="fixed inset-0 z-[200] flex items-center justify-center bg-background/90 backdrop-blur-md"
          onClick={() => setOpen(false)}
          role="dialog"
          aria-modal="true"
          aria-label={alt}
        >
          {/* Close button */}
          <button
            type="button"
            onClick={() => setOpen(false)}
            className="absolute top-5 right-5 z-10 flex h-10 w-10 cursor-pointer items-center justify-center rounded-full border border-line bg-background/80 text-foreground transition-colors hover:bg-muted"
            aria-label="Close"
          >
            <X className="h-4.5 w-4.5" />
          </button>

          {/* Image container */}
          <div
            className="max-h-[85vh] max-w-[90vw] rounded-2xl border border-line bg-background p-2 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <Image
              src={src}
              alt={alt}
              width={width}
              height={height}
              unoptimized
              className="h-auto max-h-[81vh] w-auto max-w-[88vw] rounded-xl object-contain"
            />
          </div>
        </div>
      )}
    </figure>
  );
}
