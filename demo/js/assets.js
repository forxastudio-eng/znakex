// Image preloader with progress callback.
import { SKINS } from './data.js';

export const IMG = {};

const range = (n, f) => Array.from({ length: n }, (_, i) => f(i));

export const MANIFEST = [
  'bg/splash.jpg', 'bg/menu.jpg', 'bg/blur.jpg', 'ui/logo.png',
  ...range(4, (i) => `tiles/court/floor${i}.jpg`),
  ...range(7, (i) => `tiles/court/deco${i}.png`),
  'tiles/court/wall_h.png', 'tiles/court/wall_v.png', 'tiles/court/wall_corner.png',
  'tiles/court/wall_ivy.png', 'tiles/court/wall_rune.png', 'tiles/court/statue.png',
  'tiles/court/rune0.png', 'tiles/court/rune1.png',
  ...range(4, (i) => `tiles/glade/floor${i}.jpg`),
  ...range(4, (i) => `tiles/glade/deco${i}.png`),
  ...range(3, (i) => `tiles/glade/rune${i}.png`),
  ...range(4, (i) => `tiles/ritual/floor${i}.jpg`),
  ...range(5, (i) => `tiles/ritual/spawn${i}.png`),
  'tiles/ritual/sigil.png', 'tiles/ritual/sigil_glow.png', 'tiles/ritual/wall_h.png', 'tiles/ritual/wall_v.png',
  'tiles/ritual/wall_corner.png', 'tiles/ritual/wall_torch_amber.png', 'tiles/ritual/wall_torch_crimson.png',
  'tiles/ritual/pillar.png', 'tiles/ritual/column.png', 'tiles/ritual/totem.png',
  ...range(16, (i) => [0, 1, 2].map((k) => `tiles/maps/m${String(i).padStart(2, '0')}_f${k}.jpg`)).flat(),
  ...SKINS.flatMap((s) => ['head', 'body', 'tail'].map((p) => `skins2/${s.art || s.id}/${p}.png`)),
];

function loadOne(src) {
  return new Promise((resolve) => {
    const im = new Image();
    im.decoding = 'async';
    im.onload = () => { IMG[src] = im; resolve(); };
    im.onerror = () => { console.warn('asset failed', src); resolve(); };
    im.src = 'assets/' + src;
  });
}

export async function loadAll(onProgress) {
  let done = 0;
  const total = MANIFEST.length;
  await Promise.all(MANIFEST.map((src) => loadOne(src).then(() => onProgress(++done / total))));
}

export const url = (p) => `assets/${p}`;
