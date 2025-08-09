"use client";

import React, { useEffect, useRef, useState } from "react";
import rough from "roughjs";

const FibonacciSpiral: React.FC = () => {
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 500, height: 300 });

  // Generate Fibonacci sequence
  const generateFibonacci = (count: number): number[] => {
    const fib = [1, 1];
    for (let i = 2; i < count; i++) {
      fib[i] = fib[i - 1] + fib[i - 2];
    }
    return fib;
  };

  // Handle responsive dimensions
  useEffect(() => {
    const handleResize = () => {
      if (containerRef.current) {
        const container = containerRef.current;
        const rect = container.getBoundingClientRect();
        // Maintain aspect ratio (4:3) while being responsive
        const aspectRatio = 4 / 3;
        let newWidth = Math.min(rect.width, 500); // Max width 1000px
        let newHeight = newWidth / aspectRatio;

        // For mobile devices, use more square aspect ratio
        if (newWidth < 600) {
          newHeight = newWidth * 0.8; // 5:4 aspect ratio for mobile
        }

        setDimensions({
          width: Math.max(320, newWidth), // Min width 320px
          height: Math.max(240, newHeight), // Min height 240px
        });
      }
    };

    handleResize(); // Initial sizing

    const resizeObserver = new ResizeObserver(handleResize);
    if (containerRef.current) {
      resizeObserver.observe(containerRef.current);
    }

    return () => {
      resizeObserver.disconnect();
    };
  }, []);

  useEffect(() => {
    const svg = svgRef.current;
    if (!svg) return;

    // Clear previous content
    svg.innerHTML = "";

    const rc = rough.svg(svg);
    const { width, height } = dimensions;

    // Calculate responsive scaling
    const baseWidth = 600;
    const scaleFactor = width / baseWidth;
    const gridSize = Math.max(15, 25 * scaleFactor);

    // Draw grid background
    for (let x = 0; x <= width; x += gridSize) {
      const line = rc.line(x, 0, x, height, {
        stroke: "#e8d5b7",
        strokeWidth: 0.8 * scaleFactor,
        roughness: 1.2,
      });
      svg.appendChild(line);
    }
    for (let y = 0; y <= height; y += gridSize) {
      const line = rc.line(0, y, width, y, {
        stroke: "#e8d5b7",
        strokeWidth: 0.8 * scaleFactor,
        roughness: 1.2,
      });
      svg.appendChild(line);
    }

    // Generate Fibonacci numbers
    const fibNumbers = generateFibonacci(10);
    const scale = Math.max(2, 4 * scaleFactor);

    // Starting position
    let startX = width * 0.45;
    let startY = height * 0.40;

    let currentX = startX;
    let currentY = startY;
    let direction = 0; // 0: right, 1: up, 2: left, 3: down

    // Golden colors
    const colors = [
      "#FFD700",
      "#FFA500",
      "#FF8C00",
      "#DAA520",
      "#B8860B",
      "#CD853F",
      "#D2691E",
      "#F4A460",
      "#DEB887",
      "#F0E68C",
    ];

    for (let i = 0; i < Math.min(fibNumbers.length - 1, 9); i++) {
      const size = fibNumbers[i] * scale;

      // Draw filled rectangle
      const rect = rc.rectangle(currentX, currentY, size, size, {
        fill: colors[i % colors.length],
        fillStyle: "solid",
        stroke: "#8B4513",
        strokeWidth: Math.max(1, 2 * scaleFactor),
        roughness: 2.5,
        fillWeight: 1.5,
      });
      svg.appendChild(rect);

      // Draw spiral arc
      let centerX: number = 0,
        centerY: number = 0,
        startAngle: number = 0,
        endAngle: number = 0;

      switch (direction % 4) {
        case 0: // right
          centerX = currentX;
          centerY = currentY + size;
          startAngle = -Math.PI / 2;
          endAngle = 0;
          break;
        case 1: // up
          centerX = currentX + size;
          centerY = currentY + size;
          startAngle = Math.PI;
          endAngle = -Math.PI / 2;
          break;
        case 2: // left
          centerX = currentX + size;
          centerY = currentY;
          startAngle = Math.PI / 2;
          endAngle = Math.PI;
          break;
        case 3: // down
          centerX = currentX;
          centerY = currentY;
          startAngle = 0;
          endAngle = Math.PI / 2;
          break;
      }

      // Create arc path
      const startPointX = centerX + size * Math.cos(startAngle);
      const startPointY = centerY + size * Math.sin(startAngle);
      const endPointX = centerX + size * Math.cos(endAngle);
      const endPointY = centerY + size * Math.sin(endAngle);

      const pathData = `M ${startPointX} ${startPointY} A ${size} ${size} 0 0 1 ${endPointX} ${endPointY}`;

      const arc = rc.path(pathData, {
        stroke: "#B8860B",
        strokeWidth: Math.max(2, 3 * scaleFactor),
        roughness: 2,
        fill: "none",
      });
      svg.appendChild(arc);

      // Calculate next position
      const nextSize =
        i < fibNumbers.length - 2 ? fibNumbers[i + 1] * scale : 0;

      switch (direction % 4) {
        case 0: // right
          currentX += size;
          currentY -= nextSize;
          break;
        case 1: // up
          currentX -= nextSize;
          currentY -= nextSize;
          break;
        case 2: // left
          currentX -= nextSize;
          currentY += size;
          break;
        case 3: // down
          currentX += size;
          currentY += size;
          break;
      }

      direction++;
    }

    // Add responsive "Golden Ratio" text
    const fontSize = 14;
    const textX = Math.max(20, 30 * scaleFactor);
    const textY = Math.max(30, 40 * scaleFactor);

    const text = document.createElementNS("http://www.w3.org/2000/svg", "text");
    text.setAttribute("x", textX.toString());
    text.setAttribute("y", textY.toString());
    text.setAttribute("font-family", "Kalam, cursive, serif");
    text.setAttribute("font-size", fontSize.toString());
    text.setAttribute("fill", "#8B4513");
    text.textContent = "Golden Ratio";

    // Add slight text shadow effect with multiple text elements
    const textShadow1 = text.cloneNode(true) as SVGTextElement;
    textShadow1.setAttribute("x", (textX + 1).toString());
    textShadow1.setAttribute("y", (textY + 1).toString());
    textShadow1.setAttribute("fill", "#DEB887");
    textShadow1.setAttribute("opacity", "0.5");

    const textShadow2 = text.cloneNode(true) as SVGTextElement;
    textShadow2.setAttribute("x", (textX - 1).toString());
    textShadow2.setAttribute("y", (textY - 1).toString());
    textShadow2.setAttribute("fill", "#CD853F");
    textShadow2.setAttribute("opacity", "0.3");

    svg.appendChild(textShadow2);
    svg.appendChild(textShadow1);
    svg.appendChild(text);
  }, [dimensions]);

  return (
    <div
      ref={containerRef}
      className="w-full h-auto min-h-[240px] max-w-4xl mx-auto p-2 sm:p-4"
    >
      <svg
        ref={svgRef}
        width={dimensions.width}
        height={dimensions.height}
        viewBox={`0 0 ${dimensions.width} ${dimensions.height}`}
        className="w-full h-auto"
        style={{
          background: "linear-gradient(135deg, #fef7e6 0%, #f4e7d1 100%)",
        }}
      />
    </div>
  );
};

export default FibonacciSpiral;
