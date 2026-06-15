"use client"

import { useRef } from "react"
import { motion, useMotionValue, useSpring } from "motion/react"

// Pixel art ARUN — each letter is 5×7 grid, 32px per cell
const PIXEL_PATH = [
  // A
  "M32,0 h32 v32 h-32 z",
  "M64,0 h32 v32 h-32 z",
  "M96,0 h32 v32 h-32 z",
  "M0,32 h32 v32 h-32 z",
  "M128,32 h32 v32 h-32 z",
  "M0,64 h32 v32 h-32 z",
  "M128,64 h32 v32 h-32 z",
  "M0,96 h32 v32 h-32 z",
  "M32,96 h32 v32 h-32 z",
  "M64,96 h32 v32 h-32 z",
  "M96,96 h32 v32 h-32 z",
  "M128,96 h32 v32 h-32 z",
  "M0,128 h32 v32 h-32 z",
  "M128,128 h32 v32 h-32 z",
  "M0,160 h32 v32 h-32 z",
  "M128,160 h32 v32 h-32 z",
  "M0,192 h32 v32 h-32 z",
  "M128,192 h32 v32 h-32 z",
  // R
  "M240,0 h32 v32 h-32 z",
  "M272,0 h32 v32 h-32 z",
  "M304,0 h32 v32 h-32 z",
  "M336,0 h32 v32 h-32 z",
  "M240,32 h32 v32 h-32 z",
  "M368,32 h32 v32 h-32 z",
  "M240,64 h32 v32 h-32 z",
  "M368,64 h32 v32 h-32 z",
  "M240,96 h32 v32 h-32 z",
  "M272,96 h32 v32 h-32 z",
  "M304,96 h32 v32 h-32 z",
  "M336,96 h32 v32 h-32 z",
  "M240,128 h32 v32 h-32 z",
  "M336,128 h32 v32 h-32 z",
  "M240,160 h32 v32 h-32 z",
  "M368,160 h32 v32 h-32 z",
  "M240,192 h32 v32 h-32 z",
  "M368,192 h32 v32 h-32 z",
  // U
  "M448,0 h32 v32 h-32 z",
  "M528,0 h32 v32 h-32 z",
  "M448,32 h32 v32 h-32 z",
  "M528,32 h32 v32 h-32 z",
  "M448,64 h32 v32 h-32 z",
  "M528,64 h32 v32 h-32 z",
  "M448,96 h32 v32 h-32 z",
  "M528,96 h32 v32 h-32 z",
  "M448,128 h32 v32 h-32 z",
  "M528,128 h32 v32 h-32 z",
  "M448,160 h32 v32 h-32 z",
  "M528,160 h32 v32 h-32 z",
  "M480,192 h32 v32 h-32 z",
  "M512,192 h32 v32 h-32 z",
  "M544,192 h32 v32 h-32 z",
  // N
  "M656,0 h32 v32 h-32 z",
  "M736,0 h32 v32 h-32 z",
  "M656,32 h32 v32 h-32 z",
  "M688,32 h32 v32 h-32 z",
  "M736,32 h32 v32 h-32 z",
  "M656,64 h32 v32 h-32 z",
  "M720,64 h32 v32 h-32 z",
  "M736,64 h32 v32 h-32 z",
  "M656,96 h32 v32 h-32 z",
  "M752,96 h32 v32 h-32 z",
  "M784,96 h32 v32 h-32 z",
  "M656,128 h32 v32 h-32 z",
  "M736,128 h32 v32 h-32 z",
  "M656,160 h32 v32 h-32 z",
  "M736,160 h32 v32 h-32 z",
  "M656,192 h32 v32 h-32 z",
  "M736,192 h32 v32 h-32 z",
].join(" ")

const VIEWBOX_W = 900
const VIEWBOX_H = 224

export function SiteFooterInteractiveLogotype() {
  const containerRef = useRef<HTMLDivElement>(null)

  const mouseX = useMotionValue(VIEWBOX_W / 2)
  const mouseY = useMotionValue(VIEWBOX_H / 2)

  const smoothX = useSpring(mouseX, { stiffness: 150, damping: 20, mass: 0.3 })
  const smoothY = useSpring(mouseY, { stiffness: 150, damping: 20, mass: 0.3 })

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect()
    const scaleX = VIEWBOX_W / rect.width
    const scaleY = VIEWBOX_H / rect.height
    mouseX.set((e.clientX - rect.left) * scaleX)
    mouseY.set((e.clientY - rect.top) * scaleY)
  }

  const handleMouseLeave = () => {
    mouseX.set(VIEWBOX_W / 2)
    mouseY.set(VIEWBOX_H / 2)
  }

  return (
    <div className="w-full p-4">
      <div
        ref={containerRef}
        className="relative w-full h-[40vh] min-h-[140px] max-h-[280px] cursor-default overflow-hidden bg-background"
        style={{ imageRendering: 'pixelated' }}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
      >
        {/* Pixelated grid overlay */}
        <div 
          className="absolute inset-0 opacity-[0.03] pointer-events-none"
          style={{
            backgroundImage: `linear-gradient(to right, currentColor 1px, transparent 1px), linear-gradient(to bottom, currentColor 1px, transparent 1px)`,
            backgroundSize: '32px 32px'
          }}
        />
        {/* Half-cut: push text down so only top ~50% shows */}
        <div className="absolute inset-x-0 bottom-0 translate-y-[40%]">
          {/* Base dim layer */}
          <svg
            className="w-full"
            viewBox={`0 0 ${VIEWBOX_W} ${VIEWBOX_H}`}
            preserveAspectRatio="xMidYMid meet"
          >
            <path
              d={PIXEL_PATH}
              fill="currentColor"
              stroke="currentColor"
              strokeWidth="0.5"
              className="text-foreground/10"
            />
          </svg>

          {/* Lit layer — pixels brighten near cursor via radial mask */}
          <svg
            className="absolute inset-0 w-full h-full"
            viewBox={`0 0 ${VIEWBOX_W} ${VIEWBOX_H}`}
            preserveAspectRatio="xMidYMid meet"
          >
            <defs>
              <radialGradient id="spotlight">
                <stop offset="0%" stopColor="white" />
                <stop offset="100%" stopColor="black" />
              </radialGradient>
              <mask id="pixel-mask">
                <rect width={VIEWBOX_W} height={VIEWBOX_H} fill="black" />
                <motion.circle
                  cx={smoothX}
                  cy={smoothY}
                  r="200"
                  fill="url(#spotlight)"
                />
              </mask>
            </defs>
            <path
              d={PIXEL_PATH}
              fill="currentColor"
              stroke="currentColor"
              strokeWidth="0.5"
              className="text-foreground"
              mask="url(#pixel-mask)"
            />
          </svg>
        </div>
      </div>
    </div>
  )
}
