"""Extract game-ready assets for the ZNAKEX web demo from the design sheets.

Run from the repository root:  python3 demo/tools/build_assets.py
Requires Pillow. Output goes to demo/assets/.
"""
import os
from PIL import Image, ImageFilter

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
OUT = os.path.join(ROOT, "demo", "assets")


def src(*p):
    return os.path.join(ROOT, *p)


def out(*p):
    path = os.path.join(OUT, *p)
    os.makedirs(os.path.dirname(path), exist_ok=True)
    return path


def crop(img, box, inset=0):
    """box = (y, x, w, h) as produced by the detection pass."""
    y, x, w, h = box
    return img.crop((x + inset, y + inset, x + w - inset, y + h - inset))


def remove_magenta(img, soft=True):
    """Turn the #FF00FF sheet background into transparency."""
    img = img.convert("RGBA")
    px = img.load()
    w, h = img.size
    for j in range(h):
        for i in range(w):
            r, g, b, a = px[i, j]
            # distance to pure magenta
            d = abs(r - 255) + g + abs(b - 255)
            if d < 150:
                px[i, j] = (r, g, b, 0)
            elif soft and d < 260:
                k = (d - 150) / 110.0
                # de-fringe: pull the pink spill towards neutral
                g2 = max(g, int((r + b) / 2 * 0.55))
                px[i, j] = (int(r * 0.9), g2, int(b * 0.8), int(255 * k))
    return img


def save_png(img, path, size=None):
    if size:
        img = img.resize(size, Image.LANCZOS)
    img.save(out(path), optimize=True)


def save_jpg(img, path, size=None, q=86):
    img = img.convert("RGB")
    if size:
        img = img.resize(size, Image.LANCZOS)
    img.save(out(path), quality=q, optimize=True, progressive=True)


# ---------------------------------------------------------------- arenas
DUEL = src("MAPAS", "magnific_create-a-gameready-map-mo_ksiksal16B.png")
GLADE = src("MAPAS", "magnific_create-a-gameready-map-mo_nVanVl6YQD.png")
COURT = src("MAPAS", "magnific_create-a-gameready-map-mo_rgRrgTbxtc.png")

TILE = 192  # stored floor tile size (px)


