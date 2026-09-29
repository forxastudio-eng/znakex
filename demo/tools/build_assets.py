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


# ---------------------------------------------------------------- skin sprites (faithful to the sheets)
# Boxes are (x0, y0, x1, y1) in 1264x848 sheet space (BASICA is 2x and gets scaled).
# head: (box, snout direction) | body: (box, axis 'h'/'v') | tail: (box, tip direction)
SKIN_SPRITES = {
    "basica":   ("BASICA.png", ((28, 428, 122, 572), "up"), ((687, 440, 763, 495), "v"), ((1005, 398, 1065, 568), "down"), None),
    "inferno":  ("magnific_02-inferno-serpent-rarity_rgRba4yxtc.jpg", ((535, 165, 665, 300), "down"), ((545, 408, 655, 512), "h"), ((890, 410, 1032, 485), "right"), None),
    "frost":    ("magnific_03-frostbite-dragon-rarit_dtKVGvZXSL.jpg", ((45, 372, 172, 532), "down"), ((690, 395, 775, 505), "v"), ((990, 378, 1062, 528), "up"), None),
    "samurai":  ("magnific_04-samurai-serpent-rarity_4Rp7jbb9Aa.jpg", ((458, 82, 602, 258), "up"), ((75, 540, 300, 645), "h"), ((58, 685, 320, 752), "right"), (1055, 528, 1215, 688)),
    "ghost":    ("magnific_05-ghost-serpent-rarity-e_fHUtehKCDY.jpg", ((92, 468, 182, 602), "up"), ((474, 273, 548, 361), "h"), ((551, 438, 802, 528), "right"), (918, 635, 1062, 782)),
    "cyber":    ("magnific_06-cyber-snake-rarity-leg_dtKVn0sXSL.jpg", ((70, 138, 148, 278), "down"), ((440, 140, 650, 238), "h"), ((862, 146, 1025, 220), "right"), None),
    "forest":   ("magnific_07-forest-guardian-rarity_xSZ5QK1jfW.jpg", ((62, 248, 162, 385), "up"), ((470, 385, 600, 500), "h"), ((838, 402, 1018, 475), "right"), None),
    "crystal":  ("magnific_08-crystal-serpent-rarity_yiMUsXdPW9.jpg", ((310, 183, 428, 342), "up"), ((318, 455, 598, 555), "h"), ((92, 688, 198, 798), "down"), (1043, 438, 1208, 598)),
    "solar":    ("magnific_10-solar-serpent-rarity-m_rgRbFMgxtc.jpg", ((572, 182, 668, 300), "up"), ((520, 428, 695, 508), "h"), ((866, 436, 1034, 496), "right"), (848, 630, 1003, 785)),
    "toxic":    ("magnific_11-toxic-mutant-rarity-ep_1l3qFk1r4r.jpg", ((62, 388, 162, 528), "up"), ((62, 682, 205, 782), "h"), ((638, 688, 802, 780), "right"), None),
    "sakura":   ("magnific_12-sakura-spirit-rarity-e_lJzrry0gv9.jpg", ((743, 152, 812, 252), "up"), ((60, 394, 320, 492), "h"), ((46, 650, 355, 740), "right"), None),
    "scorpion": ("magnific_13-desert-scorpion-rarity_xSZ5KyDjfW.jpg", ((670, 142, 755, 248), "down"), ((75, 348, 400, 442), "h"), ((728, 354, 972, 428), "right"), None),
    "cosmic":   ("magnific_14-cosmic-void-rarity-myt_u5Jva6MQLD.jpg", ((66, 408, 142, 508), "up"), ((218, 410, 310, 516), "h"), ((874, 408, 928, 518), "down"), None),
    "abyssal":  ("magnific_15-abyssal-serpent-rarity_lJzrjY0gv9.jpg", ((588, 82, 702, 218), "down"), ((812, 105, 937, 195), "h"), ((1068, 368, 1205, 442), "right"), (788, 668, 918, 802)),
    "knight":   ("magnific_16-knight-serpent-rarity-_KL6FHHTkqp.jpg", ((962, 62, 1052, 172), "down"), ((95, 428, 180, 558), "h"), ((1060, 438, 1232, 544), "right"), (852, 683, 962, 798)),
    "mushroom": ("magnific_17-mushroom-witch-rarity-_lJzrLL6gv9.jpg", ((102, 282, 228, 422), "up"), ((75, 522, 295, 605), "h"), ((663, 525, 902, 603), "right"), (783, 700, 888, 805)),
    "vampire":  ("magnific_18-vampire-serpent-rarity_ovreIUB829.jpg", ((522, 162, 668, 338), "up"), ((100, 436, 430, 524), "h"), ((756, 438, 937, 522), "right"), (838, 640, 972, 775)),
    "quetzal":  ("magnific_create-a-professional-2d-_9Ze79lLNYZ.jpeg", ((612, 28, 794, 220), "down"), ((603, 476, 820, 552), "h"), ((1066, 478, 1232, 548), "right"), (855, 660, 958, 765)),
    "ember":    ("magnific_create-a-professional-2d-_LwAkUiDswO.png", ((488, 260, 618, 392), "up"), ((640, 470, 740, 585), "v"), ((962, 462, 1038, 592), "up"), (845, 675, 968, 800)),
    "umbra":    ("magnific_create-a-professional-2d-_tCLXuQdmZJ.jpeg", ((666, 52, 790, 222), "up"), ((674, 405, 762, 530), "v"), ((1002, 398, 1078, 538), "down"), (900, 678, 1025, 803)),
    "kitsune":  ("magnific_void-kitsune-rarity-mythi_P3D79Nh42C.jpg", ((608, 78, 732, 232), "down"), ((186, 485, 254, 605), "v"), ((502, 528, 562, 748), "down"), None),
}

