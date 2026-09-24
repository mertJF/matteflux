"""
Builds site media for matteflux.com.

Copies production renders from production/build/ into the site media folder,
measures the overlay for white text on every format, and writes overlay data
to overlay-measured.json.

Usage: python build_site_media.py <production-build-dir> <out-dir>
"""
import json, os, shutil, subprocess, sys
import numpy as np

BUILD, OUT = sys.argv[1:3]
SETS = [
    ("01", "ember-aurora"), ("02", "night-fog"), ("03", "deep-water"),
    ("04", "drift"), ("05", "violet-tide"), ("06", "contour"),
]
FORMATS = ["hero-desktop", "hero-mobile", "footer-desktop", "footer-mobile"]
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


result = {}
for num, slug in SETS:
    src_dir = os.path.join(BUILD, f"matteflux-{num}-{slug}")
    dst_dir = os.path.join(OUT, slug)
    for d in ("hero", "footer", "posters"):
        os.makedirs(os.path.join(dst_dir, d), exist_ok=True)
    result[slug] = {}
    for fmt in FORMATS:
        kind = fmt.split("-")[0]
        src_base = os.path.join(src_dir, kind, f"{slug}-{fmt}")
        dst_base = os.path.join(dst_dir, kind, f"{slug}-{fmt}")
        post_src = os.path.join(src_dir, "posters", f"{slug}-{fmt}")
        post_dst = os.path.join(dst_dir, "posters", f"{slug}-{fmt}")
        for ext in ("mp4", "webm"):
            shutil.copy(f"{src_base}.{ext}", f"{dst_base}.{ext}")
        for ext in ("jpg", "webp"):
            shutil.copy(f"{post_src}.{ext}", f"{post_dst}.{ext}")
        result[slug][fmt] = {
            "overlay": measure(f"{dst_base}.mp4", fmt),
            "mp4": os.path.getsize(f"{dst_base}.mp4"),
            "webm": os.path.getsize(f"{dst_base}.webm"),
        }
    print(slug, {k: v["overlay"] for k, v in result[slug].items()}, flush=True)

json.dump(result, open(os.path.join(OUT, "overlay-measured.json"), "w"), indent=2)
