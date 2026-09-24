// matteflux.com build: node build.mjs  ->  dist/
// Zero dependencies. Reads src/data, renders every page, fingerprints CSS/JS,
// copies public/ (media, favicon, headers) and writes sitemap.xml.
import { readFileSync, writeFileSync, mkdirSync, rmSync, cpSync, existsSync } from "node:fs";
import { createHash } from "node:crypto";
import { dirname, join } from "node:path";
import { config } from "./src/config.mjs";
import { layout } from "./src/components.mjs";
import { home, setsIndex, setDetail, pricing } from "./src/pages/marketing.mjs";
import { docs, license, faqPage, legal, notFound } from "./src/pages/content.mjs";

const DIST = "dist";
const read = (p) => readFileSync(p, "utf8");
const json = (p) => JSON.parse(read(p));

// ------------------------------------------------------------------ data
const measured = json("public/media/overlay-measured.json");
const round5 = (v) => Math.round(v * 20) / 20;
const kb = (b) => (b < 1024 * 1024 ? `${Math.round(b / 1024)} KB` : `${(b / 1048576).toFixed(2)} MB`);

// Recommended overlay = measured minimum + 5%, never below a floor
// (heroes 20%, footers 25%). Same rule as the set README.
const FLOOR = { hero: 0.2, footer: 0.25 };
const sets = json("src/data/sets.json").map((s) => {
  const m = measured[s.slug];
  if (!m) throw new Error(`No measured media for ${s.slug}: run tools/build_site_media.py`);
  const meas = {
    hero: Math.max(m["hero-desktop"].overlay, m["hero-mobile"].overlay),
    footer: Math.max(m["footer-desktop"].overlay, m["footer-mobile"].overlay),
  };
  const rec = {
    hero: round5(Math.max(FLOOR.hero, meas.hero + 0.05)),
    footer: round5(Math.max(FLOOR.footer, meas.footer + 0.05)),
  };
  const sizes = Object.fromEntries(Object.entries(m).map(([k, v]) => [k, { mp4: kb(v.mp4), webm: kb(v.webm) }]));
  return { ...s, measured: meas, rec, sizes };
});
const faq = json("src/data/faq.json");
const defaultSet = sets.find((s) => s.slug === config.defaultSet) || sets[0];

// ---------------------------------------------------------------- assets
rmSync(DIST, { recursive: true, force: true });
mkdirSync(join(DIST, "assets"), { recursive: true });
const assets = {};
for (const [name, src] of [
  ["matteflux.css", "src/assets/mf/matteflux.css"],
  ["matteflux.js", "src/assets/mf/matteflux.js"],
  ["site.css", "src/assets/site.css"],
  ["site.js", "src/assets/site.js"],
]) {
  const body = read(src);
  const hash = createHash("sha256").update(body).digest("hex").slice(0, 10);
  const [base, ext] = name.split(/\.(?=[^.]+$)/);
  const file = `${base}.${hash}.${ext}`;
  writeFileSync(join(DIST, "assets", file), body);
  assets[name] = `/assets/${file}`;
}

// ----------------------------------------------------------------- pages
const ctx = { sets, faq, defaultSet };
const pages = [
  { path: "/", heroSet: defaultSet, bodyClass: "page-home", body: home(ctx) },
  { path: "/sets/", title: "All sets", heroSet: defaultSet, description: `All Matteflux hero and footer sets. ${sets.length} matching pairs in the Dark Ambient collection.`, body: setsIndex(ctx) },
  ...sets.map((s) => ({
    path: `/sets/${s.slug}/`, title: `${s.name} — hero & footer video background`, heroSet: s,
    description: `${s.desc} A matching hero and footer video background for websites, with desktop and mobile versions and ready-made code.`,
    body: setDetail({ ...ctx, set: s }),
  })),
  { path: "/pricing/", title: "Pricing", heroSet: defaultSet, body: pricing(ctx) },
  { path: "/docs/", title: "Docs", description: "Set up a Matteflux hero or footer in HTML/CSS, Framer or Webflow. Overlay, performance and common mistakes.", body: docs(ctx) },
  { path: "/license/", title: "License", body: license(ctx) },
  { path: "/faq/", title: "Questions", body: faqPage(ctx) },
  { path: "/terms/", title: "Terms of service", body: legal("terms", ctx), noindex: true },
  { path: "/privacy/", title: "Privacy policy", body: legal("privacy", ctx), noindex: true },
  { path: "/refunds/", title: "Refund policy", body: legal("refunds", ctx), noindex: true },
  { path: "/404.html", title: "Page not found", heroSet: defaultSet, body: notFound(ctx), noindex: true, file: "404.html" },
];

for (const page of pages) {
  const out = page.file ? join(DIST, page.file) : join(DIST, page.path, "index.html");
  mkdirSync(dirname(out), { recursive: true });
  let doc = layout({ page, assets, sets, defaultSet, body: page.body }).toString();
  if (page.noindex) doc = doc.replace("</title>", '</title>\n<meta name="robots" content="noindex">');
  writeFileSync(out, doc);
}

// -------------------------------------------------------- public + seo
if (existsSync("public")) cpSync("public", DIST, { recursive: true, filter: (p) => !p.endsWith("overlay-measured.json") });
const urls = pages.filter((p) => !p.noindex).map((p) => `  <url><loc>${config.siteUrl}${p.path}</loc></url>`).join("\n");
writeFileSync(join(DIST, "sitemap.xml"), `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`);
writeFileSync(join(DIST, "robots.txt"), `User-agent: *\nAllow: /\nSitemap: ${config.siteUrl}/sitemap.xml\n`);

// ---------------------------------------------------------------- report
const placeholders = new Set();
for (const page of pages) {
  const out = page.file ? join(DIST, page.file) : join(DIST, page.path, "index.html");
  for (const m of read(out).matchAll(/\[(?:PLACEHOLDER|[A-Z_]{4,})[^\]]*\]/g)) placeholders.add(m[0].slice(0, 60));
}
console.log(`Built ${pages.length} pages into ${DIST}/`);
console.log("Recommended overlays:", sets.map((s) => `${s.slug} ${s.rec.hero}/${s.rec.footer}`).join(", "));
console.log(`Open placeholders (${placeholders.size}):`, [...placeholders].sort().join(" "));
