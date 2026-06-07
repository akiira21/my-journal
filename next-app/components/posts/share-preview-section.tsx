"use client";

import { useCallback, useRef, useState } from "react";
import { toPng } from "html-to-image";
import { DownloadIcon, LinkIcon, CheckIcon } from "lucide-react";

import { Button } from "@/components/ui/button";

/* ── Types ────────────────────────────────────────────────────── */

interface SharePreviewSectionProps {
  title: string;
  description?: string | null;
  coverUrl?: string | null;
  slug: string;
}

/* ── Helpers ───────────────────────────────────────────────────── */

function getSiteUrl(): string {
  if (typeof window !== "undefined") {
    return window.location.origin;
  }
  return process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
}

function formatUrl(slug: string): string {
  return `${getSiteUrl()}/posts/${slug}`;
}

function formatDomain(): string {
  try {
    return new URL(getSiteUrl()).hostname;
  } catch {
    return "arunjournal.com";
  }
}

function gradientForSlug(s: string): string {
  const total = [...s].reduce((sum, c) => sum + c.charCodeAt(0), 0);
  const gradients = [
    "linear-gradient(135deg, #0ea5e9cc 0%, #3b82f6b3 50%, #6366f1cc 100%)",
    "linear-gradient(135deg, #10b981cc 0%, #14b8a6b3 50%, #06b6d4cc 100%)",
    "linear-gradient(135deg, #f59e0bcc 0%, #f97316b3 50%, #ef4444cc 100%)",
    "linear-gradient(135deg, #d946efcc 0%, #ec4899b3 50%, #f43f5ecc 100%)",
    "linear-gradient(135deg, #8b5cf6cc 0%, #a855f7b3 50%, #6366f1cc 100%)",
  ];
  return gradients[total % gradients.length] ?? gradients[0];
}

/* Inline an external image so html-to-image can serialize it */
async function inlineImages(container: HTMLElement) {
  const imgs = container.querySelectorAll("img");
  const restore: { el: HTMLImageElement; original: string }[] = [];

  await Promise.all(
    Array.from(imgs).map(async (img) => {
      const src = img.src;
      if (!src || src.startsWith("data:")) return;

      try {
        const resp = await fetch(src, { mode: "cors" });
        if (!resp.ok) throw new Error("fetch failed");
        const blob = await resp.blob();
        const dataUrl = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result as string);
          reader.onerror = reject;
          reader.readAsDataURL(blob);
        });
        restore.push({ el: img, original: src });
        img.src = dataUrl;
      } catch {
        /* leave as-is; html-to-image will use placeholder */
      }
    })
  );

  return restore;
}

/* ── Instagram Card (4:5) ────────────────────────────────────── */

function InstagramCard({
  title,
  description,
  coverUrl,
  slug,
}: SharePreviewSectionProps) {
  const url = formatUrl(slug);
  const domain = formatDomain();
  const fallbackBg = gradientForSlug(slug);
  const [imgError, setImgError] = useState(false);

  return (
    <div
      className="flex w-[280px] flex-col overflow-hidden rounded-2xl"
      style={{
        aspectRatio: "4/5",
        background: "#0a0a0a",
        boxShadow: "0 20px 40px -12px rgba(0,0,0,0.6)",
      }}
    >
      {/* Cover */}
      <div className="relative shrink-0 overflow-hidden" style={{ height: "45%" }}>
        {coverUrl && !imgError ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={coverUrl}
            alt={title}
            className="h-full w-full object-cover"
            onError={() => setImgError(true)}
          />
        ) : (
          <div className="h-full w-full" style={{ background: fallbackBg }} />
        )}
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(to bottom, transparent 0%, transparent 60%, #0a0a0a 100%)",
          }}
        />
      </div>

      {/* Content */}
      <div className="flex flex-1 flex-col justify-between px-5 pb-5 pt-2">
        <div className="space-y-2">
          <h3
            className="text-balance text-base leading-tight tracking-tight text-white"
            style={{
              wordBreak: "break-word",
              fontFamily:
                "var(--font-geist-pixel-square), ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace",
            }}
          >
            {title}
          </h3>
          {description && (
            <p
              className="line-clamp-3 text-[11px] leading-relaxed text-white/55"
              style={{
                fontFamily:
                  "var(--font-geist-mono), ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace",
              }}
            >
              {description}
            </p>
          )}
        </div>

        <div className="space-y-2 pt-2">
          <div
            className="h-px w-full"
            style={{ background: "rgba(255,255,255,0.08)" }}
          />
          <div className="flex items-center justify-between">
            <span
              className="text-[9px] uppercase tracking-widest text-white/35"
              style={{
                fontFamily:
                  "var(--font-geist-mono), ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace",
              }}
            >
              {domain}
            </span>
            <span
              className="text-[9px] text-white/25"
              style={{
                fontFamily:
                  "var(--font-geist-mono), ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace",
              }}
            >
              /posts/{slug}
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
}: SharePreviewSectionProps) {
  const url = formatUrl(slug);
  const domain = formatDomain();
  const fallbackBg = gradientForSlug(slug);
  const [imgError, setImgError] = useState(false);

  return (
    <div
      className="flex w-[380px] overflow-hidden rounded-xl"
      style={{
        aspectRatio: "16/9",
        background: "#0a0a0a",
        boxShadow: "0 20px 40px -12px rgba(0,0,0,0.6)",
      }}
    >
      {/* Left: Cover */}
      <div
        className="relative shrink-0 overflow-hidden"
        style={{ width: "42%" }}
      >
        {coverUrl && !imgError ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={coverUrl}
            alt={title}
            className="h-full w-full object-cover"
            onError={() => setImgError(true)}
          />
        ) : (
          <div className="h-full w-full" style={{ background: fallbackBg }} />
        )}
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(to right, transparent 0%, transparent 50%, #0a0a0a 100%)",
          }}
        />
      </div>

      {/* Right: Content */}
      <div className="flex flex-1 flex-col justify-between px-4 py-4">
        <div className="space-y-1.5">
          <h3
            className="text-balance text-sm leading-tight tracking-tight text-white"
            style={{
              wordBreak: "break-word",
              fontFamily:
                "var(--font-geist-pixel-square), ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace",
            }}
          >
            {title}
          </h3>
          {description && (
            <p
              className="line-clamp-2 text-[10px] leading-relaxed text-white/50"
              style={{
                fontFamily:
                  "var(--font-geist-mono), ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace",
              }}
            >
              {description}
            </p>
          )}
        </div>

        <div className="space-y-1.5">
          <div
            className="h-px w-full"
            style={{ background: "rgba(255,255,255,0.08)" }}
          />
          <div className="flex items-center justify-between">
            <span
              className="text-[9px] uppercase tracking-widest text-white/35"
              style={{
                fontFamily:
                  "var(--font-geist-mono), ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace",
              }}
            >
              {domain}
            </span>
            <span
              className="text-[9px] text-white/25"
              style={{
                fontFamily:
                  "var(--font-geist-mono), ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace",
              }}
            >
              /posts/{slug}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── Main Section ─────────────────────────────────────────────── */

