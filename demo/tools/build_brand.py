"""ZNAKEX brand v2 (v1.0): cuts the new identity assets from 'Pantallas/v2' (magenta sheets,
backgrounds, logos, menu video) into demo/assets/brand.  Run:  python3 demo/tools/build_brand.py"""
import json
import os
import subprocess

import numpy as np
from PIL import Image
from scipy import ndimage

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
SRC = os.path.join(ROOT, "Pantallas", "v2")
OUT = os.path.join(ROOT, "demo", "assets", "brand")
FFMPEG = "/usr/local/lib/python3.11/dist-packages/imageio_ffmpeg/binaries/ffmpeg-linux-x86_64-v7.0.2"


def key_magenta(im, soft=False):
    """Magenta key -> RGBA. Alpha from the magenta 'spill' (min(R,B)-G), colour un-mixed from the
    measured background so glows keep their own colour instead of turning pink."""
    a = np.asarray(im.convert("RGB")).astype(np.float32)
    h, w, _ = a.shape
    border = np.concatenate([a[:6].reshape(-1, 3), a[-6:].reshape(-1, 3), a[:, :6].reshape(-1, 3), a[:, -6:].reshape(-1, 3)])
    bg = np.median(border, axis=0)
    spill = np.minimum(a[..., 0], a[..., 2]) - a[..., 1]
    bgs = min(bg[0], bg[2]) - bg[1]
    lo, hi = (bgs * 0.12, bgs * 0.8) if soft else (bgs * 0.3, bgs * 0.72)
    alpha = np.clip(1 - (spill - lo) / (hi - lo), 0, 1)
    # everything magenta-ish that touches the border is background, even if the key was unsure
    al = alpha[..., None]
    rgb = (a - (1 - al) * bg) / np.maximum(al, 0.04)
    rgb = np.clip(rgb, 0, 255)
    # despill: a keyed edge must not keep a magenta cast
    m = np.minimum(rgb[..., 0], rgb[..., 2])
    over = np.clip(m - rgb[..., 1] - 30, 0, None) * (1 - alpha)
    rgb[..., 0] -= over
    rgb[..., 2] -= over
    out = np.dstack([np.clip(rgb, 0, 255), alpha * 255]).astype(np.uint8)
    return Image.fromarray(out, "RGBA")


def pieces(rgba, n, merge=14, rows=None):
    """Connected components of the keyed sheet in reading order -> list of RGBA crops."""
    al = np.asarray(rgba.getchannel("A")) > 90
    lab, k = ndimage.label(ndimage.binary_dilation(al, iterations=merge))
    objs = ndimage.find_objects(lab)
    sizes = ndimage.sum(al, lab, range(1, k + 1))
    boxes = [(o, s) for o, s in zip(objs, sizes) if s > al.size * 0.0012]
    boxes = sorted(boxes, key=lambda b: -b[1])[:n]
    bb = [(o[1].start, o[0].start, o[1].stop, o[0].stop) for o, _ in boxes]
    # reading order: group by row (centre y within half the median height)
    hmed = np.median([b[3] - b[1] for b in bb])
    bb.sort(key=lambda b: (b[1] + b[3]) / 2)
    ordered, row = [], []
    for b in bb:
        if row and (b[1] + b[3]) / 2 - (row[0][1] + row[0][3]) / 2 > hmed * 0.5:
            ordered += sorted(row, key=lambda r: r[0]); row = []
        row.append(b)
    ordered += sorted(row, key=lambda r: r[0])
    out = []
    for x0, y0, x1, y1 in ordered:
        c = rgba.crop((max(0, x0 - 4), max(0, y0 - 4), x1 + 4, y1 + 4))
        # drop stray bits from neighbouring pieces: keep the largest blob of this crop
        out.append(trim(c))
    return out


def trim(c):
    bb = c.getchannel("A").point(lambda v: 255 if v > 10 else 0).getbbox()
    return c.crop(bb) if bb else c


def save(img, name, maxdim=None, q=86):
    path = os.path.join(OUT, name)
    os.makedirs(os.path.dirname(path), exist_ok=True)
    if maxdim and max(img.size) > maxdim:
        img = img.copy()
        img.thumbnail((maxdim, maxdim), Image.LANCZOS)
    img.save(path, "WEBP", quality=q, method=6)
    return img.size


