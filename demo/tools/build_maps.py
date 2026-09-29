"""Extract per-map elements (ground, walls, obstacles, hazards) from the 16 map sheets.

Every entry of PICKS is an approximate point (x, y) in sheet space (1264x848)
that lies inside the wanted element; the extractor finds the element around it.
Run from the repo root:  python3 demo/tools/build_maps.py
Writes demo/assets/mx/<NN>/*.png|jpg and demo/js/mapmanifest.js
"""
import json
import os
import sys

import numpy as np
from PIL import Image, ImageFilter
from scipy import ndimage

sys.path.insert(0, os.path.dirname(__file__))
import build_assets as B  # noqa: E402

ROOT = B.ROOT
OUT = os.path.join(ROOT, "demo", "assets", "mx")

# sheet index (order of B.MAP_SHEETS) for each story map id
SHEET_OF_MAP = {1: 8, 2: 0, 3: 6, 4: 3, 5: 10, 6: 5, 7: 7, 8: 14, 9: 1, 10: 4, 11: 13, 12: 9, 13: 12, 14: 2, 15: 15, 16: 11}

# role -> list of points. floor*: tiles, feat/edge: terrain tiles, wall/corner/inner/cap: frame pieces,
# obs: obstacle sprites, haz: hazard sprites, portal: portal sprite, bridge: bridge sprite
PICKS = {
    1: dict(floor=[(275, 318), (377, 318), (176, 318), (74, 318)], feat=(580, 318), edge=(682, 318),
            wall=(120, 430), corner=(508, 428), inner=(650, 428), cap=(782, 428),
            obs=[(88, 535), (222, 538), (365, 535), (503, 540), (640, 538), (775, 538)],
            haz=[(410, 662), (68, 660), (168, 660)], portal=(625, 655), slow=(478, 318)),
    2: dict(floor=[(141, 468), (364, 468), (66, 468), (141, 468)], feat=(437, 468), edge=(515, 468),
            wall=(710, 466), corner=(1032, 466), inner=(1122, 466), cap=(1204, 466),
            obs=[(75, 578), (170, 578), (258, 585), (426, 585), (517, 580), (592, 585)],
            haz=[(700, 585), (987, 580)], portal=(1072, 580), bridge=(908, 580)),
    3: dict(floor=[(66, 414), (155, 414), (432, 414), (340, 414)], feat=(526, 414), edge=(618, 414),
            wall=(730, 490), corner=(1038, 490), inner=(1135, 490), cap=(1210, 490),
            obs=[(66, 625), (155, 620), (243, 625), (334, 622), (518, 625), (612, 622)],
            haz=[(726, 625), (820, 625), (990, 625)], portal=(1090, 625)),
    4: dict(floor=[(172, 358), (66, 358), (273, 358), (378, 358)], feat=(589, 358), edge=(695, 358),
            wall=(168, 485), corner=(376, 485), inner=(482, 485), cap=(576, 485),
            obs=[(66, 615), (168, 622), (272, 617), (376, 622), (480, 620), (568, 617)],
            haz=[(694, 485), (999, 487), (897, 487)], portal=(1084, 487), slow=(484, 358)),
    5: dict(floor=[(60, 300), (158, 300), (257, 300), (448, 300)], feat=(544, 300), edge=(642, 300),
            wall=(120, 410), corner=(640, 420), inner=(743, 420), cap=(833, 420),
            obs=[(60, 520), (152, 530), (268, 525), (359, 523), (466, 527), (568, 527), (672, 522)],
            haz=[(268, 650), (474, 648), (159, 648)], portal=(785, 648), slow=(575, 648)),
    6: dict(floor=[(68, 378), (167, 378), (462, 378), (266, 378)], feat=(560, 378), edge=(658, 378),
            wall=(72, 495), corner=(407, 495), inner=(509, 495), cap=(596, 495),
            obs=[(68, 630), (155, 635), (243, 630), (330, 632), (420, 632), (510, 632), (598, 632)],
            haz=[(700, 625), (803, 628), (890, 625)], portal=(1036, 628), slow=(363, 378)),
    7: dict(floor=[(70, 345), (170, 345), (250, 345), (345, 345)], feat=(710, 345), edge=(620, 345), ice=(435, 345),
            wall=(68, 470), corner=(418, 470), inner=(490, 470), cap=(581, 462),
            obs=[(690, 470), (785, 470), (843, 470), (925, 468), (1010, 470), (1103, 470)],
            haz=[(365, 590), (475, 590), (270, 590)], portal=None),
    8: dict(floor=[(64, 358), (168, 358), (272, 358), (480, 358)], feat=(582, 358), edge=(686, 358),
            wall=(64, 482), corner=(376, 482), inner=(478, 482), cap=(581, 480),
            obs=[(68, 595), (170, 587), (274, 595), (376, 590), (479, 590), (581, 583)],
            haz=[(707, 555), (797, 535), (1004, 553)], portal=(1080, 552)),
    9: dict(trim={'portal': 20, 'obs1': 34}, floor=[(573, 133), (664, 133), (753, 133), (843, 133)], feat=(753, 248), edge=(664, 248),
            wall=(573, 395), corner=(1004, 395), inner=(1103, 395), cap=(1200, 395),
            obs=[(66, 522), (163, 522), (265, 524), (365, 522), (462, 524), (782, 522)],
            haz=[(676, 522), (900, 520)], portal=(1017, 520)),
    10: dict(floor=[(62, 320), (152, 320), (340, 320), (433, 320)], feat=(622, 320), edge=(713, 320),
             wall=(165, 440), corner=(400, 447), inner=(490, 447), cap=(569, 447),
             obs=[(664, 465), (735, 463), (827, 465), (917, 465), (1009, 465), (1101, 465), (1201, 463)],
             haz=[(65, 585), (445, 585), (911, 583)], portal=(1000, 585)),
    11: dict(trim={'wall': 16}, floor=[(66, 392), (166, 392), (266, 392), (467, 392)], feat=(568, 392), edge=(668, 392),
             wall=(66, 525), corner=(470, 525), inner=(566, 525), cap=(665, 525),
             obs=[(66, 640), (166, 640), (265, 645), (362, 645), (464, 642), (562, 645)],
             haz=[(66, 768), (262, 770), (164, 770)], portal=(470, 770), bridge=(365, 525)),
    12: dict(floor=[(66, 378), (168, 378), (272, 378), (476, 378)], feat=(684, 378), edge=None,
             wall=(66, 500), corner=(472, 500), inner=(573, 500), cap=(640, 500),
             obs=[(738, 500), (825, 505), (932, 500), (1010, 500), (1121, 500), (1215, 500)],
             haz=[(349, 640), (490, 625), (595, 635)], portal=(892, 600)),
    13: dict(floor=[(172, 422), (273, 422), (172, 422), (273, 422)], feat=(683, 422), edge=(581, 422),
             wall=(890, 420), corner=(1098, 425), inner=None, cap=(1198, 420),
             obs=[(68, 540), (165, 540), (262, 535), (362, 545), (463, 545), (682, 545)],
             haz=[(68, 660), (274, 657), (172, 657)], portal=(468, 657), bridge=(582, 543)),
    14: dict(trim={'portal': 28}, floor=[(66, 385), (163, 385), (453, 385), (260, 385)], feat=(549, 385), edge=(646, 385),
             wall=(66, 505), corner=(386, 505), inner=(496, 505), cap=(591, 505),
             obs=[(66, 630), (168, 630), (265, 630), (369, 628), (473, 630), (575, 630)],
             haz=[(997, 518), (697, 520), (802, 530)], portal=(1097, 515)),
    15: dict(trim={'portal': 28, 'haz0': 16}, floor=[(76, 315), (172, 315), (268, 315), (470, 315)], feat=(571, 315), edge=(668, 315),
             wall=(198, 424), corner=(575, 424), inner=(675, 424), cap=(774, 424),
             obs=[(68, 528), (172, 522), (265, 525), (378, 525), (494, 527), (596, 527), (712, 522)],
             haz=[(68, 657), (250, 660), (155, 660)], portal=(500, 657), slow=(268, 315)),
    16: dict(trim={'obs5': 18, 'obs6': 12}, floor=None, feat=None, edge=None,
             wall=(218, 470), corner=(543, 462), inner=None, cap=(539, 552),
             obs=[(797, 468), (890, 470), (988, 470), (1090, 470), (1195, 468), (64, 560), (190, 560)],
             haz=[(312, 655), (78, 660), (443, 660)], portal=(873, 562)),
}


