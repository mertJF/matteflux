import { html, raw, code } from "./html.mjs";
import { config } from "./config.mjs";

// ------------------------------------------------------------ media paths
export const mediaPath = (set, kind, device) =>
  `${config.mediaBase}/${set.slug}/${kind}/${set.slug}-${kind}-${device}`;
export const posterPath = (set, kind, device, ext) =>
  `${config.mediaBase}/${set.slug}/posters/${set.slug}-${kind}-${device}.${ext}`;

// ------------------------------------------------------------------ icons
const icon = (d, size = 20) =>
  raw(`<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${d}</svg>`);
export const icons = {
  loop: icon('<path d="M4 12a8 8 0 0 1 14-5.3M20 12a8 8 0 0 1-14 5.3"/><path d="M18 3v4h-4M6 21v-4h4"/>', 28),
  small: icon('<path d="M12 3v12M7 10l5 5 5-5"/><path d="M5 20h14"/>', 28),
  speed: icon('<path d="M13 3L5 14h6l-1 7 8-11h-6z"/>', 28),
  wave: icon('<path d="M3 12c3-6 6-6 9 0s6 6 9 0"/><path d="M3 18c3-6 6-6 9 0s6 6 9 0" opacity=".5"/>', 28),
  contrast: icon('<circle cx="12" cy="12" r="8"/><path d="M12 4v16"/>', 28),
  devices: icon('<rect x="2" y="5" width="14" height="10" rx="1.5"/><rect x="17" y="8" width="5" height="11" rx="1.2"/><path d="M6 19h6"/>', 28),
  menu: icon('<path d="M4 7h16M4 12h16M4 17h16"/>', 22),
  close: icon('<path d="M6 6l12 12M18 6L6 18"/>', 22),
  check: icon('<path d="M5 12l4 4 10-10"/>', 18),
  arrow: icon('<path d="M5 12h14M13 6l6 6-6 6"/>', 18),
  download: icon('<path d="M12 3v12M7 10l5 5 5-5"/><path d="M5 20h14"/>', 18),
  github: raw(`<svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 2C6.48 2 2 6.48 2 12c0 4.42 2.87 8.17 6.84 9.5.5.09.66-.22.66-.48v-1.7c-2.78.6-3.37-1.34-3.37-1.34-.46-1.16-1.11-1.47-1.11-1.47-.91-.62.07-.61.07-.61 1 .07 1.53 1.03 1.53 1.03.89 1.53 2.34 1.09 2.91.83.09-.65.35-1.09.63-1.34-2.22-.25-4.55-1.11-4.55-4.94 0-1.09.39-1.98 1.03-2.68-.1-.25-.45-1.27.1-2.64 0 0 .84-.27 2.75 1.02A9.56 9.56 0 0 1 12 6.8c.85 0 1.7.11 2.5.33 1.91-1.29 2.75-1.02 2.75-1.02.55 1.37.2 2.39.1 2.64.64.7 1.03 1.59 1.03 2.68 0 3.84-2.34 4.68-4.57 4.93.36.31.68.92.68 1.85v2.75c0 .27.16.58.67.48A10.01 10.01 0 0 0 22 12c0-5.52-4.48-10-10-10z"/></svg>`),
};

// ------------------------------------------------------- video background
// The product's own markup (.mf-bg), exactly as shipped in the set ZIP.
export function mfLayer(set, kind, { overlay, eager = false } = {}) {
  const lazy = !eager;
  return html`<div class="mf-bg" data-mf-kind="${kind}" style="--mf-overlay: ${overlay}">
  <picture class="mf-bg__poster">
    <source media="(max-width: 767px)" srcset="${posterPath(set, kind, "mobile", "webp")}" type="image/webp">
    <source media="(max-width: 767px)" srcset="${posterPath(set, kind, "mobile", "jpg")}">
    <source srcset="${posterPath(set, kind, "desktop", "webp")}" type="image/webp">
    <img src="${posterPath(set, kind, "desktop", "jpg")}" alt="" decoding="async" ${raw(lazy ? 'loading="lazy"' : 'fetchpriority="high"')}>
  </picture>
  <video class="mf-bg__video" muted loop playsinline preload="none" aria-hidden="true"
         data-mf-load="${eager ? "eager" : "lazy"}"
         data-mf-desktop="${mediaPath(set, kind, "desktop")}"
         data-mf-mobile="${mediaPath(set, kind, "mobile")}"></video>
  <div class="mf-bg__overlay"></div>
</div>`;
}

