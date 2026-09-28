# Matteflux

> Ambient motion for heroes & footers.

Matteflux is a collection of **free, production-ready video components** for web designers and developers. Each set includes perfectly-looped hero and footer videos with matching visual themes, optimized for web performance.

Visit **[matteflux.com](https://matteflux.com)** to browse, preview, and download sets.

---

## ✨ What's Included

- **9 video sets** across two collections
  - **Dark Ambient** (6 sets): Ember Aurora, Night Fog, Deep Water, Silk, Violet Tide, Nebula
  - **Earthen** (3 sets): Mist, Linen, Ripple
  - Hero videos: 2560×1440 (desktop) + 1080×1920 (mobile)
  - Footer videos: 2560×854 (desktop) + 1080×1350 (mobile)
- **Multiple formats**: MP4 + WebM, ultra-compressed for performance
- **Ready-to-use code**: HTML/CSS, Framer, Webflow templates
- **Accessibility-tested**: Validated overlay opacity for text contrast; `prefers-reduced-motion` support
- **Zero AI artifacts**: Procedurally generated, guaranteed loop seams

---

## 🚀 Getting Started

### Download
1. Visit [matteflux.com](https://matteflux.com)
2. Browse and preview sets
3. Click to download (ZIP packages include all formats, templates, and documentation)

### Install
Each set includes quick-start code for:
- **HTML/CSS**: Copy-paste into your site
- **Framer**: Drop in the component
- **Webflow**: Use embed instructions

See the set's README for details and recommended overlay opacity.

---

## 📂 Project Structure

- **`site/`** — The Matteflux website (matteflux.com)
  - `src/pages/` — Page templates (home, sets catalog, documentation)
  - `src/data/` — Set definitions (`sets.json`) and FAQ
  - `src/assets/mf/` — Matteflux component code (CSS, JavaScript)
  - `public/` — Static assets (videos, posters, fonts)
  - `build.mjs` — Dependency-free Node build script
  - `serve.mjs` — Dev server
- **`production/templates/`** — Code templates for each platform (HTML/CSS, Framer, Webflow)

---

## 💻 Development

### Prerequisites
- Node.js 18+

### Build & Serve
```bash
cd site
node build.mjs          # Build to dist/
node serve.mjs          # Serve at localhost:4321
node tools/test.mjs     # Run tests (Playwright)
```

### Contributing

**Site & Docs**: Bug reports, template improvements, and documentation updates are welcome. Please open an issue or pull request.

**Video Sets**: New set ideas? Open an issue with concept sketches or references. Matteflux curates the collection to maintain visual cohesion and quality.

---

## 📜 License

All video sets are licensed under **[CC0 1.0 Universal](https://creativecommons.org/publicdomain/zero/1.0/)** (public domain). Use freely in personal and commercial projects, no attribution required.

Site code is licensed under **[MIT](LICENSE)**.

---

## 🌐 Links

- Website: [matteflux.com](https://matteflux.com)
- Docs: [matteflux.com/docs](https://matteflux.com/docs)
- FAQ: [matteflux.com/faq](https://matteflux.com/faq)

---

**Made by [Mert](https://github.com/mertJF) · Hosted on [Cloudflare Pages](https://pages.cloudflare.com/)**
