"use client";

import { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";

export type PixelSphereProps = {
  className?: string;
};

export function PixelSphere({ className }: PixelSphereProps) {
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

    // Oblate ellipsoid: flattened at the poles so rotation is VISIBLE.
    // Rx = Rz > Ry makes it look like a squashed ball.
    const Rx = 26;
    const Ry = 16;
    const Rz = 26;

    const K2 = 400;
    const K1 = (H * K2 * 2) / (8 * ((Rx + Ry + Rz) / 3));

    let A = 0; // rotation around X
    let B = 0; // rotation around Y
    let animId: number;

    // Camera: look from the side (slightly above equator)
    const camTilt = -0.7;
    const cosCam = Math.cos(camTilt);
    const sinCam = Math.sin(camTilt);

    // Light fixed
    const lX = 0.5;
    const lY = -0.3;
    const lZ = -1.0;
    const lLen = Math.sqrt(lX * lX + lY * lY + lZ * lZ);
    const lnx = lX / lLen;
    const lny = lY / lLen;
    const lnz = lZ / lLen;

    const latCount = 14;
    const lonCount = 24;

    // Build curves: latitudes and longitudes
    const curves: { theta: number; phi: number }[][] = [];

    // Latitudes
    for (let i = 1; i < latCount; i++) {
      const theta = (i / latCount) * Math.PI;
      const ring: { theta: number; phi: number }[] = [];
      for (let j = 0; j <= lonCount; j++) {
        ring.push({ theta, phi: (j / lonCount) * Math.PI * 2 });
      }
      curves.push(ring);
    }

    // Longitudes
    for (let j = 0; j < lonCount; j++) {
      const phi = (j / lonCount) * Math.PI * 2;
      const arc: { theta: number; phi: number }[] = [];
      for (let i = 0; i <= latCount; i++) {
        arc.push({ theta: (i / latCount) * Math.PI, phi });
      }
      curves.push(arc);
    }

    function transformAndProject(
      theta: number,
      phi: number
    ): { x: number; y: number; z: number; brightness: number } | null {
      const sinT = Math.sin(theta);
      const cosT = Math.cos(theta);
      const sinP = Math.sin(phi);
      const cosP = Math.cos(phi);

      // Ellipsoid surface point
      const sx = Rx * sinT * cosP;
      const sy = Ry * cosT;
      const sz = Rz * sinT * sinP;

      const sinA = Math.sin(A);
      const cosA = Math.cos(A);
      const sinB = Math.sin(B);
      const cosB = Math.cos(B);

      // Rx(A)
      const y1 = sy * cosA - sz * sinA;
      const z1 = sy * sinA + sz * cosA;
      const x1 = sx;

      // Ry(B)
      const x2 = x1 * cosB + z1 * sinB;
      const y2 = y1;
      const z2 = -x1 * sinB + z1 * cosB;

      // Camera tilt
      const y3 = y2 * cosCam - z2 * sinCam;
      const z3 = y2 * sinCam + z2 * cosCam;
      const x3 = x2;

      const z = z3 + K2;
      if (z <= 0) return null;

      const ooz = 1 / z;
      const projX = W / 2 + K1 * ooz * x3;
      const projY = H / 2 - K1 * ooz * y3;

      // Normal for ellipsoid: (x/Rx^2, y/Ry^2, z/Rz^2)
      const nX = sinT * cosP / Rx;
      const nY = cosT / Ry;
      const nZ = sinT * sinP / Rz;

      // Normalize
      const nLen = Math.sqrt(nX * nX + nY * nY + nZ * nZ);
      const nx0 = nX / nLen;
      const ny0 = nY / nLen;
      const nz0 = nZ / nLen;

      // Rotate normal same way
      const ny1 = ny0 * cosA - nz0 * sinA;
      const nz1 = ny0 * sinA + nz0 * cosA;
      const nx2 = nx0 * cosB + nz1 * sinB;
      const ny2 = ny1;
      const nz2 = -nx0 * sinB + nz1 * cosB;

      const ny3 = ny2 * cosCam - nz2 * sinCam;
      const nz3 = ny2 * sinCam + nz2 * cosCam;
      const nx3 = nx2;

      const L = nx3 * lnx + ny3 * lny + nz3 * lnz;
      const brightness = Math.max(0, Math.min(1, (L + 0.5) / 1.2));

      return { x: projX, y: projY, z: ooz, brightness };
    }

    function draw() {
      if (!ctx) return;
      ctx.clearRect(0, 0, W, H);

      const time = Date.now() * 0.001;

      for (const curve of curves) {
        const pts: { x: number; y: number; z: number; brightness: number }[] = [];

        for (const p of curve) {
          const r = transformAndProject(p.theta, p.phi);
          if (!r || r.z < 0.003) continue;
          pts.push(r);
        }

        if (pts.length < 2) continue;

        for (const p of pts) {
          const glimmer =
            Math.sin(time * 2 + p.x * 0.05 + p.y * 0.04) * 0.3 +
            Math.sin(time * 1.5 - p.x * 0.03 + p.y * 0.06) * 0.2 +
            0.55;

          const alpha = Math.min(1, Math.max(0.15, p.brightness * glimmer));
          const size = 2.2;

          ctx.globalAlpha = alpha;
          ctx.fillStyle = "#3b82f6";

          if (p.brightness > 0.55) {
            ctx.shadowColor = "#60a5fa";
            ctx.shadowBlur = 4;
          } else {
            ctx.shadowBlur = 0;
          }

          ctx.fillRect(p.x - size / 2, p.y - size / 2, size, size);
        }
      }

      ctx.globalAlpha = 1;
      ctx.shadowBlur = 0;

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
