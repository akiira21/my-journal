"use client";

import Image from "next/image";
import { useEffect, useState } from "react";

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
    if (!open) {
      return;
    }

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open]);

  return (
    <figure className="my-4 w-full">
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="group block w-full cursor-zoom-in overflow-hidden rounded-lg border border-line text-left"
      >
        <Image
          src={src}
          alt={alt}
          width={width}
          height={height}
          unoptimized
          className="h-auto w-full object-cover transition-transform duration-300 group-hover:scale-[1.01]"
        />
      </button>

      {caption ? (
        <figcaption className="mt-2 text-center text-xs text-muted-foreground">{caption}</figcaption>
      ) : null}

      {open ? (
        <div
          className="fixed inset-0 z-120 flex cursor-zoom-out items-center justify-center bg-black/85 p-4"
          onClick={() => setOpen(false)}
          role="dialog"
          aria-modal="true"
          aria-label={alt}
        >
          <div className="max-h-[90vh] max-w-[92vw]" onClick={(event) => event.stopPropagation()}>
            <Image
              src={src}
              alt={alt}
              width={width}
              height={height}
              unoptimized
              className="h-auto max-h-[90vh] w-auto rounded-lg object-contain"
            />
          </div>
        </div>
      ) : null}
    </figure>
  );
}
