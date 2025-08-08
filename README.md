# The Cold Open — UI Refresh (Fixed)

- Liquid-glass UI
- Working light/dark toggle (explicit theme overrides)
- Mobile-first, responsive layout
- “Things You Might Find In A…” format
- Clean header (no GitHub pill)
- Correct `vercel.json` using rewrites (doesn’t break static assets)

## Files
- `index.html` — markup
- `style.css` — liquid glass styles + theme
- `scripts.js` — prompt logic, saving/exporting, theme toggle
- `vercel.json` — static config for Vercel
- `.gitignore`

## Deploy
- Replace files in your branch (e.g., `ui-refresh`) and push.
- Vercel will create a Preview deployment.