// ---------------------------------------------------------- preview frame
// A sample client site (fictional studio) showing a set's hero + footer.
// Its videos are driven by site.js, not by matteflux.js, because the frame
// must show the mobile composition even on a desktop screen.
function pvMedia(set, kind, device, overlay) {
  return html`<div class="pv-media" data-pv-kind="${kind}" data-pv-device="${device}" style="--mf-overlay: ${overlay}">
    <img class="pv-poster" src="${posterPath(set, kind, device, "webp")}" alt="" loading="lazy" decoding="async">
    <video class="pv-video" muted loop playsinline preload="none" aria-hidden="true"></video>
    <div class="mf-bg__overlay"></div>
  </div>`;
}

export function previewFrame(set, { id, overlayHero, overlayFooter }) {
  return html`<div class="pv" id="${id}" data-device="desktop" data-set="${set.slug}">
  <div class="pv-desktop" aria-label="Desktop preview of ${set.name}" role="img">
    <div class="pv-chrome"><span></span><span></span><span></span><div class="pv-url">northfield.studio</div></div>
    <div class="pv-hero">
      ${pvMedia(set, "hero", "desktop", overlayHero)}
      <div class="pv-nav"><strong>NORTHFIELD</strong><span>Work&nbsp;&nbsp;Studio&nbsp;&nbsp;Contact</span></div>
      <div class="pv-hero-copy"><p class="pv-h">Spaces shaped by quiet light.</p><p>Architecture and interiors for homes that slow you down.</p><span class="pv-btn">View projects</span></div>
    </div>
    <div class="pv-body"><div><i></i>Casa Lumen</div><div><i></i>The Orchard House</div><div><i></i>Harbour Loft</div></div>
    <div class="pv-footer">
      ${pvMedia(set, "footer", "desktop", overlayFooter)}
      <div class="pv-footer-copy"><p class="pv-h">Let’s build<br>something calm.</p><p>hello@northfield.studio</p></div>
    </div>
  </div>
  <div class="pv-mobile">
    <div class="pv-phone" tabindex="0" aria-label="Mobile preview of ${set.name}. Scroll inside to reach the footer." role="region">
      <div class="pv-hero pv-hero--m">
        ${pvMedia(set, "hero", "mobile", overlayHero)}
        <div class="pv-nav"><strong>NORTHFIELD</strong><span>Menu</span></div>
        <div class="pv-hero-copy"><p class="pv-h">Spaces shaped by quiet light.</p><p>Architecture and interiors for homes that slow you down.</p></div>
      </div>
      <div class="pv-body pv-body--m"><div><i></i>Casa Lumen</div></div>
      <div class="pv-footer pv-footer--m">
        ${pvMedia(set, "footer", "mobile", overlayFooter)}
        <div class="pv-footer-copy"><p class="pv-h">Let’s build something calm.</p><p>hello@northfield.studio</p></div>
      </div>
    </div>
    <p class="pv-note">Scroll inside the phone to reach the footer. Mobile uses its own 9:16 and 4:5 compositions.</p>
  </div>
</div>`;
}

