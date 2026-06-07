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

    // Higher internal res for dense dot grid, still pixelated via CSS
    const W = 280;
    const H = 280;
    canvas.width = W;
    canvas.height = H;

    const baseColor = "#3b82f6"; // bright blue
    const glowColor = "#60a5fa"; // lighter blue glow

    // Build lat/lon grid points on unit sphere
    const latSteps = 40;
    const lonSteps = 60;
    const points: { x: number; y: number; z: number; lat: number; lon: number }[] = [];

    for (let latIdx = 0; latIdx <= latSteps; latIdx++) {
      const lat = (latIdx / latSteps) * Math.PI; // 0 -> PI
      const y = Math.cos(lat);
      const ringRadius = Math.sin(lat);

      for (let lonIdx = 0; lonIdx < lonSteps; lonIdx++) {
        const lon = (lonIdx / lonSteps) * Math.PI * 2;
        const x = ringRadius * Math.cos(lon);
        const z = ringRadius * Math.sin(lon);
        points.push({ x, y, z, lat, lon });
      }
    }

    let animationId: number;
    let angleY = 0;
    let time = 0;

    const fov = 300;
    const globeR = 90;

    function project(px: number, py: number, pz: number) {
      // Rotate around Y
      const cosY = Math.cos(angleY);
      const sinY = Math.sin(angleY);
      const rx = px * cosY - pz * sinY;
      const rz = px * sinY + pz * cosY;
      const ry = py;

      // Tilt slightly back
      const tilt = -0.25;
      const cosT = Math.cos(tilt);
      const sinT = Math.sin(tilt);
      const ty = ry * cosT - rz * sinT;
      const tz = ry * sinT + rz * cosT;

      const scale = fov / (fov + tz);
      const sx = rx * scale * globeR + W / 2;
      const sy = -ty * scale * globeR + H / 2 + 6; // nudge down
      return { x: sx, y: sy, scale, z: tz };
    }

    function draw() {
      if (!ctx) return;
      ctx.clearRect(0, 0, W, H);

      // Project all points
      const projected = points.map((p) => ({
        ...project(p.x, p.y, p.z),
        lat: p.lat,
        lon: p.lon,
      }));

      // Sort by depth (back to front)
      projected.sort((a, b) => a.z - b.z);

      for (const p of projected) {
        // Only draw points on the visible hemisphere (+ small margin)
        if (p.z < -0.35) continue;

        // Glimmer: sine wave traveling across surface
        const shimmer =
          Math.sin(time * 2.5 + p.lat * 6 + p.lon * 3) * 0.5 +
          Math.sin(time * 1.8 + p.lon * 8) * 0.3 +
          0.8; // base brightness

        const alpha = Math.min(1, Math.max(0.15, shimmer * (p.z > 0 ? 1 : 0.4)));
        const dotSize = Math.max(1.5, 2.2 * p.scale);

        ctx.globalAlpha = alpha;
        ctx.fillStyle = baseColor;
        ctx.shadowColor = glowColor;
        ctx.shadowBlur = p.z > 0 ? 3 : 0;
        ctx.fillRect(p.x - dotSize / 2, p.y - dotSize / 2, dotSize, dotSize);
      }

      ctx.globalAlpha = 1;
      ctx.shadowBlur = 0;

      angleY += 0.0035; // slow rotation
      time += 0.016;
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
