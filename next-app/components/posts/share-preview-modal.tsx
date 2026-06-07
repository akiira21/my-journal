"use client";

import { useCallback, useRef, useState } from "react";
import { toPng } from "html-to-image";
import { Share2Icon, DownloadIcon, LinkIcon, XIcon, ImageIcon } from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

/* ── Types ────────────────────────────────────────────────────── */

interface SharePreviewModalProps {
  title: string;
  description?: string | null;
  coverUrl?: string | null;
  slug: string;
  categories?: string[];
}

/* ── Helpers ───────────────────────────────────────────────────── */

function getSiteUrl(): string {
  if (typeof window !== "undefined") {
    return window.location.origin;
  }
  return "https://arun.space";
}

function formatUrl(slug: string): string {
  return `${getSiteUrl()}/posts/${slug}`;
}

/* ── Instagram Card (4:5) ────────────────────────────────────── */

function InstagramCard({
  title,
  description,
  coverUrl,
  slug,
}: SharePreviewModalProps) {
  const url = formatUrl(slug);
  const gradientForSlug = (s: string) => {
    const total = [...s].reduce((sum, c) => sum + c.charCodeAt(0), 0);
    const gradients = [
      "from-sky-500/80 via-blue-500/70 to-indigo-500/80",
      "from-emerald-500/80 via-teal-500/70 to-cyan-500/80",
      "from-amber-500/80 via-orange-500/70 to-red-500/80",
      "from-fuchsia-500/80 via-pink-500/70 to-rose-500/80",
      "from-violet-500/80 via-purple-500/70 to-indigo-500/80",
    ];
    return gradients[total % gradients.length] ?? gradients[0];
  };

  return (
    <div
      className="flex w-[360px] flex-col overflow-hidden rounded-2xl bg-[#0a0a0a] shadow-2xl"
      style={{ aspectRatio: "4/5" }}
    >
      {/* Cover */}
      <div className="relative h-[45%] w-full shrink-0 overflow-hidden">
        {coverUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={coverUrl}
            alt={title}
            className="h-full w-full object-cover"
            crossOrigin="anonymous"
          />
        ) : (
          <div className={`h-full w-full bg-linear-to-br ${gradientForSlug(slug)}`} />
        )}
        <div className="absolute inset-0 bg-linear-to-b from-transparent via-transparent to-[#0a0a0a]" />
      </div>

      {/* Content */}
      <div className="flex flex-1 flex-col justify-between px-6 pb-6 pt-2">
        <div className="space-y-3">
          <h3
            className="text-balance text-xl font-pixel leading-tight tracking-tight text-white"
            style={{ wordBreak: "break-word" }}
          >
            {title}
          </h3>
          {description && (
            <p className="line-clamp-3 text-xs leading-relaxed text-white/60" style={{ fontFamily: "var(--font-geist-mono), ui-monospace, monospace" }}>
              {description}
            </p>
          )}
        </div>

        <div className="space-y-3 pt-2">
          <div className="h-px w-full bg-white/10" />
          <div className="flex items-center justify-between">
            <span
              className="text-[10px] uppercase tracking-widest text-white/40"
              style={{ fontFamily: "var(--font-geist-mono), ui-monospace, monospace" }}
            >
              arun.space
            </span>
            <span
              className="text-[10px] text-white/30"
              style={{ fontFamily: "var(--font-geist-mono), ui-monospace, monospace" }}
            >
              {url.replace("https://", "")}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── X / Twitter Card (16:9) ───────────────────────────────────── */

function XCard({
  title,
  description,
  coverUrl,
  slug,
}: SharePreviewModalProps) {
  const url = formatUrl(slug);
  const gradientForSlug = (s: string) => {
    const total = [...s].reduce((sum, c) => sum + c.charCodeAt(0), 0);
    const gradients = [
      "from-sky-500/80 via-blue-500/70 to-indigo-500/80",
      "from-emerald-500/80 via-teal-500/70 to-cyan-500/80",
      "from-amber-500/80 via-orange-500/70 to-red-500/80",
      "from-fuchsia-500/80 via-pink-500/70 to-rose-500/80",
      "from-violet-500/80 via-purple-500/70 to-indigo-500/80",
    ];
    return gradients[total % gradients.length] ?? gradients[0];
  };

  return (
    <div
      className="flex w-[480px] overflow-hidden rounded-xl bg-[#0a0a0a] shadow-2xl"
      style={{ aspectRatio: "16/9" }}
    >
      {/* Left: Cover */}
      <div className="relative h-full w-[42%] shrink-0 overflow-hidden">
        {coverUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={coverUrl}
            alt={title}
            className="h-full w-full object-cover"
            crossOrigin="anonymous"
          />
        ) : (
          <div className={`h-full w-full bg-linear-to-br ${gradientForSlug(slug)}`} />
        )}
        <div className="absolute inset-0 bg-linear-to-r from-transparent to-[#0a0a0a]" />
      </div>

      {/* Right: Content */}
      <div className="flex flex-1 flex-col justify-between px-5 py-5">
        <div className="space-y-2">
          <h3
            className="text-balance text-lg font-pixel leading-tight tracking-tight text-white"
            style={{ wordBreak: "break-word" }}
          >
            {title}
          </h3>
          {description && (
            <p className="line-clamp-2 text-[11px] leading-relaxed text-white/55" style={{ fontFamily: "var(--font-geist-mono), ui-monospace, monospace" }}>
              {description}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <div className="h-px w-full bg-white/10" />
          <div className="flex items-center justify-between">
            <span
              className="text-[10px] uppercase tracking-widest text-white/40"
              style={{ fontFamily: "var(--font-geist-mono), ui-monospace, monospace" }}
            >
              arun.space
            </span>
            <span
              className="text-[10px] text-white/30"
              style={{ fontFamily: "var(--font-geist-mono), ui-monospace, monospace" }}
            >
              {url.replace("https://", "")}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── Main Modal ───────────────────────────────────────────────── */

export function SharePreviewModal({
  title,
  description,
  coverUrl,
  slug,
  categories,
}: SharePreviewModalProps) {
  const [copied, setCopied] = useState(false);
  const igRef = useRef<HTMLDivElement>(null);
  const xRef = useRef<HTMLDivElement>(null);

  const postUrl = formatUrl(slug);

  const handleCopyLink = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(postUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // ignore
    }
  }, [postUrl]);

  const handleNativeShare = useCallback(async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title,
          text: description ?? "",
          url: postUrl,
        });
      } catch {
        // user cancelled
      }
    }
  }, [title, description, postUrl]);

  const downloadCard = useCallback(
    async (ref: React.RefObject<HTMLDivElement | null>, filename: string) => {
      if (!ref.current) return;
      try {
        const dataUrl = await toPng(ref.current, {
          cacheBust: true,
          pixelRatio: 2,
        });
        const link = document.createElement("a");
        link.download = filename;
        link.href = dataUrl;
        link.click();
      } catch {
        // ignore
      }
    },
    [],
  );

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button
          variant="ghost"
          size="icon-sm"
          className="text-muted-foreground/60 transition-colors hover:text-foreground"
          title="Share this post"
        >
          <Share2Icon className="size-4" />
          <span className="sr-only">Share</span>
        </Button>
      </DialogTrigger>

      <DialogContent className="max-w-2xl gap-6 p-6">
        <DialogHeader>
          <DialogTitle className="font-pixel text-base">Share This Post</DialogTitle>
        </DialogHeader>

        {/* Cards */}
        <div className="flex flex-col items-center gap-6">
          {/* Instagram */}
          <div className="flex flex-col items-center gap-3">
            <div className="flex items-center gap-2">
              <ImageIcon className="size-4 text-muted-foreground" />
              <span className="font-mono text-xs text-muted-foreground">Instagram</span>
            </div>
            <div className="scale-[0.65] origin-top sm:scale-75">
              <div ref={igRef}>
                <InstagramCard
                  title={title}
                  description={description}
                  coverUrl={coverUrl}
                  slug={slug}
                  categories={categories}
                />
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              className="font-mono text-xs"
              onClick={() => downloadCard(igRef, `share-${slug}-ig.png`)}
            >
              <DownloadIcon className="mr-1.5 size-3.5" />
              Download
            </Button>
          </div>

          <div className="h-px w-full bg-line" />

          {/* X / Twitter */}
          <div className="flex flex-col items-center gap-3">
            <div className="flex items-center gap-2">
              <XIcon className="size-4 text-muted-foreground" />
              <span className="font-mono text-xs text-muted-foreground">X / Twitter</span>
            </div>
            <div className="scale-[0.65] origin-top sm:scale-75">
              <div ref={xRef}>
                <XCard
                  title={title}
                  description={description}
                  coverUrl={coverUrl}
                  slug={slug}
                  categories={categories}
                />
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              className="font-mono text-xs"
              onClick={() => downloadCard(xRef, `share-${slug}-x.png`)}
            >
              <DownloadIcon className="mr-1.5 size-3.5" />
              Download
            </Button>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col gap-2 border-t border-line pt-4 sm:flex-row sm:items-center sm:justify-between">
          <Button
            variant="ghost"
            size="sm"
            className="font-mono text-xs"
            onClick={handleCopyLink}
          >
            <LinkIcon className="mr-1.5 size-3.5" />
            {copied ? "Copied!" : "Copy Link"}
          </Button>

          {typeof navigator !== "undefined" && "share" in navigator && (
            <Button
              variant="outline"
              size="sm"
              className="font-mono text-xs"
              onClick={handleNativeShare}
            >
              <Share2Icon className="mr-1.5 size-3.5" />
              Share
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
