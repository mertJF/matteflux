# Production tools

Renders Matteflux sets as seamless procedural loops and packages them.

Requirements: Python 3.10+, `pip install numpy pillow`, and `ffmpeg` on PATH
(with libx264 and libvpx-vp9).

```bash
python matteflux_render.py verify  01                    # loop-seam check
python matteflux_render.py posters 01                    # posters (JPG + WebP)
python matteflux_render.py overlay 01                    # legibility measurement
python matteflux_render.py render  01 hero-desktop       # one format, MP4 + WebM
python matteflux_package.py 01                           # Webflow files, README, ZIP
```

Output goes to `production/build/` (git-ignored). The package step copies
`templates/code/` into each set, replacing `__SLUG__` and `__TITLE__`.
`templates/code/html-css/matteflux.css` and `matteflux.js` are the product
code; keep `site/src/assets/mf/` in sync with them (the site uses the same files).

`generate_preview_atlas.py` made the low-res Phase 1 previews of sets 1–6
(one atlas video per set). Sets 02–06 still need production functions in
`matteflux_render.py` (`SETS` dict); use the atlas generator as the visual
reference for each one.

Never run two renders of the same format at once: they write to the same
file and corrupt it.
