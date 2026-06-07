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

    const W = 320;
    const H = 320;
    canvas.width = W;
    canvas.height = H;

    // Math symbols palette
    const MATH_CHARS = [
      "+", "-", "×", "÷", "=", "≠", "≈", "∞", "∑", "∏",
      "∫", "∂", "√", "π", "Δ", "θ", "λ", "α", "β", "γ",
      "≈", "≤", "≥", "∈", "∉", "∩", "∪", "∀", "∃", "¬",
      "∧", "∨", "→", "↔", "⇒", "∴", "∵", "∼", "≅", "≡",
      "∥", "⊥", "∠", "′", "″", "°", "½", "¼", "¾", "♯",
    ];

    // Build dense lat/lon grid on unit sphere
    const latSteps = 45;
    const lonSteps = 70;
    const points: {
      x: number;
      y: number;
      z: number;
      char: string;
      phase: number;
      speed: number;
      minOpacity: number;
    }[] = [];

    for (let latIdx = 0; latIdx <= latSteps; latIdx++) {
      const lat = (latIdx / latSteps) * Math.PI;
      const py = Math.cos(lat);
      const ringRadius = Math.sin(lat);

      for (let lonIdx = 0; lonIdx < lonSteps; lonIdx++) {
        const lon = (lonIdx / lonSteps) * Math.PI * 2;
        const px = ringRadius * Math.cos(lon);
        const pz = ringRadius * Math.sin(lon);
        const char = MATH_CHARS[(latIdx * lonSteps + lonIdx) % MATH_CHARS.length];
        const phase = Math.random() * Math.PI * 2;
        const speed = Math.random() * 1.5 + 0.5;
        const minOpacity = Math.random() * 0.4 + 0.1;
        points.push({ x: px, y: py, z: pz, char, phase, speed, minOpacity });
      }
    }

    let animationId: number;
    let angleY = 0;
    let time = 0;

    const fov = 320;
    const globeR = 100;

    function project(px: number, py: number, pz: number) {
      const cosY = Math.cos(angleY);
      const sinY = Math.sin(angleY);
      const rx = px * cosY - pz * sinY;
      const rz = px * sinY + pz * cosY;
      const ry = py;

      const tilt = -0.25;
      const cosT = Math.cos(tilt);
      const sinT = Math.sin(tilt);
      const ty = ry * cosT - rz * sinT;
      const tz = ry * sinT + rz * cosT;

      const scale = fov / (fov + tz);
      const sx = rx * scale * globeR + W / 2;
      const sy = -ty * scale * globeR + H / 2 + 4;
      return { x: sx, y: sy, scale, z: tz };
    }

    function draw() {
      if (!ctx) return;
      ctx.clearRect(0, 0, W, H);

      const projected = points.map((p) => ({
        ...project(p.x, p.y, p.z),
        char: p.char,
        phase: p.phase,
        speed: p.speed,
        minOpacity: p.minOpacity,
      }));

      projected.sort((a, b) => a.z - b.z);

      for (const p of projected) {
        // Cull back hemisphere
        if (p.z < -0.2) continue;

        // Glimmer: sine wave with per-dot random phase and speed
        const glimmer =
          Math.sin(time * p.speed + p.phase) * 0.5 + 0.5; // 0 -> 1
        const alpha = p.minOpacity + glimmer * (1 - p.minOpacity);

        // Depth dimming for back-facing chars
        const depthAlpha = p.z > 0 ? 1 : 0.35;
        const finalAlpha = alpha * depthAlpha;

        const size = Math.max(7, 11 * p.scale);

        ctx.globalAlpha = finalAlpha;
        ctx.fillStyle = "#3b82f6"; // bright blue
        ctx.shadowColor = "#60a5fa";
        ctx.shadowBlur = p.z > 0 ? 4 : 0;
        ctx.font = `${size}px var(--font-geist-mono, monospace)`;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(p.char, p.x, p.y);
      }

      ctx.globalAlpha = 1;
      ctx.shadowBlur = 0;

      angleY += 0.004;
      time += 0.05;
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
