"""Finds the pieces of a skin sheet (cover, effects, head, tongue, body modules, special, repeating module, tail)
on a flat chroma-key background and returns their boxes. Layouts vary a little between generated sheets,
so pieces are classified by size / shape / position; a sheet can be corrected with OVERRIDES."""
import numpy as np
from PIL import Image
from scipy import ndimage


def key_of(im):
    a = np.asarray(im.convert("RGB")).astype(int)
    h, w, _ = a.shape
    corners = np.concatenate([a[:6, :6].reshape(-1, 3), a[:6, -6:].reshape(-1, 3), a[-6:, :6].reshape(-1, 3), a[-6:, -6:].reshape(-1, 3)])
    return np.median(corners, axis=0)


def foreground(im, key, thr=70):
    a = np.asarray(im.convert("RGB")).astype(int)
    d = np.abs(a - key).sum(axis=2)
    return d > thr


def components(im, min_area=900, close=6):
    key = key_of(im)
    fg = foreground(im, key)
    fg = ndimage.binary_opening(fg, iterations=1)
    m = ndimage.binary_closing(fg, iterations=close)
    lab, n = ndimage.label(m)
    out = []
    for k, sl in enumerate(ndimage.find_objects(lab), start=1):
        if sl is None:
            continue
        y0, y1, x0, x1 = sl[0].start, sl[0].stop, sl[1].start, sl[1].stop
        area = int((lab[sl] == k).sum())
        if area < min_area:
            continue
        out.append(dict(box=(x0, y0, x1, y1), area=area, w=x1 - x0, h=y1 - y0, cx=(x0 + x1) / 2, cy=(y0 + y1) / 2, id=k))
    return key, lab, out


def classify(im):
    """returns dict cover, head, tongue, mods[3], special, rep, tail (boxes) or None entries"""
    key, lab, comps = components(im)
    W, H = im.size
    big = [c for c in comps if c['h'] >= 60 and c['area'] >= 4000]
    r = {}
    sq = [c for c in big if 0.85 <= c['w'] / c['h'] <= 1.18 and c['w'] > 350]
    cover = max(sq, key=lambda c: c['area']) if sq else None
    r['cover'] = cover
    rest = [c for c in big if c is not cover]
    wide = [c for c in rest if c['w'] >= 1.45 * c['h'] and c['cy'] > H * 0.48 and c['w'] > 250]
    wide.sort(key=lambda c: c['cy'])
    # split into rows by biggest cy gap
    rows = []
    for c in wide:
        if rows and abs(rows[-1][-1]['cy'] - c['cy']) < 90:
            rows[-1].append(c)
        else:
            rows.append([c])
    rows = [sorted(rw, key=lambda c: c['cx']) for rw in rows]
    r['rows'] = rows
    tall = [c for c in rest if c not in wide and c['h'] > c['w'] * 1.0 and c['h'] >= 100 and c['cy'] < H * 0.72]
    heads = [c for c in tall if c['w'] > 90]
    r['head'] = max(heads, key=lambda c: c['area']) if heads else None
    tg = [c for c in tall if c['w'] <= 90 and c['h'] > 2.2 * c['w']]
    if r['head'] and tg:
        tg.sort(key=lambda c: abs(c['cx'] - r['head']['cx']) + abs(c['cy'] - r['head']['cy']))
        r['tongue'] = tg[0]
    else:
        r['tongue'] = tg[0] if tg else None
    r['key'] = key
    return r


def _runs(mask):
    best = (0, 0); s = None
    for i, v in enumerate(list(mask) + [False]):
        if v and s is None: s = i
        if not v and s is not None:
            if i - s > best[1] - best[0]: best = (s, i)
            s = None
    return best


