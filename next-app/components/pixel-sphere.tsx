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

    // Grid resolution (character cells)
    const cols = 70;
    const rows = 70;
    const W = 420;
    const H = 420;
    canvas.width = W;
    canvas.height = H;

    const cellW = W / cols;
    const cellH = H / rows;

    // Sphere constants
    const R = 18;          // sphere radius
    const K2 = 200;        // viewer distance
    const K1 = (rows * K2 * 3) / (8 * (R * 2));

    const output = new Array(cols * rows).fill(" ");
    const zbuffer = new Array(cols * rows).fill(0);

    let angleX = 0;
    let angleY = 0;
    let animId: number;

    const thetaStep = 0.09; // latitude step
    const phiStep = 0.06;   // longitude step

    function draw() {
      if (!ctx) return;

      // Clear buffers
      output.fill(" ");
      zbuffer.fill(0);

      const cosAX = Math.cos(angleX);
      const sinAX = Math.sin(angleX);
      const cosAY = Math.cos(angleY);
      const sinAY = Math.sin(angleY);

      // Light direction (fixed in world space)
      const lightX = 0;
      const lightY = 1;
      const lightZ = -1;
      const lightLen = Math.sqrt(lightX * lightX + lightY * lightY + lightZ * lightZ);
      const lX = lightX / lightLen;
      const lY = lightY / lightLen;
      const lZ = lightZ / lightLen;

      for (let theta = 0; theta < Math.PI; theta += thetaStep) {
        const cosT = Math.cos(theta);
        const sinT = Math.sin(theta);

        for (let phi = 0; phi < Math.PI * 2; phi += phiStep) {
          const cosP = Math.cos(phi);
          const sinP = Math.sin(phi);

          // Sphere surface point
          const sx = R * sinT * cosP;
          const sy = R * cosT;
          const sz = R * sinT * sinP;

          // Rotate around X then Y
          // X rotation
          const ry1 = sy * cosAX - sz * sinAX;
          const rz1 = sy * sinAX + sz * cosAX;
          const rx1 = sx;

          // Y rotation
          const x = rx1 * cosAY - rz1 * sinAY;
          const y = ry1;
          const z = rx1 * sinAY + rz1 * cosAY + K2;

          const ooz = 1 / z;

          // 2D projection
          const xp = Math.floor(cols / 2 + K1 * ooz * x);
          const yp = Math.floor(rows / 2 - K1 * ooz * y);

          if (xp < 0 || xp >= cols || yp < 0 || yp >= rows) continue;

          const pos = xp + cols * yp;

          // Z-buffer
          if (ooz > zbuffer[pos]) {
            zbuffer[pos] = ooz;

            // Surface normal (same as point on unit sphere, rotated)
            const nx1 = sinT * cosP;
            const ny1 = cosT;
            const nz1 = sinT * sinP;

            // Apply same rotations to normal
            const nry1 = ny1 * cosAX - nz1 * sinAX;
            const nrz1 = ny1 * sinAX + nz1 * cosAX;
            const nx = nx1 * cosAY - nrz1 * sinAY;
            const ny = nry1;
            const nz = nx1 * sinAY + nrz1 * cosAY;

            // Luminance = dot(normal, light)
            const L = nx * lX + ny * lY + nz * lZ;

            const lumIdx = Math.floor(L * 8);
            const charIdx = Math.max(0, Math.min(CHARS.length - 1, lumIdx));
            output[pos] = CHARS[charIdx];
          }
        }
      }

      // Render to canvas
      ctx.clearRect(0, 0, W, H);

      // Glimmer time
      const time = Date.now() * 0.001;

      for (let y = 0; y < rows; y++) {
        for (let x = 0; x < cols; x++) {
          const ch = output[x + cols * y];
          if (ch !== " ") {
            // Find char brightness index
            const charIdx = CHARS.indexOf(ch);
            const brightness = charIdx / (CHARS.length - 1); // 0..1

            // Glimmer: traveling wave across screen
            const glimmer =
              Math.sin(time * 2 + x * 0.15 + y * 0.1) * 0.3 +
              Math.sin(time * 1.5 + x * 0.08 - y * 0.12) * 0.2 +
              0.5;

            const alpha = Math.min(1, Math.max(0.15, brightness * glimmer + 0.2));

            ctx.globalAlpha = alpha;
            ctx.fillStyle = "#3b82f6"; // blue
            ctx.shadowColor = "#60a5fa";
            ctx.shadowBlur = brightness > 0.6 ? 3 : 0;
            ctx.font = `${Math.min(cellW, cellH) * 0.9}px var(--font-geist-mono, monospace)`;
            ctx.textAlign = "center";
            ctx.textBaseline = "middle";
            ctx.fillText(ch, x * cellW + cellW / 2, y * cellH + cellH / 2);
          }
        }
      }

      ctx.globalAlpha = 1;
      ctx.shadowBlur = 0;

      angleX += 0.025;
      angleY += 0.015;

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