class Sheet:
    def __init__(self, idx):
        self.im = Image.open(B.src("MAPAS", B.MAP_SHEETS[idx])).convert("RGB")
        self.a = np.asarray(self.im).astype(np.int32)
        self.bg = np.median(self.a[828:848, :, :].reshape(-1, 3), axis=0)
        self.diff = np.abs(self.a - self.bg).sum(axis=2)

    def components(self, thr=50, close=1):
        m = self.diff > thr
        # drop label text before closing so words never glue to sprites
        raw, rn = ndimage.label(m)
        for k, sl in enumerate(ndimage.find_objects(raw), start=1):
            if sl is None:
                continue
            h, w = sl[0].stop - sl[0].start, sl[1].stop - sl[1].start
            if h <= 17 and w <= 24:
                m[sl][raw[sl] == k] = False
        m = ndimage.binary_closing(m, iterations=close)
        lab, n = ndimage.label(m)
        return lab, n

    def nearest_comp(self, lab, n, x, y, min_area=250, radius=40):
        """Component containing (x, y) or the closest big one within radius."""
        best, bd = 0, 1e9
        objs = ndimage.find_objects(lab)
        for k, s in enumerate(objs, start=1):
            if s is None:
                continue
            h = s[0].stop - s[0].start
            w = s[1].stop - s[1].start
            if w * h < min_area or w > 520 or h > 300 or h < 22:
                continue
            sub = lab[s] == k
            if sub.sum() < min_area * 0.5:
                continue
            if s[1].start - radius <= x <= s[1].stop + radius and s[0].start - radius <= y <= s[0].stop + radius:
                ys, xs = np.nonzero(sub)
                d = np.min(np.hypot(xs + s[1].start - x, ys + s[0].start - y))
                if d < bd:
                    best, bd = k, d
        return best if bd <= radius else 0


