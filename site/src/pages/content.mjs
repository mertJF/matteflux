import { html } from "../html.mjs";
import { config } from "../config.mjs";
import { header, siteFooter, codeBlock, mfLayer } from "../components.mjs";
import { faqList } from "./marketing.mjs";

const plainHead = (title, lead, current) => html`${header({ overlay: false, current })}
<div class="page-head"><div class="wrap"><h1 class="h1">${title}</h1>${lead ? html`<p class="lead">${lead}</p>` : ""}</div></div>`;

// ---------------------------------------------------------------- /docs/
export function docs({ defaultSet: d }) {
  const toc = [
    ["quick-start", "Quick start (HTML/CSS)"], ["framer", "Framer"], ["webflow", "Webflow"],
    ["overlay", "Overlay and legibility"], ["performance", "Performance"], ["hosting", "Hosting the files"],
    ["mistakes", "Common mistakes"], ["reference", "Reference"],
  ];
  return html`${plainHead("Docs", "Everything you need to put a Matteflux set on a site. Most setups take a few minutes.", "/docs/")}
<main id="main" class="section section--tight">
  <div class="wrap docs">
    <nav class="docs__toc" aria-label="On this page">
      <p class="foot-h">On this page</p>
      ${toc.map(([id, t]) => html`<a href="#${id}">${t}</a>`)}
    </nav>
    <article class="prose">
      <h2 id="quick-start">Quick start (HTML/CSS)</h2>
      <ol>
        <li>Unzip the set. Copy the <code>hero</code>, <code>footer</code> and <code>posters</code> folders, plus <code>code/html-css/matteflux.css</code> and <code>matteflux.js</code>, into your site.</li>
        <li>Open <code>code/html-css/example.html</code> through a local server to see it working (see <a href="#mistakes">Common mistakes</a> if nothing plays).</li>
        <li>Add the stylesheet in <code>&lt;head&gt;</code> and the script before <code>&lt;/body&gt;</code>, then paste the section markup where you want it.</li>
      </ol>
      ${codeBlock("index.html", "HTML", `<head>
  <link rel="stylesheet" href="/matteflux/matteflux.css">
</head>
<body>
  <section class="mf-section mf-section--hero">
    <div class="mf-bg" style="--mf-overlay: 0.2">
      <picture class="mf-bg__poster">
        <source media="(max-width: 767px)" srcset="/posters/${d.slug}-hero-mobile.webp" type="image/webp">
        <source srcset="/posters/${d.slug}-hero-desktop.webp" type="image/webp">
        <img src="/posters/${d.slug}-hero-desktop.jpg" alt="" fetchpriority="high">
      </picture>
      <video class="mf-bg__video" muted loop playsinline preload="none" aria-hidden="true"
             data-mf-load="eager"
             data-mf-desktop="/hero/${d.slug}-hero-desktop"
             data-mf-mobile="/hero/${d.slug}-hero-mobile"></video>
      <div class="mf-bg__overlay"></div>
    </div>
    <!-- your content -->
  </section>

  <script src="/matteflux/matteflux.js" defer></script>
</body>`)}
      <p>The video paths have no file extension on purpose: the script adds <code>.webm</code> first and <code>.mp4</code> as the fallback.</p>
      <p>For the footer, use <code>mf-section--footer</code>, the footer files and <code>data-mf-load="lazy"</code> so it only downloads when a visitor scrolls near it.</p>

      <h2 id="framer">Framer</h2>
      <ol>
        <li>In Framer, open <strong>Assets → Code</strong>, create a new code component and name it <code>MattefluxBackground</code>.</li>
        <li>Replace its contents with <code>code/framer/MattefluxBackground.tsx</code> and save.</li>
        <li>Drag the component into your hero or footer frame. Set its position to absolute with all edges at 0, and send it to the back.</li>
        <li>In the properties panel, upload the desktop and mobile WebM and MP4 files and the posters.</li>
        <li>Set <strong>Overlay</strong> to the value from the README, and turn on <strong>Lazy load</strong> for footers.</li>
      </ol>

      <h2 id="webflow">Webflow</h2>
      <ol>
        <li>Paste <code>code/webflow/1-head-code.html</code> into <strong>Site settings → Custom code → Head code</strong>, and <code>2-footer-code.html</code> into <strong>Footer code</strong>. You can use Page settings instead to limit it to one page.</li>
        <li>Upload the videos and posters to a public host (see <a href="#hosting">Hosting the files</a>).</li>
        <li>Give your hero Section <em>position: relative</em>, <em>overflow: hidden</em> and a minimum height.</li>
        <li>Add a <strong>Code Embed</strong> as the first child of the Section, paste <code>3-hero-embed.html</code> and replace <code>https://YOUR-FILE-HOST/…</code> with your file URL.</li>
        <li>Repeat with <code>4-footer-embed.html</code> for the footer.</li>
      </ol>
      <p>Custom code needs a Webflow plan that allows it. The native Background Video element also works, but you lose the separate mobile composition and the reduced-motion handling.</p>

      <h2 id="overlay">Overlay and legibility</h2>
      <p>The overlay is a dark layer between the video and your text, set with <code>--mf-overlay</code> (0 to 1). For every set we measure each pixel of the text area across the whole loop, and find the lowest overlay at which white text reaches a 4.5:1 contrast ratio (WCAG AA) on 99.5% of pixels.</p>
      <p>The recommended value adds headroom on top of that minimum: at least 20% for heroes and 25% for footers, or the measured minimum plus 5% if that is higher. Both numbers are in each set's README and on its page.</p>
      ${codeBlock("CSS", "CSS", `/* Darker for small text or busy layouts */
.mf-bg { --mf-overlay: 0.35; }

/* Dark text instead of white: use a light overlay and check contrast */
.mf-bg__overlay { background: rgb(243 239 231 / 0.6); }`)}

      <h2 id="performance">Performance</h2>
      <ul>
        <li><strong>Preload the hero poster.</strong> It is your largest image on first paint; add a <code>&lt;link rel="preload" as="image"&gt;</code> for the desktop and mobile posters, as in <code>example.html</code>.</li>
        <li><strong>Hero loads right away, footer loads late.</strong> <code>data-mf-load="eager"</code> for heroes, <code>"lazy"</code> for everything below the fold.</li>
        <li><strong>Videos pause off screen.</strong> No CPU is spent on a video nobody is looking at.</li>
        <li><strong>Reduced motion and Data Saver</strong> get the poster only. No video is downloaded at all.</li>
        <li><strong>WebM first.</strong> It is usually a third of the MP4 size; MP4 is the fallback for any browser that can't play WebM.</li>
      </ul>

      <h2 id="hosting">Hosting the files</h2>
      <p>Any host that serves static files works. For busy sites, serve the videos from a CDN or object storage and set a long cache lifetime. Keep the folder names from the ZIP (<code>hero/</code>, <code>footer/</code>, <code>posters/</code>) so the paths in the code stay valid.</p>

      <h2 id="mistakes">Common mistakes</h2>
      <dl class="qa">
        <dt>The video doesn't autoplay on iPhone.</dt><dd>Keep <code>muted</code> and <code>playsinline</code> on the <code>&lt;video&gt;</code> tag. Low Power Mode can also block autoplay; the poster stays visible in that case.</dd>
        <dt>The video covers my text.</dt><dd>The section needs <code>position: relative</code> and <code>isolation: isolate</code> (the <code>.mf-section</code> class does both), or give your content <code>position: relative; z-index: 1</code>.</dd>
        <dt>Mobile shows the desktop video.</dt><dd>Check the <code>data-mf-mobile</code> path. The default breakpoint is 767 px; change it with <code>data-mf-breakpoint="900"</code> on a parent element.</dd>
        <dt>Nothing plays when I open the file directly.</dt><dd>Some browsers block video from <code>file://</code>. Run a local server in the set folder, for example <code>python -m http.server</code>.</dd>
        <dt>The video jumps once per loop.</dt><dd>Make sure the files weren't re-encoded or trimmed by a site builder. The original files loop exactly.</dd>
      </dl>

      <h2 id="reference">Reference</h2>
      <div class="table-wrap"><table class="table">
        <thead><tr><th scope="col">Attribute or variable</th><th scope="col">Where</th><th scope="col">What it does</th></tr></thead>
        <tbody>
          <tr><th scope="row"><code>data-mf-desktop</code></th><td>video</td><td>Path to the desktop file, without extension</td></tr>
          <tr><th scope="row"><code>data-mf-mobile</code></th><td>video</td><td>Path to the mobile file, without extension</td></tr>
          <tr><th scope="row"><code>data-mf-load</code></th><td>video</td><td><code>eager</code> (hero) or <code>lazy</code> (default)</td></tr>
          <tr><th scope="row"><code>data-mf-breakpoint</code></th><td>any parent</td><td>Max width in px that counts as mobile (default 767)</td></tr>
          <tr><th scope="row"><code>--mf-overlay</code></th><td>.mf-bg</td><td>Overlay strength, 0 to 1</td></tr>
          <tr><th scope="row"><code>--mf-position</code></th><td>.mf-bg</td><td>Focus point, e.g. <code>50% 30%</code></td></tr>
          <tr><th scope="row"><code>Matteflux.refresh()</code></th><td>JavaScript</td><td>Starts videos added to the page after load</td></tr>
        </tbody>
      </table></div>
    </article>
  </div>
</main>
${siteFooter(d)}`;
}

// ----------------------------------------------------------------- /faq/
export function faqPage({ defaultSet: d, faq }) {
  return html`${plainHead("Questions", null, "/faq/")}
<main id="main" class="section section--tight">
  <div class="wrap narrow">${faqList(faq)}
    <p class="muted faq-more">Something else? Email <a href="mailto:${config.contactEmail}">${config.contactEmail}</a>.</p>
  </div>
</main>
${siteFooter(d)}`;
}

// ------------------------------------------------------------------ 404
export function notFound({ defaultSet: d }) {
  return html`${header({ overlay: true, current: "" })}
<main id="main">
  <section class="mf-section mf-section--hero page-hero" data-mf-slot="hero">
    ${mfLayer(d, "hero", { overlay: d.rec.hero, eager: true })}
    <div class="wrap page-hero__inner">
      <h1 class="h1">This page drifted off.</h1>
      <p class="lead">The link may be old or mistyped.</p>
      <div class="actions"><a class="btn btn--solid" href="/">Go to the home page</a><a class="btn btn--ghost" href="/sets/">Browse sets</a></div>
    </div>
  </section>
</main>
${siteFooter(d)}`;
}
