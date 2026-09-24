"""
Matteflux production renderer.

Renders one set (hero + footer, desktop + mobile) as seamless procedural
loops, encodes MP4 (H.264) + WebM (VP9), exports posters and measures the
overlay strength needed for readable white text.

Usage:
    python matteflux_render.py render  <set> <format> [mp4|webm|both]
    python matteflux_render.py posters <set>            # poster JPG + WebP
    python matteflux_render.py overlay <set>            # legibility test
    python matteflux_render.py verify  <set>            # loop-seam check

Formats: hero-desktop, hero-mobile, footer-desktop, footer-mobile
Loop rule: every time term uses phase = 2*pi*frame/N with integer
multipliers, so frame N is identical to frame 0.
"""
import json, os, subprocess, sys
import numpy as np
from PIL import Image

TAU = 2 * np.pi
FPS, SECONDS = 24, 10
N = FPS * SECONDS

FORMATS = {
    #  name             width height kind
    "hero-desktop":   (2560, 1440, "hero"),
    "hero-mobile":    (1080, 1920, "hero"),
    "footer-desktop": (2560, 854,  "footer"),
    "footer-mobile":  (1080, 1350, "footer"),
}
# Rendering happens at 1/COMPUTE_DIV and is upscaled: the fields are soft,
# so this loses nothing and keeps render time low.
COMPUTE_DIV = 2


# ------------------------------------------------------------------ helpers
def hexrgb(h):
    h = h.lstrip("#")
    return np.array([int(h[i:i + 2], 16) for i in (0, 2, 4)], np.float32) / 255


def ramp(v, stops):
    cols = np.stack([hexrgb(s) for s in stops])
    v = np.clip(v, 0, 1) * (len(stops) - 1)
    i = np.clip(np.floor(v).astype(int), 0, len(stops) - 2)
    f = (v - i)[..., None]
    return cols[i] * (1 - f) + cols[i + 1] * f


def coords(w, h):
    """y in 0..1 (top->bottom), x in 0..aspect."""
    lw, lh = max(16, round(w / COMPUTE_DIV)), max(16, round(h / COMPUTE_DIV))
    y, x = np.mgrid[0:lh, 0:lw].astype(np.float32)
    return (x + 0.5) / lh, (y + 0.5) / lh, w / h


def vignette(x, y, asp, strength):
    d = np.sqrt(((x - asp / 2) / asp) ** 2 * 1.6 + (y - 0.5) ** 2)
    return 1 - strength * np.clip(d * 1.25, 0, 1) ** 2


def warp(x, y, p, amt, k=(1, 2)):
    wx = x + amt * np.sin(TAU * (0.9 * y + 0.35 * x) + k[0] * p) \
           + 0.5 * amt * np.sin(TAU * (1.7 * x - 0.6 * y) - k[1] * p)
    wy = y + amt * np.sin(TAU * (0.8 * x - 0.3 * y) + k[1] * p + 1.3) \
           + 0.5 * amt * np.sin(TAU * (1.3 * y + 0.9 * x) + k[0] * p)
    return wx, wy


# Static ordered-dither matrix (same every frame, so the loop stays exact).
_BAYER = np.array([[0, 8, 2, 10], [12, 4, 14, 6], [3, 11, 1, 9], [15, 7, 13, 5]], np.float32) / 16 - 0.47