HEAD_TOL = {"kitsune": 36}
ROT_TO_UP = {"up": None, "down": Image.ROTATE_180, "left": Image.ROTATE_270, "right": Image.ROTATE_90}
ROT_TO_RIGHT = {"right": None, "left": Image.ROTATE_180, "up": Image.ROTATE_270, "down": Image.ROTATE_90}


def sheet_image(fname):
    im = Image.open(src("SKINS", fname)).convert("RGB")
    if im.size[0] > 2000:
        im = im.resize((1264, 848), Image.LANCZOS)
    return im


def knock_out(im, sides="tblr", tol=46, force=False):
    """Flood-fill the flat panel background from the chosen crop borders."""
    import numpy as np
    from scipy import ndimage
    a = np.asarray(im.convert("RGB")).astype(np.int32)
    h, w, _ = a.shape
    border = []
    if "t" in sides: border.append(a[0:3, :, :].reshape(-1, 3))
    if "b" in sides: border.append(a[h - 3:h, :, :].reshape(-1, 3))
    if "l" in sides: border.append(a[:, 0:3, :].reshape(-1, 3))
    if "r" in sides: border.append(a[:, w - 3:w, :].reshape(-1, 3))
    bgc = np.median(np.concatenate(border), axis=0)
    if bgc.sum() < 120 and not force:  # near-black sheet: dark sprites must not be eaten by the fill
        tol = min(tol, 16)
    diff = np.abs(a - bgc).sum(axis=2)
    cand = diff < tol
    # cut hairline gaps in dark outlines so the fill cannot leak into dark sprites
    cand = ndimage.binary_opening(cand, iterations=1)
    seed = np.zeros((h, w), bool)
    if "t" in sides: seed[0, :] = True
    if "b" in sides: seed[h - 1, :] = True
    if "l" in sides: seed[:, 0] = True
    if "r" in sides: seed[:, w - 1] = True
    lab, n = ndimage.label(cand)
    keep = set(np.unique(lab[seed & cand])) - {0}
    bg = np.isin(lab, list(keep))
    bg = ndimage.binary_dilation(bg, iterations=1) & (diff < tol * 1.5)
    obj = ndimage.binary_fill_holes(~bg)
    bg = ~obj
    # soften: partial alpha for pixels close to the background colour next to it
    alpha = np.where(bg, 0, 255).astype(np.float32)
    near = (~bg) & (diff < tol * 1.8) & ndimage.binary_dilation(bg, iterations=2)
    alpha[near] = np.clip((diff[near] - tol) / (tol * 0.8), 0.15, 1) * 255
    al = Image.fromarray(alpha.astype(np.uint8)).filter(ImageFilter.GaussianBlur(0.6))
    out_im = im.convert("RGBA")
    out_im.putalpha(al)
    return out_im


