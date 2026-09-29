"""ZNAKEX v0.6 skin pipeline: cuts the new 1872x1248 sheets into game sprites.
Output per skin (demo/assets/skins3/<id>/, WebP): head, tongue, m0 m1 m2 (body modules A/B/C),
sp (special module, 2 cells), tail; cover -> demo/assets/skins/<id>.jpg (1:1, 512).
"""
import glob, json, os, shutil, sys
import numpy as np
from PIL import Image, ImageFilter
from scipy import ndimage
sys.path.insert(0, os.path.dirname(__file__))
from sheet_parts import find_parts, key_of

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..'))
OUT = os.path.join(ROOT, 'demo', 'assets')
FILES = sorted(glob.glob(os.path.join(ROOT, 'skins finales', '*'))) + sorted(glob.glob(os.path.join(ROOT, 'skins de temporada', '*')))
ONLY = set(os.environ.get('ONLY', '').split(',')) - {''}

# sheet index -> id, name, rarity, trail, description
SK = {
    1: ('nube', 'Serpiente Nube', 'especial', 'sparkle', 'Suave como una nube de algodón, con arcoíris en el corazón.'),
    2: ('gargola', 'Gárgola de Catedral', 'mitico', 'ember', 'Piedra viva con musgo, alas de vitral y ascuas en la garganta.'),
    3: ('cactus', 'Serpiente Cactus', 'especial', 'leaf', 'Espinas, una flor rosa y el sol del desierto.'),
    4: ('escarabajo', 'Escarabajo Sagrado', 'mitico', 'sparkle', 'Oro faraónico con un escarabajo azul sobre la frente.'),
    5: ('cuervo', 'Serpiente Cuervo', 'mitico', 'feather', 'Plumas negras bajo la luna llena.'),
    6: ('prisma', 'Serpiente Prisma', 'legendario', 'sparkle', 'Cristal vivo que rompe la luz en mil colores.'),
    7: ('mecanismo', 'Serpiente Mecanismo', 'mitico', 'metal', 'Engranajes de latón y un ojo de cristal turquesa.'),
    8: ('ambar', 'Serpiente de Ámbar', 'mitico', 'ember', 'Ámbar dorado con alas de insecto y luz atrapada.'),
    9: ('origami', 'Serpiente Origami', 'mitico', 'petal', 'Papel plegado con pico afilado y grulla al viento.'),
    10: ('eclipse', 'Serpiente Eclipse', 'legendario', 'shadow', 'Un sol negro coronado por cuernos de plata.'),
    11: ('robot', 'Serpiente Robot Retro', 'especial', 'digital', 'Chapa plateada, antenas y ojos rojos de otra época.'),
    12: ('musgo', 'Serpiente Runa de Musgo', 'especial', 'leaf', 'Piedra rúnica cubierta de musgo antiguo.'),
    13: ('celestial', 'Dragón Celestial', 'legendario', 'sparkle', 'Cuernos dorados, nubes y rayos del cielo.'),
    14: ('monarca', 'Serpiente Monarca', 'especial', 'petal', 'Alas de mariposa naranja y negro.'),
    15: ('wyrmlunar', 'Wyrm Lunar', 'legendario', 'star', 'Cristal de luna y escarcha bajo un cielo de plata.'),
    16: ('serafin', 'Serafín', 'legendario', 'feather', 'Alas de luz y una aureola de oro.'),
    17: ('arandano', 'Serpiente Arándano', 'especial', 'petal', 'Azul profundo con manchas de arándano.'),
    18: ('ladrillo', 'Serpiente Ladrillo', 'normal', 'dust', 'Muro de barro cocido: dura y con carácter.'),
    19: ('fenix', 'Serpiente Fénix', 'legendario', 'ember', 'Plumas de fuego que renacen de las cenizas.'),
    20: ('girasol', 'Serpiente Girasol', 'especial', 'petal', 'Pétalos de girasol alrededor de la cabeza.'),
    21: ('miel', 'Serpiente Miel', 'normal', 'dust', 'Ámbar dulce con un panal en el lomo.'),
    22: ('tempestad', 'Wyrm de la Tempestad', 'legendario', 'digital', 'Cuernos de plata y un anillo de rayos.'),
    23: ('aurora', 'Serpiente Aurora', 'mitico', 'sparkle', 'Cintas de aurora boreal ondean tras su cabeza.'),
    24: ('unicornio', 'Unicornio Astral', 'mitico', 'star', 'Perla y arcoíris, con un cuerno de luz de estrellas.'),
    25: ('cebra', 'Serpiente Cebra', 'especial', 'dust', 'Rayas negras sobre crema y una melena rebelde.'),
    26: ('trueno', 'Serpiente Trueno', 'especial', 'digital', 'Acero azul y relámpagos en cada escama.'),
    27: ('arenisca', 'Cobra Arenisca', 'normal', 'dust', 'Estratos de arenisca dorada del desierto.'),
    28: ('pizarra', 'Víbora Pizarra', 'normal', 'dust', 'Placas de pizarra gris, fría y discreta.'),
    29: ('coral', 'Serpiente Coral', 'normal', 'dust', 'Anillos rojos, negros y crema. Bonita, pero cuidado.'),
    30: ('kraken', 'Kraken Abisal', 'legendario', 'bubble', 'Tentáculos, mareas y un ojo turquesa del abismo.'),
    31: ('pirata', 'Serpiente Pirata', 'especial', 'dust', 'Pañuelo rojo y escamas de mar bravo.'),
    32: ('coloso', 'Coloso de Bronce', 'legendario', 'metal', 'Casco con cresta roja y armadura de bronce.'),
    33: ('ciervo', 'Ciervo del Bosque', 'mitico', 'leaf', 'Astas cubiertas de flores y un corazón de musgo.'),
    34: ('niebla', 'Boa de Niebla', 'normal', 'spirit', 'Gris niebla, cuernos suaves y misterio.'),
    35: ('volcan', 'Rey Volcán', 'legendario', 'ember', 'Roca negra agrietada por lava viva.'),
    36: ('vikinga', 'Serpiente Vikinga', 'especial', 'metal', 'Escudos de madera, hierro y tormenta del norte.'),
    37: ('oni', 'Oni de Ceniza', 'mitico', 'ember', 'Cuernos de ceniza y ojos de brasa.'),
    38: ('menta', 'Serpiente Menta', 'normal', 'leaf', 'Verde fresco con hojitas de menta.'),
    39: ('caramelo', 'Serpiente Caramelo', 'especial', 'petal', 'Rayas de bastón rosa y blanco. Muy dulce.'),
    41: ('ola', 'Serpiente Ola', 'especial', 'bubble', 'Espuma, cresta de ola y aguas turquesas.'),
    42: ('panda', 'Serpiente Panda', 'especial', 'leaf', 'Blanco y negro, entre hojas de bambú.'),
    43: ('tigre', 'Serpiente Tigre', 'especial', 'ember', 'Rayas de tigre y ojos de fuego.'),
    44: ('vidriera', 'Serpiente Vidriera', 'mitico', 'sparkle', 'Vitral de colores con una rosa de luz en el lomo.'),
    45: ('arrecife', 'Serpiente Arrecife', 'mitico', 'bubble', 'Corona de coral y aguas cristalinas.'),
    46: ('cacao', 'Serpiente Cacao', 'normal', 'dust', 'Marrón chocolate con granos de cacao.'),
    47: ('arcade', 'Serpiente Arcade', 'especial', 'digital', 'Neones sobre negro: insert coin.'),
    48: ('piton', 'Pitón de la Selva', 'normal', 'leaf', 'Verde selva con ojos que lo ven todo.'),
    49: ('emperador', 'Emperador Dorado', 'legendario', 'sparkle', 'Corona con rubíes, oro puro y mirada de rey.'),
    50: ('sirena', 'Serpiente Sirena', 'mitico', 'bubble', 'Perlas, conchas y aletas nacaradas.'),
    51: ('bruja', 'Bruja de la Luna', 'temporada', 'star', 'Terciopelo violeta, lunas de plata y un sombrero de bruja.'),
    52: ('calabaza', 'Emperador Calabaza', 'temporada', 'ember', 'Obsidiana con fuego de calabaza y corona de brasas.'),
    53: ('maiz', 'Serpiente de Maíz', 'temporada', 'dust', 'Granos dorados, panochas y seda de maíz.'),
    54: ('espantapajaros', 'Espantapájaros Encantado', 'temporada', 'leaf', 'Remiendos, paja y ojos que brillan como calabazas.'),
    55: ('farol', 'Serpiente Farol', 'temporada', 'spirit', 'Faroles de papel que iluminan la noche de cosecha.'),
}
OVERRIDE = {  # sheet index -> manual boxes on the 1872 scale
    2: dict(cover=(328, 57, 937, 647), head=(302, 675, 541, 946)),
}
BASIC_VARIANTS = [
    ('basica_rojo', 2, 1.1, 1.0), ('basica_azul', 212, 1.0, 1.0), ('basica_amarillo', 48, 1.2, 1.12),
    ('basica_morado', 275, 0.95, 1.0), ('basica_naranja', 24, 1.25, 1.05), ('basica_rosa', 330, 0.8, 1.12),
    ('basica_turquesa', 172, 1.0, 1.0), ('basica_negro', None, 0.0, 0.42), ('basica_blanco', None, 0.0, 1.35),
]


