"""
Builds site media for matteflux.com.

- Set 01: copies the final production files from the Set 1 build.
- Sets 02-06: cuts the Phase 1 preview atlases (1280x976) into the same
  four formats and folder layout as a real set, so the site treats every
  set the same. Marked "preview" in sets.json until final renders exist.
- Measures the overlay for white text on every format (same method as
  matteflux_render.py) and writes it to overlay-measured.json.

Usage: python build_site_media.py <phase1-media-dir> <set1-build-dir> <out-dir>
"""
import json, os, shutil, subprocess, sys
import numpy as np
from PIL import Image

PH1, SET1, OUT = sys.argv[1:4]
SLUGS = {1: "ember-aurora", 2: "night-fog", 3: "deep-water", 4: "drift", 5: "violet-tide", 6: "contour"}
REGIONS = {  # atlas crops: x, y, w, h
    "hero-desktop": (0, 0, 960, 540), "footer-desktop": (0, 540, 960, 320),
    "hero-mobile": (960, 0, 320, 568), "footer-mobile": (960, 568, 320, 400),
}
ZONES = {
    "hero-desktop": (0.10, 0.90, 0.35, 0.85), "hero-mobile": (0.06, 0.94, 0.40, 0.92),
    "footer-desktop": (0.03, 0.97, 0.10, 0.90), "footer-mobile": (0.06, 0.94, 0.08, 0.92),
}
OV = np.array([8, 8, 9], np.float32) / 255


def lin(c):
    return np.where(c <= 0.04045, c / 12.92, ((c + 0.055) / 1.055) ** 2.4)


def measure(path, fmt):
    """Minimum overlay so white text hits 4.5:1 on 99.5% of text-zone pixels."""
    w, h = map(int, subprocess.check_output(
        ["ffprobe", "-v", "error", "-select_streams", "v:0", "-show_entries",
         "stream=width,height", "-of", "csv=p=0", path]).decode().split(","))
    # Measure on a 320px-wide copy: the fields are soft, so this is exact
    # enough and keeps memory low.
    sw = 320
    h = int(round(h * sw / w / 2) * 2)
    w = sw
    raw = subprocess.check_output(["ffmpeg", "-v", "error", "-i", path,
                                   "-vf", f"fps=4,scale={w}:{h}",
                                   "-f", "rawvideo", "-pix_fmt", "rgb24", "-"])
    fr = np.frombuffer(raw, np.uint8).reshape(-1, h, w, 3).astype(np.float32) / 255
    x0, x1, y0, y1 = ZONES[fmt]
    px = fr[:, int(y0 * h):int(y1 * h), int(x0 * w):int(x1 * w)].reshape(-1, 3)
    for a in np.arange(0, 0.905, 0.05):
        L = lin(px * (1 - a) + OV * a) @ np.array([0.2126, 0.7152, 0.0722])
        if 1.05 / (np.percentile(L, 99.5) + 0.05) >= 4.5:
            return round(float(a), 2)
    return 0.9


def encode(src, crop, dst_base):
    x, y, w, h = crop
    vf = f"crop={w}:{h}:{x}:{y}"
    subprocess.run(["ffmpeg", "-y", "-v", "error", "-i", src, "-vf", vf, "-c:v", "libx264",
                    "-preset", "medium", "-crf", "28", "-pix_fmt", "yuv420p",
                    "-movflags", "+faststart", "-an", dst_base + ".mp4"], check=True)
    subprocess.run(["ffmpeg", "-y", "-v", "error", "-i", src, "-vf", vf, "-c:v", "libvpx-vp9",
                    "-crf", "36", "-b:v", "0", "-deadline", "realtime", "-cpu-used", "8",
                    "-row-mt", "1", "-pix_fmt", "yuv420p", "-an", dst_base + ".webm"], check=True)


result = {}
for n, slug in SLUGS.items():
    base = os.path.join(OUT, slug)
    for d in ("hero", "footer", "posters"):
        os.makedirs(os.path.join(base, d), exist_ok=True)
    result[slug] = {}
    for fmt, crop in REGIONS.items():
        kind = fmt.split("-")[0]
        dst = os.path.join(base, kind, f"{slug}-{fmt}")
        post = os.path.join(base, "posters", f"{slug}-{fmt}")
        if n == 1:
            for ext in ("mp4", "webm"):
                shutil.copy(os.path.join(SET1, kind, f"{slug}-{fmt}.{ext}"), f"{dst}.{ext}")
            for ext in ("jpg", "webp"):
                shutil.copy(os.path.join(SET1, "posters", f"{slug}-{fmt}.{ext}"), f"{post}.{ext}")
        elif not os.path.exists(dst + ".webm"):
            src = os.path.join(PH1, f"set{n}.mp4")
            encode(src, crop, dst)
            x, y, w, h = crop
            img = Image.open(os.path.join(PH1, f"set{n}-poster.jpg")).crop((x, y, x + w, y + h))
            img.save(post + ".jpg", quality=80, optimize=True, progressive=True)
            img.save(post + ".webp", quality=78, method=6)
        result[slug][fmt] = {
            "overlay": measure(dst + ".mp4", fmt),
            "mp4": os.path.getsize(dst + ".mp4"),
            "webm": os.path.getsize(dst + ".webm"),
        }
    print(slug, {k: v["overlay"] for k, v in result[slug].items()}, flush=True)

json.dump(result, open(os.path.join(OUT, "overlay-measured.json"), "w"), indent=2)