SHEETS = {
    # file: (folder, names, soft key, merge radius, max size)
    "iconos_1.jpg": ("icons", ["modes", "maps", "home", "skins", "settings", "shop", "mode_story", "mode_classic", "mode_frenzy", "mode_duel", "mode_leaderboard", "mode_spin"], False, 10, 160),
    "iconos_2.jpg": ("icons", ["back", "close", "check", "pause", "play", "retry", "quit", "lock", "levels", "refresh", "ad", "video"], False, 26, 160),
    "iconos_3.jpg": ("icons", ["coin", "coins", "coins_a", "plus1", "chest_closed", "chest_open", "slot_gift", "slot_locked", "collected", "wax_seal", "coin_z", "coin_plain"], False, 10, 160),
    "iconos_4.jpg": ("icons", ["star_gold", "star_empty", "star_glow", "star_pop", "medal_gold", "medal_silver", "medal_bronze", "medal_locked", "rosette", "scroll_daily", "scroll_weekly", "calendar"], False, 10, 160),
    "iconos_5.jpg": ("icons", ["flame", "bars", "bulb", "cloud", "eye", "feather", "gamepad", "joystick", "dpad", "vibration", "snake", "map"], False, 10, 160),
    "iconos_6.jpg": ("icons", ["swipe", "swipe2", "tap", "tap_ring", "streak_people", "orb_red", "orb_gold", "orb", "check_box", "x2kit", "slot_a", "slot_b"], False, 8, 160),
    "kit_paneles.jpg": ("kit", ["panel", "card_tall", "card", "slot", "title", "ring", "divider"], False, 12, None),
    "kit_botones.jpg": ("kit", ["btn_primary", "btn_primary_down", "btn_secondary", "btn_reward", "btn_round", "btn_pill"], False, 12, None),
    "kit_placas.jpg": ("plaques", ["danger", "brand", "reward", "info", "special"], False, 12, None),
    "objetos.jpg": ("pw", ["shield", "magnet", "star", "magnet_alt", "portal", "star_alt", "hud_magnet", "hud_portal", "hud_star"], False, 10, 256),
    "objetos_fx.jpg": ("fx", ["shield_bubble", "shield_crack1", "shield_crack2", "shield_shards", "magnet_ring", "portal_glow", "portal_vortex", "burst_gold", "burst_lime", "burst_white", "star_pop", "star_streak"], True, 6, 256),
}


def sheets(only=None):
    man = {}
    for fn, (folder, names, soft, merge, maxdim) in SHEETS.items():
        if only and fn not in only:
            continue
        rgba = key_magenta(Image.open(os.path.join(SRC, fn)), soft)
        ps = pieces(rgba, len(names), merge)
        if len(ps) != len(names):
            print("!!", fn, "found", len(ps), "expected", len(names))
        for name, p in zip(names, ps):
            man[f"{folder}/{name}"] = save(p, f"{folder}/{name}.webp", maxdim)
    return man


BGS = ["inicio", "carga", "skins", "interior", "tienda", "temporada"]
LOGOS = {"logo_full": "logo_full_color", "logo_wide": "logo_wide_color", "logo_mark": "logo_mark_color"}


def ff(*args):
    subprocess.run([FFMPEG, "-v", "error", "-y", *args], check=True)


def backgrounds():
    for n in BGS:
        im = Image.open(os.path.join(SRC, n + ".jpg")).convert("RGB").resize((1080, 1920), Image.LANCZOS)
        save(im, f"bg/{n}.webp", q=80)
    # the menu art is the first frame of its loop video (the still shows while the video starts)
    tmp = os.path.join(OUT, "bg", "_menu.png")
    ff("-i", os.path.join(SRC, "menu.mp4"), "-frames:v", "1", "-vf", "scale=1080:1920", tmp)
    save(Image.open(tmp).convert("RGB"), "bg/menu.webp", q=80)
    os.remove(tmp)
    blur = Image.open(os.path.join(OUT, "bg", "interior.webp")).resize((270, 480), Image.LANCZOS)
    save(blur, "bg/blur.webp", q=70)


def videos():
    """5 s loops: the last 0.6 s cross-fade into the start so the loop has no jump. 720p, no audio."""
    d, T = 0.6, 5.0
    for n in ("menu", "inicio"):
        ff("-i", os.path.join(SRC, n + ".mp4"), "-filter_complex",
           f"[0:v]scale=720:1280,fps=24,split[a][b];[a]trim={d}:{T},setpts=PTS-STARTPTS,fps=24[x];"
           f"[b]trim=0:{d},setpts=PTS-STARTPTS,fps=24[y];[x][y]xfade=transition=fade:duration={d}:offset={T - 2 * d:.2f},format=yuv420p[v]",
           "-map", "[v]", "-an", "-c:v", "libx264", "-profile:v", "main", "-crf", "30", "-preset", "slow",
           "-movflags", "+faststart", os.path.join(OUT, "video", n + ".mp4"))


def drop_videos():
    """the mp4s are only an intermediate step now: the game ships the animated WebPs"""
    import shutil
    shutil.rmtree(os.path.join(OUT, "video"), ignore_errors=True)


