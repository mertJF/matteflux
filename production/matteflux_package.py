"""
Matteflux packager: builds Webflow snippets from the shared CSS/JS, writes
the README with real file sizes and measured overlay values, then zips.

Usage: python matteflux_package.py 01
"""
import json, os, re, sys, zipfile
from matteflux_render import SETS, FORMATS, FPS, SECONDS

sid = sys.argv[1]
S = SETS[sid]
slug, title = S["slug"], S["title"]
root = os.path.join("build", f"matteflux-{sid}-{slug}")
code = os.path.join(root, "code")

# Copy the code templates into the set, filling in its slug and title.
TEMPLATES = os.path.join(os.path.dirname(os.path.abspath(__file__)), "templates", "code")
for d, _, files in os.walk(TEMPLATES):
    for f in files:
        src = os.path.join(d, f)
        dst = os.path.join(code, os.path.relpath(src, TEMPLATES))
        os.makedirs(os.path.dirname(dst), exist_ok=True)
        text = open(src, encoding="utf-8").read().replace("__SLUG__", slug).replace("__TITLE__", title)
        open(dst, "w", encoding="utf-8").write(text)
css = open(os.path.join(code, "html-css", "matteflux.css")).read()
js = open(os.path.join(code, "html-css", "matteflux.js")).read()
overlay = json.load(open(os.path.join(root, "overlay.json")))

# Recommended defaults: measured minimum + margin for small text and
# compression, rounded to 0.05.
REC = {"hero": 0.20, "footer": 0.35}


def kb(path):
    b = os.path.getsize(os.path.join(root, path))
    return f"{b / 1024:.0f} KB" if b < 1024 * 1024 else f"{b / 1024 / 1024:.2f} MB"


# ---------------------------------------------------------------- Webflow
wf = os.path.join(code, "webflow")
os.makedirs(wf, exist_ok=True)
open(os.path.join(wf, "1-head-code.html"), "w").write(
    "<!-- Matteflux: paste into Site settings > Custom code > Head code\n"
    "     (or Page settings > Custom code > Inside <head> tag for one page). -->\n"
    f"<style>\n{css}</style>\n")
open(os.path.join(wf, "2-footer-code.html"), "w").write(
    "<!-- Matteflux: paste into Site settings > Custom code > Footer code\n"
    "     (or Page settings > Before </body> tag). -->\n"
    f"<script>\n{js}</script>\n")


def embed(kind, load, ov):
    base = f"https://YOUR-FILE-HOST/{slug}"
    lazy_img = 'loading="lazy" ' if load == "lazy" else 'fetchpriority="high" '
    return f"""<!-- Matteflux {title} — {kind} background.
  1. Give your {kind} Section: Position relative, Overflow hidden, and a min height
     (hero: 100vh; footer: about 33vw on desktop).
  2. Add a Code Embed element as the FIRST child of the Section and paste this.
  3. Upload the files from the ZIP to a public host and replace
     https://YOUR-FILE-HOST/{slug} below with that folder's URL (keep the folder names).
  4. Give the Section's other children position relative and z-index 1 if they
     end up under the video. -->
<div class="mf-bg" style="--mf-overlay: {ov}">
  <picture class="mf-bg__poster">
    <source media="(max-width: 767px)" srcset="{base}/posters/{slug}-{kind}-mobile.webp" type="image/webp">
    <source media="(max-width: 767px)" srcset="{base}/posters/{slug}-{kind}-mobile.jpg">
    <source srcset="{base}/posters/{slug}-{kind}-desktop.webp" type="image/webp">
    <img src="{base}/posters/{slug}-{kind}-desktop.jpg" alt="" {lazy_img}decoding="async">
  </picture>
  <video class="mf-bg__video" muted loop playsinline preload="none" aria-hidden="true"
         data-mf-load="{load}"
         data-mf-desktop="{base}/{kind}/{slug}-{kind}-desktop"
         data-mf-mobile="{base}/{kind}/{slug}-{kind}-mobile"></video>
  <div class="mf-bg__overlay"></div>
</div>
"""


open(os.path.join(wf, "3-hero-embed.html"), "w").write(embed("hero", "eager", REC["hero"]))
open(os.path.join(wf, "4-footer-embed.html"), "w").write(embed("footer", "lazy", REC["footer"]))

# ----------------------------------------------------------------- README
rows = []
for fmt, (w, h, kind) in FORMATS.items():
    rows.append(f"| {kind}/{slug}-{fmt} | {w}×{h} | {kb(f'{kind}/{slug}-{fmt}.mp4')} | "
                f"{kb(f'{kind}/{slug}-{fmt}.webm')} | {kb(f'posters/{slug}-{fmt}.webp')} |")
ov_rows = []
for fmt, (w, h, kind) in FORMATS.items():
    o = overlay[fmt]
    ov_rows.append(f"| {fmt} | {o['overlay']:.2f} | {REC[kind]:.2f} |")