def finish(rgb_low, w, h):
    """Upscale the float field to full size, dither to 8-bit (kills banding)."""
    chans = []
    for c in range(3):
        im = Image.fromarray(rgb_low[..., c].astype(np.float32), mode="F")
        chans.append(np.asarray(im.resize((w, h), Image.BICUBIC)))
    rgb = np.stack(chans, -1) * 255
    d = np.tile(_BAYER, (h // 4 + 1, w // 4 + 1))[:h, :w, None]
    return np.clip(rgb + d, 0, 255).astype(np.uint8)


# ------------------------------------------------------------------- sets
def ember_aurora(w, h, kind, p):
    """Set 01 - amber light band over a teal dusk."""
    x, y, asp = coords(w, h)
    portrait = asp < 1
    wx, wy = warp(x, y, p, 0.12)
    freq = 1.1 if portrait else 0.55
    centre = (0.26 if portrait else 0.30) if kind == "hero" else (0.50 if portrait else 0.55)
    band = centre + 0.10 * np.sin(TAU * freq * wx + p) + 0.05 * np.sin(TAU * 2.2 * freq * wx - 2 * p)
    d = np.abs(wy - band)
    glow = 0.8 * np.exp(-(d / 0.12) ** 2) + 0.45 * np.exp(-(d / 0.32) ** 2)
    streak = 0.5 + 0.5 * np.sin(TAU * 3.0 * wx + 0.8 * np.sin(TAU * wy + p) + p)
    v = glow * (0.75 + 0.25 * streak) * vignette(x, y, asp, 0.55)
    if kind == "hero":
        # Calm zone where a headline usually sits (centre, slightly low).
        cy = 0.60 if portrait else 0.58
        v *= 1 - 0.35 * np.exp(-(((x - asp / 2) / (0.45 * asp)) ** 2 + ((y - cy) / 0.22) ** 2))
    return ramp(v * 0.78, ["#0A0B0E", "#0E181E", "#163A40", "#966034", "#E8AA68"])


def night_fog(w, h, kind, p):
    """Set 02 — slow, low-contrast haze rolling past."""
    x, y, asp = coords(w, h)
    acc = np.zeros_like(x)
    for i, (f, sp, a) in enumerate([(0.6, 1, 1.0), (1.1, -1, 0.6), (2.0, 2, 0.35)]):
        wx, wy = warp(x * f, y * f, p * sp, 0.3, (1, 1))
        acc += a * (0.5 + 0.5 * np.sin(TAU * (wx * 0.8 + wy * 0.4) + i * 2.1))
    v = acc / 1.95
    v = v ** 1.6 * (0.55 + 0.45 * y) * vignette(x, y, asp, 0.6)
    return ramp(np.clip(v * 1.35, 0, 1), ["#08090B", "#11151A", "#232B34", "#46525E", "#8F9AA5"])


def deep_water(w, h, kind, p):
    """Set 03 — caustic light on a dark water surface."""
    x, y, asp = coords(w, h)
    portrait = asp < 1
    persp = 0.35 + y
    acc = np.zeros_like(x)
    for i, (fx, fy, k) in enumerate([(3, 7, 1), (-4, 5, 2), (5, 9, -1), (2, 11, 3)]):
        acc += np.sin(TAU * (fx * x + fy * y * persp) / 2.2 + k * p + i)
    caust = np.exp(-(acc / 0.9) ** 2)
    depth = 0.25 + 0.45 * y
    v = (depth * 0.6 + caust * 0.45 * (0.3 + y)) * vignette(x, y, asp, 0.5)
    if kind == "hero":
        cy = 0.60 if portrait else 0.55
        v *= 1 - 0.3 * np.exp(-(((x - asp / 2) / (0.5 * asp)) ** 2 + ((y - cy) / 0.25) ** 2))
    return ramp(v, ["#03070C", "#071A2A", "#0F3A55", "#2B7394", "#A8DCE8"])


_rng = np.random.default_rng(4)
_PART = {
    "x": _rng.random(260), "y": _rng.random(260), "z": _rng.random(260) ** 2,
    "k": _rng.integers(1, 3, 260), "ph": _rng.random(260) * TAU,
}


def drift(w, h, kind, p):
    """Set 04 — distant particles gliding across a quiet field."""
    x, y, asp = coords(w, h)
    cw, ch = x.shape[1], x.shape[0]
    base = ramp(0.25 + 0.35 * (1 - y) * vignette(x, y, asp, 0.7),
                ["#07080B", "#0C1017", "#131B26", "#1E2A38"])
    P = _PART
    n = min(260, int(220 * (cw * ch) / (480 * 270)) + 40)
    t = p / TAU
    px = ((P["x"][:n] + t * P["k"][:n].astype(float)) % 1.0) * cw
    py = (P["y"][:n] + 0.015 * np.sin(p * P["k"][:n] + P["ph"][:n])) * ch
    tw = 0.6 + 0.4 * np.sin(p * 2 * P["k"][:n] + P["ph"][:n])
    warm, cool = hexrgb("#E8C89A"), hexrgb("#9FB8D0")
    for i in range(n):
        r = 0.8 + 2.0 * P["z"][i]
        rr = int(r * 3) + 1
        ci, ri = int(px[i]), int(py[i])
        x0, x1 = max(ci - rr, 0), min(ci + rr + 1, cw)
        y0, y1 = max(ri - rr, 0), min(ri + rr + 1, ch)
        if x0 >= x1 or y0 >= y1:
            continue
        yy, xx = np.mgrid[y0:y1, x0:x1]
        g = np.exp(-((xx - px[i]) ** 2 + (yy - py[i]) ** 2) / (2 * r * r))
        col = warm if i % 3 == 0 else cool
        base[y0:y1, x0:x1] += g[..., None] * col * (0.25 + 0.6 * P["z"][i]) * tw[i]
    return np.clip(base, 0, 1)


def violet_tide(w, h, kind, p):
    """Set 05 — fluid violet folding into midnight navy."""
    x, y, asp = coords(w, h)
    wx, wy = warp(x, y, p, 0.28)
    wx, wy = warp(wx * 0.8, wy * 0.8, -p, 0.18, (2, 1))
    v = 0.5 + 0.5 * np.sin(TAU * (0.6 * wx + 0.9 * wy) + p)
    v = 0.15 + 0.75 * v ** 2 * (0.4 + 0.6 * (1 - y if kind == "hero" else y))
    v *= vignette(x, y, asp, 0.5)
    return ramp(v, ["#07071A", "#141236", "#2A1F63", "#5B3FA6", "#B895E6"])


def contour(w, h, kind, p):
    """Set 06 — fine topographic lines in slow motion."""
    x, y, asp = coords(w, h)
    portrait = asp < 1
    wx, wy = warp(x, y, p, 0.10)
    f = (np.sin(TAU * (0.7 * wx + 0.2 * wy) + p)
         + 0.8 * np.sin(TAU * (0.5 * wy - 0.4 * wx) - p + 1.0)
         + 0.4 * np.sin(TAU * (1.3 * wx + 1.1 * wy) + 2 * p))
    bands = 7
    fr = (f * bands) % 1.0
    d = np.minimum(fr, 1 - fr) / (np.abs(np.gradient(f * bands, axis=1)) + np.abs(np.gradient(f * bands, axis=0)) + 1e-4)
    line = np.clip(1.2 - d, 0, 1)
    fade = vignette(x, y, asp, 0.75)
    if kind == "hero":
        cy = 0.60 if portrait else 0.56
        fade *= 1 - 0.55 * np.exp(-(((x - asp / 2) / (0.42 * asp)) ** 2 + ((y - cy) / 0.2) ** 2))
    bg = ramp(0.2 + 0.15 * (0.5 + 0.5 * f / 2.2), ["#0A0B0B", "#121414", "#1B1F1E"])
    rgb = bg + line[..., None] * fade[..., None] * hexrgb("#C9C2B0") * 0.42
    return np.clip(rgb, 0, 1)


SETS = {
    "01": {"slug": "ember-aurora", "title": "Ember Aurora", "fn": ember_aurora},
    "02": {"slug": "night-fog", "title": "Night Fog", "fn": night_fog},
    "03": {"slug": "deep-water", "title": "Deep Water", "fn": deep_water},
    "04": {"slug": "drift", "title": "Drift", "fn": drift},
    "05": {"slug": "violet-tide", "title": "Violet Tide", "fn": violet_tide},
    "06": {"slug": "contour", "title": "Contour", "fn": contour},
}


def frame(set_id, fmt, i):
    w, h, kind = FORMATS[fmt]
    return finish(SETS[set_id]["fn"](w, h, kind, TAU * i / N), w, h)


# --------------------------------------------------------------- commands
def out_name(set_id, fmt, ext, folder):
    s = SETS[set_id]
    return os.path.join("build", f"matteflux-{set_id}-{s['slug']}", folder, f"{s['slug']}-{fmt}.{ext}")


def render(set_id, fmt, only="both"):
    w, h, kind = FORMATS[fmt]
    folder = kind
    mp4, webm = out_name(set_id, fmt, "mp4", folder), out_name(set_id, fmt, "webm", folder)
    os.makedirs(os.path.dirname(mp4), exist_ok=True)
    gop = str(FPS * 2)
    cmd = ["ffmpeg", "-y", "-loglevel", "error", "-f", "rawvideo", "-pix_fmt", "rgb24",
           "-s", f"{w}x{h}", "-r", str(FPS), "-i", "-",
           # MP4 / H.264 - universal
           "-map", "0", "-c:v", "libx264", "-preset", "slow", "-crf", "27", "-tune", "grain",
           "-profile:v", "high", "-pix_fmt", "yuv420p", "-g", gop, "-movflags", "+faststart",
           "-an", mp4,
           # WebM / VP9 - smaller where supported
           "-map", "0", "-c:v", "libvpx-vp9", "-crf", "38", "-b:v", "0", "-deadline", "good",
           "-cpu-used", "4", "-row-mt", "1", "-pix_fmt", "yuv420p", "-g", gop, "-an", webm]
    split = cmd.index("-map", cmd.index("-map") + 1)
    if only == "mp4":
        cmd = cmd[:split]
    elif only == "webm":
        cmd = cmd[:cmd.index("-map")] + cmd[split:]
    proc = subprocess.Popen(cmd, stdin=subprocess.PIPE)
    for i in range(N):
        proc.stdin.write(frame(set_id, fmt, i).tobytes())
        if i % 24 == 0:
            print(f"{fmt} frame {i}/{N}", flush=True)
    proc.stdin.close()
    proc.wait()
    print("done", fmt, only, flush=True)


def posters(set_id):
    for fmt, (w, h, kind) in FORMATS.items():
        img = Image.fromarray(frame(set_id, fmt, 0))
        base = out_name(set_id, fmt, "x", "posters")[:-2]
        os.makedirs(os.path.dirname(base), exist_ok=True)
        img.save(base + ".jpg", quality=80, optimize=True, progressive=True)
        img.save(base + ".webp", quality=78, method=6)
        print(fmt, os.path.getsize(base + ".jpg"), os.path.getsize(base + ".webp"))


def verify(set_id):
    """Frame N must equal frame 0 (seamless loop); also report the jump
    between the last and first frame vs. an average step."""
    for fmt in FORMATS:
        f0 = frame(set_id, fmt, 0).astype(int)
        fN = frame(set_id, fmt, N).astype(int)
        f1 = frame(set_id, fmt, 1).astype(int)
        fl = frame(set_id, fmt, N - 1).astype(int)
        print(fmt, "frame N vs 0 max diff:", np.abs(fN - f0).max(),
              "| seam step:", round(float(np.abs(f0 - fl).mean()), 3),
              "| normal step:", round(float(np.abs(f1 - f0).mean()), 3))


def srgb_to_lin(c):
    return np.where(c <= 0.04045, c / 12.92, ((c + 0.055) / 1.055) ** 2.4)


def overlay(set_id, samples=40):
    """Smallest overlay (black #080809 at opacity a) so white text reaches
    4.5:1 on 99.5% of pixels in the text zone, across the whole loop."""
    ov = hexrgb("#080809")
    zones = {  # (x0, x1, y0, y1) fractions where text is expected
        "hero-desktop": (0.10, 0.90, 0.35, 0.85),
        "hero-mobile": (0.06, 0.94, 0.40, 0.92),
        "footer-desktop": (0.03, 0.97, 0.10, 0.90),
        "footer-mobile": (0.06, 0.94, 0.08, 0.92),
    }
    result = {}
    for fmt, (w, h, kind) in FORMATS.items():
        x0, x1, y0, y1 = zones[fmt]
        px = []
        for i in np.linspace(0, N - 1, samples).astype(int):
            f = SETS[set_id]["fn"](w, h, kind, TAU * i / N)
            fh, fw = f.shape[:2]
            px.append(f[int(y0 * fh):int(y1 * fh), int(x0 * fw):int(x1 * fw)].reshape(-1, 3))
        px = np.concatenate(px)
        best = None
        for a in np.arange(0.0, 0.905, 0.05):
            c = px * (1 - a) + ov * a
            L = srgb_to_lin(c) @ np.array([0.2126, 0.7152, 0.0722])
            ratio = 1.05 / (np.percentile(L, 99.5) + 0.05)
            if ratio >= 4.5:
                best = (round(float(a), 2), round(float(ratio), 2))
                break
        result[fmt] = {"overlay": best[0], "contrast_white_text": best[1]}
        print(fmt, result[fmt])
    path = os.path.join("build", f"matteflux-{set_id}-{SETS[set_id]['slug']}", "overlay.json")
    os.makedirs(os.path.dirname(path), exist_ok=True)
    json.dump(result, open(path, "w"), indent=2)


if __name__ == "__main__":
    cmd, sid = sys.argv[1], sys.argv[2]
    {"render": lambda: render(sid, sys.argv[3], sys.argv[4] if len(sys.argv) > 4 else "both"), "posters": lambda: posters(sid),
     "verify": lambda: verify(sid), "overlay": lambda: overlay(sid)}[cmd]()
