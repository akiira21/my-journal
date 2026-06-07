"use client";

import { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";

export type PixelSphereProps = {
  className?: string;
};

const CHARS = ".,-~:;=!*#$@";

export function PixelSphereRaster({ className }: PixelSphereProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const cols = 70;
    const rows = 42;
    const W = 420;
    const H = 252;
    canvas.width = W;
    canvas.height = H;

    const cellW = W / cols;
    const cellH = H / rows;

    const R = 22;
    const K2 = 250;
    const K1 = (rows * K2 * 2) / (8 * R);

    const output = new Array(cols * rows).fill(" ");
    const zbuffer = new Array(cols * rows).fill(0);

    let A = 0;
    let B = 0;
    let animId: number;

    // Match the "Zig cube" feel: sparser steps
    const thetaStep = 0.18;
    const phiStep = 0.12;

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

          // Rotate around X by A
          const y1 = sy * cosA - sz * sinA;
          const z1 = sy * sinA + sz * cosA;
          const x1 = sx;

          // Rotate around Y by B
          const x = x1 * cosB + z1 * sinB;
          const y = y1;
          const z = -x1 * sinB + z1 * cosB + K2;

          const ooz = 1 / z;

          const xp = Math.floor(cols / 2 + K1 * ooz * x);
          const yp = Math.floor(rows / 2 - K1 * ooz * y);

          if (xp < 0 || xp >= cols || yp < 0 || yp >= rows) continue;

          const pos = xp + cols * yp;

          if (ooz > zbuffer[pos]) {
            zbuffer[pos] = ooz;

            // Normal (unit sphere)
            const ny1 = cosT * cosA - sinT * sinP * sinA;
            const nz1 = cosT * sinA + sinT * sinP * cosA;
            const nx1 = sinT * cosP;

            const nx = nx1 * cosB + nz1 * sinB;
            const ny = ny1;
            const nz = -nx1 * sinB + nz1 * cosB;

            // Light from upper-left-front
            const L = nx * 0.3 + ny * 0.5 - nz * 0.8;

            const lumIdx = Math.floor(L * 8);
            const charIdx = Math.max(0, Math.min(CHARS.length - 1, lumIdx));
            output[pos] = CHARS[charIdx];
          }
        }
      }

      ctx.clearRect(0, 0, W, H);

      const style = getComputedStyle(canvas!);
      const textColor = style.color || "currentColor";

      ctx.fillStyle = textColor;
      ctx.font = `${cellH * 1.1}px var(--font-geist-pixel-circle, monospace)`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";

      for (let y = 0; y < rows; y++) {
        for (let x = 0; x < cols; x++) {
          const ch = output[x + cols * y];
          if (ch !== " ") {
            ctx.fillText(ch, x * cellW + cellW / 2, y * cellH + cellH / 2);
          }
        }
      }

      A += 0.025;
      B += 0.018;

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
