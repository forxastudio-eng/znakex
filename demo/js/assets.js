// Image preloader with progress callback.
import { BOTS, skinById } from './data.js';
import { MX } from './mapmanifest.js';
import { PW_FILES, PLAQUES } from './newmanifest.js';

export const IMG = {};

const range = (n, f) => Array.from({ length: n }, (_, i) => f(i));


// every extracted element of the 16 story maps
function mapFiles() {
  const out = [];
  for (const [id, m] of Object.entries(MX)) {
    const d = `mx/${String(id).padStart(2, '0')}/`;
    for (let i = 0; i < m.floor; i++) out.push(`${d}floor${i}.jpg`);
    for (const r of ['feat', 'edge', 'slow', 'ice']) if (m[r]) out.push(`${d}${r}.jpg`);
    for (const r of ['wall', 'corner', 'inner', 'cap', 'portal', 'bridge']) if (m[r]) out.push(`${d}${r}.png`);
    for (let i = 0; i < m.obs; i++) out.push(`${d}obs${i}.png`);
    for (let i = 0; i < m.haz; i++) out.push(`${d}haz${i}.png`);
  }
  return out;
}

export const MANIFEST = [
  'brand/logo/logo_full.webp', 'brand/bg/carga.webp', 'brand/bg/inicio.webp', 'brand/bg/menu.webp', 'brand/bg/interior.webp',
  ...['panel', 'btn_primary', 'btn_primary_down', 'btn_secondary', 'btn_reward', 'btn_round', 'btn_pill', 'title', 'divider', 'ring'].map((n) => `brand/kit/${n}.webp`),
  ...PLAQUES.map((n) => `brand/plaques/${n}.webp`),
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
  ...mapFiles(),
  ...PW_FILES.map((n) => `brand/${n}.webp`),
  'ui/season_badge.png', 'maps/season1.jpg',
];

// Skin art is loaded on demand (64 skins would be too much memory on a phone): the equipped
// skin and the duel rivals at start, any other one when the gallery shows it or a game uses it.
const skinFiles = (k) => ['head', 'm0', 'm1', 'm2', 'sp', 'tail', ...(skinById(k).tongueImg ? ['tongue'] : [])].map((p) => `skins3/${k}/${p}.webp`);
const skinLoads = new Map();
export function ensureSkin(id) {
  const k = skinById(id).art || skinById(id).id;
  if (!skinLoads.has(k)) skinLoads.set(k, Promise.all(skinFiles(k).filter((f) => !IMG[f]).map(loadOne)));
  return skinLoads.get(k);
}

function loadOne(src) {
  return new Promise((resolve) => {
    const im = new Image();
    im.decoding = 'async';
    im.onload = () => { IMG[src] = im; resolve(); };
    im.onerror = () => { console.warn('asset failed', src); resolve(); };
    im.src = 'assets/' + src;
  });
}

export async function loadAll(onProgress, startSkins = []) {
  let done = 0;
  const list = [...MANIFEST, ...new Set([...startSkins, ...Object.values(BOTS).map((b) => b.art || b.id)].flatMap(skinFiles))];
  const total = list.length;
  await Promise.all(list.map((src) => loadOne(src).then(() => onProgress(++done / total))));
  for (const k of startSkins) skinLoads.set(k, Promise.resolve());
}

export const url = (p) => `assets/${p}`;