// Device toggle + overlay slider bound to a preview frame (and optionally
// to the page's own hero and footer).
export function previewControls(set, { target, page = false }) {
  return html`<div class="pv-controls" data-pv-target="${target}" ${raw(page ? "data-pv-page" : "")}>
  <div class="pv-row">
    <span class="muted">Preview</span>
    <div class="seg" role="group" aria-label="Preview device">
      <button type="button" class="seg__btn" data-device="desktop" aria-pressed="true">Desktop</button>
      <button type="button" class="seg__btn" data-device="mobile" aria-pressed="false">Mobile</button>
    </div>
  </div>
  <div class="pv-slider">
    <div class="pv-row"><label for="${target}-overlay" class="muted">Overlay darkness</label><output for="${target}-overlay" class="mono" data-pv-out>${Math.round(set.rec.hero * 100)}%</output></div>
    <input id="${target}-overlay" type="range" min="0" max="80" step="1" value="${Math.round(set.rec.hero * 100)}" data-pv-overlay>
    <p class="faint small">Recommended for <span data-mf-name>${set.name}</span>: hero <span data-mf-rec-hero>${Math.round(set.rec.hero * 100)}</span>%, footer <span data-mf-rec-footer>${Math.round(set.rec.footer * 100)}</span>%. Measured for white text at 4.5:1 contrast.</p>
  </div>
</div>`;
}

// -------------------------------------------------------------- set cards
export function setCard(set, { headingLevel = 3 } = {}) {
  const h = headingLevel === 2 ? "h2" : "h3";
  return html`<article class="set-card" data-tone="${set.tone}" data-motion="${set.motion}">
  <a class="set-card__link" href="/sets/${set.slug}/">
    <div class="set-card__media">
      <div class="set-card__hero" data-card-part="hero">
        <img src="${posterPath(set, "hero", "desktop", "webp")}" alt="" loading="lazy" decoding="async" width="2560" height="1440">
        <video muted loop playsinline preload="none" aria-hidden="true" data-card-src="${mediaPath(set, "hero", "desktop")}"></video>
        <span class="tag tag--on-media">Hero</span>
      </div>
      <div class="set-card__footer" data-card-part="footer">
        <img src="${posterPath(set, "footer", "desktop", "webp")}" alt="" loading="lazy" decoding="async" width="2560" height="854">
        <video muted loop playsinline preload="none" aria-hidden="true" data-card-src="${mediaPath(set, "footer", "desktop")}"></video>
        <span class="tag tag--on-media">Footer</span>
      </div>
    </div>
    <div class="set-card__meta">
      <${raw(h)} class="set-card__name"><span class="set-card__num mono">${set.num}</span> ${set.name}</${raw(h)}>
      ${set.status === "released" ? html`<span class="set-card__price">Free</span>` : html`<span class="set-card__price">Coming soon</span>`}
    </div>
    <p class="set-card__desc">${set.desc}</p>
    <p class="set-card__tags"><span class="tag">${set.tone}</span><span class="tag">${set.motion}</span>${set.status === "preview" ? html`<span class="tag tag--soft">Preview</span>` : ""}</p>
  </a>
</article>`;
}

export function codeBlock(file, lang, text) {
  return html`<figure class="code">
  <figcaption class="code__bar"><span>${file}</span><span>${lang}</span></figcaption>
  <pre><code>${code(text)}</code></pre>
</figure>`;
}

// ------------------------------------------------------------- page chrome
const NAV = [
  ["Sets", "/sets/"], ["Docs", "/docs/"],
];

export function header({ overlay, current }) {
  return html`<header class="site-header ${overlay ? "site-header--overlay" : ""}">
  <div class="wrap site-header__inner">
    <a class="wordmark" href="/" aria-label="Matteflux home">Matteflux</a>
    <button type="button" class="nav-toggle" aria-expanded="false" aria-controls="site-nav" aria-label="Open menu"><span class="nav-toggle__open">${icons.menu}</span><span class="nav-toggle__close">${icons.close}</span></button>
    <nav id="site-nav" class="site-nav" aria-label="Main">
      ${NAV.map(([label, href]) => html`<a href="${href}" ${raw(current === href ? 'aria-current="page"' : "")}>${label}</a>`)}
      <a class="btn btn--ghost btn--sm" href="${config.githubRepo}" target="_blank" rel="noopener">${icons.github} Star on GitHub</a>
    </nav>
  </div>
</header>`;
}

