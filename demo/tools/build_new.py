"""Extracts the season map 17 (assets/mx/17) from the season sheet.  Run: python3 demo/tools/build_new.py
(The v0.4 power-ups, UI kit and banners it used to cut were replaced in v1.0 by tools/build_brand.py.)"""
import json
import os
import sys

import numpy as np
from PIL import Image, ImageFilter, ImageDraw
from scipy import ndimage

sys.path.insert(0, os.path.dirname(__file__))
import build_assets as B  # noqa: E402
import build_maps as M  # noqa: E402

ROOT = B.ROOT
ASSETS = os.path.join(ROOT, "demo", "assets")
NEW = os.path.join(ROOT, "Pantallas", "nuevos recursos")


def sheet(name):
    im = Image.open(os.path.join(NEW, name)).convert("RGB")
    k = im.size[0] / 1264.0
    return im, k


def crop(im, k, box):
    return im.crop(tuple(int(round(v * k)) for v in box))


def black_to_alpha(im, low=12):
    """Sprites drawn on pure black for additive blending -> RGBA (colour un-premultiplied)."""
    a = np.asarray(im.convert("RGB")).astype(np.float32)
    m = a.max(axis=2)
    alpha = np.clip((m - low) / (255.0 - low), 0, 1)
    rgb = np.where(alpha[..., None] > 0.01, a / np.maximum(alpha[..., None], 0.05), 0)
    rgb = np.clip(rgb, 0, 255)
    out = np.dstack([rgb, alpha * 255]).astype(np.uint8)
    img = Image.fromarray(out, "RGBA")
    bb = img.getchannel("A").point(lambda v: 255 if v > 14 else 0).getbbox()
    return img.crop(bb) if bb else img


def save(img, *p):
    path = os.path.join(ASSETS, *p)
    os.makedirs(os.path.dirname(path), exist_ok=True)
    img.save(path, optimize=True)


# --------------------------------------------------------------- season map 17
class SeasonSheet(M.Sheet):
    def __init__(self):
        self.im = Image.open(os.path.join(ROOT, "MAPAS", "season_harvest.jpg")).convert("RGB").resize((1264, 848), Image.LANCZOS)
        self.a = np.asarray(self.im).astype(np.int32)
        self.bg = np.median(self.a[828:848, :, :].reshape(-1, 3), axis=0)
        self.diff = np.abs(self.a - self.bg).sum(axis=2)


SEASON = dict(
    floors=[(618, 25, 746, 153), (774, 25, 900, 153), (935, 25, 1065, 153), (1093, 25, 1222, 153)],
    wall=(1093, 175, 1222, 298), corner=(774, 175, 900, 298),
    obs=[(122, 420), (235, 425), (342, 418), (431, 420), (548, 415), (680, 418), (783, 395), (878, 412), (1010, 395), (1160, 400)],
    haz=[(600, 600), (728, 600), (862, 600)], portal=(265, 590),
)


def tile_box(sh, box, size=96):
    x0, y0, x1, y1 = box
    ins = int((x1 - x0) * 0.13)
    t = sh.im.crop((x0 + ins, y0 + ins, x1 - ins, y1 - ins)).resize((size, size), Image.LANCZOS)
    # keep the ground calm so orbs, snake and obstacles stand out
    from PIL import ImageEnhance
    t = ImageEnhance.Contrast(t).enhance(0.5)
    t = ImageEnhance.Brightness(t).enhance(0.82)
    return t.filter(ImageFilter.GaussianBlur(0.8))


def dark_water(size=96):
    """The sheet has no water: paint dark teal cursed swamp water with drifting lantern glints."""
    import math
    f = Image.new("RGB", (size, size))
    px = f.load()
    for y in range(size):
        for x in range(size):
            v = 0.5 + 0.5 * math.sin((x + y * 0.5) * 0.19) * math.sin(y * 0.15 + x * 0.06)
            px[x, y] = (int(14 + 12 * v), int(52 + 40 * v), int(66 + 40 * v))
    d = ImageDraw.Draw(f)
    for y in range(10, size, 18):
        d.line([(0, y), (size, y + 2)], fill=(70, 130, 140), width=1)
    d.ellipse((60, 20, 72, 30), fill=(200, 150, 70))
    return f.filter(ImageFilter.GaussianBlur(0.9))