def arenas():
    d = Image.open(DUEL).convert("RGB")
    for i, x in enumerate([55, 328, 606, 888]):
        save_jpg(crop(d, (92, x, 240, 240), 6), f"tiles/ritual/floor{i}.jpg", (TILE, TILE))
    save_png(remove_magenta(crop(d, (411, 55, 433, 401))), "tiles/ritual/sigil.png", (400, 370))
    save_png(remove_magenta(crop(d, (411, 533, 434, 401))), "tiles/ritual/sigil_glow.png", (400, 370))
    save_png(remove_magenta(crop(d, (889, 55, 241, 181))), "tiles/ritual/wall_h.png")
    save_png(remove_magenta(crop(d, (889, 354, 179, 181))), "tiles/ritual/wall_v.png")
    save_png(remove_magenta(crop(d, (889, 591, 227, 181))), "tiles/ritual/wall_corner.png")
    save_png(remove_magenta(crop(d, (881, 873, 241, 189))), "tiles/ritual/wall_torch_amber.png")
    save_png(remove_magenta(crop(d, (885, 1154, 240, 185))), "tiles/ritual/wall_torch_crimson.png")
    save_png(remove_magenta(crop(d, (1149, 55, 178, 181))), "tiles/ritual/pillar.png")
    save_png(remove_magenta(crop(d, (1150, 314, 257, 180))), "tiles/ritual/column.png")
    save_png(remove_magenta(crop(d, (1150, 646, 176, 180))), "tiles/ritual/totem.png")
    for i, x in enumerate([55, 330, 605, 879, 1154]):
        save_png(remove_magenta(crop(d, (1405, x, 241, 234), 4)), f"tiles/ritual/spawn{i}.png", (160, 156))

    g = Image.open(GLADE).convert("RGB")
    for i, x in enumerate([57, 330, 604, 877]):
        save_jpg(crop(g, (62, x, 243, 244), 6), f"tiles/glade/floor{i}.jpg", (TILE, TILE))
    for i, x in enumerate([58, 332, 606, 881]):
        save_png(remove_magenta(crop(g, (1058, x, 243, 240), 4)), f"tiles/glade/deco{i}.png", (160, 160))
    for i, x in enumerate([58, 332, 606]):
        save_png(remove_magenta(crop(g, (1378, x, 243, 240), 4)), f"tiles/glade/rune{i}.png", (160, 160))

    c = Image.open(COURT).convert("RGB")
    for i, x in enumerate([50, 399, 748, 1102]):
        save_jpg(crop(c, (56, x, 312, 312), 6), f"tiles/court/floor{i}.jpg", (TILE, TILE))
    save_png(remove_magenta(crop(c, (413, 50, 218, 229))), "tiles/court/wall_h.png")
    save_png(remove_magenta(crop(c, (410, 303, 161, 232))), "tiles/court/wall_v.png")
    save_png(remove_magenta(crop(c, (409, 542, 236, 238))), "tiles/court/wall_corner.png")
    save_png(remove_magenta(crop(c, (411, 1047, 175, 236))), "tiles/court/wall_rune.png")
    save_png(remove_magenta(crop(c, (404, 1255, 231, 243))), "tiles/court/wall_ivy.png")
    save_png(remove_magenta(crop(c, (692, 49, 427, 438))), "tiles/court/statue.png", (300, 308))
    for i, (y, x, w, h) in enumerate([(692, 514, 233, 264), (692, 758, 232, 264), (692, 1006, 232, 264),
                                       (692, 1254, 233, 264), (998, 636, 268, 268), (998, 944, 267, 268),
                                       (998, 1251, 235, 268)]):
        save_png(remove_magenta(crop(c, (y, x, w, h), 6)), f"tiles/court/deco{i}.png")
    save_png(remove_magenta(crop(c, (1306, 50, 281, 284), 4)), "tiles/court/rune0.png", (160, 160))
    save_png(remove_magenta(crop(c, (1306, 388, 304, 284), 4)), "tiles/court/rune1.png", (160, 160))

    # mode card thumbnails: the assembled board previews of each sheet
    save_jpg(crop(c, (53, 1525, 955, 1535), 14), "modes/classic.jpg", (480, 772))
    save_jpg(crop(g, (65, 1356, 1172, 1550), 14), "modes/frenzy.jpg", (480, 635))
    save_jpg(crop(d, (91, 1496, 977, 1548), 14), "modes/duel.jpg", (480, 760))


# ---------------------------------------------------------------- UI kit
KIT = src("Pantallas", "magnific_using-the-exact-style-of-_790wgBAJAL.png")

ICON_ROWS = {
    132: [(23, "coin"), (115, "coins"), (391, "orb_red"), (483, "orb_gold"), (575, "x2"), (666, "x3")],
    265: [(23, "mode_story", 109), (145, "mode_classic", 109), (268, "mode_frenzy", 109),
          (391, "mode_duel", 109), (514, "mode_spin", 109), (637, "mode_leaderboard", 108)],
    441: [(23, "hz_log"), (115, "hz_pillar"), (207, "hz_mud"), (299, "hz_quicksand"),
          (391, "hz_bridge"), (483, "hz_ice"), (575, "hz_portal"), (666, "hz_spores")],
    545: [(23, "hz_lava"), (115, "hz_wind"), (207, "hz_spikes"), (299, "hz_block"),
          (391, "hz_dark"), (483, "hz_skull"), (575, "hz_void"), (666, "hz_temple")],
    692: [(23, "modes"), (115, "maps"), (207, "home"), (299, "skins"), (391, "settings"),
          (483, "shop"), (575, "pause"), (666, "play")],
    793: [(23, "retry"), (115, "levels"), (207, "quit"), (299, "ad"), (391, "lock"),
          (483, "check"), (575, "close"), (666, "back")],
}


