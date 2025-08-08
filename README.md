# The Cold Open — Complete Refresh

A polished, fast, *offline-capable* improv prompt app with:
- Liquid-glass UI, responsive & accessible
- Auto/Light/Dark theme switcher (persisted)
- New “Things You Might Find In A…” format with seed input
- Save, Copy, Import/Export (JSON), and URL-based sharing
- Keyboard shortcuts (g/s/c, / to focus), PWA + offline cache

## Structure
- `index.html` — markup + SEO/OG tags
- `style.css` — theme tokens and UI
- `scripts.js` — app logic, persistence, shortcuts
- `manifest.webmanifest` — PWA manifest
- `sw.js` — service worker for offline
- `assets/` — icons + og image
- `vercel.json` — rewrites that don’t break static files

## Local
Open `index.html` in a browser or serve statically.

## Deploy
Push to any branch — Vercel will create a Preview URL.
