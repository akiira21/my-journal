"use client";

import { useEffect, useRef, useCallback } from "react";
import { cn } from "@/lib/utils";

export type PixelCubeProps = {
  className?: string;
};

const SYMBOLS = "$$**++--@@==;;::~~##..,,><";

// Terminal-like grid (wider than tall for proper cube aspect)
const NB_COLS = 120;
const NB_ROWS = 44;

// Cube vertices
const cubeVertices: { x: number; y: number; z: number }[] = [
  { x: -1, y: -1, z: -1 }, // 0
  { x: -1, y: 1, z: -1 },  // 1
  { x: 1, y: 1, z: -1 },   // 2
  { x: 1, y: -1, z: -1 },  // 3
  { x: 1, y: 1, z: 1 },    // 4
  { x: 1, y: -1, z: 1 },   // 5
  { x: -1, y: -1, z: 1 },  // 6
  { x: -1, y: 1, z: 1 },   // 7
];

// Cube triangles (12 faces, 2 triangles each)
const cubeTriangles: [number, number, number][] = [
  // front
  [0, 1, 2],
  [0, 2, 3],
  // right
  [3, 2, 4],
  [3, 4, 5],
  // back
  [5, 4, 7],
  [5, 7, 6],
  // left
  [6, 7, 1],
  [6, 1, 0],
  // top
  [6, 0, 3],
  [6, 3, 5],
  // bottom
  [1, 7, 4],
  [1, 4, 2],
];

type Vec3 = { x: number; y: number; z: number };
type Vec2 = { x: number; y: number };

function rotateX(v: Vec3, angle: number): Vec3 {
  const c = Math.cos(angle);
  const s = Math.sin(angle);
  return { x: v.x, y: c * v.y - s * v.z, z: s * v.y + c * v.z };
}

function rotateY(v: Vec3, angle: number): Vec3 {
  const c = Math.cos(angle);
  const s = Math.sin(angle);
  return { x: c * v.x + s * v.z, y: v.y, z: -s * v.x + c * v.z };
}

function rotateZ(v: Vec3, angle: number): Vec3 {
  const c = Math.cos(angle);
  const s = Math.sin(angle);
  return { x: c * v.x - s * v.y, y: s * v.x + c * v.y, z: v.z };
}

function cross(a: Vec3, b: Vec3): Vec3 {
  return {
    x: a.y * b.z - a.z * b.y,
    y: a.z * b.x - a.x * b.z,
    z: a.x * b.y - a.y * b.x,
  };
}

function dot(a: Vec3, b: Vec3): number {
  return a.x * b.x + a.y * b.y + a.z * b.z;
}

function sub(a: Vec3, b: Vec3): Vec3 {
  return { x: a.x - b.x, y: a.y - b.y, z: a.z - b.z };
}

function project(v: Vec3, scale: number, cx: number, cy: number): Vec2 {
  return {
    x: Math.round(v.x / v.z + cx),
    y: Math.round(v.y / v.z + cy),
  };
}

function drawScanLine(
  screen: string[][],
  zbuf: number[][],
  y: number,
  x0: number,
  x1: number,
  symbol: string,
  triZ: number
) {
  if (y < 0 || y >= NB_ROWS) return;
  const left = Math.max(0, Math.min(x0, x1));
  const right = Math.min(NB_COLS - 1, Math.max(x0, x1));

  for (let x = left; x <= right; x++) {
    if (triZ > zbuf[y][x]) {
      zbuf[y][x] = triZ;
      screen[y][x] = symbol;
    }
  }
}

function drawFlatTop(
  screen: string[][],
  zbuf: number[][],
  t0: Vec2,
  t1: Vec2,
  b: Vec2,
  symbol: string,
  triZ: number
) {
  const xInc0 = (b.x - t0.x) / (b.y - t0.y);
  const xInc1 = (b.x - t1.x) / (b.y - t1.y);

  let xStart = t0.x;
  let xEnd = t1.x;

  const yStart = Math.round(t0.y);
  const yEnd = Math.round(b.y);

  for (let y = yStart; y <= yEnd; y++) {
    drawScanLine(screen, zbuf, y, Math.round(xStart), Math.round(xEnd), symbol, triZ);
    xStart += xInc0;
    xEnd += xInc1;
  }
}

function drawFlatBottom(
  screen: string[][],
  zbuf: number[][],
  t: Vec2,
  b0: Vec2,
  b1: Vec2,
  symbol: string,
  triZ: number
) {
  const xDec0 = (t.x - b0.x) / (b0.y - t.y);
  const xDec1 = (t.x - b1.x) / (b1.y - t.y);

  let xStart = t.x;
  let xEnd = t.x;

  const yStart = Math.round(t.y);
  const yEnd = Math.round(Math.max(b0.y, b1.y));

  for (let y = yStart; y <= yEnd; y++) {
    drawScanLine(screen, zbuf, y, Math.round(xStart), Math.round(xEnd), symbol, triZ);
    xStart -= xDec0;
    xEnd -= xDec1;
  }
}

