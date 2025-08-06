"use client";

import React, { useEffect, useRef } from "react";
import rough from "roughjs";

const RoughGaussianSketch: React.FC = () => {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    const svg = svgRef.current;
    if (!svg) return;

    const rc = rough.svg(svg);

    // Clear existing content
    svg.innerHTML = "";

    const width = 400;
    const height = 250;
    const padding = 40;

    // Grid lines (rough sketch style)
    const gridSpacing = 40;

    // Vertical grid lines
    for (let x = padding; x < width - padding; x += gridSpacing) {
      const line = rc.line(x, padding, x, height - padding, {
        stroke: "currentColor",
        strokeWidth: 1,
        roughness: 1.5,
      });
      svg.appendChild(line);
    }

    // Horizontal grid lines
    for (let y = padding; y < height - padding; y += gridSpacing) {
      const line = rc.line(padding, y, width - padding, y, {
        stroke: "currentColor",
        strokeWidth: 1,
        roughness: 1.5,
      });
      svg.appendChild(line);
    }

    // Axes positions
    const xAxisY = height - padding;
    const yAxisX = padding + 50; // Y-axis positioned away from left edge

    // Draw X-axis with arrow
    const xAxis = rc.line(yAxisX, xAxisY, width - padding + 20, xAxisY, {
      stroke: "currentColor",
      strokeWidth: 2,
      roughness: 1.2,
    });
    svg.appendChild(xAxis);

    // X-axis arrow
    const xArrow = rc.polygon(
      [
        [width - padding + 20, xAxisY],
        [width - padding + 10, xAxisY - 5],
        [width - padding + 10, xAxisY + 5],
      ],
      {
        fill: "currentColor",
        stroke: "currentColor",
        roughness: 1.2,
      }
    );
    svg.appendChild(xArrow);

    // Draw Y-axis with arrow
    const yAxis = rc.line(yAxisX, xAxisY, yAxisX, padding - 20, {
      stroke: "currentColor",
      strokeWidth: 2,
      roughness: 1.2,
    });
    svg.appendChild(yAxis);

    // Y-axis arrow
    const yArrow = rc.polygon(
      [
        [yAxisX, padding - 20],
        [yAxisX - 5, padding - 10],
        [yAxisX + 5, padding - 10],
      ],
      {
        fill: "currentColor",
        stroke: "currentColor",
        roughness: 1.2,
      }
    );
    svg.appendChild(yArrow);

    // Generate asymmetric Gaussian curve - spanning full x-axis
    const points: [number, number][] = [];
    const numPoints = 150;

    // Bell spans the entire x-axis width
    const xStart = yAxisX;
    const xEnd = width - padding;
    const bellCenterX = yAxisX + (xEnd - yAxisX) * 0.6; // Center at 60% of x-axis
    const bellCenterY = xAxisY - 80; // Smaller curve
    const amplitude = 60; // Reduced amplitude
    const sigma1 = 60; // left side - wider
    const sigma2 = 40; // right side - narrower

    for (let i = 0; i <= numPoints; i++) {
      const x = xStart + (i / numPoints) * (xEnd - xStart);

      const distFromCenter = x - bellCenterX;
      let y;

      if (distFromCenter <= 0) {
        y =
          bellCenterY -
          amplitude * Math.exp(-0.5 * Math.pow(distFromCenter / sigma1, 2));
      } else {
        y =
          bellCenterY -
          amplitude * Math.exp(-0.5 * Math.pow(distFromCenter / sigma2, 2));
      }

      points.push([x, y]);
    }

    // Fill area under curve
    const fillPoints: [number, number][] = [];
    fillPoints.push([points[0][0], xAxisY]);
    fillPoints.push(...points);
    fillPoints.push([points[points.length - 1][0], xAxisY]);

    const fillArea = rc.polygon(fillPoints, {
      fill: "#5eead4",
      stroke: "none",
      roughness: 1.8,
      fillStyle: "hachure",
      hachureAngle: 60,
      hachureGap: 10,
    });
    svg.appendChild(fillArea);

    // Draw the bell curve
    const curvePath =
      `M ${points[0][0]} ${points[0][1]} ` +
      points
        .slice(1)
        .map((p) => `L ${p[0]} ${p[1]}`)
        .join(" ");

    const curve = rc.path(curvePath, {
      stroke: "#2563eb",
      strokeWidth: 3,
      roughness: 1.0,
      fill: "none",
    });
    svg.appendChild(curve);

    // Draw dashed line at bell center
    const centerLine = rc.line(
      bellCenterX,
      xAxisY,
      bellCenterX,
      bellCenterY - amplitude,
      {
        stroke: "currentColor",
        strokeWidth: 1.5,
        roughness: 0.8,
        strokeLineDash: [5, 5],
      }
    );
    svg.appendChild(centerLine);

    // Add labels
    // X label
    const xLabel = document.createElementNS(
      "http://www.w3.org/2000/svg",
      "text"
    );
    xLabel.setAttribute("x", (width - padding + 30).toString());
    xLabel.setAttribute("y", (xAxisY + 5).toString());
    xLabel.setAttribute("fill", "currentColor");
    xLabel.setAttribute("font-family", "serif");
    xLabel.setAttribute("font-style", "italic");
    xLabel.setAttribute("font-size", "18");
    xLabel.textContent = "x";
    svg.appendChild(xLabel);

    // Y label
    const yLabel = document.createElementNS(
      "http://www.w3.org/2000/svg",
      "text"
    );
    yLabel.setAttribute("x", (yAxisX - 5).toString());
    yLabel.setAttribute("y", (padding - 25).toString());
    yLabel.setAttribute("fill", "currentColor");
    yLabel.setAttribute("font-family", "serif");
    yLabel.setAttribute("font-style", "italic");
    yLabel.setAttribute("font-size", "18");
    yLabel.textContent = "y";
    svg.appendChild(yLabel);

    // Add fun fact in handwritten style - top right corner
    const funFact = document.createElementNS(
      "http://www.w3.org/2000/svg",
      "text"
    );
    funFact.setAttribute("x", (width - 200).toString());
    funFact.setAttribute("y", "55");
    funFact.setAttribute("fill", "currentColor");
    funFact.setAttribute("font-family", "Kalam, cursive, serif");
    funFact.setAttribute("font-size", "12");
    funFact.setAttribute("font-weight", "400");
    funFact.setAttribute("opacity", "0.8");
    funFact.textContent = '"The shape of uncertainty."';
    svg.appendChild(funFact);
  }, []);

  return (
    <div className="w-full flex justify-start text-gray-800 dark:text-gray-200">
      <svg
        ref={svgRef}
        width="400"
        height="250"
        viewBox="0 0 400 250"
        className="w-full h-auto max-w-lg"
      />
    </div>
  );
};

export default RoughGaussianSketch;
