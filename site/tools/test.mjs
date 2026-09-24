// Browser tests for dist/ with Playwright (Chromium).
//   node tools/test.mjs          (run after node build.mjs)
// Checks every page on desktop and mobile for JS errors, broken local
// requests and sideways scrolling; checks that videos really play, that the
// right composition loads per screen size, and that the set switcher,
// preview toggle, catalog filters, license toggle and form behave.
import { spawn } from "node:child_process";
import { mkdirSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
let playwright;
try { playwright = require("playwright"); } catch { playwright = require(join(process.env.HOME, ".npm-global/lib/node_modules/playwright")); }
const { chromium } = playwright;

const PORT = 4329;
const BASE = `http://localhost:${PORT}`;
const SHOTS = "shots";
mkdirSync(SHOTS, { recursive: true });

const pages = [];
(function walk(dir) {
  for (const f of readdirSync(dir)) {
    const p = join(dir, f);
    if (statSync(p).isDirectory()) { if (f !== "media" && f !== "assets") walk(p); }
    else if (f === "index.html") pages.push("/" + dir.replace(/^dist\/?/, "") + (dir === "dist" ? "" : "/"));
  }
})("dist");
pages.sort();

const server = spawn("node", ["serve.mjs", String(PORT)], { stdio: "ignore" });
await new Promise((r) => setTimeout(r, 600));

let failures = 0;
const ok = (cond, msg) => { console.log(`${cond ? "  ok  " : "  FAIL"} ${msg}`); if (!cond) failures++; };
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const browser = await chromium.launch();
const VIEWPORTS = {
  desktop: { viewport: { width: 1440, height: 900 } },
  mobile: { viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true, deviceScaleFactor: 2 },
};

async function open(vp, path) {
  const ctx = await browser.newContext(VIEWPORTS[vp]);
  const page = await ctx.newPage();
  const errors = [];
  page.on("pageerror", (e) => errors.push("pageerror: " + e.message));
  // Aborted Google Fonts requests log a generic ERR_FAILED; real failures of
  // our own files are caught by the requestfailed / response handlers.
  page.on("console", (m) => { if (m.type() === "error" && !/ERR_FAILED/.test(m.text())) errors.push("console: " + m.text()); });
  page.on("requestfailed", (r) => { if (r.url().startsWith(BASE) && !/\.(webm|mp4)$/.test(r.url())) errors.push("failed: " + r.url()); });
  page.on("response", (r) => { if (r.url().startsWith(BASE) && r.status() >= 400) errors.push(`${r.status()} ${r.url()}`); });
  // Google Fonts are unreachable in the test sandbox; don't wait for them.
  await page.route(/fonts\.(googleapis|gstatic)\.com/, (route) => route.abort());
  await page.goto(BASE + path, { waitUntil: "load" });
  return { ctx, page, errors };
}

const heroState = (page) => page.evaluate(() => {
  const v = document.querySelector('[data-mf-slot="hero"] .mf-bg__video');
  return v && { src: v.currentSrc, paused: v.paused, t: v.currentTime, ready: v.readyState };
});

// ----------------------------------------------------- every page, twice
for (const vp of Object.keys(VIEWPORTS)) {
  console.log(`\n[${vp}] all pages`);
  for (const path of pages) {
    const { ctx, page, errors } = await open(vp, path);
    await sleep(700);
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
    const links = await page.evaluate(() => [...document.querySelectorAll("a[href^='/']")].map((a) => a.getAttribute("href")));
    ok(errors.length === 0, `${path} no errors${errors.length ? ": " + errors.join(" | ") : ""}`);
    ok(overflow <= 0, `${path} no sideways scroll (${overflow}px)`);
    for (const href of [...new Set(links)]) {
      const clean = href.split("#")[0];
      if (!clean) continue;
      const r = await page.request.get(BASE + clean);
      if (r.status() >= 400) ok(false, `${path} link ${href} -> ${r.status()}`);
    }
    await ctx.close();
  }
}

// ------------------------------------------------------ home, desktop
console.log("\n[desktop] home behaviour");
{
  const { ctx, page } = await open("desktop", "/");
  await sleep(2500);
  let h = await heroState(page);
  ok(h && /ember-aurora-hero-desktop\.webm$/.test(h.src), `hero loads desktop WebM (${h && h.src.split("/").pop()})`);
  ok(h && !h.paused && h.t > 0.5, `hero is playing (t=${h && h.t.toFixed(2)}s)`);
  await page.screenshot({ path: `${SHOTS}/home-desktop-hero.png` });

  await page.locator("#try").scrollIntoViewIfNeeded();
  await sleep(1500);
  const pv = () => page.evaluate(() => [...document.querySelectorAll("#pv-home .pv-video")].map((v) => ({ src: v.currentSrc.split("/").pop(), paused: v.paused })));
  let p = await pv();
  ok(p.some((v) => v.src === "ember-aurora-hero-desktop.webm" && !v.paused), "preview hero plays");
  await page.screenshot({ path: `${SHOTS}/home-desktop-switcher.png` });

  await page.click('[data-pick="deep-water"]');
  await sleep(2500);
  h = await heroState(page);
  ok(h && /deep-water-hero-desktop\.webm$/.test(h.src) && !h.paused, `switcher swaps page hero (${h && h.src.split("/").pop()}, paused=${h && h.paused})`);
  p = await pv();
  ok(p.some((v) => v.src === "deep-water-hero-desktop.webm" && !v.paused), "switcher swaps preview");
  const label = await page.textContent(".now-playing [data-mf-name]");
  ok(label === "Deep Water", `labels update (${label})`);
  const detached = await page.evaluate(() => document.querySelectorAll('[data-mf-slot] .mf-bg__video').length);
  ok(detached === 2, `exactly one video per page slot after swap (${detached})`);
  await page.screenshot({ path: `${SHOTS}/home-desktop-switched.png` });

  await page.fill("#pv-home-overlay", "60");
  await page.dispatchEvent("#pv-home-overlay", "input");
  const ov = await page.evaluate(() => getComputedStyle(document.querySelector('[data-mf-slot="hero"] .mf-bg')).getPropertyValue("--mf-overlay").trim());
  ok(ov === "0.6", `overlay slider drives page hero (${ov})`);

  await page.click('.pv-controls .seg__btn[data-device="mobile"]');
  await sleep(2000);
  p = await pv();
  ok(p.some((v) => v.src === "deep-water-hero-mobile.webm" && !v.paused), "mobile preview uses the 9:16 file");
  await page.locator("#try").screenshot({ path: `${SHOTS}/home-desktop-mobile-preview.png` });

  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
  await sleep(2500);
  const f = await page.evaluate(() => { const v = document.querySelector('[data-mf-slot="footer"] .mf-bg__video'); return { src: v.currentSrc.split("/").pop(), paused: v.paused }; });
  ok(f.src === "deep-water-footer-desktop.webm" && !f.paused, `footer lazy-loads the switched set (${f.src})`);
  await page.screenshot({ path: `${SHOTS}/home-desktop-footer.png` });

  await page.locator("#pricing").scrollIntoViewIfNeeded();
  await page.click('#pricing [data-license="commercial"]');
  const href = await page.getAttribute("#pricing .price-card--featured a", "href");
  ok(href === "[POLAR_URL_COLLECTION_COMMERCIAL]", `license toggle switches checkout link (${href})`);

  await page.fill("#free-email", "not-an-email");
  await page.click("#free button[type=submit]");
  ok(/Enter an email/.test(await page.textContent("[data-free-status]")), "form rejects a bad email");
  await page.fill("#free-email", "you@studio.com");
  await page.click("#free button[type=submit]");
  ok(/isn’t connected/.test(await page.textContent("[data-free-status]")) && page.url().endsWith("/"), "unconnected form doesn't navigate");

  await page.screenshot({ path: `${SHOTS}/home-desktop-full.png`, fullPage: true });
  await ctx.close();
}

// ------------------------------------------------------- home, mobile
console.log("\n[mobile] home behaviour");
{
  const { ctx, page } = await open("mobile", "/");
  await sleep(2500);
  const h = await heroState(page);
  ok(h && /ember-aurora-hero-mobile\.webm$/.test(h.src) && !h.paused, `hero loads the 9:16 mobile file (${h && h.src.split("/").pop()})`);
  await page.screenshot({ path: `${SHOTS}/home-mobile-hero.png` });
  await page.click(".nav-toggle");
  await sleep(300);
  ok(await page.isVisible("#site-nav a[href='/pricing/']"), "mobile menu opens");
  await page.screenshot({ path: `${SHOTS}/home-mobile-menu.png` });
  await page.keyboard.press("Escape");
  await page.screenshot({ path: `${SHOTS}/home-mobile-full.png`, fullPage: true });
  await ctx.close();
}

// ------------------------------------------------ reduced motion
console.log("\n[desktop] reduced motion");
{
  const ctx = await browser.newContext({ ...VIEWPORTS.desktop, reducedMotion: "reduce" });
  const page = await ctx.newPage();
  const media = [];
  page.on("request", (r) => { if (/\.(webm|mp4)$/.test(r.url())) media.push(r.url()); });
  await page.route(/fonts\.(googleapis|gstatic)\.com/, (route) => route.abort());
  await page.goto(BASE + "/", { waitUntil: "load" });
  await page.locator("#try").scrollIntoViewIfNeeded();
  await sleep(1500);
  ok(media.length === 0, `no video downloaded with reduced motion (${media.length})`);
  await ctx.close();
}

// ---------------------------------------------------- catalog + detail
console.log("\n[desktop] catalog and set page");
{
  const { ctx, page } = await open("desktop", "/sets/");
  await page.click('[data-filter="tone"][data-value="Blue"]');
  const visible = await page.$$eval(".set-card", (cs) => cs.filter((c) => !c.hidden).length);
  ok(visible === 1, `tone filter (${visible} visible)`);
  await page.click('[data-filter="motion"][data-value="Fog"]');
  ok(await page.isVisible("[data-catalog-empty]"), "empty state when filters exclude everything");
  await page.click('[data-filter="tone"][data-value="all"]');
  await page.click('[data-filter="motion"][data-value="all"]');
  await page.click('button[data-view="footer"]');
  ok(!(await page.isVisible(".set-card__hero")), "view toggle hides heroes");
  await page.click('button[data-view="pair"]');
  await page.hover(".set-card >> nth=1");
  await sleep(1800);
  const card = await page.evaluate(() => { const v = document.querySelectorAll(".set-card")[1].querySelector("video"); return { src: v.currentSrc.split("/").pop(), paused: v.paused }; });
  ok(!card.paused && /night-fog-hero-desktop/.test(card.src), `card plays on hover (${card.src})`);
  await page.screenshot({ path: `${SHOTS}/sets-desktop.png`, fullPage: true });
  await ctx.close();

  const d = await open("desktop", "/sets/ember-aurora/");
  await sleep(2500);
  const h = await heroState(d.page);
  ok(h && /ember-aurora-hero-desktop\.webm$/.test(h.src) && !h.paused, "set page hero plays its own set");
  await d.page.screenshot({ path: `${SHOTS}/set-ember-desktop.png`, fullPage: true });
  await d.ctx.close();

  const n = await open("desktop", "/sets/contour/");
  await sleep(2000);
  const hc = await heroState(n.page);
  ok(hc && /contour-hero-desktop\.webm$/.test(hc.src) && !hc.paused, "preview set page (Contour) plays");
  ok(await n.page.isVisible("text=Coming soon"), "preview set shows Coming soon instead of Buy");
  await n.ctx.close();

  for (const [vp, path] of [["desktop", "/docs/"], ["mobile", "/sets/ember-aurora/"], ["desktop", "/pricing/"], ["mobile", "/docs/"]]) {
    const x = await open(vp, path);
    await sleep(1200);
    await x.page.screenshot({ path: `${SHOTS}/${path.replace(/\//g, "_")}${vp}.png`, fullPage: true });
    await x.ctx.close();
  }
}

await browser.close();
server.kill();
console.log(`\n${failures === 0 ? "ALL PASSED" : failures + " FAILURE(S)"}`);
process.exit(failures ? 1 : 0);