export function SharePreviewSection({
  title,
  description,
  coverUrl,
  slug,
}: SharePreviewSectionProps) {
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

  const downloadCard = useCallback(
    async (ref: React.RefObject<HTMLDivElement | null>, filename: string) => {
      if (!ref.current) {
        setDownloadError("Card not found");
        return;
      }
      setDownloadError(null);

      /* clone the card into a detached container so extensions cannot pollute it */
      const clone = ref.current.cloneNode(true) as HTMLElement;
      const wrapper = document.createElement("div");
      wrapper.style.position = "fixed";
      wrapper.style.top = "-9999px";
      wrapper.style.left = "-9999px";
      wrapper.style.opacity = "0";
      wrapper.style.pointerEvents = "none";
      wrapper.appendChild(clone);
      document.body.appendChild(wrapper);

      try {
        await new Promise((resolve) => setTimeout(resolve, 300));

        /* inline external images on the clone */
        await inlineImages(clone);

        const dataUrl = await toPng(clone, {
          cacheBust: true,
          pixelRatio: 2,
          backgroundColor: "#0a0a0a",
        });

        const link = document.createElement("a");
        link.download = filename;
        link.href = dataUrl;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      } catch (err: unknown) {
        // eslint-disable-next-line no-console
        console.error("Download failed:", err);
        const msg =
          typeof err === "object" && err !== null && "message" in err
            ? String((err as Record<string, unknown>).message)
            : String(err);
        setDownloadError(msg || "Failed to generate image. Try reloading the page.");
      } finally {
        document.body.removeChild(wrapper);
      }
    },
    [],
  );

  return (
    <div className="border-t border-line py-8">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="font-pixel text-sm font-medium">Share This Post</h2>
          <p className="mt-1 font-mono text-xs text-muted-foreground">
            Download a card and share it on social media.
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          className="font-mono text-xs"
          onClick={handleCopyLink}
        >
          {copied ? (
            <>
              <CheckIcon className="mr-1.5 size-3.5" />
              Copied
            </>
          ) : (
            <>
              <LinkIcon className="mr-1.5 size-3.5" />
              Copy Link
            </>
          )}
        </Button>
      </div>

      {downloadError && (
        <div className="mb-4 flex items-center gap-2 rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 font-mono text-xs text-destructive">
          {downloadError}
        </div>
      )}

      <div className="flex flex-col items-center gap-8 sm:flex-row sm:items-start sm:justify-center">
        {/* Instagram */}
        <div className="flex flex-col items-center gap-3">
          <div ref={igRef}>
            <InstagramCard
              title={title}
              description={description}
              coverUrl={coverUrl}
              slug={slug}
            />
          </div>
          <Button
            variant="outline"
            size="sm"
            className="font-mono text-xs"
            onClick={() => downloadCard(igRef, `share-${slug}-ig.png`)}
          >
            <DownloadIcon className="mr-1.5 size-3.5" />
            Download for Instagram
          </Button>
        </div>

        {/* X / Twitter */}
        <div className="flex flex-col items-center gap-3">
          <div ref={xRef}>
            <XCard
              title={title}
              description={description}
              coverUrl={coverUrl}
              slug={slug}
            />
          </div>
          <Button
            variant="outline"
            size="sm"
            className="font-mono text-xs"
            onClick={() => downloadCard(xRef, `share-${slug}-x.png`)}
          >
            <DownloadIcon className="mr-1.5 size-3.5" />
            Download for X
          </Button>
        </div>
      </div>
    </div>
  );
}
