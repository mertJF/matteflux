import { html, raw } from "../html.mjs";
import { config } from "../config.mjs";
import {
  header, siteFooter, mfLayer, previewFrame, previewControls, setCard, codeBlock, icons, posterPath,
} from "../components.mjs";

const pct = (v) => `${Math.round(v * 100)}%`;

// ---------------------------------------------------------------- shared
function faqList(items) {
  return html`<div class="faq">${items.map((f) => html`<details class="faq__item">
    <summary><span>${f.q}</span><span class="faq__icon" aria-hidden="true"></span></summary>
    <p>${f.a}</p>
  </details>`)}</div>`;
}

const SNIPPET = (slug) => `<section class="mf-section mf-section--hero">
  <div class="mf-bg" style="--mf-overlay: 0.2">
    <picture class="mf-bg__poster"> … </picture>
    <video class="mf-bg__video" muted loop playsinline preload="none"
           data-mf-load="eager"
           data-mf-desktop="hero/${slug}-hero-desktop"
           data-mf-mobile="hero/${slug}-hero-mobile"></video>
    <div class="mf-bg__overlay"></div>
  </div>
  <h1>Your headline</h1>
</section>`;

// ------------------------------------------------------------------ home
export function home({ sets, faq, defaultSet: d }) {
  return html`${header({ overlay: true, current: "/" })}
<main id="main">
  <section class="mf-section mf-section--hero site-hero" data-mf-slot="hero">
    ${mfLayer(d, "hero", { overlay: d.rec.hero, eager: true })}
    <div class="wrap site-hero__inner">
      <p class="kicker">Collection 01 — Dark Ambient</p>
      <h1 class="display">Ambient motion for heroes &amp; footers.</h1>
      <p class="lead lead--hero">Matching video backgrounds for the top and the bottom of your site. Design, code and seamless loops included. Paste one in and it plays in minutes.</p>
      <div class="actions">
        <a class="btn btn--solid" href="#sets-gallery">Browse sets</a>
        <a class="btn btn--ghost" href="${config.githubRepo}" target="_blank" rel="noopener">${icons.github} Star on GitHub</a>
      </div>
    </div>
    <div class="wrap site-hero__bar">
      <a href="#try" class="now-playing"><span class="dot" aria-hidden="true"></span><span>Now playing: <span data-mf-name>${d.name}</span>. Change it below</span></a>
      <span class="hide-sm">Code-generated motion</span>
    </div>
  </section>

  <section id="try" class="section section--line">
    <div class="wrap split">
      <div class="split__side sticky">
        <p class="kicker">Try it live</p>
        <h2 class="h2">Pick a set. Watch this page change.</h2>
        <p class="lead">Every set is a hero and a footer from the same family. Choose one and the top of this page, the footer at the bottom and the preview beside you all switch to it.</p>
        <div class="chips" role="group" aria-label="Choose a set">
          ${sets.map((s) => html`<button type="button" class="chip" data-pick="${s.slug}" aria-pressed="${s.slug === d.slug ? "true" : "false"}">
            <span class="chip__thumb"><img src="${posterPath(s, "hero", "desktop", "webp")}" alt="" loading="lazy" width="2560" height="1440"></span>
            <span class="chip__text"><span class="mono faint">${s.num}</span><span>${s.name}</span></span>
          </button>`)}
        </div>
        ${previewControls(d, { target: "pv-home", page: true })}
      </div>
      <div class="split__main">
        ${previewFrame(d, { id: "pv-home", overlayHero: d.rec.hero, overlayFooter: d.rec.footer })}
      </div>
    </div>
  </section>

  <section class="section section--line">
    <div class="wrap stack-lg">
      <div class="section-head">
        <h2 class="h2">From download to live in three steps.</h2>
        <a class="link-arrow" href="/docs/">Read the setup guides ${icons.arrow}</a>
      </div>
      <ol class="steps">
        <li><span class="steps__n">1</span><h3>Pick a set</h3><p>Choose a hero and footer pair that fits your site's mood. Preview both on desktop and mobile right here.</p></li>
        <li><span class="steps__n">2</span><h3>Download</h3><p>One ZIP: desktop and mobile videos in MP4 and WebM, poster images, ready-made code and a README with overlay values.</p></li>
        <li><span class="steps__n">3</span><h3>Paste the code</h3><p>Drop the snippet into HTML, Framer or Webflow. Poster first, lazy loading and reduced-motion support are already wired in.</p></li>
      </ol>
      ${codeBlock("code/html-css/example.html", "HTML", SNIPPET(d.slug))}
    </div>
  </section>

  <section id="sets-gallery" class="section section--line">
    <div class="wrap stack-lg">
      <div class="section-head">
        <div><p class="kicker">Collection 01 — Dark Ambient</p><h2 class="h2">Hero above, footer below. Always a pair.</h2></div>
        <a class="link-arrow" href="/sets/">View all sets ${icons.arrow}</a>
      </div>
      <div class="grid-3 grid-cards">${sets.map((s) => setCard(s))}</div>
    </div>
  </section>

  <section class="section section--line">
    <div class="wrap split">
      <div class="split__side">
        <p class="kicker">Why Matteflux</p>
        <h2 class="h2">Code-generated motion.</h2>
        <p class="lead">Every frame is rendered from wave fields and code. That is what makes the loops exact, the files small and the edges clean.</p>
      </div>
      <div class="split__main features">
        <div class="feature">${icons.loop}<h3>Seamless loops</h3><p>The last frame flows into the first by design. No jump, no crossfade.</p></div>
        <div class="feature">${icons.small}<h3>Small files</h3><p>Soft, slow motion compresses well. The Ember Aurora hero is 217 KB as WebM at 2560×1440.</p></div>
        <div class="feature">${icons.speed}<h3>Ready for page speed</h3><p>Instant poster images, lazy-loaded footers and reduced-motion support out of the box.</p></div>
        <div class="feature">${icons.wave}<h3>Clean edges</h3><p>No flicker, no warping, no watermark. The same clean motion every loop.</p></div>
        <div class="feature">${icons.contrast}<h3>Legibility measured</h3><p>Every set ships with overlay values measured for white text at 4.5:1 contrast.</p></div>
        <div class="feature">${icons.devices}<h3>Composed for each screen</h3><p>Desktop and mobile are rendered separately, never cropped from one another.</p></div>
      </div>
    </div>
  </section>

  <section class="section section--line section--tight">
    <div class="wrap works">
      <p class="kicker">Works with</p>
      <ul class="works__list"><li><span class="mono faint">&lt;/&gt;</span> HTML / CSS</li><li>Framer</li><li>Webflow</li></ul>
      <p class="muted small works__note">Copy-paste code for each, plus plain video files for anything else.</p>
    </div>
  </section>

  <section id="github" class="section section--line">
    <div class="wrap">
      <div class="free">
        <div class="free__copy">
          <h2 class="h2">Free and open source.</h2>
          <p class="lead">Every set is free to download. Star the repo on GitHub to help others find it.</p>
        </div>
        <div class="free__cta">
          <a class="btn btn--solid btn--lg" href="${config.githubRepo}" target="_blank" rel="noopener">${icons.github} Star on GitHub</a>
          <p class="faint small">All sets, all formats, all code — free for personal and commercial use.</p>
        </div>
      </div>
    </div>
  </section>

  <section class="section">
    <div class="wrap split">
      <div class="split__side"><h2 class="h2">Questions</h2><a class="link-arrow" href="/faq/">All questions ${icons.arrow}</a></div>
      <div class="split__main">${faqList(faq.filter((f) => f.home))}</div>
    </div>
  </section>
</main>
${siteFooter(d)}`;
}

