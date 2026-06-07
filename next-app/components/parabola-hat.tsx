"use client";

import { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";

export type DonutProps = {
  className?: string;
};

const CHARS = ".,-~:;=!*#$@";

export function PixelGlobe({ className }: DonutProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const cols = 60;
    const rows = 60;
    const W = 360;
    const H = 360;
    canvas.width = W;
    canvas.height = H;

    const cellW = W / cols;
    const cellH = H / rows;

    const R1 = 10;
    const R2 = 20;
    const K2 = 200;
    const K1 = (rows * K2 * 3) / (8 * (R1 + R2));

    const output = new Array(cols * rows).fill(" ");
    const zbuffer = new Array(cols * rows).fill(0);

    let A = 0;
    let B = 0;
    let animId: number;

    const thetaStep = 0.08;
    const phiStep = 0.03;

    function draw() {
      if (!ctx) return;
      output.fill(" ");
      zbuffer.fill(0);

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

      const time = Date.now() * 0.001;

      for (let y = 0; y < rows; y++) {
        for (let x = 0; x < cols; x++) {
          const ch = output[x + cols * y];
          if (ch !== " ") {
            const charIdx = CHARS.indexOf(ch);
            const brightness = charIdx / (CHARS.length - 1);

            // Glimmer: traveling wave across the donut
            const glimmer =
              Math.sin(time * 2.5 + x * 0.15 + y * 0.1) * 0.3 +
              Math.sin(time * 1.8 + x * 0.08 - y * 0.12) * 0.2 +
              0.5;

            const alpha = Math.min(1, Math.max(0.15, brightness * glimmer + 0.2));

            ctx.globalAlpha = alpha;
            ctx.fillStyle = "#3b82f6";
            ctx.shadowColor = "#60a5fa";
            ctx.shadowBlur = brightness > 0.6 ? 3 : 0;
            ctx.font = `${Math.min(cellW, cellH) * 0.85}px var(--font-geist-mono, monospace)`;
            ctx.textAlign = "center";
            ctx.textBaseline = "middle";
            ctx.fillText(ch, x * cellW + cellW / 2, y * cellH + cellH / 2);
          }
        }
      }

      ctx.globalAlpha = 1;
      ctx.shadowBlur = 0;

      A += 0.03;
      B += 0.007;

      animId = requestAnimationFrame(draw);
    }

    draw();

    return () => cancelAnimationFrame(animId);
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className={cn(
        "w-full h-72 sm:h-80 md:h-96",
        className
      )}
      style={{ imageRendering: "pixelated" }}
    />
  );
}