def cut(im, key, tol=95):
    """Chroma-key knock-out of a cropped piece: flood from the border over pixels near the key colour."""
    a = np.asarray(im.convert('RGB')).astype(np.int32)
    h, w, _ = a.shape
    diff = np.abs(a - key.astype(np.int32)).sum(axis=2)
    cand = diff < tol
    seed = np.zeros((h, w), bool)
    seed[0, :] = seed[-1, :] = True
    seed[:, 0] = seed[:, -1] = True
    lab, n = ndimage.label(cand)
    keep = set(np.unique(lab[seed & cand])) - {0}
    bg = np.isin(lab, list(keep))
    # interior islands of pure key colour (between limbs of the sprite) also go
    bg |= ndimage.binary_dilation(bg, iterations=1) & (diff < tol * 1.5)
    bg |= diff < tol * 0.5  # enclosed pockets of pure key colour
    if key[1] > key[0] and key[1] > key[2]:  # green key: strongly green pixels are spill, never art
        bg |= (a[..., 1] - np.maximum(a[..., 0], a[..., 2]) > 70) & (a[..., 1] > 140)
    else:
        bg |= (np.minimum(a[..., 0], a[..., 2]) - a[..., 1] > 90) & (a[..., 0] > 150) & (a[..., 2] > 150)
    obj = ndimage.binary_fill_holes(~bg)
    bg = ~obj
    edge = ndimage.binary_dilation(bg, iterations=3) & ~bg
    alpha = np.where(bg, 0, 255).astype(np.float32)
    near = edge & (diff < tol * 2.2)
    alpha[near] = np.clip((diff[near] - tol * 0.7) / (tol * 1.3), 0.2, 1) * 255
    # despill on the fringe
    r, g, b = a[..., 0].astype(np.float32), a[..., 1].astype(np.float32), a[..., 2].astype(np.float32)
    if key[1] > key[0] and key[1] > key[2]:  # green key
        lim = np.maximum(r, b) * 1.05 + 6
        g2 = np.where(edge, np.minimum(g, lim), g)
        r2, b2 = r, b
    else:  # magenta key
        lim = g * 1.1 + 24
        r2 = np.where(edge, np.minimum(r, lim), r)
        b2 = np.where(edge, np.minimum(b, lim), b)
        g2 = g
    if key[1] > key[0] and key[1] > key[2]:
        # glows and translucent bits mixed with the green key: fade them out and neutralise the green
        ex = g - np.maximum(r, b)
        spill = (ex > 45) & ~bg
        alpha[spill] *= np.clip(1 - (ex[spill] - 45) / 90, 0, 1)
        g2 = np.where(ex > 20, np.maximum(r, b) + 20, g2)
    rgb = np.stack([r2, g2, b2], axis=-1).clip(0, 255).astype(np.uint8)
    al = Image.fromarray(alpha.astype(np.uint8)).filter(ImageFilter.GaussianBlur(0.5))
    o = Image.fromarray(rgb, 'RGB').convert('RGBA')
    o.putalpha(al)
    return o