// ------------------------------------------------------------- /sets/
export function setsIndex({ sets, defaultSet: d }) {
  const tones = [...new Set(sets.map((s) => s.tone))];
  const motions = [...new Set(sets.map((s) => s.motion))];
  const chips = (group, values) => html`<div class="filter" role="group" aria-label="${group}">
    <span class="filter__label muted small">${group}</span>
    <button type="button" class="pill" data-filter="${group.toLowerCase()}" data-value="all" aria-pressed="true">All</button>
    ${values.map((v) => html`<button type="button" class="pill" data-filter="${group.toLowerCase()}" data-value="${v}" aria-pressed="false">${v}</button>`)}
  </div>`;
  return html`${header({ overlay: true, current: "/sets/" })}
<main id="main">
  <section class="mf-section mf-section--hero page-hero" data-mf-slot="hero">
    ${mfLayer(d, "hero", { overlay: d.rec.hero, eager: true })}
    <div class="wrap page-hero__inner">
      <p class="kicker">Collection 01 — Dark Ambient</p>
      <h1 class="h1">All sets</h1>
      <p class="lead">${sets.length} hero and footer pairs. Hover a card to play it; open a set to try it on a real page.</p>
    </div>
  </section>
  <section class="section section--tight">
    <div class="wrap stack-lg" data-catalog>
      <div class="filters">
        ${chips("Tone", tones)}
        ${chips("Motion", motions)}
        <div class="filter" role="group" aria-label="Show">
          <span class="filter__label muted small">Show</span>
          <button type="button" class="pill" data-view="pair" aria-pressed="true">Pair</button>
          <button type="button" class="pill" data-view="hero" aria-pressed="false">Hero</button>
          <button type="button" class="pill" data-view="footer" aria-pressed="false">Footer</button>
        </div>
      </div>
      <p class="muted small" data-catalog-count aria-live="polite">${sets.length} sets</p>
      <div class="grid-3 grid-cards" data-view="pair">${sets.map((s) => setCard(s, { headingLevel: 2 }))}</div>
      <p class="muted" data-catalog-empty hidden>No set matches both filters yet. Try another tone or motion.</p>
    </div>
  </section>
</main>
${siteFooter(d)}`;
}