def ui_kit():
    k = Image.open(KIT).convert("RGB")
    for y, items in ICON_ROWS.items():
        for it in items:
            x, name = it[0], it[1]
            w = it[2] if len(it) > 2 else 79
            h = 79 if w == 79 else 92
            save_png(k.crop((x, y, x + w, y + h)), f"ui/icons/{name}.png")
    # level nodes
    save_png(k.crop((23, 932, 173, 1062)), "ui/nodes/cleared.png")
    save_png(k.crop((197, 932, 347, 1062)), "ui/nodes/current.png")
    save_png(k.crop((372, 932, 521, 1062)), "ui/nodes/locked.png")
    save_png(k.crop((547, 932, 746, 1062)), "ui/nodes/guardian.png")


# ---------------------------------------------------------------- art
SPLASH = src("Pantallas", "magnific_design-the-splash-loading_w4cULN57EI.png")
LOGO = src("ZNAKEZ", "logos", "logo blanco.png")

MAP_SHEETS = [
    "magnific_create-a-professional-2d-_1l3qAOdr4r.png",
    "magnific_create-a-professional-2d-_5jNQ951Kxe.png",
    "magnific_create-a-professional-2d-_Eb7hyRHuuO.png",
    "magnific_create-a-professional-2d-_KL6F69ckqp.png",
    "magnific_create-a-professional-2d-_LwAkZXqswO.png",
    "magnific_create-a-professional-2d-_LwAkng6swO.png",
    "magnific_create-a-professional-2d-_P3DwM6Y42C.png",
    "magnific_create-a-professional-2d-_P3DwVDh42C.png",
    "magnific_create-a-professional-2d-_P3DwWh142C.png",
    "magnific_create-a-professional-2d-_WDCACLocXe.png",
    "magnific_create-a-professional-2d-_WDCAmAlcXe.png",
    "magnific_create-a-professional-2d-_ksiHALK16B.png",
    "magnific_create-a-professional-2d-_lJzrYyugv9.png",
    "magnific_create-a-professional-2d-_nVaZuuoYQD.png",
    "magnific_create-a-professional-2d-_xSZ5AdVjfW.png",
    "magnific_create-a-professional-2d-_xSZ5zXgjfW.png",
]

# key-art box (x0, y0, x1, y1) inside each 1264x848 map sheet
MAP_KEYART = {
    0: (20, 45, 800, 370), 1: (50, 95, 510, 315), 2: (20, 45, 800, 295), 3: (20, 45, 800, 280),
    4: (20, 45, 800, 222), 5: (30, 60, 800, 285), 6: (20, 45, 800, 320), 7: (20, 45, 800, 252),
    8: (20, 45, 800, 238), 9: (20, 45, 600, 280), 10: (20, 45, 800, 208), 11: (330, 45, 1000, 285),
    12: (20, 45, 800, 360), 13: (20, 45, 700, 293), 14: (20, 45, 800, 260), 15: (20, 45, 800, 233),
}


def art():
    s = Image.open(SPLASH).convert("RGB")
    save_jpg(s, "bg/splash.jpg", (1080, 1935), q=88)
    # menu background: same art, without the painted loading panel
    save_jpg(s.crop((0, 0, 768, 1180)), "bg/menu.jpg", (1080, 1660), q=86)
    blurred = s.resize((270, 484), Image.LANCZOS).filter(ImageFilter.GaussianBlur(6))
    save_jpg(blurred, "bg/blur.jpg", (540, 968), q=80)
    Image.open(LOGO).save(out("ui/logo.png"), optimize=True)
    for i, name in enumerate(MAP_SHEETS):
        m = Image.open(src("MAPAS", name)).convert("RGB")
        k = m.crop(MAP_KEYART[i])
        save_jpg(k, f"maps/key{i:02d}.jpg", (720, int(720 * k.size[1] / k.size[0])), q=84)