def largest(im):
    """Keep the main object (drops label text and specks that survive the cut)."""
    al = np.asarray(im.getchannel('A')) > 40
    lab, n = ndimage.label(ndimage.binary_dilation(al, iterations=4))
    if n <= 1:
        return im
    sizes = ndimage.sum(al, lab, range(1, n + 1))
    keep = [i + 1 for i, v in enumerate(sizes) if v >= 0.2 * max(sizes)]
    m = np.isin(lab, keep)
    a = np.asarray(im.getchannel('A')).copy()
    a[~m] = 0
    o = im.copy(); o.putalpha(Image.fromarray(a))
    return o


def trim(im, pad=0):
    bb = im.getchannel('A').point(lambda v: 255 if v > 24 else 0).getbbox()
    if not bb:
        return im
    return im.crop((max(0, bb[0] - pad), max(0, bb[1] - pad), bb[2] + pad, bb[3] + pad))


def narrow(im, max_aspect, to_aspect):
    """Very long module -> keep its central part so it fits one cell without distortion."""
    if im.width / im.height > max_aspect:
        w = int(im.height * to_aspect)
        x0 = (im.width - w) // 2
        return im.crop((x0, 0, x0 + w, im.height))
    return im


def end_trim(im, left=0.03, right=0.03):
    """cut the dark outline the artist drew on the flat ends of a module, so modules chain without seams"""
    x0 = int(im.width * left); x1 = im.width - int(im.width * right)
    return im.crop((x0, 0, x1, im.height))


