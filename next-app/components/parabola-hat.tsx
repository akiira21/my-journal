"use client";

import { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";

export type DonutProps = {
  className?: string;
};

const CHARS = ".,-~:;=!*#$@";

function hsvToRgb(h: number, s: number, v: number): [number, number, number] {
  const i = Math.floor(h * 6);
  const f = h * 6 - i;
  const p = v * (1 - s);
  const q = v * (1 - f * s);
  const t = v * (1 - (1 - f) * s);
  let r = 0, g = 0, b = 0;
  switch (i % 6) {
    case 0: r = v; g = t; b = p; break;
    case 1: r = q; g = v; b = p; break;
    case 2: r = p; g = v; b = t; break;
    case 3: r = p; g = q; b = v; break;
    case 4: r = t; g = p; b = v; break;
    case 5: r = v; g = p; b = q; break;
  }
  return [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)];
}

export function PixelGlobe({ className }: DonutProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Grid resolution (character cells)
    const cols = 60;
    const rows = 60;
    const W = 360;
    const H = 360;
    canvas.width = W;
    canvas.height = H;

    const cellW = W / cols;
    const cellH = H / rows;

    // Donut math constants
    const R1 = 10;
    const R2 = 20;
    const K2 = 200;
    const K1 = (rows * K2 * 3) / (8 * (R1 + R2));

    const output = new Array(cols * rows).fill(" ");
    const zbuffer = new Array(cols * rows).fill(0);

    let A = 0;
    let B = 0;
    let hue = 0;
    let animId: number;

    const thetaStep = 0.08;
    const phiStep = 0.03;

    function draw() {
      if (!ctx) return;
      // Clear buffers
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

          // Torus cross-section circle
          const circlex = R2 + R1 * costheta;
          const circley = R1 * sintheta;

          // 3D rotation
          const x =
            circlex * (cosB * cosphi + sinA * sinB * sinphi) -
            circley * cosA * sinB;
          const y =
            circlex * (sinB * cosphi - sinA * cosB * sinphi) +
            circley * cosA * cosB;
          const z = K2 + cosA * circlex * sinphi + circley * sinA;
          const ooz = 1 / z;

          // 2D projection
          const xp = Math.floor(cols / 2 + K1 * ooz * x);
          const yp = Math.floor(rows / 2 - K1 * ooz * y);

          if (xp < 0 || xp >= cols || yp < 0 || yp >= rows) continue;

          const pos = xp + cols * yp;

          // Z-buffer: larger ooz = closer to viewer
          if (ooz > zbuffer[pos]) {
            zbuffer[pos] = ooz;

            // Luminance (surface normal dot light source)
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

      // Render to canvas
      ctx.clearRect(0, 0, W, H);

      const [r, g, b] = hsvToRgb(hue, 1, 1);
      ctx.fillStyle = `rgb(${r}, ${g}, ${b})`;
      ctx.font = `${Math.min(cellW, cellH) * 0.85}px var(--font-geist-mono, monospace)`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";

      for (let y = 0; y < rows; y++) {
        for (let x = 0; x < cols; x++) {
          const ch = output[x + cols * y];
          if (ch !== " ") {
            ctx.fillText(
              ch,
              x * cellW + cellW / 2,
              y * cellH + cellH / 2
            );
          }
        }
      }

      // Increment rotation angles
      A += 0.03;
      B += 0.007;
      hue = (hue + 0.002) % 1;

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
