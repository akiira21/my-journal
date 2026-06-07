"use client";

import { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";

export type ParabolaHatProps = {
  className?: string;
};

export function ParabolaHat({ className }: ParabolaHatProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Internal low resolution for pixelated look
    const W = 160;
    const H = 120;
    canvas.width = W;
    canvas.height = H;

    // Read color from computed style
    const style = getComputedStyle(canvas);
    const color = style.color || "#e8e8e8";

    // Hat geometry parameters
    const rings = 12;
    const segments = 24;
    const maxR = 40;
    const height = 50;
    const a = height / (maxR * maxR); // z = height - a * r^2

    // Generate mesh points
    const mesh: { x: number; y: number; z: number }[][] = [];
    for (let i = 0; i <= rings; i++) {
      const r = (i / rings) * maxR;
      const row: { x: number; y: number; z: number }[] = [];
      for (let j = 0; j <= segments; j++) {
        const theta = (j / segments) * Math.PI * 2;
        const x = r * Math.cos(theta);
        const z = r * Math.sin(theta); // using z as the horizontal plane axis (will become y after tilt)
        const y = height - a * r * r; // height axis (will become z after tilt)
        row.push({ x, y, z });
      }
      mesh.push(row);
    }

    let animationId: number;
    let angleY = 0;

    const fov = 200;

    function project(p: { x: number; y: number; z: number }) {
      // Rotate around Y (vertical after tilt)
      const cosY = Math.cos(angleY);
      const sinY = Math.sin(angleY);
      const rx = p.x * cosY - p.z * sinY;
      const rz = p.x * sinY + p.z * cosY;
      const ry = p.y;

      // Tilt backward slightly (rotate around X)
      const tilt = -0.35; // radians, about -20 deg
      const cosT = Math.cos(tilt);
      const sinT = Math.sin(tilt);
      const ty = ry * cosT - rz * sinT;
      const tz = ry * sinT + rz * cosT;

      const scale = fov / (fov + tz);
      const sx = rx * scale * 1.8 + W / 2;
      const sy = -ty * scale * 1.8 + H / 2 + 10; // +10 to center vertically
      return { x: sx, y: sy, scale };
    }

    function draw() {
      if (!ctx) return;
      ctx.clearRect(0, 0, W, H);

      ctx.shadowBlur = 3;
      ctx.shadowColor = color;
      ctx.strokeStyle = color;
      ctx.lineWidth = 0.5;

      // Draw rings
      for (let i = 0; i <= rings; i++) {
        ctx.beginPath();
        for (let j = 0; j <= segments; j++) {
          const p = project(mesh[i][j]);
          if (j === 0) ctx.moveTo(p.x, p.y);
          else ctx.lineTo(p.x, p.y);
        }
        ctx.closePath();
        ctx.globalAlpha = 0.5 + (i / rings) * 0.5;
        ctx.stroke();
      }

      // Draw spokes
      ctx.globalAlpha = 0.35;
      for (let j = 0; j < segments; j += 2) {
        ctx.beginPath();
        for (let i = 0; i <= rings; i++) {
          const p = project(mesh[i][j]);
          if (i === 0) ctx.moveTo(p.x, p.y);
          else ctx.lineTo(p.x, p.y);
        }
        ctx.stroke();
      }

      ctx.globalAlpha = 1;
      ctx.shadowBlur = 0;

      angleY += 0.015;
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