def skin_sprites():
    os.makedirs(os.path.join(OUT, "skins2"), exist_ok=True)
    for sid, (fname, head, body, tail, icon_box) in SKIN_SPRITES.items():
        sh = Image.open(src("SKINS", fname)).convert("RGB")
        k = sh.size[0] / 1264.0  # BASICA is drawn at 2x: crop at full resolution
        sc = lambda b: tuple(int(round(v * k)) for v in b)
        head = (sc(head[0]), head[1])
        body = (sc(body[0]), body[1])
        tail = (sc(tail[0]), tail[1])
        icon_box = sc(icon_box) if icon_box else None
        d = os.path.join(OUT, "skins2", sid)
        os.makedirs(d, exist_ok=True)
        # head: facing up
        hb, hdir = head
        hi = knock_out(sh.crop(hb), tol=HEAD_TOL.get(sid, 46), force=sid in HEAD_TOL)
        if ROT_TO_UP[hdir] is not None:
            hi = hi.transpose(ROT_TO_UP[hdir])
        hi.save(os.path.join(d, "head.png"), optimize=True)
        # body: horizontal texture, flood only across the sides of the tube
        bb, axis = body
        bi = sh.crop(bb)
        if sid == "basica":
            bi = knock_out(bi, "lr", 20)
        else:
            bi = knock_out(bi, "tb" if axis == "h" else "lr")
        if axis == "v":
            bi = bi.transpose(Image.ROTATE_90)
        bi.save(os.path.join(d, "body.png"), optimize=True)
        # tail: tip pointing right
        tb, tdir = tail
        ti = knock_out(sh.crop(tb))
        if ROT_TO_RIGHT[tdir] is not None:
            ti = ti.transpose(ROT_TO_RIGHT[tdir])
        ti.save(os.path.join(d, "tail.png"), optimize=True)
        if icon_box:
            save_jpg(sh.crop(icon_box), f"skins/{sid}.jpg", (256, 256), q=88)


if __name__ == "__main__":
    skin_sprites()


def _recolor(im, hue, sk, vk, src_hue=77 / 360.0):
    import colorsys
    im = im.convert("RGBA")
    px = im.load()
    w, h = im.size
    for j in range(h):
        for i in range(w):
            r, g, b, a = px[i, j]
            if a == 0:
                continue
            hh, s, v = colorsys.rgb_to_hsv(r / 255.0, g / 255.0, b / 255.0)
            if s > 0.12:
                if hue is None:
                    s = 0.0
                else:
                    hh = (hh - src_hue + hue / 360.0) % 1.0
                    s = min(1.0, s * sk)
                v = min(1.0, v * vk if v > 0.18 else v)
            rr, gg, bb = colorsys.hsv_to_rgb(hh, s, v)
            px[i, j] = (int(rr * 255), int(gg * 255), int(bb * 255), a)
    return im


def basic_sprite_variants():
    base = os.path.join(OUT, "skins2", "basica")
    for sid, hue, sk, vk in BASIC_VARIANTS:
        d = os.path.join(OUT, "skins2", sid)
        os.makedirs(d, exist_ok=True)
        for part in ["head", "body", "tail"]:
            _recolor(Image.open(os.path.join(base, part + ".png")), hue, sk, vk).save(os.path.join(d, part + ".png"), optimize=True)


if __name__ == "__main__":
    basic_sprite_variants()


TAIL_FROM_BODY = ["umbra", "ember", "kitsune"]


