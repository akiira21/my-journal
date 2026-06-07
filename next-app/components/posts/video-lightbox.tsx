"use client";

import { useEffect, useState } from "react";
import { X, Play } from "lucide-react";

type VideoLightboxProps = {
  src: string;
  title?: string;
};

export function VideoLightbox({ src, title }: VideoLightboxProps) {
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
    <>
      {/* Thumbnail / Preview */}
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="group relative my-6 block w-full cursor-pointer overflow-hidden rounded-xl border border-line text-left"
      >
        {/* Video poster / gradient background */}
        <div className="relative flex aspect-video w-full items-center justify-center bg-muted/60">
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-full border border-line bg-background/80 shadow-lg transition-transform duration-300 group-hover:scale-110">
              <Play className="ml-0.5 h-5.5 w-5.5 fill-foreground text-foreground" />
            </div>
          </div>
          {title && (
            <div className="absolute bottom-0 left-0 right-0 bg-background/80 px-4 py-2 backdrop-blur-sm">
              <span className="font-mono text-[11px] uppercase tracking-wider text-muted-foreground">
                {title}
              </span>
            </div>
          )}
        </div>
      </button>

      {/* Lightbox Overlay */}
      {open && (
        <div
          className="fixed inset-0 z-[200] flex items-center justify-center bg-background/90 backdrop-blur-md"
          onClick={() => setOpen(false)}
          role="dialog"
          aria-modal="true"
          aria-label={title || "Video"}
        >
          {/* Close button */}
          <button
            type="button"
            onClick={() => setOpen(false)}
            className="absolute top-5 right-5 z-10 flex h-10 w-10 items-center justify-center rounded-full border border-line bg-background/80 text-foreground transition-colors hover:bg-muted"
            aria-label="Close"
          >
            <X className="h-4.5 w-4.5" />
          </button>

          {/* Video container */}
          <div
            className="max-h-[85vh] max-w-[90vw] rounded-2xl border border-line bg-background p-2 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <video
              controls
              autoPlay
              className="h-auto max-h-[81vh] w-full max-w-[88vw] rounded-xl"
              src={src}
              title={title}
            />
          </div>
        </div>
      )}
    </>
  );
}
