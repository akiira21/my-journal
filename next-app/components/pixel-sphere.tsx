"use client";

import { useEffect, useRef, useCallback } from "react";
import { cn } from "@/lib/utils";

export type PixelSphereProps = {
  className?: string;
};

export function PixelSphere({ className }: PixelSphereProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const isVisibleRef = useRef(true);
  const animIdRef = useRef<number>(0);
  const rotationRef = useRef({ A: 0, B: 0 });

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas || !isVisibleRef.current) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const W = 320;
    const H = 320;
    if (canvas.width !== W) canvas.width = W;
    if (canvas.height !== H) canvas.height = H;

    const SR = 20;
    const ringInner = 28;
    const ringOuter = 40;

    const K2 = 450;
    const K1 = (H * K2 * 2) / (8 * ringOuter);

    const camTilt = -0.75;
    const cosCam = Math.cos(camTilt);
    const sinCam = Math.sin(camTilt);

    const lX = 0.5;
    const lY = -0.3;
    const lZ = -1.0;
    const lLen = Math.sqrt(lX * lX + lY * lY + lZ * lZ);
    const lnx = lX / lLen;
    const lny = lY / lLen;
    const lnz = lZ / lLen;

    const thetaStep = 0.08;
    const phiStep = 0.08;

    type Dot = {
      x: number;
      y: number;
      z: number;
      brightness: number;
      isBright: boolean;
      size: number;
    };

    function rotateAndProject(
      sx: number,
      sy: number,
      sz: number,
      nx: number,
      ny: number,
      nz: number,
      A: number,
      B: number
    ): { x: number; y: number; z: number; brightness: number } | null {
      const sinA = Math.sin(A);
      const cosA = Math.cos(A);
      const sinB = Math.sin(B);
      const cosB = Math.cos(B);

      const y1 = sy * cosA - sz * sinA;
      const z1 = sy * sinA + sz * cosA;
      const x1 = sx;

      const x2 = x1 * cosB + z1 * sinB;
      const y2 = y1;
      const z2 = -x1 * sinB + z1 * cosB;

      const y3 = y2 * cosCam - z2 * sinCam;
      const z3 = y2 * sinCam + z2 * cosCam;
      const x3 = x2;

      const z = z3 + K2;
      if (z <= 0) return null;

      const ooz = 1 / z;
      const projX = W / 2 + K1 * ooz * x3;
      const projY = H / 2 - K1 * ooz * y3;

      const nry1 = ny * cosA - nz * sinA;
      const nrz1 = ny * sinA + nz * cosA;
      const nrx2 = nx * cosB + nrz1 * sinB;
      const nry2 = nry1;
      const nrz2 = -nx * sinB + nrz1 * cosB;

      const nry3 = nry2 * cosCam - nrz2 * sinCam;
      const nrz3 = nry2 * sinCam + nrz2 * cosCam;
      const nrx3 = nrx2;

      const L = nrx3 * lnx + nry3 * lny + nrz3 * lnz;
      const brightness = Math.max(0, Math.min(1, (L + 0.5) / 1.2));

      return { x: projX, y: projY, z: ooz, brightness };
    }

    function frame() {
      if (!ctx || !isVisibleRef.current) return;
      ctx.clearRect(0, 0, W, H);

      const { A, B } = rotationRef.current;
      const dots: Dot[] = [];

      for (let theta = 0; theta <= Math.PI; theta += thetaStep) {
        const sinT = Math.sin(theta);
        const cosT = Math.cos(theta);

        for (let phi = 0; phi < Math.PI * 2; phi += phiStep) {
          const sinP = Math.sin(phi);
          const cosP = Math.cos(phi);

          const sx = SR * sinT * cosP;
          const sy = SR * cosT;
          const sz = SR * sinT * sinP;

          const nx = sinT * cosP;
          const ny = cosT;
          const nz = sinT * sinP;

          const p = rotateAndProject(sx, sy, sz, nx, ny, nz, A, B);
          if (!p || p.z < 0.002) continue;

          dots.push({
            x: p.x,
            y: p.y,
            z: p.z,
            brightness: p.brightness,
            isBright: p.brightness > 0.5,
            size: 1.6,
          });
        }
      }

      const ringStepsR = 6;
      const ringStepsTheta = 80;

      for (let ri = 0; ri < ringStepsR; ri++) {
        const r = ringInner + (ri / (ringStepsR - 1)) * (ringOuter - ringInner);
        for (let ti = 0; ti < ringStepsTheta; ti++) {
          const t = (ti / ringStepsTheta) * Math.PI * 2;

          const sx = r * Math.cos(t);
          const sy = 0;
          const sz = r * Math.sin(t);

          const nx = 0;
          const ny = 1;
          const nz = 0;

          const p = rotateAndProject(sx, sy, sz, nx, ny, nz, A, B);
          if (!p || p.z < 0.002) continue;

          dots.push({
            x: p.x,
            y: p.y,
            z: p.z,
            brightness: p.brightness,
            isBright: p.brightness > 0.4,
            size: 2.0,
          });
        }
      }

      dots.sort((a, b) => a.z - b.z);

      const time = Date.now() * 0.001;

      for (const p of dots) {
        const glimmer =
          Math.sin(time * 2 + p.x * 0.05 + p.y * 0.04) * 0.3 +
          Math.sin(time * 1.5 - p.x * 0.03 + p.y * 0.06) * 0.2 +
          0.55;

        const alpha = Math.min(1, Math.max(0.12, p.brightness * glimmer));

        ctx.globalAlpha = alpha;
        ctx.fillStyle = "#3b82f6";

        if (p.isBright) {
          ctx.shadowColor = "#60a5fa";
          ctx.shadowBlur = 4;
        } else {
          ctx.shadowBlur = 0;
        }

        ctx.fillRect(p.x - p.size / 2, p.y - p.size / 2, p.size, p.size);
      }

      ctx.globalAlpha = 1;
      ctx.shadowBlur = 0;

      rotationRef.current.A += 0.025;
      rotationRef.current.B += 0.018;

      animIdRef.current = requestAnimationFrame(frame);
    }

    frame();
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        const wasVisible = isVisibleRef.current;
        isVisibleRef.current = entry.isIntersecting;

        if (entry.isIntersecting && !wasVisible) {
          draw();
        } else if (!entry.isIntersecting) {
          cancelAnimationFrame(animIdRef.current);
        }
      },
      { threshold: 0.01 }
    );

    observer.observe(canvas);
    draw();

    return () => {
      observer.disconnect();
      cancelAnimationFrame(animIdRef.current);
    };
  }, [draw]);

  return (
    <canvas
      ref={canvasRef}
      className={cn(
        "w-full h-72 sm:h-80 md:h-96",
        className
      )}
      style={{ imageRendering: "pixelated", contain: "strict" }}
    />
  );
}
