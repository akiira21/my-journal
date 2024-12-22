import React, { useEffect, useRef } from "react";

interface CanvasLoadingBorderProps {
  children: React.ReactNode;
  loading: boolean;
  className?: string;
}

const CanvasLoadingBorder = ({
  children,
  loading,
  className = "",
}: CanvasLoadingBorderProps) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animationFrameRef = useRef<number>();
  const resizeObserverRef = useRef<ResizeObserver>();

  const updateCanvasSize = () => {
    if (!containerRef.current || !canvasRef.current) return;

    const container = containerRef.current;
    const canvas = canvasRef.current;

    // Get the actual dimensions of the container
    const rect = container.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;

    // Update canvas dimensions
    canvas.width = width;
    canvas.height = height;

    // Update canvas scale for high DPI displays
    const dpr = window.devicePixelRatio || 1;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;

    const ctx = canvas.getContext("2d");
    if (ctx) {
      ctx.scale(dpr, dpr);
    }
  };

  useEffect(() => {
    if (!containerRef.current || !loading) return;

    const container = containerRef.current;
    let canvas = canvasRef.current;

    if (!canvas) {
      canvas = document.createElement("canvas");
      canvas.className = "absolute top-0 left-0 pointer-events-none";
      canvasRef.current = canvas;
      container.appendChild(canvas);
    }

    // Initial size setup
    updateCanvasSize();

    // Setup ResizeObserver
    resizeObserverRef.current = new ResizeObserver((entries) => {
      for (const entry of entries) {
        if (entry.target === container) {
          updateCanvasSize();
        }
      }
    });

    resizeObserverRef.current.observe(container);

    let startTime = performance.now();

    const drawBeam = (time: number) => {
      if (!canvas || !loading) return;

      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      const rect = container.getBoundingClientRect();
      const width = rect.width;
      const height = rect.height;

      ctx.clearRect(0, 0, width, height);

      const duration = 4000;
      const progress = ((time - startTime) % duration) / duration;
      const totalLength = 2 * (width + height);
      const beamLength = width * 0.3;

      let distance = progress * totalLength;
      let x, y;
      let angle = 0;

      if (distance < width) {
        x = distance;
        y = 0;
        angle = 0;
      } else if (distance < width + height) {
        x = width;
        y = distance - width;
        angle = Math.PI / 2;
      } else if (distance < 2 * width + height) {
        x = width - (distance - (width + height));
        y = height;
        angle = Math.PI;
      } else {
        x = 0;
        y = height - (distance - (2 * width + height));
        angle = (3 * Math.PI) / 2;
      }

      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(angle);

      const gradient = ctx.createLinearGradient(0, 0, beamLength, 0);
      gradient.addColorStop(0, "rgba(59, 130, 246, 0)");
      gradient.addColorStop(0.6, "rgba(96, 165, 250, 0.3)");
      gradient.addColorStop(0.8, "rgba(59, 130, 246, 0.9)");
      gradient.addColorStop(1, "rgba(59, 130, 246, 1)");

      ctx.fillStyle = gradient;
      ctx.shadowColor = "#3B82F6";
      ctx.shadowBlur = 15;
      ctx.fillRect(0, -1.5, beamLength, 3);

      ctx.restore();

      if (loading) {
        animationFrameRef.current = requestAnimationFrame(drawBeam);
      }
    };

    animationFrameRef.current = requestAnimationFrame(drawBeam);

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      if (resizeObserverRef.current) {
        resizeObserverRef.current.disconnect();
      }
      if (canvas && container.contains(canvas)) {
        container.removeChild(canvas);
        canvasRef.current = null;
      }
    };
  }, [loading]);

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      <div className="relative h-full w-full rounded-lg">{children}</div>
    </div>
  );
};

export default CanvasLoadingBorder;
