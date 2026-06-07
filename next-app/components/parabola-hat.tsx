"use client";

import { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";

export type PixelGlobeProps = {
  className?: string;
};

export function PixelGlobe({ className }: PixelGlobeProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Low-res pixelated canvas
    const W = 180;
    const H = 180;
    canvas.width = W;
    canvas.height = H;

    const globeColor = "#60a5fa"; // bright blue
    const glowColor = "#2563eb";  // deeper blue glow

    // Generate evenly distributed points on sphere using Fibonacci spiral
    const pointCount = 280;
    const points: { x: number; y: number; z: number; char: string }[] = [];
    const phi = Math.PI * (3 - Math.sqrt(5)); // golden angle

    for (let i = 0; i < pointCount; i++) {
      const y = 1 - (i / (pointCount - 1)) * 2; // y from 1 to -1
      const radius = Math.sqrt(1 - y * y);
      const theta = phi * i;
      const x = Math.cos(theta) * radius;
      const z = Math.sin(theta) * radius;
      const char = i % 2 === 0 ? "+" : "x";
      points.push({ x, y, z, char });
    }

    let animationId: number;
    let angleY = 0;

    const fov = 250;
    const globeR = 55;

    function project(px: number, py: number, pz: number) {
      // Rotate around Y
      const cosY = Math.cos(angleY);
      const sinY = Math.sin(angleY);
      const rx = px * cosY - pz * sinY;
      const rz = px * sinY + pz * cosY;
      const ry = py;

      // Tilt slightly back
      const tilt = -0.2;
      const cosT = Math.cos(tilt);
      const sinT = Math.sin(tilt);
      const ty = ry * cosT - rz * sinT;
      const tz = ry * sinT + rz * cosT;

      const scale = fov / (fov + tz);
      const sx = rx * scale * globeR + W / 2;
      const sy = -ty * scale * globeR + H / 2;
      return { x: sx, y: sy, scale, z: tz };
    }

    function draw() {
      if (!ctx) return;
      ctx.clearRect(0, 0, W, H);

      // Project all points
      const projected = points.map((p) => ({
        ...project(p.x, p.y, p.z),
        char: p.char,
      }));

      // Sort by depth (back to front)
      projected.sort((a, b) => a.z - b.z);

      // Draw back points dimmer
      for (const p of projected) {
        const alpha = p.z < 0 ? 0.25 : 1;
        const size = Math.max(6, 10 * p.scale);

        ctx.globalAlpha = alpha;
        ctx.fillStyle = globeColor;
        ctx.shadowColor = glowColor;
        ctx.shadowBlur = p.z > 0 ? 4 : 0;
        ctx.font = `${size}px var(--font-geist-pixel-square, monospace)`;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(p.char, p.x, p.y);
      }

      ctx.globalAlpha = 1;
      ctx.shadowBlur = 0;

      angleY += 0.012;
      animationId = requestAnimationFrame(draw);
    }

    draw();

    return () => {
      cancelAnimationFrame(animationId);
    };
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