readme = f"""# Matteflux — {title} (Set {sid})

A matching hero and footer video background. Seamless {SECONDS}-second loops,
separate compositions for desktop and mobile, ready-made code for
HTML/CSS, Framer and Webflow.

Code-generated motion · matteflux.com

---

## Quick start (HTML/CSS)

1. Copy the `hero`, `footer`, `posters` folders and `code/html-css/matteflux.css`
   + `matteflux.js` into your site.
2. Open `code/html-css/example.html` in a browser to see the set working.
3. Copy the `<section class="mf-section ...">` blocks into your page and fix the
   file paths. Add the CSS in `<head>` and the JS before `</body>`.

That is it. The poster image shows instantly, the video fades in once it plays.

**Framer:** see the comment at the top of `code/framer/MattefluxBackground.tsx`.

**Webflow:** paste `1-head-code.html` into Head code and `2-footer-code.html`
into Footer code (Site or Page settings), then add a Code Embed with
`3-hero-embed.html` / `4-footer-embed.html` as the first child of your section.
Custom code requires a Webflow plan that allows it.
The videos need a public URL: upload them to your own file host or CDN
and update the paths in the embed.

---

## What's in the box

```
hero/      {slug}-hero-desktop.mp4 / .webm   2560×1440 (16:9)
           {slug}-hero-mobile.mp4  / .webm   1080×1920 (9:16)
footer/    {slug}-footer-desktop.mp4 / .webm 2560×854  (3:1)
           {slug}-footer-mobile.mp4  / .webm 1080×1350 (4:5)
posters/   first frame of each video, .jpg and .webp
code/      html-css/  framer/  webflow/
README.md
```

| File | Resolution | MP4 (H.264) | WebM (VP9) | Poster (WebP) |
|---|---|---|---|---|
{chr(10).join(rows)}

All videos: {SECONDS} s, {FPS} fps, silent, seamless loop (the last frame flows into the first).
The mobile files are separate compositions, not crops of the desktop ones.

---

## Overlay values

The overlay is a dark layer (#080809) between the video and your text.
We measured every pixel of the text area over the whole loop. The minimum is
the lowest overlay where white text reaches a 4.5:1 contrast ratio (WCAG AA)
on 99.5% of pixels. The recommended value adds headroom for small text and
different screens.

| Format | Measured minimum | Recommended |
|---|---|---|
{chr(10).join(ov_rows)}

Text area measured: hero = centre of the frame, footer = full frame.
Set it with `--mf-overlay` (HTML/Webflow) or the Overlay control (Framer).
Using dark text instead? Use a light overlay in your own CSS: 
`background: rgb(243 239 231 / 0.6)`, then check contrast.

---

## Performance notes

- **Hero:** loads right away (`data-mf-load="eager"`). Preload the hero poster
  (see `example.html`) so it paints as your largest image.
- **Footer:** loads only when it comes near the viewport (`data-mf-load="lazy"`).
- Videos pause while off screen.
- Visitors with *reduce motion* turned on, or with Data Saver on, see the poster only.
- WebM is tried first (smaller); MP4 is the fallback for every browser.
- Host the files on a CDN if you can. Serve them with long cache headers.

## Common mistakes

- **Video doesn't autoplay on iPhone:** the `muted` and `playsinline` attributes
  must stay on the `<video>` tag.
- **Video shows over the text:** the section needs `position: relative` and
  `isolation: isolate` (the `.mf-section` class does both), or give your
  content `position: relative; z-index: 1`.
- **Mobile shows the desktop video:** check the `data-mf-mobile` path. The
  default breakpoint is 767 px; change it with `data-mf-breakpoint` on a parent.
- **Nothing loads locally:** some browsers block video from `file://`. Run a
  local server, e.g. `npx serve` or `python -m http.server`, in the set folder.

---

## License

Free for personal and commercial use. You can use this set on unlimited
websites, including client projects.

You may **not**:
- Resell or redistribute the video files on their own
- Include them in a template, theme, UI kit or asset pack for sale or free download
- Claim authorship of the video files

Attribution is not required but appreciated: a link to matteflux.com or a
GitHub star helps others find the project.

Questions: matteflux.com · github.com/mertJF/matteflux
"""
open(os.path.join(root, "README.md"), "w").write(readme)

# -------------------------------------------------------------------- ZIP
zpath = os.path.join("build", f"matteflux-{sid}-{slug}.zip")
with zipfile.ZipFile(zpath, "w", zipfile.ZIP_DEFLATED) as z:
    for d, _, files in os.walk(root):
        for f in sorted(files):
            if f == "overlay.json":
                continue
            full = os.path.join(d, f)
            z.write(full, os.path.relpath(full, "build"))
print("wrote", zpath, os.path.getsize(zpath))
