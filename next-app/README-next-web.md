# Next Web Customization Guide

This app is built so you can customize content from one JSON file without editing React code.

## Quick Start

1. Open `data/personal.json`.
2. Change the values you want (title, links, hero text, repo).
3. Save file.
4. Run `npm run dev` and refresh.

## Main Data File

Path: `data/personal.json`

Fields used today:

- `siteName`: Navbar brand text.
- `copyrightName`: Footer copyright text.
- `navigation`: Navbar links.
- `home.eyebrow`: Small text above homepage title.
- `home.headline`: Main homepage title.
- `home.description`: Homepage description paragraph.
- `home.shimmerDuration`: Title animation speed.
- `repo`: GitHub repo as either:
  - `owner/repo`
  - `https://github.com/owner/repo`

Example:

```json
{
  "siteName": "My Journal",
  "copyrightName": "My Name",
  "navigation": [
    { "label": "Home", "href": "/" },
    { "label": "Posts", "href": "/posts" },
    { "label": "About", "href": "/about" }
  ],
  "home": {
    "eyebrow": "Welcome",
    "headline": "I write about engineering.",
    "description": "Notes on software, systems, and learning.",
    "shimmerDuration": 2.8
  },
  "repo": "akiira21/my-journal"
}
```

## UI Behavior Included

- Theme toggle button supports:
  - Click to switch theme
  - Tooltip hint
  - Keyboard shortcut: `Ctrl+T` (or `Cmd+T` on macOS)
  - Soft click sound on toggle
- Default font: Geist Sans
- `text-mono` utilities use Geist Mono
- Navbar/footer are shared components for all pages in `app/(root)`

## Where Components Live

- Navbar: `components/main-navbar.tsx`
- Footer: `components/footer.tsx`
- Theme toggle: `components/mode-toggle.tsx`
- GitHub stars: `components/github-stars/github-stars.tsx`
- Data loader: `lib/personal-data.ts`

## Add More Data-Driven Sections

If you want to make more pages configurable:

1. Add a new section in `data/personal.json`.
2. Add types in `lib/personal-data.ts`.
3. Read those values in your page/component.

This keeps content updates simple for anyone using your template.