// --------------------------------------------------------- /sets/[slug]/
export function setDetail({ set: s, sets }) {
  const released = s.status === "released";
  const others = sets.filter((o) => o.slug !== s.slug).slice(0, 3);
  const size = (fmt, ext) => (s.sizes && s.sizes[fmt] ? s.sizes[fmt][ext] : "—");
  const rows = [
    ["hero-desktop", "Hero · desktop", "2560 × 1440", "16:9"],
    ["hero-mobile", "Hero · mobile", "1080 × 1920", "9:16"],
    ["footer-desktop", "Footer · desktop", "2560 × 854", "3:1"],
    ["footer-mobile", "Footer · mobile", "1080 × 1350", "4:5"],
  ];
  return html`${header({ overlay: true, current: "/sets/" })}
<main id="main">
  <section class="mf-section mf-section--hero page-hero page-hero--set" data-mf-slot="hero">
    ${mfLayer(s, "hero", { overlay: s.rec.hero, eager: true })}
    <div class="wrap page-hero__inner">
      <p class="kicker"><a href="/sets/">Sets</a> / ${s.collection}</p>
      <h1 class="h1"><span class="mono h1-num">${s.num}</span> ${s.name}</h1>
      <p class="lead">${s.desc} This page is using it right now: the header above and the footer below.</p>
      <p class="set-card__tags"><span class="tag tag--on-media">${s.tone}</span><span class="tag tag--on-media">${s.motion}</span>${released ? "" : html`<span class="tag tag--on-media">Preview</span>`}</p>
    </div>
  </section>

  <section class="section section--line">
    <div class="wrap split split--detail">
      <div class="split__main">
        ${previewFrame(s, { id: "pv-set", overlayHero: s.rec.hero, overlayFooter: s.rec.footer })}
      </div>
      <aside class="split__side sticky buy" aria-label="Download ${s.name}">
        ${released ? html`<div class="buy__panel">
          <p class="buy__price">Free</p>
          <p class="muted small">Hero + footer, desktop + mobile. MP4 + WebM, posters and code.</p>
          <a class="btn btn--solid btn--block" href="${config.githubRepo}" target="_blank" rel="noopener">${icons.github} Download on GitHub</a>
          <p class="faint small">Star the repo to help others find it.</p>
        </div>` : html`<div class="buy__panel">
          <p class="buy__price">Coming soon</p>
          <p class="muted small">This is an early preview. Final 2560 px renders, sizes and overlay values arrive with the release.</p>
          <a class="btn btn--ghost btn--block" href="${config.githubRepo}" target="_blank" rel="noopener">${icons.github} Star on GitHub</a>
        </div>`}
        ${previewControls(s, { target: "pv-set", page: true })}
      </aside>
    </div>
  </section>

  <section class="section section--line">
    <div class="wrap split">
      <div class="split__side"><h2 class="h2">Technical details</h2>${released ? "" : html`<p class="muted">Preview: final numbers are published with the release.</p>`}</div>
      <div class="split__main stack">
        <div class="table-wrap"><table class="table">
          <thead><tr><th scope="col">File</th><th scope="col">Resolution</th><th scope="col">Ratio</th><th scope="col">WebM</th><th scope="col">MP4</th></tr></thead>
          <tbody>${rows.map(([k, label, res, ratio]) => html`<tr><th scope="row">${label}</th><td>${res}</td><td>${ratio}</td><td>${released ? size(k, "webm") : "—"}</td><td>${released ? size(k, "mp4") : "—"}</td></tr>`)}</tbody>
        </table></div>
        <dl class="specs">
          <div><dt>Length</dt><dd>${released ? "10 s seamless loop" : "Seamless loop"}</dd></div>
          <div><dt>Frame rate</dt><dd>24 fps</dd></div>
          <div><dt>Audio</dt><dd>None</dd></div>
          <div><dt>Codecs</dt><dd>WebM (VP9) + MP4 (H.264)</dd></div>
          <div><dt>Overlay, hero</dt><dd>${pct(s.rec.hero)} recommended${released ? html` <span class="faint">(measured min ${pct(s.measured.hero)})</span>` : ""}</dd></div>
          <div><dt>Overlay, footer</dt><dd>${pct(s.rec.footer)} recommended${released ? html` <span class="faint">(measured min ${pct(s.measured.footer)})</span>` : ""}</dd></div>
        </dl>
      </div>
    </div>
  </section>

  <section class="section section--line">
    <div class="wrap split">
      <div class="split__side"><h2 class="h2">In the package</h2></div>
      <div class="split__main stack-lg">
        <ul class="tree mono">
          <li><strong>hero/</strong> desktop + mobile, .webm + .mp4</li>
          <li><strong>footer/</strong> desktop + mobile, .webm + .mp4</li>
          <li><strong>posters/</strong> first frame of each video, .webp + .jpg</li>
          <li><strong>code/html-css/</strong> matteflux.css, matteflux.js, example.html</li>
          <li><strong>code/framer/</strong> MattefluxBackground.tsx</li>
          <li><strong>code/webflow/</strong> head code, footer code, hero and footer embeds</li>
          <li><strong>README.md</strong> setup, overlay values</li>
        </ul>
        ${codeBlock("code/html-css/example.html (excerpt)", "HTML", SNIPPET(s.slug))}
      </div>
    </div>
  </section>

  <section class="section">
    <div class="wrap stack-lg">
      <div class="section-head"><h2 class="h2">More from ${s.collection}</h2><a class="link-arrow" href="/sets/">All sets ${icons.arrow}</a></div>
      <div class="grid-3 grid-cards">${others.map((o) => setCard(o))}</div>
    </div>
  </section>
</main>
${siteFooter(s)}`;
}

export { faqList };
