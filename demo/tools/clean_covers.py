"""Removes the rarity / name text baked into some skin cover images (assets/skins/*.jpg).
Push-pull inpainting over hand-placed boxes (256 px covers). Run once; keeps a copy in assets/skins_orig/."""
import os, shutil
import numpy as np
from PIL import Image, ImageFilter

HERE = os.path.dirname(__file__)
D = os.path.join(HERE, "..", "assets", "skins")
ORIG = os.path.join(HERE, "..", "assets", "skins_orig")

BOXES = {
    "cosmic": [(180, 0, 252, 60), (48, 198, 208, 256)],
    "crystal": [(12, 196, 248, 246)],
    "cyber": [(14, 154, 246, 206), (28, 196, 226, 252)],
    "ghost": [(52, 196, 200, 254)],
    "kitsune": [(22, 220, 234, 256)],
    "knight": [(8, 184, 248, 254)],
    "toxic": [(146, 0, 254, 50), (0, 186, 252, 246)],
    "vampire": [(52, 194, 200, 254)],
}


def pushpull(img, mask):
    """img float HxWx3, mask bool HxW (True = unknown). Fills unknown pixels smoothly."""
    levels = []
    a = img.copy()
    w = (~mask).astype(np.float32)
    a *= w[..., None]
    while min(a.shape[:2]) > 2:
        levels.append((a, w))
        h, wd = a.shape[0] // 2 * 2, a.shape[1] // 2 * 2
        a2 = a[:h, :wd].reshape(h // 2, 2, wd // 2, 2, 3).sum((1, 3))
        w2 = w[:h, :wd].reshape(h // 2, 2, wd // 2, 2).sum((1, 3))
        a, w = a2, np.minimum(w2, 1.0) * 0 + w2
        a = a2
    # pull: normalise
    res = None
    for (fa, fw) in reversed(levels):
        pass
    # simple iterative version: blur-diffuse from the known area at multiple scales
    out = img.copy()
    known = ~mask
    cur = np.where(known[..., None], img, 0).astype(np.float32)
    wt = known.astype(np.float32)
    filled = cur.copy()
    for sigma in (2, 4, 8, 16, 32):
        from scipy.ndimage import gaussian_filter
        num = np.stack([gaussian_filter(cur[..., c] * wt, sigma) for c in range(3)], -1)
        den = gaussian_filter(wt, sigma)[..., None] + 1e-6
        est = num / den
        fill_here = mask & (gaussian_filter(wt, sigma) > 0.05)
        out[fill_here] = est[fill_here]
        # newly filled pixels become known for the next (larger) scale
        cur = np.where(fill_here[..., None], est, cur)
        wt = np.where(fill_here, 1.0, wt)
        mask = mask & ~fill_here
    return out


def clean(name):
    src = os.path.join(ORIG, name + ".jpg")
    im = Image.open(src).convert("RGB")
    a = np.asarray(im).astype(np.float32)
    mask = np.zeros(a.shape[:2], bool)
    for (x0, y0, x1, y1) in BOXES[name]:
        mask[y0:y1, x0:x1] = True
    # the inpainting must not use the text itself: box is unknown, surroundings are known
    filled = pushpull(a, mask)
    # feathered blend + a little grain so the patch does not look plastic
    m = Image.fromarray((mask * 255).astype(np.uint8)).filter(ImageFilter.GaussianBlur(3))
    mm = np.asarray(m).astype(np.float32)[..., None] / 255.0
    rng = np.random.default_rng(7)
    filled = filled + rng.normal(0, 3.0, filled.shape)
    out = a * (1 - mm) + filled * mm
    Image.fromarray(np.clip(out, 0, 255).astype(np.uint8)).save(os.path.join(D, name + ".jpg"), quality=90)


if __name__ == "__main__":
    os.makedirs(ORIG, exist_ok=True)
    for n in BOXES:
        o = os.path.join(ORIG, n + ".jpg")
        if not os.path.exists(o):
            shutil.copy(os.path.join(D, n + ".jpg"), o)
        clean(n)
    print("covers cleaned:", ", ".join(BOXES))
