"use client";

import { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";

export type PixelSphereProps = {
  className?: string;
};

const CHARS = ".,-~:;=!*#$@";

export function PixelSphere({ className }: PixelSphereProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const cols = 80;
    const rows = 80;
    const W = 400;
    const H = 400;
    canvas.width = W;
    canvas.height = H;

    const cellW = W / cols;
    const cellH = H / rows;

    const R1 = 20;   // sphere "cross-section" radius
    const R2 = 0;    // 0 = sphere (no hole like donut)
    const K2 = 200;
    const K1 = (rows * K2 * 3) / (8 * (R1 + R2 || R1));

    const output = new Array(cols * rows).fill(" ");
    const zbuffer = new Array(cols * rows).fill(0);

    let A = 0;
    let B = 0;
    let animId: number;

    // Use same step sizes as donut for similar density
    const thetaStep = 0.07;
    const phiStep = 0.025;

    function draw() {
      if (!ctx) return;

      output.fill(" ");
      zbuffer.fill(0);

      const sinA = Math.sin(A);
      const cosA = Math.cos(A);
      const sinB = Math.sin(B);
      const cosB = Math.cos(B);

      for (let theta = 0; theta < Math.PI * 2; theta += thetaStep) {
        const sintheta = Math.sin(theta);
        const costheta = Math.cos(theta);

        for (let phi = 0; phi < Math.PI * 2; phi += phiStep) {
          const sinphi = Math.sin(phi);
          const cosphi = Math.cos(phi);

          // Circle cross-section (sphere: R2=0)
          const circlex = R2 + R1 * costheta;
          const circley = R1 * sintheta;

          // 3D coords after A/B rotation (same as donut!)
          const x = circlex * (cosB * cosphi + sinA * sinB * sinphi) - circley * cosA * sinB;
          const y = circlex * (sinB * cosphi - sinA * cosB * sinphi) + circley * cosA * cosB;
          const z = K2 + cosA * circlex * sinphi + circley * sinA;
          const ooz = 1 / z;

          // 2D projection
          const xp = Math.floor(cols / 2 + K1 * ooz * x);
          const yp = Math.floor(rows / 2 - K1 * ooz * y);

          if (xp < 0 || xp >= cols || yp < 0 || yp >= rows) continue;

          const pos = xp + cols * yp;

          if (ooz > zbuffer[pos]) {
            zbuffer[pos] = ooz;

            // Luminance (same formula as donut - dot of rotated normal with light)
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

      // Render
      ctx.clearRect(0, 0, W, H);
      const time = Date.now() * 0.001;

      for (let y = 0; y < rows; y++) {
        for (let x = 0; x < cols; x++) {
          const ch = output[x + cols * y];
          if (ch !== " ") {
            const charIdx = CHARS.indexOf(ch);
            const brightness = charIdx / (CHARS.length - 1);

            const glimmer =
              Math.sin(time * 2 + x * 0.12 + y * 0.08) * 0.3 +
              Math.sin(time * 1.5 - x * 0.1 + y * 0.15) * 0.2 +
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

      // Same increments as donut for same tumbling feel
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