# ---------------------------------------------------------------- skins
SKINS = {
    # id: (file, (x0, y0, x1, y1)) shop-icon crop inside the sheet
    "basica": ("BASICA.png", (1950, 1372, 2142, 1564)),
    "forest": ("magnific_07-forest-guardian-rarity_xSZ5QK1jfW.jpg", (796, 606, 960, 770)),
    "scorpion": ("magnific_13-desert-scorpion-rarity_xSZ5KyDjfW.jpg", (1079, 532, 1229, 682)),
    "inferno": ("magnific_02-inferno-serpent-rarity_rgRba4yxtc.jpg", (872, 636, 1014, 778)),
    "sakura": ("magnific_12-sakura-spirit-rarity-e_lJzrry0gv9.jpg", (896, 664, 1030, 798)),
    "toxic": ("magnific_11-toxic-mutant-rarity-ep_1l3qFk1r4r.jpg", (884, 655, 1028, 792)),
    "frost": ("magnific_03-frostbite-dragon-rarit_dtKVGvZXSL.jpg", (856, 652, 1010, 806)),
    "cyber": ("magnific_06-cyber-snake-rarity-leg_dtKVn0sXSL.jpg", (1018, 395, 1215, 592)),
    "cosmic": ("magnific_14-cosmic-void-rarity-myt_u5Jva6MQLD.jpg", (746, 622, 920, 798)),
    "kitsune": ("magnific_void-kitsune-rarity-mythi_P3D79Nh42C.jpg", (1069, 355, 1228, 514)),
}


def skins():
    for sid, (f, box) in SKINS.items():
        im = Image.open(src("SKINS", f)).convert("RGB")
        save_jpg(im.crop(box), f"skins/{sid}.jpg", (256, 256), q=88)


if __name__ == "__main__":
    arenas()
    ui_kit()
    art()
    skins()
    print("assets written to", OUT)


# ---------------------------------------------------------------- frames (9-slice)
KIT1 = src("Pantallas", "magnific_using-the-exact-forest-re_w4clBuQ7EI.png")

FRAMES = {
    "panel": (1126, 69, 426, 223),
    "card": (1116, 762, 326, 238),
    "slot": (1152, 542, 177, 182),
    "plate": (1385, 64, 438, 137),
    "btn": (923, 450, 347, 142),
    "btn_gold": (739, 448, 352, 159),
    "divider": (1566, 543, 211, 41),
}


def frames():
    k = Image.open(KIT1).convert("RGBA")
    for name, (y, x, w, h) in FRAMES.items():
        c = k.crop((x, y, x + w, y + h))
        # pure-black sheet background becomes transparent
        px = c.load()
        for j in range(c.size[1]):
            for i in range(c.size[0]):
                r, g, b, a = px[i, j]
                m = max(r, g, b)
                if m < 14:
                    px[i, j] = (r, g, b, 0)
                elif m < 40:
                    px[i, j] = (r, g, b, int(255 * (m - 14) / 26))
        c.save(out(f"ui/frames/{name}.png"), optimize=True)


def grunge():
    """Tileable worn-paint alpha mask for distressed titles."""
    import random
    random.seed(7)
    n = 256
    im = Image.new("L", (n, n), 255)
    px = im.load()
    for _ in range(2600):
        x, y = random.randrange(n), random.randrange(n)
        r = random.choice([0, 0, 0, 1, 1, 2])
        v = random.randint(0, 120)
        for dy in range(-r, r + 1):
            for dx in range(-r, r + 1):
                px[(x + dx) % n, (y + dy) % n] = v
    for _ in range(40):  # scratches
        x, y = random.randrange(n), random.randrange(n)
        L = random.randint(8, 30)
        ang = random.uniform(-0.6, 0.6)
        for t in range(L):
            xx = int(x + t) % n
            yy = int(y + t * ang) % n
            px[xx, yy] = random.randint(60, 160)
    im = im.filter(ImageFilter.GaussianBlur(0.4))
    rgba = Image.new("RGBA", (n, n), (255, 255, 255, 255))
    rgba.putalpha(im)
    rgba.save(out("ui/grunge.png"), optimize=True)


if __name__ == "__main__":
    frames()
    grunge()


