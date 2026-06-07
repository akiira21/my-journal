"use client";

import { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";

export type PixelSphereRasterProps = {
  className?: string;
};

const SYMBOLS = "$$**++--@@==;;::~~##..,,><";

// Grid resolution (character cells)
const NB_COLS = 70;
const NB_ROWS = 30;

// Sphere geometry
const LAT_BANDS = 10;
const LON_BANDS = 14;
const R = 1.5;

// Camera / projection
const CAM_DIST = 4.5;
const SCALE_Y = 22;
const SCALE_X = SCALE_Y * 2.3;

// Center of screen
const CX = NB_COLS / 2;
const CY = NB_ROWS / 2;

type Vec3 = { x: number; y: number; z: number };
type Vec2 = { x: number; y: number };

type TriangleData = {
  indices: [number, number, number];
  avgZ: number;
};

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

function project(v: Vec3): Vec2 {
  return {
    x: Math.round(v.x / v.z + CX),
    y: Math.round(v.y / v.z + CY),
  };
}

function generateSphere() {
  const vertices: Vec3[] = [];
  const triangles: TriangleData[] = [];

  // North pole
  vertices.push({ x: 0, y: R, z: 0 });

  // Latitude rings
  for (let lat = 1; lat < LAT_BANDS; lat++) {
    const theta = (lat / LAT_BANDS) * Math.PI;
    const y = Math.cos(theta) * R;
    const ringR = Math.sin(theta) * R;
    for (let lon = 0; lon < LON_BANDS; lon++) {
      const phi = (lon / LON_BANDS) * Math.PI * 2;
      const x = ringR * Math.cos(phi);
      const z = ringR * Math.sin(phi);
      vertices.push({ x, y, z });
    }
  }

  // South pole
  vertices.push({ x: 0, y: -R, z: 0 });

  const pole = 0;
  const firstRing = 1;
  const lastRingStart = 1 + (LAT_BANDS - 2) * LON_BANDS;
  const southPole = vertices.length - 1;

  // Top cap triangles
  for (let lon = 0; lon < LON_BANDS; lon++) {
    const next = (lon + 1) % LON_BANDS;
    triangles.push({ indices: [pole, firstRing + lon, firstRing + next], avgZ: 0 });
  }

  // Middle ring quads -> 2 triangles each
  for (let lat = 0; lat < LAT_BANDS - 2; lat++) {
    const ringStart = firstRing + lat * LON_BANDS;
    const nextRingStart = ringStart + LON_BANDS;
    for (let lon = 0; lon < LON_BANDS; lon++) {
      const nextLon = (lon + 1) % LON_BANDS;

      // Triangle 1
      triangles.push({
        indices: [ringStart + lon, nextRingStart + lon, ringStart + nextLon],
        avgZ: 0,
      });

      // Triangle 2
      triangles.push({
        indices: [nextRingStart + lon, nextRingStart + nextLon, ringStart + nextLon],
        avgZ: 0,
      });
    }
  }

  // Bottom cap triangles
  for (let lon = 0; lon < LON_BANDS; lon++) {
    const next = (lon + 1) % LON_BANDS;
    triangles.push({
      indices: [southPole, lastRingStart + next, lastRingStart + lon],
      avgZ: 0,
    });
  }

  return { vertices, triangles };
}

function drawScanline(
  screen: string[][],
  zbuf: number[][],
  y: number,
  x0: number,
  x1: number,
  symbol: string,
  triZ: number
) {
  if (y < 0 || y >= NB_ROWS) return;
  let left = Math.max(0, Math.min(x0, x1));
  let right = Math.min(NB_COLS - 1, Math.max(x0, x1));

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
    if (y >= 0 && y < NB_ROWS) {
      drawScanline(screen, zbuf, y, Math.round(xStart), Math.round(xEnd), symbol, triZ);
    }
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
    if (y >= 0 && y < NB_ROWS) {
      drawScanline(screen, zbuf, y, Math.round(xStart), Math.round(xEnd), symbol, triZ);
    }
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
  let [a, b, c] = [v0, v1, v2].sort((p1, p2) => p1.y - p2.y);

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

export function PixelSphereRaster({ className }: PixelSphereRasterProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Canvas size
    const W = 400;
    const H = 260;
    canvas.width = W;
    canvas.height = H;

    const cellW = W / NB_COLS;
    const cellH = H / NB_ROWS;

    const { vertices: baseVertices, triangles: baseTriangles } = generateSphere();

    let rx = 0;
    let ry = 0;
    let rz = 0;
    let animId: number;

    function draw() {
      if (!ctx) return;

      // Clear screen & z-buffer
      const screen: string[][] = Array.from({ length: NB_ROWS }, () =>
        Array(NB_COLS).fill(" ")
      );
      const zbuf: number[][] = Array.from({ length: NB_ROWS }, () =>
        Array(NB_COLS).fill(-Infinity)
      );

      // Camera vector (looking down -z)
      const camera: Vec3 = { x: 0, y: 0, z: 1 };

      // Transform all vertices
      const transformed: Vec3[] = baseVertices.map((v) => {
        let p = rotateX(v, rx);
        p = rotateY(p, ry);
        p = rotateZ(p, rz);
        // Push into screen
        p.z += CAM_DIST;
        // Scale (x gets extra for terminal aspect ratio)
        p.x *= SCALE_X;
        p.y *= SCALE_Y;
        return p;
      });

      // Build visible triangles with avgZ
      const visible: { tri: TriangleData; proj: Vec2[]; z: number; symbol: string }[] = [];

      for (let s = 0; s < baseTriangles.length; s++) {
        const tri = baseTriangles[s];
        const i0 = tri.indices[0];
        const i1 = tri.indices[1];
        const i2 = tri.indices[2];

        const v0 = transformed[i0];
        const v1 = transformed[i1];
        const v2 = transformed[i2];

        if (v0.z <= 0 || v1.z <= 0 || v2.z <= 0) continue;

        // Back-face culling
        const e0 = sub(v1, v0);
        const e1 = sub(v2, v0);
        const normal = cross(e0, e1);

        if (dot(camera, normal) >= 0) continue;

        // Project
        const p0 = project(v0);
        const p1 = project(v1);
        const p2 = project(v2);

        // Average z for sorting
        const avgZ = (v0.z + v1.z + v2.z) / 3;

        // Symbol from face index
        const symbol = SYMBOLS[s % SYMBOLS.length];

        visible.push({ tri, proj: [p0, p1, p2], z: avgZ, symbol });
      }

      // Painter's algorithm: draw back to front
      visible.sort((a, b) => a.z - b.z);

      for (const v of visible) {
        drawTriangle(screen, zbuf, v.proj[0], v.proj[1], v.proj[2], v.symbol, v.z);
      }

      // Render to canvas
      ctx.clearRect(0, 0, W, H);

      // Read theme text color
      const style = getComputedStyle(canvas!);
      const textColor = style.color || "currentColor";
      const isDark = document.documentElement.classList.contains("dark");

      // Faint background for shape definition
      ctx.save();
      ctx.beginPath();
      ctx.ellipse(W / 2, H / 2, W * 0.35, H * 0.45, 0, 0, Math.PI * 2);
      ctx.fillStyle = isDark ? "rgba(255,255,255,0.015)" : "rgba(0,0,0,0.025)";
      ctx.fill();
      ctx.restore();

      ctx.fillStyle = textColor;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.font = `${cellH * 1.1}px var(--font-geist-pixel-circle, monospace)`;

      for (let y = 0; y < NB_ROWS; y++) {
        for (let x = 0; x < NB_COLS; x++) {
          const ch = screen[y][x];
          if (ch !== " ") {
            ctx.fillText(ch, x * cellW + cellW / 2, y * cellH + cellH / 2);
          }
        }
      }

      rx += 0.025;
      ry += 0.018;
      rz += 0.012;

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