def sprite(sh, x, y, thr=50, maxdim=180, merge=False):
    lab, n = sh.components(thr)
    k = sh.nearest_comp(lab, n, x, y)
    if not k:
        return None
    objs = ndimage.find_objects(lab)
    s = objs[k - 1]
    y0, y1, x0, x1 = s[0].start, s[0].stop, s[1].start, s[1].stop
    keep = {k}
    # merge sibling parts (portal pairs, glows) that sit close to it and are big enough
    changed = merge
    while changed:
        changed = False
        for j, sj in enumerate(objs, start=1):
            if j in keep or sj is None:
                continue
            w, h = sj[1].stop - sj[1].start, sj[0].stop - sj[0].start
            if w * h < 500 or w > 300 or h < 26 or w < 26:
                continue
            if sj[1].start < x1 + 14 and sj[1].stop > x0 - 14 and sj[0].start < y1 + 6 and sj[0].stop > y0 - 6:
                keep.add(j)
                y0, y1 = min(y0, sj[0].start), max(y1, sj[0].stop)
                x0, x1 = min(x0, sj[1].start), max(x1, sj[1].stop)
                changed = True
    mask = np.isin(lab, list(keep))
    mask = ndimage.binary_fill_holes(ndimage.binary_dilation(mask, iterations=1))
    pad = 3
    y0, x0 = max(0, y0 - pad), max(0, x0 - pad)
    y1, x1 = min(sh.a.shape[0], y1 + pad), min(sh.a.shape[1], x1 + pad)
    rgb = sh.im.crop((x0, y0, x1, y1)).convert("RGBA")
    al = Image.fromarray((mask[y0:y1, x0:x1] * 255).astype(np.uint8)).filter(ImageFilter.GaussianBlur(0.7))
    rgb.putalpha(al)
    rgb = clean_sprite(rgb)
    if max(rgb.size) > maxdim:
        k2 = maxdim / max(rgb.size)
        rgb = rgb.resize((max(1, int(rgb.size[0] * k2)), max(1, int(rgb.size[1] * k2))), Image.LANCZOS)
    return rgb


