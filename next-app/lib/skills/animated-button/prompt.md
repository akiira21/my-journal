# Monochrome Animated Button Design Prompt

Design a high-impact CTA button with a continuously flowing gradient background and a light-shine sweep effect. Use **monochrome tones only** — silver, white, and gray gradients. Never use blue, purple, pink, or neon colors.

## Visual Requirements
- **Background**: Linear gradient spanning `300%` width, animated with `background-position` shift. Colors: `#e5e5e5` → `#f5f5f5` → `#ffffff` → `#d4d4d4` → `#e5e5e5`
- **Animation speed**: `3s` loop for a smooth, elegant flow. Never too fast — it should feel refined, not frantic.
- **Shine overlay**: A semi-transparent white stripe that sweeps diagonally across the button on hover, creating a "light catching polished metal" illusion.
- **Shadow**: `0 0 30px rgba(0,0,0,0.08)` for a subtle diffused glow. Never colored.
- **Border radius**: `18px` (or `full` for pill shape). Sharp corners kill the premium feel.

## Interaction Requirements
- **Hover**: `scale(1.05)` + increase shadow spread. Use `transition-all duration-200 ease-out`
- **Active/Press**: `scale(0.95)` — immediate tactile feedback
- **Focus**: `ring-2 ring-neutral-400 ring-offset-2 ring-offset-white` for keyboard users
- **Disabled**: `opacity-50`, `pointer-events-none`, `grayscale(0.5)` — clearly inactive

## Layout
- Button centered on a **light background** (`#ffffff` or `neutral-50`) to maximize contrast
- Text should be `neutral-900` (dark), `font-semibold`, `14px` with generous letter-spacing
- Padding: `12px 24px` for default size. Never let text touch edges.

## Typography
- Label: Short, action-oriented. "Get Started", "Explore", "Launch" — never more than 2 words.
- Sentence case feels more modern than uppercase.

## Accessibility
- Real `<button>` element with `type="button"`
- `prefers-reduced-motion`: disable gradient animation, replace with static gradient
- Ensure color contrast meets WCAG AA even at lightest point of gradient loop

## Key Implementation
```css
@keyframes shimmer {
  0% { background-position: 0% 50%; }
  100% { background-position: 300% 50%; }
}

.btn-gradient {
  background: linear-gradient(90deg, #e5e5e5, #f5f5f5, #ffffff, #d4d4d4, #e5e5e5);
  background-size: 300% 100%;
  animation: shimmer 3s linear infinite;
}
```

## Why This Works
The gradient animation mimics light playing across polished metal or brushed aluminum — a signature Apple aesthetic. The monochrome palette keeps it professional, avoiding the garish look of neon gradients.
