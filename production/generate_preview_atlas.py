"""
Matteflux - Dark Ambient mockup renderer (Phase 1 preview quality).

Each set is rendered as ONE looping "atlas" video so the four formats stay
perfectly in sync inside the mockup:

  +------------------------+--------+
  | hero desktop  960x540  | hero   |
  |                        | mobile |
  +------------------------+ 320x568|
  | footer desktop 960x320 +--------+
  |                        | footer |
  +------------------------+ mobile |
                           | 320x400|
  atlas: 1280 x 976        +--------+

Every time term uses phase = 2*pi*frame/total_frames with integer
multipliers, so frame N == frame 0 (seamless loop).
Final production renders (2560x1440 etc.) come in Phase 2.
"""
import subprocess, sys
import numpy as np
from PIL import Image, ImageFilter

FPS, SECONDS = 24, 8
N = FPS * SECONDS
TAU = 2 * np.pi
AW, AH = 1280, 976
REGIONS = {  # name: (x, y, w, h, kind)
    "hero_d":   (0,   0,   960, 540, "hero"),
    "footer_d": (0,   540, 960, 320, "footer"),
    "hero_m":   (960, 0,   320, 568, "hero"),
    "footer_m": (960, 568, 320, 400, "footer"),
}

def hexrgb(h):
    h = h.lstrip("#")
    return np.array([int(h[i:i + 2], 16) for i in (0, 2, 4)], np.float32) / 255

def ramp(v, stops):
    """v in 0..1 -> RGB via evenly spaced hex stops."""
    cols = np.stack([hexrgb(s) for s in stops])
    v = np.clip(v, 0, 1) * (len(stops) - 1)
    i = np.clip(np.floor(v).astype(int), 0, len(stops) - 2)
    f = (v - i)[..., None]
    return cols[i] * (1 - f) + cols[i + 1] * f

def grid(w, h, scale):
    """Normalised coords: y in 0..1, x in 0..aspect."""
    lw, lh = max(8, int(w / scale)), max(8, int(h / scale))
    y, x = np.mgrid[0:lh, 0:lw].astype(np.float32)
    return x / lh, y / lh, lw, lh, w / h

def vignette(x, y, asp, strength=0.55):
    cx, cy = asp / 2, 0.5
    d = np.sqrt(((x - cx) / asp) ** 2 * 1.6 + (y - cy) ** 2)
    return 1 - strength * np.clip(d * 1.25, 0, 1) ** 2

def warp(x, y, p, amt=0.25, k=(1, 2)):
    wx = x + amt * np.sin(TAU * (0.9 * y + 0.35 * x) + k[0] * p) \
           + 0.5 * amt * np.sin(TAU * (1.7 * x - 0.6 * y) - k[1] * p)
    wy = y + amt * np.sin(TAU * (0.8 * x - 0.3 * y) + k[1] * p + 1.3) \
           + 0.5 * amt * np.sin(TAU * (1.3 * y + 0.9 * x) + k[0] * p)
    return wx, wy

def upscale(rgb, w, h, blur):
    img = Image.fromarray((np.clip(rgb, 0, 1) * 255).astype(np.uint8))
    img = img.resize((w, h), Image.BICUBIC)
    if blur:
        img = img.filter(ImageFilter.GaussianBlur(blur))
    return np.asarray(img)

# ---------------------------------------------------------------- sets
def s1_aurora(w, h, kind, p):
    x, y, lw, lh, asp = grid(w, h, 6)
    wx, wy = warp(x, y, p, 0.12)
    centre = 0.30 if kind == "hero" else 0.55
    band = centre + 0.10 * np.sin(TAU * 0.55 * wx + p) + 0.05 * np.sin(TAU * 1.2 * wx - 2 * p)
    d = np.abs(wy - band)
    glow = 0.8 * np.exp(-(d / 0.12) ** 2) + 0.45 * np.exp(-(d / 0.32) ** 2)
    streak = 0.5 + 0.5 * np.sin(TAU * 3.0 * wx + 0.8 * np.sin(TAU * wy + p) + p)
    v = glow * (0.75 + 0.25 * streak) * vignette(x, y, asp)
    if kind == "hero":  # keep the headline zone (centre) calmer
        v *= 1 - 0.35 * np.exp(-(((x - asp / 2) / (0.45 * asp)) ** 2 + ((y - 0.58) / 0.22) ** 2))
    rgb = ramp(v * 0.78, ["#0A0B0E", "#0E181E", "#163A40", "#966034", "#E8AA68"])
    return upscale(rgb, w, h, 6)