def clean_sprite(img):
    """Drop a dark label band under the sprite and the flat dark panel behind it."""
    a = np.asarray(img).astype(np.int32)
    h, w, _ = a.shape
    al = a[:, :, 3] > 40
    cover = al.mean(axis=1)
    # label band: after a gap of empty rows near the bottom
    lim = int(h * 0.65)
    gap = None
    for r in range(h - 1, lim, -1):
        if cover[r] < 0.04 and cover[r - 1] < 0.04:
            gap = r
            break
    if gap is not None and gap > 24:
        img = img.crop((0, 0, w, gap))
        a = np.asarray(img).astype(np.int32)
        h = a.shape[0]
    # flat dark panel behind the sprite: flood-fill from the border
    border = np.concatenate([a[:3, :, :3].reshape(-1, 3), a[-3:, :, :3].reshape(-1, 3),
                             a[:, :3, :3].reshape(-1, 3), a[:, -3:, :3].reshape(-1, 3)])
    balpha = np.concatenate([a[:3, :, 3].ravel(), a[-3:, :, 3].ravel(), a[:, :3, 3].ravel(), a[:, -3:, 3].ravel()])
    solid = border[balpha > 200]
    if len(solid) > 30 and np.median(solid, axis=0).sum() < 300:
        k = B.knock_out(img.convert("RGB"), "tblr", 74 if np.median(solid, axis=0).sum() < 120 else 46)
        keep = np.minimum(np.asarray(img.getchannel("A")), np.asarray(k.getchannel("A")))
        img = img.copy()
        img.putalpha(Image.fromarray(keep.astype(np.uint8)))
    # keep only the main parts (drops leftover label fragments)
    al = np.asarray(img.getchannel("A")) > 40
    lab, n = ndimage.label(ndimage.binary_dilation(al, iterations=3))
    if n > 1:
        sizes = ndimage.sum(al, lab, range(1, n + 1))
        keep = [i + 1 for i, v in enumerate(sizes) if v >= 0.18 * sizes.max()]
        m = np.isin(lab, keep)
        a2 = np.asarray(img.getchannel("A")).copy()
        a2[~m] = 0
        img = img.copy()
        img.putalpha(Image.fromarray(a2))
    bb = img.getbbox()
    return img.crop(bb) if bb else img


def tile(sh, x, y, size=96):
    """Top-down ground tile around the point: square component or fixed crop."""
    lab, n = sh.components(34, 3)
    k = sh.nearest_comp(lab, n, x, y, min_area=1500, radius=24)
    if k:
        s = ndimage.find_objects(lab)[k - 1]
        y0, y1, x0, x1 = s[0].start, s[0].stop, s[1].start, s[1].stop
        w, h = x1 - x0, y1 - y0
        if 52 <= w <= 110 and 52 <= h <= 110 and abs(w - h) <= 16:
            side = min(w, h)
            x0 = x0 + (w - side) // 2   # top aligned: any label sits below the square
            ins = max(6, int(side * 0.13))
            t = sh.im.crop((x0 + ins, y0 + ins, x0 + side - ins, y0 + side - ins))
            return t.resize((size, size), Image.LANCZOS)
    half = 28
    t = sh.im.crop((x - half, y - half - 4, x + half, y + half - 4))
    return t.resize((size, size), Image.LANCZOS)


def trim_bottom(img, px):
    if not px:
        return img
    w, h = img.size
    img = img.crop((0, 0, w, max(8, h - px)))
    bb = img.getbbox()
    return img.crop(bb) if bb else img


def save(img, *p):
    path = os.path.join(OUT, *p)
    os.makedirs(os.path.dirname(path), exist_ok=True)
    if p[-1].endswith(".jpg"):
        img.convert("RGB").save(path, quality=88)
    else:
        img.save(path, optimize=True)


def strip_wall(img):
    """Long wall strips: keep a square-ish chunk from the middle."""
    w, h = img.size
    if w / h > 2.0:
        cw = int(h * 1.7)
        x0 = (w - cw) // 2
        img = img.crop((x0, 0, x0 + cw, h))
    return img