def core_h(im):
    a = np.asarray(im.getchannel('A')) > 160
    rows = np.where(a.sum(axis=1) >= im.width * 0.5)[0]
    return int(rows[-1] - rows[0] + 1) if len(rows) else im.height


def fit_core(im, target):
    """uniform scale so the body core is `target` px thick (A/B/C are drawn as close-ups in the sheets)"""
    k = target / core_h(im)
    return im.resize((max(1, round(im.width * k)), max(1, round(im.height * k))), Image.LANCZOS)


def trim_tail(im):
    """Drop the straight stretch at the base of the tail (it is just body) so the taper fits one cell."""
    a = np.asarray(im.getchannel('A')) > 160
    th = a.sum(axis=0).astype(np.float32)
    base = np.median(th[: max(3, im.width // 12)])
    keep = int(im.width * 0.1)
    i = keep
    while i < im.width * 0.45 and th[i] >= base * 0.95:
        i += 1
    x0 = max(0, i - keep)
    return im.crop((x0, 0, im.width, im.height)) if x0 > 0 else im


def piece(sh, box, key, m=8, maxh=None, maxw=None, scale=None):
    x0, y0, x1, y1 = box
    im = sh.crop((max(0, x0 - m), max(0, y0 - m), min(sh.width, x1 + m), min(sh.height, y1 + m)))
    im = trim(largest(cut(im, key)))
    s = 1.0 if scale is None else scale
    if maxh and im.height > maxh: s = min(s, maxh / im.height)
    if maxw and im.width > maxw: s = min(s, maxw / im.width)
    piece.last_scale = s
    if s != 1:
        im = im.resize((max(1, round(im.width * s)), max(1, round(im.height * s))), Image.LANCZOS)
    return im


def avg_colors(*ims):
    px = []
    for im in ims:
        a = np.asarray(im.convert('RGBA'))
        m = a[..., 3] > 200
        px.append(a[m][:, :3])
    p = np.concatenate(px).astype(np.float32)
    base = p.mean(axis=0)
    lum = p.sum(axis=1)
    light = p[lum >= np.percentile(lum, 85)].mean(axis=0)
    sat = p.max(axis=1) - p.min(axis=1)
    acc = p[sat >= np.percentile(sat, 85)].mean(axis=0)
    hx = lambda c: '#%02x%02x%02x' % tuple(int(max(0, min(255, v))) for v in c)
    return [hx(base), hx(light), hx(acc)]


def process(idx, sid):
    sh = Image.open(FILES[idx]).convert('RGB')
    p = find_parts(sh)
    k = p['k']
    key = p['key']
    ov = OVERRIDE.get(idx, {})
    sc = lambda b: tuple(int(round(v * k)) for v in b)
    rows = p['rows']
    if idx in ov and False:
        pass
    head_box = sc(ov['head']) if 'head' in ov else p['head']['box']
    cover_box_ = sc(ov['cover']) if 'cover' in ov else p['cover']['box']
    mods = [c['box'] for c in rows[0][:3]]
    sp, rep, tail = [c['box'] for c in rows[1][:3]]
    d = os.path.join(OUT, 'skins3', sid)
    shutil.rmtree(d, ignore_errors=True)
    os.makedirs(d)
    # one common scale for the whole skin, taken from the repeating module (true body thickness);
    # modules A/B/C are close-ups in the sheets and are brought down to that same thickness
    rep_raw = trim(largest(cut(sh.crop(rep), key)))
    sc_ = 120.0 / core_h(rep_raw)
    head = piece(sh, head_box, key, scale=sc_)
    head.save(os.path.join(d, 'head.webp'), 'WEBP', quality=90, method=6)
    if p['tongue'] and 'head' not in ov:
        piece(sh, p['tongue']['box'], key, scale=sc_).save(os.path.join(d, 'tongue.webp'), 'WEBP', quality=90, method=6)
    ms = [end_trim(narrow(fit_core(piece(sh, b, key), 120), 1.8, 1.35)) for b in mods]
    for i, m in enumerate(ms):
        m.save(os.path.join(d, f'm{i}.webp'), 'WEBP', quality=90, method=6)
    spi = end_trim(piece(sh, sp, key, scale=sc_), 0.02, 0.02)
    spi.save(os.path.join(d, 'sp.webp'), 'WEBP', quality=90, method=6)
    ti = end_trim(trim_tail(piece(sh, tail, key, scale=sc_)), 0.02, 0)
    ti.save(os.path.join(d, 'tail.webp'), 'WEBP', quality=90, method=6)
    # cover: square, 512
    cv = sh.crop(cover_box_)
    s = min(cv.size)
    cv = cv.crop(((cv.width - s) // 2, (cv.height - s) // 2, (cv.width - s) // 2 + s, (cv.height - s) // 2 + s)).resize((512, 512), Image.LANCZOS)
    os.makedirs(os.path.join(OUT, 'skins'), exist_ok=True)
    cv.save(os.path.join(OUT, 'skins', sid + '.jpg'), quality=88)
    return avg_colors(*ms, spi)


def basic():
    """The single BASIC sheet (magenta key) + nine hue-shifted variants."""
    idx = 0
    sh = Image.open(FILES[idx]).convert('RGB')
    key = key_of(sh)
    W, H = sh.size
    k = W / 1872.0
    import sheet_parts as sp_
    p = find_parts(sh)
    rows = p['rows']
    d = os.path.join(OUT, 'skins3', 'basica')
    shutil.rmtree(d, ignore_errors=True)
    os.makedirs(d)
    rep_raw = trim(largest(cut(sh.crop(rows[1][1]['box']), key)))
    sc_ = 120.0 / core_h(rep_raw)
    parts = {'head': piece(sh, p['head']['box'], key, scale=sc_)}
    if p['tongue']:
        parts['tongue'] = piece(sh, p['tongue']['box'], key, scale=sc_)
    for i, c in enumerate(rows[0][:3]):
        parts[f'm{i}'] = end_trim(fit_core(piece(sh, c['box'], key), 120))
    parts['sp'] = end_trim(piece(sh, rows[1][0]['box'], key, scale=sc_), 0.02, 0.02)
    parts['tail'] = end_trim(trim_tail(piece(sh, rows[1][2]['box'], key, scale=sc_)), 0.02, 0)
    for n, im in parts.items():
        im.save(os.path.join(d, n + '.webp'), 'WEBP', quality=90, method=6)
    cb = p['cover']['box']
    cv = sh.crop(cb); s = min(cv.size)
    cv = cv.crop(((cv.width - s) // 2, (cv.height - s) // 2, (cv.width - s) // 2 + s, (cv.height - s) // 2 + s)).resize((512, 512), Image.LANCZOS)
    cv.save(os.path.join(OUT, 'skins', 'basica.jpg'), quality=88)
    cols = {'basica': avg_colors(*[parts[n] for n in ('m0', 'm1', 'm2', 'sp')])}
    for sid, hue, sk_, vk in BASIC_VARIANTS:
        dd = os.path.join(OUT, 'skins3', sid)
        shutil.rmtree(dd, ignore_errors=True)
        os.makedirs(dd)
        for n, im in parts.items():
            recolor(im, hue, sk_, vk).save(os.path.join(dd, n + '.webp'), 'WEBP', quality=90, method=6)
        recolor(cv, hue, sk_, vk).save(os.path.join(OUT, 'skins', sid + '.jpg'), quality=88)
        cols[sid] = avg_colors(*[Image.open(os.path.join(dd, n + '.webp')) for n in ('m0', 'm1', 'm2', 'sp')])
    return cols


def recolor(im, hue, sk_, vk, src_hue=77 / 360.0):
    has_a = im.mode == 'RGBA'
    a = im.getchannel('A') if has_a else None
    hsv = np.asarray(im.convert('RGB').convert('HSV')).astype(np.float32)
    h, s, v = hsv[..., 0] / 255.0, hsv[..., 1] / 255.0, hsv[..., 2] / 255.0
    m = s > 0.12
    if hue is None:
        s = np.where(m, 0.0, s)
    else:
        h = np.where(m, (h - src_hue + hue / 360.0) % 1.0, h)
        s = np.where(m, np.minimum(1.0, s * sk_), s)
    v = np.where(m & (v > 0.18), np.minimum(1.0, v * vk), v)
    out = np.stack([h * 255, s * 255, v * 255], axis=-1).clip(0, 255).astype(np.uint8)
    o = Image.fromarray(out, 'HSV').convert('RGB')
    if has_a:
        o = o.convert('RGBA'); o.putalpha(a)
    return o


def main():
    colors = {}
    for idx, (sid, *_r) in SK.items():
        if ONLY and sid not in ONLY:
            continue
        print(idx, sid, flush=True)
        colors[sid] = process(idx, sid)
    if not ONLY or 'basica' in ONLY:
        colors.update(basic())
    path = os.path.join(OUT, 'skin_colors.json')
    old = json.load(open(path)) if os.path.exists(path) else {}
    old.update(colors)
    json.dump(old, open(path, 'w'), indent=1)
    write_list(old)


def write_list(colors):
    """demo/js/skinlist.js: the generated skin catalogue (names, rarity, trail, colours, tongue sprite)."""
    lines = ['// Generated by tools/build_v6.py. Do not edit by hand.', 'export const SKIN_LIST = [']
    for idx, (sid, name, rar, trail, desc) in SK.items():
        tg = os.path.exists(os.path.join(OUT, 'skins3', sid, 'tongue.webp'))
        lines.append('  ' + json.dumps(dict(id=sid, name=name, rarity=rar, trail=trail, desc=desc, colors=colors.get(sid), tongueImg=tg), ensure_ascii=False) + ',')
    lines.append('];')
    lines.append('export const BASIC_COLORS = ' + json.dumps({k: v for k, v in colors.items() if k.startswith('basica')}) + ';')
    open(os.path.join(ROOT, 'demo', 'js', 'skinlist.js'), 'w').write('\n'.join(lines) + '\n')


if __name__ == '__main__':
    main()