def s2_fog(w, h, kind, p):
    x, y, lw, lh, asp = grid(w, h, 6)
    acc = np.zeros_like(x)
    for i, (f, sp, a) in enumerate([(0.6, 1, 1.0), (1.1, -1, 0.6), (2.0, 2, 0.35)]):
        wx, wy = warp(x * f, y * f, p * sp, 0.3, (1, 1))
        acc += a * (0.5 + 0.5 * np.sin(TAU * (wx * 0.8 + wy * 0.4) + i * 2.1))
    v = acc / 1.95
    v = v ** 1.6 * (0.55 + 0.45 * y) * vignette(x, y, asp, 0.6)
    rgb = ramp(np.clip(v * 1.35, 0, 1), ["#08090B", "#11151A", "#232B34", "#46525E", "#8F9AA5"])
    return upscale(rgb, w, h, 8)

def s3_water(w, h, kind, p):
    x, y, lw, lh, asp = grid(w, h, 3)
    persp = 0.35 + y  # waves compress toward the top
    acc = np.zeros_like(x)
    for i, (fx, fy, k) in enumerate([(3, 7, 1), (-4, 5, 2), (5, 9, -1), (2, 11, 3)]):
        acc += np.sin(TAU * (fx * x + fy * y * persp) / 2.2 + k * p + i)
    caust = np.exp(-(acc / 0.9) ** 2)  # bright thin ridges
    depth = 0.25 + 0.45 * y
    v = (depth * 0.6 + caust * 0.45 * (0.3 + y)) * vignette(x, y, asp, 0.5)
    if kind == "hero":
        v *= 1 - 0.3 * np.exp(-(((x - asp / 2) / (0.5 * asp)) ** 2 + ((y - 0.55) / 0.25) ** 2))
    rgb = ramp(v, ["#03070C", "#071A2A", "#0F3A55", "#2B7394", "#A8DCE8"])
    return upscale(rgb, w, h, 2.2)

_rng = np.random.default_rng(4)
PARTICLES = {"x": _rng.random(260), "y": _rng.random(260), "z": _rng.random(260) ** 2,
             "k": _rng.integers(1, 3, 260), "ph": _rng.random(260) * TAU}

def s4_particles(w, h, kind, p):
    x, y, lw, lh, asp = grid(w, h, 6)
    base = ramp(0.25 + 0.35 * (1 - y) * vignette(x, y, asp, 0.7),
                ["#07080B", "#0C1017", "#131B26", "#1E2A38"])
    img = upscale(base, w, h, 10).astype(np.float32) / 255
    P = PARTICLES
    n = min(260, int(220 * (w * h) / (960 * 540)) + 40)
    t = p / TAU
    px = ((P["x"][:n] + t * P["k"][:n] * (0.3 + 0.7 * P["z"][:n])) % 1.0) * w  # integer laps -> loops
    py = (P["y"][:n] + 0.015 * np.sin(p * P["k"][:n] + P["ph"][:n])) * h
    tw = 0.6 + 0.4 * np.sin(p * 2 * P["k"][:n] + P["ph"][:n])
    warm, cool = hexrgb("#E8C89A"), hexrgb("#9FB8D0")
    for i in range(n):
        r = 1.2 + 3.5 * P["z"][i]
        rr = int(r * 3) + 1
        cx, cy = int(px[i]), int(py[i])
        x0, x1, y0, y1 = max(cx - rr, 0), min(cx + rr + 1, w), max(cy - rr, 0), min(cy + rr + 1, h)
        if x0 >= x1 or y0 >= y1:
            continue
        yy, xx = np.mgrid[y0:y1, x0:x1]
        g = np.exp(-((xx - px[i]) ** 2 + (yy - py[i]) ** 2) / (2 * r * r))
        col = warm if i % 3 == 0 else cool
        img[y0:y1, x0:x1] += g[..., None] * col * (0.25 + 0.6 * P["z"][i]) * tw[i]
    return (np.clip(img, 0, 1) * 255).astype(np.uint8)