function drawTriangle(
  screen: string[][],
  zbuf: number[][],
  v0: Vec2,
  v1: Vec2,
  v2: Vec2,
  symbol: string,
  triZ: number
) {
  // Sort by y ascending
  const pts = [v0, v1, v2].sort((a, b) => a.y - b.y);
  const a = pts[0];
  const b = pts[1];
  const c = pts[2];

  if (Math.abs(c.y - b.y) < 0.5) {
    drawFlatTop(screen, zbuf, a, b, c, symbol, triZ);
    return;
  }

  if (Math.abs(b.y - a.y) < 0.5) {
    drawFlatBottom(screen, zbuf, a, b, c, symbol, triZ);
    return;
  }

  const midX = a.x + (c.x - a.x) * ((b.y - a.y) / (c.y - a.y));
  const mid: Vec2 = { x: midX, y: b.y };

  drawFlatBottom(screen, zbuf, a, b, mid, symbol, triZ);
  drawFlatTop(screen, zbuf, b, mid, c, symbol, triZ);
}

export function PixelSphereRaster({ className }: PixelCubeProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const isVisibleRef = useRef(true);
  const animIdRef = useRef<number>(0);

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas || !isVisibleRef.current) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const W = 600;
    const H = 220;
    if (canvas.width !== W) canvas.width = W;
    if (canvas.height !== H) canvas.height = H;

    const cellW = W / NB_COLS;
    const cellH = H / NB_ROWS;

    const SCALE = 90;
    const SCALE_X = SCALE * 2.8;
    const SCALE_Y = SCALE;

    const CX = NB_COLS / 2;
    const CY = NB_ROWS / 2;
    const CAM_DIST = 8;

    const camera: Vec3 = { x: 0, y: 0, z: 1 };

    let rx = 0;
    let ry = 0;
    let rz = 0;

    function frame() {
      if (!ctx || !isVisibleRef.current) return;

      const screen: string[][] = Array.from({ length: NB_ROWS }, () =>
        Array(NB_COLS).fill(" ")
      );
      const zbuf: number[][] = Array.from({ length: NB_ROWS }, () =>
        Array(NB_COLS).fill(-Infinity)
      );

      const transformed: Vec3[] = cubeVertices.map((v) => {
        let p = rotateX(v, rx);
        p = rotateY(p, ry);
        p = rotateZ(p, rz);
        p.z += CAM_DIST;
        p.x *= SCALE_X;
        p.y *= SCALE_Y;
        return p;
      });

      const visible: {
        proj: Vec2[];
        z: number;
        symbol: string;
      }[] = [];

      for (let s = 0; s < cubeTriangles.length; s++) {
        const tri = cubeTriangles[s];
        const i0 = tri[0];
        const i1 = tri[1];
        const i2 = tri[2];

        const v0 = transformed[i0];
        const v1 = transformed[i1];
        const v2 = transformed[i2];

        if (v0.z <= 0 || v1.z <= 0 || v2.z <= 0) continue;

        const e0 = sub(v1, v0);
        const e1 = sub(v2, v0);
        const normal = cross(e0, e1);

        if (dot(camera, normal) >= 0) continue;

        const p0 = project(v0, SCALE, CX, CY);
        const p1 = project(v1, SCALE, CX, CY);
        const p2 = project(v2, SCALE, CX, CY);

        const avgZ = (v0.z + v1.z + v2.z) / 3;
        const symbol = SYMBOLS[s % SYMBOLS.length];

        visible.push({ proj: [p0, p1, p2], z: avgZ, symbol });
      }

      visible.sort((a, b) => a.z - b.z);

      for (const v of visible) {
        drawTriangle(screen, zbuf, v.proj[0], v.proj[1], v.proj[2], v.symbol, v.z);
      }

      ctx.clearRect(0, 0, W, H);

      const style = getComputedStyle(canvas!);
      const textColor = style.color || "currentColor";

      ctx.fillStyle = textColor;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.font = `${cellH * 1.15}px var(--font-geist-pixel-circle, monospace)`;

      for (let y = 0; y < NB_ROWS; y++) {
        for (let x = 0; x < NB_COLS; x++) {
          const ch = screen[y][x];
          if (ch !== " ") {
            ctx.fillText(ch, x * cellW + cellW / 2, y * cellH + cellH / 2);
          }
        }
      }

      rx += 0.008;
      ry += 0.008;
      rz += 0.005;

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