def cover_box(im):
    """Square (1:1) box of the library cover, inset from the chroma-key halo."""
    W, H = im.size
    k = W / 1872.0
    key = key_of(im)
    fg = foreground(im, key, 60)
    reg = fg[: int(H * 0.72), : int(W * 0.34)]
    rows = reg.sum(axis=1) > 300 * k
    y0, y1 = _runs(rows)
    cols = reg[y0:y1].sum(axis=0) > (y1 - y0) * 0.6
    x0, x1 = _runs(cols)
    inset = int(4 * k)
    x0 += inset; y0 += inset; x1 -= inset; y1 -= inset
    s = min(x1 - x0, y1 - y0)
    cx, cy = (x0 + x1) // 2, (y0 + y1) // 2
    return (cx - s // 2, cy - s // 2, cx - s // 2 + s, cy - s // 2 + s)


def find_parts(im):
    """Locate head, tongue, modules A/B/C, special, tail in a skin sheet (any of the generated layouts)."""
    W, H = im.size
    k = W / 1872.0
    key, lab, comps = components(im, min_area=int(900 * k * k))
    cb = cover_box(im)
    if cb[2] - cb[0] < 400 * k:
        sq = [c for c in comps if 0.85 <= c['w'] / c['h'] <= 1.18 and c['w'] > 350 * k]
        if sq:
            c = max(sq, key=lambda c: c['area'])
            x0, y0, x1, y1 = c['box']; s = min(x1 - x0, y1 - y0) - int(8 * k)
            cx, cy = (x0 + x1) // 2, (y0 + y1) // 2
            cb = (cx - s // 2, cy - s // 2, cx - s // 2 + s, cy - s // 2 + s)
    cover = dict(box=cb)

    def inside_cover(c):
        return cb[0] - 20 < c['cx'] < cb[2] + 20 and cb[1] - 20 < c['cy'] < cb[3] + 20 + 260 * k and c['cx'] < cb[2] + 20 and c['w'] < 700 * k and c['area'] > 0 and c['cy'] < cb[3] + 20

    rest = [c for c in comps if not inside_cover(c) and c['h'] >= 60 * k and not (0.93 < c['w'] / c['h'] < 1.07 and 150 * k < c['w'] < 215 * k and c['cy'] < 0.4 * H and c['cx'] > 0.5 * W)]
    tall = [c for c in rest if c['cy'] < 0.55 * H and c['h'] > 1.25 * c['w'] and c['h'] > 150 * k]
    heads = [c for c in tall if c['w'] > 90 * k]
    head = max(heads, key=lambda c: c['area']) if heads else None
    if head is None:
        cand = [c for c in rest if c['cy'] < 0.5 * H and c['cx'] < 0.62 * W and c['area'] > 15000 * k * k and 0.5 < c['w'] / c['h'] < 1.4]
        head = max(cand, key=lambda c: c['area']) if cand else None
        tall = [c for c in rest if c['cy'] < 0.55 * H and c['h'] > 2.2 * c['w'] and c['h'] > 100 * k]
    tong = [c for c in tall if c['w'] <= 90 * k]
    tongue = min(tong, key=lambda c: abs(c['cx'] - head['cx']) + abs(c['cy'] - head['cy'])) if (tong and head) else None
    body = [c for c in rest if c['cy'] > 0.36 * H and c['area'] > 15000 * k * k and c is not head]
    if head is not None:
        body = [c for c in body if not (abs(c['cx'] - head['cx']) < 20 and abs(c['cy'] - head['cy']) < 20)]
    body.sort(key=lambda c: c['cy'])
    rows = []
    for c in body:
        if rows and abs(rows[-1][-1]['cy'] - c['cy']) < 110 * k:
            rows[-1].append(c)
        else:
            rows.append([c])
    rows = [sorted(rw, key=lambda c: c['cx']) for rw in rows]
    rows = [rw for rw in rows if len(rw) >= 3]
    if rows and len(rows[0]) == 4:
        if head is None:
            head = rows[0][0]
        rows[0] = rows[0][1:]
    return dict(key=key, cover=cover, head=head, tongue=tongue, rows=rows, k=k)