def season_map():
    sh = SeasonSheet()
    nn = "17"
    man = {"floor": 0, "obs": 0, "haz": 0}
    for i, b in enumerate(SEASON["floors"]):
        M.save(tile_box(sh, b), nn, f"floor{i}.jpg")
        man["floor"] = i + 1
    w = dark_water()
    M.save(w, nn, "feat.jpg")
    M.save(w, nn, "edge.jpg")
    man["feat"] = man["edge"] = True
    # frame pieces: the two tileable wall textures
    for role, box in (("wall", SEASON["wall"]), ("corner", SEASON["corner"])):
        x0, y0, x1, y1 = box
        M.save(sh.im.crop((x0 + 6, y0 + 6, x1 - 6, y1 - 6)).convert("RGBA"), nn, f"{role}.png")
        man[role] = True
    for x, y in SEASON["obs"]:
        sp = M.sprite(sh, x, y, maxdim=170)
        if sp is None:
            print("MISSING obs", x, y)
            continue
        M.save(sp, nn, f"obs{man['obs']}.png")
        man["obs"] += 1
    for x, y in SEASON["haz"]:
        sp = M.sprite(sh, x, y, maxdim=150)
        if sp is None:
            print("MISSING haz", x, y)
            continue
        M.save(sp, nn, f"haz{man['haz']}.png")
        man["haz"] += 1
    sp = M.sprite(sh, *SEASON["portal"], thr=48, maxdim=220, merge=True)
    if sp is not None:
        M.save(sp, nn, "portal.png")
        man["portal"] = True
    # key art: night hollow under the harvest moon (painted procedurally, tinted with the sheet palette)
    import random
    rnd = random.Random(17)
    Wd, Hd = 720, 1280
    yy, xx = np.mgrid[0:Hd, 0:Wd].astype(np.float32)
    t = yy / Hd
    top = np.array([34, 18, 44], np.float32); mid = np.array([120, 52, 34], np.float32); low = np.array([22, 14, 12], np.float32)
    col = np.where(t[..., None] < 0.55, top + (mid - top) * (t[..., None] / 0.55) ** 1.6, mid + (low - mid) * ((t[..., None] - 0.55) / 0.45))
    moon = np.exp(-(((xx - 470) / 210.0) ** 2 + ((yy - 250) / 210.0) ** 2))
    col += moon[..., None] * np.array([255, 205, 120], np.float32) * 0.55
    img = Image.fromarray(np.clip(col, 0, 255).astype(np.uint8))
    d = ImageDraw.Draw(img)
    d.ellipse((470 - 78, 250 - 78, 470 + 78, 250 + 78), fill=(250, 232, 178))
    d.ellipse((470 - 58, 250 - 60, 470 + 40, 250 + 30), fill=(244, 220, 160))
    # tree silhouettes
    for side in (0, 1):
        for i in range(4):
            x0 = (30 + i * 70 + rnd.randint(-15, 15)) if side == 0 else (Wd - 30 - i * 70 + rnd.randint(-15, 15))
            base = Hd + 20
            top_y = 250 + i * 120 + rnd.randint(-60, 60)
            w = 46 - i * 6
            d.polygon([(x0 - w, base), (x0 - w * 0.35, top_y), (x0 + w * 0.35, top_y), (x0 + w, base)], fill=(14, 9, 10))
            for br in range(6):
                by = top_y + br * 110 + rnd.randint(0, 40)
                dx = rnd.choice([-1, 1]) * rnd.randint(70, 170)
                d.line([(x0, by), (x0 + dx, by - rnd.randint(50, 120))], fill=(14, 9, 10), width=max(6, w // 3))
    # hanging lanterns and fireflies
    glow = Image.new("RGB", (Wd, Hd), (0, 0, 0))
    gd = ImageDraw.Draw(glow)
    for _ in range(26):
        x, y = rnd.randint(20, Wd - 20), rnd.randint(200, Hd - 100)
        r = rnd.randint(6, 16)
        gd.ellipse((x - r, y - r, x + r, y + r), fill=(255, 176, 70))
    glow = glow.filter(ImageFilter.GaussianBlur(9))
    key = Image.fromarray(np.clip(np.asarray(img).astype(np.float32) + np.asarray(glow).astype(np.float32) * 0.9, 0, 255).astype(np.uint8))
    # ground fog
    fog = np.clip((yy - Hd * 0.72) / (Hd * 0.28), 0, 1)[..., None] * np.array([60, 36, 28], np.float32)
    key = Image.fromarray(np.clip(np.asarray(key).astype(np.float32) + fog, 0, 255).astype(np.uint8)).filter(ImageFilter.GaussianBlur(1.2))
    os.makedirs(os.path.join(ASSETS, "maps"), exist_ok=True)
    key.save(os.path.join(ASSETS, "maps", "season1.jpg"), quality=88)
    # badge
    badge = sh.im.crop((1010, 610, 1240, 835)).convert("RGB")
    B_ = B.knock_out(badge, "tblr", 30)
    save(B_, "ui", "season_badge.png")
    # manifest
    p = os.path.join(ROOT, "demo", "js", "mapmanifest.js")
    txt = open(p).read()
    data = json.loads(txt[txt.index("{"):txt.rindex("}") + 1])
    data["17"] = man
    open(p, "w").write("// Generated by tools/build_maps.py + build_new.py\nexport const MX = " + json.dumps(data, indent=1) + ";\n")
    print("season map:", man)


if __name__ == "__main__":
    season_map()
