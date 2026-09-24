# matteflux.com

Static site for Matteflux. Zero dependencies: plain Node (18+) renders
HTML from templates and data. The site uses the product itself: every
hero and footer is a real Matteflux set, run by the same `matteflux.js`
that ships in the set ZIP.

## Commands

```bash
node build.mjs          # build into dist/
node serve.mjs          # preview at http://localhost:4321 (supports video Range requests)
node tools/test.mjs     # browser tests (needs Playwright: npm i -D playwright && npx playwright install chromium)
```

`node build.mjs` also prints every open `[PLACEHOLDER]` so nothing ships by accident.

## Deploy (Cloudflare Pages)

- Build command: `node build.mjs`
- Output directory: `dist`
- `public/_headers` sets caching (fingerprinted CSS/JS for a year, media for a day).
- `dist/404.html` is served for unknown paths.

## Where things live

| Path | What |
|---|---|
| `src/config.mjs` | Site URL, media base URL, Polar checkout links, prices, email form, socials |
| `src/data/sets.json` | One entry per set. Add a line here to add a set page, card and switcher chip |
| `src/data/faq.json` | Questions; `home: true` also shows them on the home page |
| `src/components.mjs` | Header, footer, video layer, preview frame, cards |
| `src/pages/` | Page templates |
| `src/assets/site.css`, `site.js` | Site styles and interactions |
| `src/assets/mf/` | The product's own `matteflux.css` / `matteflux.js` (copied from the set package) |
| `public/media/<slug>/` | Videos and posters, same layout as the set ZIP |
| `public/media/overlay-measured.json` | Measured overlay minimums and file sizes per format |
| `tools/build_site_media.py` | Builds `public/media` and measures overlays |
| `tools/test.mjs` | Browser tests |

## Adding or releasing a set

1. Render it with `matteflux_render.py` (Phase 2 tools).
2. Copy its `hero/`, `footer/`, `posters/` into `public/media/<slug>/`.
3. Re-run the measurement: `python tools/build_site_media.py <preview-dir> <set-build-dir> public/media`
   (or update `overlay-measured.json` for that slug).
4. In `src/data/sets.json` add the set, or change `"status": "preview"` to `"released"`.
5. `node build.mjs && node tools/test.mjs`.

Recommended overlay = measured minimum + 5%, never below 20% (hero) or 25% (footer).
This is computed at build time, the same rule as the set README.

## Status

- Set 01 Ember Aurora: final files.
- Sets 02–06: Phase 1 previews (960 px), marked "Preview"/"Coming soon" on the site.
- Fonts load from Google Fonts. Self-host them before launch (privacy + speed).
- Open placeholders: prices, currency, Polar URLs, email form, contact email, socials, license and legal texts.