def frame_parts():
    fr = os.path.join(OUT, "ui", "frames")
    panel = Image.open(os.path.join(fr, "panel.png"))
    panel.crop((0, 0, 64, 64)).save(out("ui/frames/corner.png"))
    card = Image.open(os.path.join(fr, "card.png"))
    card.crop((0, 0, 78, 78)).save(out("ui/frames/corner_leaf.png"))
    # gold button without the painted "PLAY" word
    g = Image.open(os.path.join(fr, "btn_gold.png"))
    w, h = g.size
    src_strip = g.crop((46, 0, 96, h))
    x = 96
    while x < w - 96:
        g.paste(src_strip, (x, 0))
        x += 50
    g.paste(Image.open(os.path.join(fr, "btn_gold.png")).crop((w - 96, 0, w, h)), (w - 96, 0))
    g.save(out("ui/frames/btn_gold_blank.png"))


if __name__ == "__main__":
    frame_parts()


def corners():
    fr = os.path.join(OUT, "ui", "frames")
    for name in ["corner", "corner_leaf"]:
        c = Image.open(os.path.join(fr, f"{name}.png"))
        c.save(out(f"ui/frames/{name}_tl.png"))
        c.transpose(Image.FLIP_LEFT_RIGHT).save(out(f"ui/frames/{name}_tr.png"))
        c.transpose(Image.FLIP_TOP_BOTTOM).save(out(f"ui/frames/{name}_bl.png"))
        c.transpose(Image.ROTATE_180).save(out(f"ui/frames/{name}_br.png"))


if __name__ == "__main__":
    corners()


def panel9():
    """Panel frame without the top-centre ornament, ready for CSS border-image."""
    fr = os.path.join(OUT, "ui", "frames")
    p = Image.open(os.path.join(fr, "panel.png"))
    w, h = p.size
    col = p.crop((90, 0, 91, 48))
    for x in range(110, w - 110):
        p.paste(col, (x, 0))
    p.paste(Image.open(os.path.join(fr, "panel.png")).crop((w - 110, 0, w, 48)), (w - 110, 0))
    p.save(out("ui/frames/panel9.png"))


if __name__ == "__main__":
    panel9()


def key_background(path, tol=34, soft=26):
    """Make the flat tile background of a decoration transparent (keyed on the corner colour)."""
    im = Image.open(path).convert("RGBA")
    w, h = im.size
    px = im.load()
    samples = [px[3, 3], px[w - 4, 3], px[3, h - 4], px[w - 4, h - 4]]
    br = sum(s[0] for s in samples) / 4
    bg_ = sum(s[1] for s in samples) / 4
    bb = sum(s[2] for s in samples) / 4
    for j in range(h):
        for i in range(w):
            r, g, b, a = px[i, j]
            d = abs(r - br) + abs(g - bg_) + abs(b - bb)
            if d < tol:
                px[i, j] = (r, g, b, 0)
            elif d < tol + soft:
                px[i, j] = (r, g, b, int(a * (d - tol) / soft))
    # fade the edges so nothing square survives
    for j in range(h):
        for i in range(w):
            e = min(i, j, w - 1 - i, h - 1 - j)
            if e < 10:
                r, g, b, a = px[i, j]
                px[i, j] = (r, g, b, int(a * e / 10))
    im.save(path)


def key_decos():
    for f in ["ritual/pillar.png", "ritual/column.png", "ritual/totem.png","court/deco0.png", "court/deco1.png", "court/deco2.png", "court/deco3.png", "court/deco4.png",
              "court/deco5.png", "court/deco6.png", "glade/deco0.png", "glade/deco1.png", "glade/deco2.png",
              "glade/deco3.png", "court/rune0.png", "court/rune1.png", "glade/rune0.png", "glade/rune1.png", "glade/rune2.png"]:
        key_background(os.path.join(OUT, "tiles", f))


if __name__ == "__main__":
    key_decos()