export function siteFooter(set) {
  const s = config.social;
  return html`<footer class="mf-section mf-section--footer site-footer" data-mf-slot="footer">
  ${mfLayer(set, "footer", { overlay: set.rec.footer })}
  <div class="wrap site-footer__inner">
    <div class="site-footer__top">
      <div class="site-footer__brand">
        <a class="wordmark wordmark--lg" href="/">Matteflux</a>
        <p>Ambient motion for heroes &amp; footers. This footer is <a href="/sets/${set.slug}/" data-mf-link><span data-mf-name>${set.name}</span></a>, a Matteflux set.</p>
      </div>
      <nav class="site-footer__nav" aria-label="Footer">
        <div><p class="foot-h">Product</p><a href="/sets/">Sets</a><a href="/docs/">Docs</a><a href="${config.githubRepo}" target="_blank" rel="noopener">GitHub</a></div>
        <div><p class="foot-h">Help</p><a href="mailto:${config.contactEmail}">Contact</a></div>
        <div><p class="foot-h">Follow</p><a href="${s.x}">X</a><a href="${s.dribbble}">Dribbble</a></div>
      </nav>
    </div>
    <div class="site-footer__bottom"><span>© ${new Date().getFullYear()} Matteflux</span><span>Code-generated motion</span></div>
  </div>
</footer>`;
}

export function layout({ page, assets, sets, defaultSet, body }) {
  const url = config.siteUrl + page.path;
  const title = page.title ? `${page.title} — Matteflux` : `Matteflux — ${config.tagline}`;
  const description = page.description || config.description;
  const ogImage = config.siteUrl + "/og.jpg";
  const setsJson = JSON.stringify(sets.map((s) => ({
    slug: s.slug, num: s.num, name: s.name, rec: s.rec,
    hero: { d: mediaPath(s, "hero", "desktop"), m: mediaPath(s, "hero", "mobile") },
    footer: { d: mediaPath(s, "footer", "desktop"), m: mediaPath(s, "footer", "mobile") },
    posters: {
      hero: { d: posterPath(s, "hero", "desktop", "webp"), m: posterPath(s, "hero", "mobile", "webp"), dj: posterPath(s, "hero", "desktop", "jpg"), mj: posterPath(s, "hero", "mobile", "jpg") },
      footer: { d: posterPath(s, "footer", "desktop", "webp"), m: posterPath(s, "footer", "mobile", "webp"), dj: posterPath(s, "footer", "desktop", "jpg"), mj: posterPath(s, "footer", "mobile", "jpg") },
    },
  }))).replace(/</g, "\\u003c");

  return html`<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>${title}</title>
<meta name="description" content="${description}">
<link rel="canonical" href="${url}">
<meta name="theme-color" content="#0C0C0B">
<meta property="og:type" content="website">
<meta property="og:site_name" content="Matteflux">
<meta property="og:title" content="${title}">
<meta property="og:description" content="${description}">
<meta property="og:url" content="${url}">
<meta property="og:image" content="${ogImage}">
<meta name="twitter:card" content="summary_large_image">
<link rel="icon" href="/favicon.svg" type="image/svg+xml">
${page.heroSet ? html`<link rel="preload" as="image" href="${posterPath(page.heroSet, "hero", "desktop", "webp")}" media="(min-width: 768px)" fetchpriority="high">
<link rel="preload" as="image" href="${posterPath(page.heroSet, "hero", "mobile", "webp")}" media="(max-width: 767px)" fetchpriority="high">` : ""}
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Geist+Mono:wght@400;500&amp;family=Instrument+Serif:ital@0;1&amp;family=Geist:wght@400;500;600&amp;display=swap">
<link rel="stylesheet" href="${assets["matteflux.css"]}">
<link rel="stylesheet" href="${assets["site.css"]}">
</head>
<body class="${page.bodyClass || ""}">
<a class="skip" href="#main">Skip to content</a>
${body}
<script type="application/json" id="mf-sets">${raw(setsJson)}</script>
<script src="${assets["site.js"]}" defer></script>
<script src="${assets["matteflux.js"]}" defer></script>
</body>
</html>`;
}
