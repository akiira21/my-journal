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

    const R = 22;
    const K2 = 200;
    const K1 = (rows * K2 * 2) / (8 * R);

    const output = new Array(cols * rows).fill(" ");
    const zbuffer = new Array(cols * rows).fill(0);

    let A = 0;
    let B = 0;
    let animId: number;

    // Match donut step density
    const thetaStep = 0.10;
    const phiStep = 0.03;

    // Light direction (same as donut convention)
    const light = [0, 1, -1];
    const lightLen = Math.sqrt(light[0]**2 + light[1]**2 + light[2]**2);
    const lX = light[0] / lightLen;
    const lY = light[1] / lightLen;
    const lZ = light[2] / lightLen;

    function draw() {
      if (!ctx) return;
      output.fill(" ");
      zbuffer.fill(0);

      const sinA = Math.sin(A);
      const cosA = Math.cos(A);
      const sinB = Math.sin(B);
      const cosB = Math.cos(B);

      for (let theta = 0; theta < Math.PI; theta += thetaStep) {
        const sinT = Math.sin(theta);
        const cosT = Math.cos(theta);

        for (let phi = 0; phi < Math.PI * 2; phi += phiStep) {
          const sinP = Math.sin(phi);
          const cosP = Math.cos(phi);

          // Sphere surface point
          const sx = R * sinT * cosP;
          const sy = R * cosT;
          const sz = R * sinT * sinP;

          // --- Rotate around X by A ---
          const y1 = sy * cosA - sz * sinA;
          const z1 = sy * sinA + sz * cosA;
          const x1 = sx;

          // --- Rotate around Y by B ---
          const x = x1 * cosB + z1 * sinB;
          const y = y1;
          const z = -x1 * sinB + z1 * cosB + K2;

          const ooz = 1 / z;

          // 2D projection
          const xp = Math.floor(cols / 2 + K1 * ooz * x);
          const yp = Math.floor(rows / 2 - K1 * ooz * y);

          if (xp < 0 || xp >= cols || yp < 0 || yp >= rows) continue;

          const pos = xp + cols * yp;

          if (ooz > zbuffer[pos]) {
            zbuffer[pos] = ooz;

            // Normal is just the unit position vector on a sphere
            // Rotate normal the same way as the point
            const ny1 = cosT * cosA - sinT * sinP * sinA;
            const nz1 = cosT * sinA + sinT * sinP * cosA;
            const nx1 = sinT * cosP;

            const nx = nx1 * cosB + nz1 * sinB;
            const ny = ny1;
            const nz = -nx1 * sinB + nz1 * cosB;

            // Luminance = dot(normal, light)
            const L = nx * lX + ny * lY + nz * lZ;

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

      // Same increments as donut
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