def cut_obstacles():
    """Remove the dark tile square behind obstacle sprites: flood-fill the dark
    background from the tile edges; the light outline of the object stops it."""
    import numpy as np
    from scipy import ndimage
    for f in ["pillar", "column", "totem"]:
        path = os.path.join(OUT, "tiles", "ritual", f + ".png")
        # start again from the untouched sheet crop
        d = Image.open(DUEL).convert("RGB")
        box = {"pillar": (1149, 55, 178, 181), "column": (1150, 314, 257, 180), "totem": (1150, 646, 176, 180)}[f]
        im = remove_magenta(crop(d, box)).convert("RGBA")
        a = np.asarray(im).astype(np.int32)
        lum = a[:, :, :3].mean(axis=2)
        h, w = lum.shape
        inset = 8
        # the object has a light cream outline: close it and fill the inside
        edge = lum < 28  # dark ink outline
        edge[:inset, :] = edge[-inset:, :] = False
        edge[:, :inset] = edge[:, -inset:] = False
        edge = ndimage.binary_closing(ndimage.binary_dilation(edge, iterations=1), iterations=3)
        obj = ndimage.binary_fill_holes(edge)
        lab, n = ndimage.label(obj)
        if n > 1:
            sizes = ndimage.sum(obj, lab, range(1, n + 1))
            obj = lab == (1 + int(np.argmax(sizes)))
        bg = ~obj
        alpha = np.where(bg, 0, 255).astype(np.uint8)
        alpha = np.asarray(Image.fromarray(alpha).filter(ImageFilter.GaussianBlur(0.8)))
        out_im = np.asarray(im).copy()
        out_im[:, :, 3] = alpha
        Image.fromarray(out_im).save(path)


if __name__ == "__main__":
    cut_obstacles()


# Basic skin colour variants: (id, target hue 0-360 or None, saturation k, value k)
BASIC_VARIANTS = [
    ("basica_rojo", 2, 1.1, 1.0), ("basica_azul", 212, 1.0, 1.0), ("basica_amarillo", 48, 1.2, 1.12),
    ("basica_morado", 275, 0.95, 1.0), ("basica_naranja", 24, 1.25, 1.05), ("basica_rosa", 330, 0.8, 1.12),
    ("basica_turquesa", 172, 1.0, 1.0), ("basica_negro", None, 0.0, 0.42), ("basica_blanco", None, 0.0, 1.35),
]


def basic_variants():
    import colorsys
    base = Image.open(os.path.join(OUT, "skins", "basica.jpg")).convert("RGB")
    src_hue = 77 / 360.0  # the basic snake green
    for sid, hue, sk, vk in BASIC_VARIANTS:
        im = base.copy()
        px = im.load()
        w, h = im.size
        for j in range(h):
            for i in range(w):
                r, g, b = [c / 255.0 for c in px[i, j]]
                hh, s, v = colorsys.rgb_to_hsv(r, g, b)
                if s > 0.12:
                    if hue is None:
                        s = 0.0
                    else:
                        hh = (hh - src_hue + hue / 360.0) % 1.0
                        s = min(1.0, s * sk)
                    v = min(1.0, v * vk if v > 0.18 else v)
                r, g, b = colorsys.hsv_to_rgb(hh, s, v)
                px[i, j] = (int(r * 255), int(g * 255), int(b * 255))
        im.save(out(f"skins/{sid}.jpg"), quality=88)


if __name__ == "__main__":
    basic_variants()


def round_sigils():
    """Fade the square tile behind the ritual sigil into a soft circle."""
    for f in ["sigil.png", "sigil_glow.png"]:
        path = os.path.join(OUT, "tiles", "ritual", f)
        im = Image.open(path).convert("RGBA")
        w, h = im.size
        mask = Image.new("L", (w, h), 0)
        from PIL import ImageDraw
        ImageDraw.Draw(mask).ellipse((w * 0.05, h * 0.03, w * 0.95, h * 0.97), fill=255)
        mask = mask.filter(ImageFilter.GaussianBlur(w * 0.03))
        a = im.getchannel("A")
        from PIL import ImageChops
        im.putalpha(ImageChops.multiply(a, mask))
        im.save(path)


if __name__ == "__main__":
    round_sigils()