def tails_from_body():
    """Build a straight tapered tail from the body texture (for sheets whose tail art is curved)."""
    from PIL import ImageDraw, ImageChops
    for sid in TAIL_FROM_BODY:
        d = os.path.join(OUT, "skins2", sid)
        body = Image.open(os.path.join(d, "body.png")).convert("RGBA")
        bw, bh = body.size
        L = int(bh * 2.6)
        strip = Image.new("RGBA", (L, bh), (0, 0, 0, 0))
        x = 0
        while x < L:
            strip.paste(body, (x, 0))
            x += bw
        a = body.getchannel("A")
        ys = [y for y in range(bh) if a.getpixel((bw // 2, y)) > 120]
        top, bot = (min(ys), max(ys)) if ys else (0, bh - 1)
        mid = (top + bot) / 2
        mask = Image.new("L", (L, bh), 0)
        ImageDraw.Draw(mask).polygon([(0, top), (L * 0.55, top + (bot - top) * 0.18), (L - 2, mid),
                                      (L * 0.55, bot - (bot - top) * 0.18), (0, bot)], fill=255)
        mask = mask.filter(ImageFilter.GaussianBlur(0.8))
        out_im = strip.copy()
        out_im.putalpha(ImageChops.multiply(strip.getchannel("A"), mask))
        # dark ink outline around the taper
        edge = mask.filter(ImageFilter.MaxFilter(5))
        ring = ImageChops.subtract(edge, mask)
        ink = Image.new("RGBA", (L, bh), (10, 8, 14, 255))
        ink.putalpha(ring)
        ink.alpha_composite(out_im)
        ink.save(os.path.join(d, "tail.png"), optimize=True)


if __name__ == "__main__":
    tails_from_body()


def map_floors():
    """Ground tiles of every map sheet (first row of tiles under the key art)."""
    import numpy as np
    from scipy import ndimage
    picks = {}
    for i, f in enumerate(MAP_SHEETS):
        im = Image.open(src("MAPAS", f)).convert("RGB")
        a = np.asarray(im).astype(int)
        bgc = np.median(a[800:848, :, :].reshape(-1, 3), axis=0)
        lab, n = ndimage.label(np.abs(a - bgc).sum(axis=2) > 40)
        y1 = MAP_KEYART[i][3]
        sq = []
        for s in ndimage.find_objects(lab):
            y0, yy = s[0].start, s[0].stop
            x0, xx = s[1].start, s[1].stop
            w, h = xx - x0, yy - y0
            if y0 > y1 - 5 and 28 <= w <= 90 and 28 <= h <= 90 and abs(w - h) <= 8 and w > 55:
                sq.append((y0, x0, w, h))
        sq.sort()
        row = sorted([q for q in sq if abs(q[0] - sq[0][0]) < 10], key=lambda q: q[1])
        chosen = [row[k] for k in MAP_FLOOR_PICK.get(i, [0, 1, 2]) if k < len(row)]
        picks[i] = chosen
        if i in MAP_FLOOR_BOX:
            chosen = [(b[1], b[0], b[2] - b[0], b[3] - b[1]) for b in MAP_FLOOR_BOX[i]]
        for k, (y0, x0, w, h) in enumerate(chosen):
            ins = max(3, w // 14)
            t = im.crop((x0 + ins, y0 + ins, x0 + w - ins, y0 + h - ins)).resize((96, 96), Image.LANCZOS)
            t.save(out(f"tiles/maps/m{i:02d}_f{k}.jpg"), quality=88)
    # Cyber City's sheet only has isometric tiles: use tinted dark stone instead
    for k in range(3):
        base_t = Image.open(os.path.join(OUT, "tiles", "ritual", f"floor{[0, 2, 3][k]}.jpg")).convert("RGB").resize((96, 96))
        tint = Image.new("RGB", (96, 96), (40, 20, 70))
        Image.blend(base_t, tint, 0.45).save(out(f"tiles/maps/m11_f{k}.jpg"), quality=88)
    return picks


# which tiles of the detected row are plain ground (skip water / special tiles)
MAP_FLOOR_PICK = {4: [0, 2, 0]}
# manual boxes when the detected row is not top-down ground (x0, y0, x1, y1)
MAP_FLOOR_BOX = {12: [(133, 383, 213, 460), (234, 383, 314, 460), (133, 383, 213, 460)]}


if __name__ == "__main__":
    map_floors()


# Extra body modules per skin, in 1264x848 sheet space: (box, axis)
#   variants: distinct straight modules that alternate along the body
#   specials: core / emblem segments inserted every few segments
SKIN_MODULES = {
    "cosmic": dict(variants=[((219, 419, 308, 508), "h"), ((329, 419, 418, 508), "h"), ((439, 419, 528, 508), "h")],
                   specials=[((1116, 417, 1206, 509), "h")]),
    "solar": dict(specials=[((1063, 402, 1214, 520), "h")]),
    "ember": dict(specials=[((1112, 466, 1196, 588), "v")]),
    "umbra": dict(specials=[((1137, 403, 1213, 533), "v")]),
    "kitsune": dict(specials=[((392, 558, 470, 745), "v")]),
    "toxic": dict(specials=[((447, 688, 602, 784), "h")]),
    "mushroom": dict(specials=[((964, 524, 1196, 598), "h")]),
    "vampire": dict(specials=[((1015, 435, 1190, 530), "h")]),
    "abyssal": dict(specials=[((946, 509, 1068, 578), "h"), ((1079, 509, 1201, 578), "h")]),
    "knight": dict(specials=[((895, 432, 1010, 545), "h")]),
}


def skin_modules():
    import json
    manifest = {}
    for sid, spec in SKIN_MODULES.items():
        fname = SKIN_SPRITES[sid][0]
        sh = Image.open(src("SKINS", fname)).convert("RGB")
        d = os.path.join(OUT, "skins2", sid)
        os.makedirs(d, exist_ok=True)
        manifest[sid] = {"variants": 0, "specials": 0}
        for kind in ("variants", "specials"):
            for i, (box, axis) in enumerate(spec.get(kind, [])):
                im = knock_out(sh.crop(box), "tb" if axis == "h" else "lr")
                if axis == "v":
                    im = im.transpose(Image.ROTATE_90)
                im.save(os.path.join(d, f"{kind[:-1]}{i}.png"), optimize=True)
                manifest[sid][kind] += 1
    with open(os.path.join(ROOT, "demo", "js", "skinmods.js"), "w") as f:
        f.write("// Generated by tools/build_assets.py (skin_modules)\nexport const SKIN_MODS = " + json.dumps(manifest, indent=1) + ";\n")


if __name__ == "__main__":
    skin_modules()
