"use client";

import { useEffect, useRef, useCallback } from "react";
import { cn } from "@/lib/utils";

export type DonutProps = {
  className?: string;
};

const CHARS = ".,-~:;=!*#$@";

export function PixelGlobe({ className }: DonutProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const isVisibleRef = useRef(true);
  const animIdRef = useRef<number>(0);
  const rotationRef = useRef({ A: 0, B: 0 });

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas || !isVisibleRef.current) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const cols = 36;
    const rows = 36;
    const W = 360;
    const H = 360;
    if (canvas.width !== W) canvas.width = W;
    if (canvas.height !== H) canvas.height = H;

    const cellW = W / cols;
    const cellH = H / rows;

    const R1 = 10;
    const R2 = 20;
    const K2 = 200;
    const K1 = (rows * K2 * 3) / (8 * (R1 + R2));

    const output = new Array(cols * rows).fill(" ");
    const zbuffer = new Array(cols * rows).fill(0);

    const thetaStep = 0.22;
    const phiStep = 0.14;

    function frame() {
      if (!ctx || !isVisibleRef.current) return;
      output.fill(" ");
      zbuffer.fill(0);

      const { A, B } = rotationRef.current;
      const cosA = Math.cos(A);
      const sinA = Math.sin(A);
      const cosB = Math.cos(B);
      const sinB = Math.sin(B);

      for (let theta = 0; theta < Math.PI * 2; theta += thetaStep) {
        const costheta = Math.cos(theta);
        const sintheta = Math.sin(theta);

        for (let phi = 0; phi < Math.PI * 2; phi += phiStep) {
          const cosphi = Math.cos(phi);
          const sinphi = Math.sin(phi);

          const circlex = R2 + R1 * costheta;
          const circley = R1 * sintheta;

          const x =
            circlex * (cosB * cosphi + sinA * sinB * sinphi) -
            circley * cosA * sinB;
          const y =
            circlex * (sinB * cosphi - sinA * cosB * sinphi) +
            circley * cosA * cosB;
          const z = K2 + cosA * circlex * sinphi + circley * sinA;
          const ooz = 1 / z;

          const xp = Math.floor(cols / 2 + K1 * ooz * x);
          const yp = Math.floor(rows / 2 - K1 * ooz * y);

          if (xp < 0 || xp >= cols || yp < 0 || yp >= rows) continue;

          const pos = xp + cols * yp;

          if (ooz > zbuffer[pos]) {
            zbuffer[pos] = ooz;

            const L =
              cosphi * costheta * sinB -
              cosA * costheta * sinphi -
              sinA * sintheta +
              cosB * (cosA * sintheta - costheta * sinA * sinphi);

            const lumIdx = Math.floor(L * 8);
            const charIdx = Math.max(0, Math.min(CHARS.length - 1, lumIdx));
            output[pos] = CHARS[charIdx];
          }
        }
      }

      ctx.clearRect(0, 0, W, H);

      const style = getComputedStyle(canvas!);
      const textColor = style.color || "currentColor";
      const isDark = document.documentElement.classList.contains("dark");

      ctx.save();
      ctx.beginPath();
      ctx.arc(W / 2, H / 2, K1 * 0.55, 0, Math.PI * 2);
      ctx.fillStyle = isDark ? "rgba(255,255,255,0.02)" : "rgba(0,0,0,0.03)";
      ctx.fill();
      ctx.restore();

      const time = Date.now() * 0.001;

      for (let y = 0; y < rows; y++) {
        for (let x = 0; x < cols; x++) {
          const ch = output[x + cols * y];
          if (ch !== " ") {
            const charIdx = CHARS.indexOf(ch);
            const brightness = charIdx / (CHARS.length - 1);

            const glimmer =
              Math.sin(time * 2.5 + x * 0.15 + y * 0.1) * 0.3 +
              Math.sin(time * 1.8 + x * 0.08 - y * 0.12) * 0.2 +
              0.5;

            const alpha = Math.min(1, Math.max(0.15, brightness * glimmer + 0.2));

            ctx.globalAlpha = alpha;
            ctx.fillStyle = textColor;
            ctx.shadowColor = textColor;
            ctx.shadowBlur = isDark && brightness > 0.6 ? 4 : 0;
            ctx.font = `${Math.min(cellW, cellH) * 1.2}px var(--font-geist-pixel-circle, monospace)`;
            ctx.textAlign = "center";
            ctx.textBaseline = "middle";
            ctx.fillText(ch, x * cellW + cellW / 2, y * cellH + cellH / 2);
          }
        }
      }

      ctx.globalAlpha = 1;
      ctx.shadowBlur = 0;

      rotationRef.current.A += 0.03;
      rotationRef.current.B += 0.007;

      animIdRef.current = requestAnimationFrame(frame);
    }

    frame();
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        const wasVisible = isVisibleRef.current;
        isVisibleRef.current = entry.isIntersecting;

        if (entry.isIntersecting && !wasVisible) {
          draw();
        } else if (!entry.isIntersecting) {
          cancelAnimationFrame(animIdRef.current);
        }
      },
      { threshold: 0.01 }
    );

    observer.observe(canvas);
    draw();

    return () => {
      observer.disconnect();
      cancelAnimationFrame(animIdRef.current);
    };
  }, [draw]);

  return (
    <canvas
      ref={canvasRef}
      className={cn(
        "w-full h-72 sm:h-80 md:h-96",
        className
      )}
      style={{ imageRendering: "pixelated", contain: "strict" }}
    />
  );
}