def s5_violet(w, h, kind, p):
    x, y, lw, lh, asp = grid(w, h, 6)
    wx, wy = warp(x, y, p, 0.28)
    wx, wy = warp(wx * 0.8, wy * 0.8, -p, 0.18, (2, 1))
    v = 0.5 + 0.5 * np.sin(TAU * (0.6 * wx + 0.9 * wy) + p)
    v = 0.15 + 0.75 * v ** 2 * (0.4 + 0.6 * (1 - y if kind == "hero" else y))
    v *= vignette(x, y, asp, 0.5)
    rgb = ramp(v, ["#07071A", "#141236", "#2A1F63", "#5B3FA6", "#B895E6"])
    return upscale(rgb, w, h, 7)

def s6_nebula(w, h, kind, p):
    x, y, lw, lh, asp = grid(w, h, 6)
    wx, wy = warp(x, y, p, 0.22)
    wx2, wy2 = warp(wx * 0.7, wy * 0.7, -p, 0.16, (2, 1))
    v1 = 0.5 + 0.5 * np.sin(TAU * (0.5 * wx2 + 0.8 * wy2) + p)
    v1 = v1 + 0.3 * np.sin(TAU * (1.2 * wx - 0.3 * wy) + 2 * p)
    v1 = np.clip(v1 / 1.3, 0, 1) ** 1.6
    v2 = 0.5 + 0.5 * np.sin(TAU * (0.7 * wx - 0.5 * wy) - p + 1.0)
    v2 = v2 + 0.25 * np.sin(TAU * (0.9 * wx2 + 1.0 * wy) + p + 0.5)
    v2 = np.clip(v2 / 1.25, 0, 1) ** 1.8
    fade = vignette(x, y, asp, 0.5)
    if kind == "hero":
        fade *= 1 - 0.3 * np.exp(-(((x - asp / 2) / (0.45 * asp)) ** 2 + ((y - 0.58) / 0.22) ** 2))
    c1 = ramp(v1 * fade, ["#06060A", "#1A0C14", "#3A1828", "#6B2838", "#B85848"])
    c2 = ramp(v2 * fade, ["#06060A", "#0C0C1A", "#181838", "#283868", "#4868A0"])
    rgb = np.clip(c1 + c2 * 0.6, 0, 1)
    return upscale(rgb, w, h, 7)

SETS = {1: s1_aurora, 2: s2_fog, 3: s3_water, 4: s4_particles, 5: s5_violet, 6: s6_nebula}

def render(set_id, out):
    fn = SETS[set_id]
    cmd = ["ffmpeg", "-y", "-loglevel", "error", "-f", "rawvideo", "-pix_fmt", "rgb24",
           "-s", f"{AW}x{AH}", "-r", str(FPS), "-i", "-",
           "-c:v", "libx264", "-preset", "slow", "-crf", "30", "-pix_fmt", "yuv420p",
           "-movflags", "+faststart", "-an", out]
    proc = subprocess.Popen(cmd, stdin=subprocess.PIPE)
    for fi in range(N):
        p = TAU * fi / N
        atlas = np.zeros((AH, AW, 3), np.uint8)
        for name, (rx, ry, rw, rh, kind) in REGIONS.items():
            atlas[ry:ry + rh, rx:rx + rw] = fn(rw, rh, kind, p)
        if fi == 0:
            Image.fromarray(atlas).save(out.replace(".mp4", "-poster.jpg"), quality=82)
        proc.stdin.write(atlas.tobytes())
    proc.stdin.close()
    proc.wait()

if __name__ == "__main__":
    for sid in map(int, sys.argv[1:] or SETS):
        render(sid, f"set{sid}.mp4")
        print("done", sid, flush=True)