def anims():
    """The videos as animated WebP (15 fps, 720x1280): plain images that loop by themselves in any
    WebView, with no video player, and can be checked frame by frame. The GPUnlock intro plays once."""
    import glob, shutil, tempfile
    for n, loop in (("menu", 0), ("inicio", 0), ("gpunlock", 1)):
        tmp = tempfile.mkdtemp()
        ff("-i", os.path.join(OUT, "video", n + ".mp4"), "-vf", "fps=15,scale=720:1280:flags=lanczos", os.path.join(tmp, "f%03d.png"))
        ims = [Image.open(f).convert("RGB") for f in sorted(glob.glob(os.path.join(tmp, "*.png")))]
        os.makedirs(os.path.join(OUT, "anim"), exist_ok=True)
        ims[0].save(os.path.join(OUT, "anim", n + ".webp"), "WEBP", save_all=True, append_images=ims[1:],
                    duration=67, loop=loop, quality=62, method=4)
        shutil.rmtree(tmp)


def logos():
    for out, src in LOGOS.items():
        im = trim(Image.open(os.path.join(SRC, "logos", src + ".png")).convert("RGBA"))
        save(im, f"logo/{out}.webp", maxdim=900, q=90)


def launcher():
    icon = Image.open(os.path.join(SRC, "logos", "icon_google_play.png")).convert("RGB")
    icon = icon.crop((0, 0, min(icon.size), min(icon.size)))
    res = os.path.join(ROOT, "demo", "android", "res")
    for folder, px in (("drawable-mdpi", 48), ("drawable-xxhdpi", 144), ("drawable-xxxhdpi", 192)):
        icon.resize((px, px), Image.LANCZOS).save(os.path.join(res, folder, "icon.png"), optimize=True)
    icon.resize((512, 512), Image.LANCZOS).save(os.path.join(ROOT, "demo", "android", "icon-512.png"), optimize=True)
    store = os.path.join(ROOT, "store")
    os.makedirs(store, exist_ok=True)
    icon.resize((512, 512), Image.LANCZOS).save(os.path.join(store, "icon_512.png"), optimize=True)
    # feature graphic 1024x500: key art on the right, the wide logo on the calm left side
    bg = Image.open(os.path.join(SRC, "store_feature_bg.jpg")).convert("RGB")
    bg = bg.resize((1024, int(bg.size[1] * 1024 / bg.size[0])), Image.LANCZOS)
    top = (bg.size[1] - 500) // 2
    bg = bg.crop((0, top, 1024, top + 500)).convert("RGBA")
    lg = trim(Image.open(os.path.join(SRC, "logos", "logo_full_color.png")).convert("RGBA"))
    lg.thumbnail((420, 400), Image.LANCZOS)
    bg.alpha_composite(lg, (60 + (420 - lg.size[0]) // 2, (500 - lg.size[1]) // 2))
    bg.convert("RGB").save(os.path.join(store, "feature_1024x500.png"), optimize=True)


def studio():
    """GPUnlock intro video (720p, no audio) and logos for the intro fallback and the credits."""
    src = os.path.join(ROOT, "gpunlock")
    vid = [f for f in os.listdir(src) if f.endswith(".mp4")][0]
    ff("-i", os.path.join(src, vid), "-vf", "scale=720:1280,format=yuv420p", "-an", "-c:v", "libx264", "-profile:v", "main",
       "-crf", "26", "-preset", "slow", "-movflags", "+faststart", os.path.join(OUT, "video", "gpunlock.mp4"))
    for out, f in (("gpunlock_color", "logo blanco.png"), ("gpunlock_wide", "Recurso 10.png")):
        save(trim(Image.open(os.path.join(src, f)).convert("RGBA")), f"logo/{out}.webp", maxdim=700, q=92)


if __name__ == "__main__":
    import sys
    os.makedirs(os.path.join(OUT, "video"), exist_ok=True)
    m = sheets(sys.argv[1:] or None)
    print(len(m), "pieces")
    if not sys.argv[1:]:
        names = lambda d: sorted(f[:-5] for f in os.listdir(os.path.join(OUT, d)) if f.endswith(".webp"))
        with open(os.path.join(ROOT, "demo", "js", "newmanifest.js"), "w") as fh:
            fh.write("// Generated by tools/build_brand.py\n")
            fh.write(f"export const BRAND_ICONS = {json.dumps(names('icons'))};\n")
            fh.write(f"export const PW_FILES = {json.dumps(['pw/' + n for n in names('pw')] + ['fx/' + n for n in names('fx')])};\n")
            fh.write(f"export const PLAQUES = {json.dumps(names('plaques'))};\n")
    if not sys.argv[1:]:
        backgrounds(); videos(); logos(); launcher(); studio(); anims()
        drop_videos()
        print("backgrounds, videos, logos, launcher icon: ok")