def build():
    manifest = {}
    for mid, sidx in SHEET_OF_MAP.items():
        P = PICKS[mid]
        sh = Sheet(sidx)
        nn = f"{mid:02d}"
        man = {"floor": 0, "obs": 0, "haz": 0}
        if P.get("floor"):
            for i, (x, y) in enumerate(P["floor"]):
                save(tile(sh, x, y), nn, f"floor{i}.jpg")
                man["floor"] = i + 1
        for role in ("feat", "edge", "slow", "ice"):
            if P.get(role):
                save(tile(sh, *P[role]), nn, f"{role}.jpg")
                man[role] = True
        for role in ("wall", "corner", "inner", "cap", "portal", "bridge"):
            if P.get(role):
                sp = sprite(sh, *P[role], thr=48, maxdim=220, merge=(role == 'portal'))
                if sp is None:
                    print("MISSING", mid, role)
                    continue
                sp = trim_bottom(sp, P.get("trim", {}).get(role))
                if role == "wall":
                    sp = strip_wall(sp)
                save(sp, nn, f"{role}.png")
                man[role] = True
        for i, (x, y) in enumerate(P.get("obs", [])):
            sp = sprite(sh, x, y, maxdim=170)
            if sp is None:
                print("MISSING", mid, "obs", i)
                continue
            sp = trim_bottom(sp, P.get("trim", {}).get(f"obs{man['obs']}"))
            save(sp, nn, f"obs{man['obs']}.png")
            man["obs"] += 1
        for i, (x, y) in enumerate(P.get("haz", [])):
            sp = sprite(sh, x, y, maxdim=150)
            if sp is None:
                print("MISSING", mid, "haz", i)
                continue
            sp = trim_bottom(sp, P.get("trim", {}).get(f"haz{man['haz']}"))
            save(sp, nn, f"haz{man['haz']}.png")
            man["haz"] += 1
        if mid == 16:
            man.update(cyber_terrain())
        manifest[mid] = man
        print(mid, man)
    js = "// Generated by tools/build_maps.py\nexport const MX = " + json.dumps(manifest, indent=1) + ";\n"
    with open(os.path.join(ROOT, "demo", "js", "mapmanifest.js"), "w") as f:
        f.write(js)


def cyber_terrain():
    """Cyber City has only isometric tiles in its sheet: paint top-down neon ground."""
    import random
    rnd = random.Random(16)
    def base(col, n=10):
        im = Image.new("RGB", (96, 96), col)
        px = im.load()
        for _ in range(500):
            x, y = rnd.randrange(96), rnd.randrange(96)
            d = rnd.randint(-n, n)
            r, g, b = px[x, y]
            px[x, y] = (max(0, r + d), max(0, g + d), max(0, b + d))
        return im.filter(ImageFilter.GaussianBlur(0.6))
    from PIL import ImageDraw
    t0 = base((26, 30, 44))
    t1 = base((22, 28, 46))
    d = ImageDraw.Draw(t1)
    for _ in range(4):
        y = rnd.randrange(10, 86)
        d.line([(0, y), (96, y + rnd.randint(-3, 3))], fill=(40, 60, 96), width=1)
    d.ellipse((20, 30, 78, 80), fill=(34, 40, 70))
    t1 = t1.filter(ImageFilter.GaussianBlur(1.2))
    t2 = base((22, 24, 40))
    d = ImageDraw.Draw(t2)
    for i in range(0, 97, 24):
        d.line([(i, 0), (i, 96)], fill=(120, 60, 190), width=1)
        d.line([(0, i), (96, i)], fill=(60, 140, 200), width=1)
    t3 = base((44, 48, 60))
    d = ImageDraw.Draw(t3)
    d.line([(0, 48), (96, 48)], fill=(30, 32, 44), width=2)
    d.line([(48, 0), (48, 96)], fill=(30, 32, 44), width=2)
    for i, t in enumerate([t0, t1, t2, t3]):
        save(t, "16", f"floor{i}.jpg")
    # energy channel
    f = Image.new("RGB", (96, 96))
    px = f.load()
    import math
    for y in range(96):
        for x in range(96):
            v = 0.5 + 0.5 * math.sin((x + y * 0.4) * 0.22) * math.sin(y * 0.17 + x * 0.05)
            px[x, y] = (int(10 + 20 * v), int(120 + 100 * v), int(170 + 70 * v))
    d = ImageDraw.Draw(f)
    for y in range(8, 96, 16):
        d.line([(0, y), (96, y)], fill=(180, 250, 255), width=1)
    save(f.filter(ImageFilter.GaussianBlur(0.5)), "16", "feat.jpg")
    save(f.filter(ImageFilter.GaussianBlur(0.5)), "16", "edge.jpg")
    return {"floor": 4, "feat": True, "edge": True}


if __name__ == "__main__":
    build()
