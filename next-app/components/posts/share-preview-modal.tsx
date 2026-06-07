"use client";

import { useCallback, useRef, useState } from "react";
import { toPng } from "html-to-image";
import { Share2Icon, DownloadIcon, LinkIcon, XIcon, ImageIcon, AlertCircleIcon } from "lucide-react";

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

function gradientForSlug(s: string): string {
  const total = [...s].reduce((sum, c) => sum + c.charCodeAt(0), 0);
  const gradients = [
    "linear-gradient(135deg, rgba(14,165,233,0.8) 0%, rgba(59,130,246,0.7) 50%, rgba(99,102,241,0.8) 100%)",   /* sky → blue → indigo */
    "linear-gradient(135deg, rgba(16,185,129,0.8) 0%, rgba(20,184,166,0.7) 50%, rgba(6,182,212,0.8) 100%)",     /* emerald → teal → cyan */
    "linear-gradient(135deg, rgba(245,158,11,0.8) 0%, rgba(249,115,22,0.7) 50%, rgba(239,68,68,0.8) 100%)",      /* amber → orange → red */
    "linear-gradient(135deg, rgba(217,70,239,0.8) 0%, rgba(236,72,153,0.7) 50%, rgba(244,63,94,0.8) 100%)",      /* fuchsia → pink → rose */
    "linear-gradient(135deg, rgba(139,92,246,0.8) 0%, rgba(168,85,247,0.7) 50%, rgba(99,102,241,0.8) 100%)",     /* violet → purple → indigo */
  ];
  return gradients[total % gradients.length] ?? gradients[0];
}

/* ── Instagram Card (4:5) ────────────────────────────────────── */

function InstagramCard({
  title,
  description,
  coverUrl,
  slug,
}: SharePreviewModalProps) {
  const url = formatUrl(slug);
  const fallbackBg = gradientForSlug(slug);

  return (
    <div
      className="flex w-[360px] flex-col overflow-hidden rounded-2xl bg-[#0a0a0a]"
      style={{
        aspectRatio: "4/5",
        boxShadow: "0 25px 50px -12px rgba(0,0,0,0.5)",
      }}
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
          <div className="h-full w-full" style={{ background: fallbackBg }} />
        )}
        <div
          className="absolute inset-0"
          style={{
            background: "linear-gradient(to bottom, transparent 0%, transparent 60%, #0a0a0a 100%)",
          }}
        />
      </div>

      {/* Content */}
      <div className="flex flex-1 flex-col justify-between px-6 pb-6 pt-2">
        <div className="space-y-3">
          <h3
            className="text-balance text-xl leading-tight tracking-tight text-white"
            style={{
              wordBreak: "break-word",
              fontFamily: "var(--font-geist-pixel-square), ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace",
            }}
          >
            {title}
          </h3>
          {description && (
            <p
              className="line-clamp-3 text-xs leading-relaxed text-white/60"
              style={{ fontFamily: "var(--font-geist-mono), ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace" }}
            >
              {description}
            </p>
          )}
        </div>

        <div className="space-y-3 pt-2">
          <div className="h-px w-full" style={{ background: "rgba(255,255,255,0.1)" }} />
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
  const fallbackBg = gradientForSlug(slug);

  return (
    <div
      className="flex w-[480px] overflow-hidden rounded-xl bg-[#0a0a0a]"
      style={{
        aspectRatio: "16/9",
        boxShadow: "0 25px 50px -12px rgba(0,0,0,0.5)",
      }}
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
          <div className="h-full w-full" style={{ background: fallbackBg }} />
        )}
        <div
          className="absolute inset-0"
          style={{
            background: "linear-gradient(to right, transparent 0%, transparent 50%, #0a0a0a 100%)",
          }}
        />
      </div>

      {/* Right: Content */}
      <div className="flex flex-1 flex-col justify-between px-5 py-5">
        <div className="space-y-2">
          <h3
            className="text-balance text-lg leading-tight tracking-tight text-white"
            style={{
              wordBreak: "break-word",
              fontFamily: "var(--font-geist-pixel-square), ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace",
            }}
          >
            {title}
          </h3>
          {description && (
            <p
              className="line-clamp-2 text-[11px] leading-relaxed text-white/55"
              style={{ fontFamily: "var(--font-geist-mono), ui-monospace, monospace" }}
            >
              {description}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <div className="h-px w-full" style={{ background: "rgba(255,255,255,0.1)" }} />
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
  const [downloadError, setDownloadError] = useState<string | null>(null);
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
      if (!ref.current) {
        setDownloadError("Card not found");
        return;
      }
      setDownloadError(null);
      try {
        // Small delay to ensure fonts/layout are settled
        await new Promise((resolve) => setTimeout(resolve, 150));
        const dataUrl = await toPng(ref.current, {
          cacheBust: true,
          pixelRatio: 2,
          skipFonts: false,
          backgroundColor: "#0a0a0a",
        });
        const link = document.createElement("a");
        link.download = filename;
        link.href = dataUrl;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      } catch (err) {
        console.error("Download failed:", err);
        setDownloadError(
          err instanceof Error ? err.message : "Failed to generate image. Try again."
        );
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

        {/* Error message */}
        {downloadError && (
          <div className="flex items-center gap-2 rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 font-mono text-xs text-destructive">
            <AlertCircleIcon className="size-3.5 shrink-0" />
            {downloadError}
          </div>
        )}

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
