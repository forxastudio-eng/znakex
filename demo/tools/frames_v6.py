"""Rarity frames (marcos/*.jpg) -> demo/assets/ui/rfr/<rarity>.png with transparent outside and window.
Prints the window inset (percent) of each frame for the CSS."""
import glob, os
import numpy as np
from PIL import Image, ImageFilter
from scipy import ndimage

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..'))
OUT = os.path.join(ROOT, 'demo', 'assets', 'ui', 'rfr')
FILES = sorted(glob.glob(os.path.join(ROOT, 'marcos', '*.jpg')))
RAR = ['temporada', 'mitico', 'normal', 'especial', 'legendario']
TOL = {'especial': 34}


def run():
    os.makedirs(OUT, exist_ok=True)
    for f, rar in zip(FILES, RAR):
        im = Image.open(f).convert('RGB').resize((512, 512), Image.LANCZOS)
        a = np.asarray(im).astype(np.int32)
        tol = TOL.get(rar, 70)
        bg = np.zeros(a.shape[:2], bool)
        for seed in [(3, 3), (256, 256)]:
            ref = np.median(a[seed[0] - 3:seed[0] + 4, seed[1] - 3:seed[1] + 4].reshape(-1, 3), axis=0)
            cand = np.abs(a - ref).sum(axis=2) < tol
            lab, _ = ndimage.label(cand)
            if seed == (3, 3):
                keep = set(np.unique(np.concatenate([lab[0], lab[-1], lab[:, 0], lab[:, -1]]))) - {0}
            else:
                keep = {lab[seed]} - {0}
            bg |= np.isin(lab, list(keep))
        bg = ndimage.binary_opening(bg, iterations=1)
        alpha = np.where(bg, 0, 255).astype(np.float32)
        if rar not in ('especial', 'normal'):
            # inner glows mixed with the green key: fade them and neutralise the green
            ex = a[..., 1] - np.maximum(a[..., 0], a[..., 2])
            sp = (ex > 25) & ~bg
            alpha[sp] *= np.clip(1 - (ex[sp] - 25) / 70, 0, 1)
            a = a.copy()
            a[..., 1] = np.where(ex > 10, np.maximum(a[..., 0], a[..., 2]) + 10, a[..., 1])
            if rar == 'legendario':  # yellow-green glow -> gold
                a[..., 1] = np.where((a[..., 1] > a[..., 0] * 0.9) & (a[..., 0] > a[..., 2] + 30), (a[..., 0] * 0.86).astype(np.int32), a[..., 1])
            im = Image.fromarray(a.clip(0, 255).astype(np.uint8), 'RGB')
        alpha = alpha.astype(np.uint8)
        al = Image.fromarray(alpha).filter(ImageFilter.GaussianBlur(0.7))
        o = im.convert('RGBA'); o.putalpha(al)
        o.save(os.path.join(OUT, rar + '.png'), optimize=True)
        # window: transparent region containing the centre
        lab, _ = ndimage.label(bg)
        win = lab == lab[256, 256]
        ys, xs = np.where(win)
        ins = min(xs.min(), ys.min(), 511 - xs.max(), 511 - ys.max()) / 512 * 100
        print(rar, round(ins, 1))


if __name__ == '__main__':
    run()
