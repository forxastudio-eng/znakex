// Story maps: identity of each of the 16 maps (terrain, mechanics, ambience)
// and the procedural level generator (seeded, so every level is always the same).
import { COLS, ROWS, DIFFS } from './data.js';

export { DIFFS };
import { MX } from './mapmanifest.js';

// cell types
export const T = { FLOOR: 0, SOLID: 1, LETHAL: 2, BRIDGE: 3, SLOW: 4, ICE: 5, SPIKE: 6, PORTAL: 7 };

// shape: how the lethal terrain is laid out. bridge: material of the crossings.
// amb: ambient particles. glow: additive light over lethal terrain.
export const MAPDEF = {
  1: { shape: 'river', bridge: 'wood', slow: true, amb: { kind: 'firefly', colors: ['#E8F5A0', '#FFE7A0', '#B8F0A0'] }, shore: '#dff5d0', mood: 'rgba(30,60,20,0.10)' },
  2: { shape: 'pools', bridge: 'wood', portals: true, amb: { kind: 'petal', colors: ['#F7B6C8', '#FFD6E0', '#FFFFFF'] }, shore: '#ffe9f0', mood: 'rgba(80,30,40,0.08)' },
  3: { shape: 'pools', bridge: 'stone', portals: true, spike: 1, amb: { kind: 'dust', colors: ['#FFF3C4', '#E8D9A0'] }, shore: '#fff6d8', mood: 'rgba(90,70,30,0.06)' },
  4: { shape: 'river', bridge: 'wood', slow: true, portals: true, amb: { kind: 'spore', colors: ['#7CFFD0', '#C99BFF', '#FFE79A'] }, shore: '#d6ffe6', mood: 'rgba(40,20,70,0.14)' },
  5: { shape: 'pools', bridge: 'stone', slow: true, portals: true, amb: { kind: 'sand', colors: ['#F3D9A0', '#E8C280'] }, shore: '#fff2c8', mood: 'rgba(120,70,10,0.06)' },
  6: { shape: 'pools', bridge: 'metal', slow: true, portals: true, glow: '#7CFF3A', amb: { kind: 'spore', colors: ['#A8FF4A', '#7CFF3A', '#D8FF9A'] }, shore: '#b8ff60', mood: 'rgba(20,50,10,0.16)' },
  7: { shape: 'river', bridge: 'ice', ice: true, spike: 1, amb: { kind: 'snow', colors: ['#FFFFFF', '#DDF2FF'] }, shore: '#ffffff', mood: 'rgba(120,170,220,0.06)' },
  8: { shape: 'river', bridge: 'stone', portals: true, amb: { kind: 'sparkle', colors: ['#9FFFFF', '#C7B2FF', '#FFFFFF'] }, shore: '#a8ffff', glow: '#2FE0FF', glowK: 0.18, mood: 'rgba(20,20,60,0.16)' },
  9: { shape: 'channel', bridge: 'stone', portals: true, amb: { kind: 'bubble', colors: ['#BFFFFF', '#7FE8F0'] }, shore: '#a8f0ff', glow: '#3FE0E0', glowK: 0.14, mood: 'rgba(0,40,70,0.22)' },
  10: { shape: 'cross', bridge: 'stone', spike: 1, glow: '#FF6A1A', amb: { kind: 'ember', colors: ['#FF9A3A', '#FFC24A', '#FF5A1A'] }, shore: '#ffb060', mood: 'rgba(80,10,0,0.14)' },
  11: { shape: 'lagoon', bridge: 'dock', spike: 1, amb: { kind: 'leaf', colors: ['#7FC060', '#A8D870'] }, shore: '#ffffff', mood: 'rgba(90,60,10,0.04)' },
  12: { shape: 'pools', bridge: 'wood', torches: true, amb: { kind: 'ember', colors: ['#FFB040', '#FF7A2A'] }, shore: '#cfe8ff', mood: 'rgba(10,10,30,0.20)' },
  13: { shape: 'islands', bridge: 'wood', spike: 2, portals: true, amb: { kind: 'feather', colors: ['#FFFFFF', '#E8F6FF'] }, shore: '#ffffff', mood: 'rgba(80,120,180,0.02)' },
  14: { shape: 'pools', bridge: 'stone', portals: true, glow: '#3FD8FF', glowK: 0.2, amb: { kind: 'star', colors: ['#FFFFFF', '#BFE8FF', '#FFF3C4'] }, shore: '#b8f0ff', mood: 'rgba(10,20,70,0.18)' },
  15: { shape: 'river', bridge: 'stone', slow: true, amb: { kind: 'wisp', colors: ['#7FE8FF', '#B8F8FF'] }, shore: '#a0d8e8', glow: '#2A9AC0', glowK: 0.08, mood: 'rgba(10,20,40,0.24)' },
  17: { shape: 'pools', bridge: 'wood', portals: true, spike: 1, glow: '#7A5CFF', glowK: 0.1, amb: { kind: 'leaf', colors: ['#E87532', '#D6A83D', '#B85A32'] }, shore: '#e6c08a', mood: 'rgba(60,20,0,0.12)' },
  16: { shape: 'channel', bridge: 'metal', glow: '#20E6FF', glowK: 0.2, amb: { kind: 'rain', colors: ['#9FD8FF', '#FF7AE0'] }, shore: '#c8ffff', mood: 'rgba(30,0,60,0.20)' },
};

// ------------------------------------------------------------------ helpers
function rng(seed) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6D2B79F5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const idx = (x, y) => y * COLS + x;
const inb = (x, y) => x >= 0 && y >= 0 && x < COLS && y < ROWS;
const N4 = [[0, -1], [1, 0], [0, 1], [-1, 0]];

// safe start area, never touched by hazards or obstacles
const SAFE = { x0: 3, x1: 8, y0: 11, y1: 17 };
const inSafe = (x, y) => x >= SAFE.x0 && x <= SAFE.x1 && y >= SAFE.y0 && y <= SAFE.y1;

function reach(cells, from, portals) {
  const seen = new Uint8Array(COLS * ROWS);
  const q = [idx(from.x, from.y)];
  seen[q[0]] = 1;
  const link = new Map();
  for (const [a, b] of portals) { link.set(idx(a.x, a.y), idx(b.x, b.y)); link.set(idx(b.x, b.y), idx(a.x, a.y)); }
  for (let i = 0; i < q.length; i++) {
    const k = q[i], x = k % COLS, y = (k / COLS) | 0;
    const nb = [];
    for (const [dx, dy] of N4) if (inb(x + dx, y + dy)) nb.push(idx(x + dx, y + dy));
    if (link.has(k)) nb.push(link.get(k));
    for (const n of nb) {
      if (seen[n]) continue;
      const t = cells[n];
      if (t === T.SOLID || t === T.LETHAL || t === T.SPIKE) continue;
      seen[n] = 1;
      q.push(n);
    }
  }
  return seen;
}

function fillRect(cells, x, y, w, h, v, respectSafe = true) {
  for (let j = y; j < y + h; j++) for (let i = x; i < x + w; i++) {
    if (!inb(i, j)) continue;
    if (respectSafe && inSafe(i, j)) continue;
    cells[idx(i, j)] = v;
  }
}

// ------------------------------------------------------------------ terrain shapes
function shapeRiver(cells, r, n, d) {
  // horizontal river, two or three wide crossings (3 cells wide on early / easy levels)
  const bridges = n <= 3 ? 3 : 2;
  const bw = n <= 4 || d.bridges > 0 ? 3 : 2;
  const t = 2;
  const y0 = 4 + Math.floor(r() * 3);
  const shift = n >= 4 && r() < 0.6 ? (r() < 0.5 ? -1 : 1) : 0;
  const cut = 4 + Math.floor(r() * 4);
  const gap = COLS / (bridges + 1);
  const bx = [];
  for (let b = 1; b <= bridges; b++) bx.push(Math.max(1, Math.min(COLS - bw - 1, Math.round(gap * b - bw / 2 + (r() - 0.5) * 2))));
  for (let x = 0; x < COLS; x++) {
    const yy = y0 + (x >= cut ? shift : 0);
    const isBridge = bx.some((b) => x >= b && x < b + bw);
    for (let j = 0; j < t; j++) cells[idx(x, yy + j)] = isBridge ? T.BRIDGE : T.LETHAL;
    if (x === cut && shift) for (let j = 0; j < t + 1; j++) if (cells[idx(x, y0 + j)] === T.FLOOR) cells[idx(x, y0 + j)] = T.LETHAL;
  }
  if (n >= 7) shapePools(cells, r, 2, d, false); // a couple of extra pools instead of a second river
}

function shapePools(cells, r, n, d, big) {
  const count = Math.min(4, 1 + Math.floor((n + 2) / 3) + (d.bridges < 0 ? 1 : 0) - (d.bridges > 0 ? 1 : 0));
  const sizes = big ? [[4, 2], [3, 3], [5, 2], [2, 3]] : [[3, 2], [2, 2], [4, 2], [2, 3], [3, 3]];
  const placed = [];
  for (let tries = 0; tries < 80 && placed.length < count; tries++) {
    const [w, h] = sizes[Math.floor(r() * sizes.length)];
    const x = Math.floor(r() * (COLS - w + 1));
    const y = Math.floor(r() * 10); // upper part of the board only
    if (placed.some((p) => x < p.x + p.w + 3 && x + w + 3 > p.x && y < p.y + p.h + 3 && y + h + 3 > p.y)) continue;
    let bad = false;
    for (let j = y - 1; j < y + h + 1; j++) for (let i = x - 1; i < x + w + 1; i++) {
      if (inb(i, j) && (inSafe(i, j) || cells[idx(i, j)] !== T.FLOOR)) bad = true;
    }
    if (bad) continue;
    placed.push({ x, y, w, h });
    fillRect(cells, x, y, w, h, T.LETHAL);
  }
  // a bridge over one wide pool
  const wide = placed.filter((p) => p.w >= 4).sort(() => r() - 0.5)[0];
  if (wide && d.bridges >= 0) {
    const by = wide.y + Math.floor(r() * wide.h);
    for (let x = wide.x; x < wide.x + wide.w; x++) cells[idx(x, by)] = T.BRIDGE;
  }
}

function shapeCross(cells, r, n, d) {
  const y0 = 7 + (r() < 0.5 ? 0 : 1);
  const bridges = n <= 5 ? 3 : 2;
  const bw = n <= 5 ? 3 : 2;
  const gap = COLS / (bridges + 1);
  const bx = [];
  for (let b = 1; b <= bridges; b++) bx.push(Math.max(0, Math.min(COLS - bw, Math.round(gap * b - bw / 2))));
  for (let x = 0; x < COLS; x++) for (let j = 0; j < 2; j++) {
    cells[idx(x, y0 + j)] = bx.some((b) => x >= b && x < b + bw) ? T.BRIDGE : T.LETHAL;
  }
  // vertical arm in the upper half with a wide crossing
  const vx = 5;
  const cross = 2 + Math.floor(r() * 2);
  for (let y = 0; y < y0; y++) for (let i = 0; i < 2; i++) {
    cells[idx(vx + i, y)] = y >= cross && y < cross + 3 ? T.BRIDGE : T.LETHAL;
  }
}

function shapeChannel(cells, r, n, d) {
  // a vertical channel through the upper part, crossed by wide bridges, plus a short branch
  const vx = 4 + Math.floor(r() * 3);
  const bridges = n <= 5 ? 2 : 1;
  const by = n <= 5 ? [1, 6] : [3];
  for (let y = 0; y < 10; y++) for (let i = 0; i < 2; i++) {
    cells[idx(vx + i, y)] = by.slice(0, bridges).some((q) => y >= q && y < q + 3) ? T.BRIDGE : T.LETHAL;
  }
  if (n >= 4) {
    const hy = 9 + Math.floor(r() * 2);
    const left = r() < 0.5;
    const len = 3 + Math.floor(n / 4);
    for (let i = 0; i < len; i++) {
      const x = left ? vx - 1 - i : vx + 2 + i;
      if (x >= 0 && x < COLS && !inSafe(x, hy)) cells[idx(x, hy)] = T.LETHAL;
    }
  }
  if (n >= 7) shapePools(cells, r, 3, d, false);
}

function shapeLagoon(cells, r, n, d) {
  const cx = 4 + Math.floor(r() * 3), cy = 2 + Math.floor(r() * 2);
  const parts = [[cx, cy, 5, 4], [cx - 2, cy + 1, 3, 2], [cx + 4, cy + 2, 2, 3]];
  for (const [x, y, w, h] of parts) fillRect(cells, x, y, w, h, T.LETHAL);
  if (d.bridges >= 0 || n <= 6) { // a dock crossing the lagoon, two rows wide
    const by = cy + 1;
    for (let x = cx - 2; x <= cx + 6; x++) for (let j = 0; j < 2; j++) if (cells[idx(x, by + j)] === T.LETHAL) cells[idx(x, by + j)] = T.BRIDGE;
  }
  if (n >= 6) shapePools(cells, r, 3, d, false);
}

function shapeIslands(cells, r, n, d) {
  cells.fill(T.LETHAL);
  const w = Math.max(5, 9 - Math.floor(n / 5) - (d.bridges < 0 ? 1 : 0));
  const A = { x: 0, y: 10, w: 12, h: 8 };
  const B = { x: 1 + Math.floor(r() * 2), y: 5, w: Math.max(6, w - 1), h: 4 };
  const C = { x: 6 + Math.floor(r() * 2), y: 1, w: 5, h: 3 };
  const D = { x: 0, y: 0, w: 5, h: 3 };
  for (const p of [A, B, C, D]) fillRect(cells, p.x, p.y, p.w, p.h, T.FLOOR, false);
  const link = (x, y0, y1) => { for (let y = y0; y <= y1; y++) for (let i = 0; i < 3; i++) if (inb(x + i, y) && cells[idx(x + i, y)] === T.LETHAL) cells[idx(x + i, y)] = T.BRIDGE; };
  const linkH = (y, x0, x1) => { for (let x = x0; x <= x1; x++) for (let j = 0; j < 2; j++) if (cells[idx(x, y + j)] === T.LETHAL) cells[idx(x, y + j)] = T.BRIDGE; };
  link(B.x + 1, B.y + B.h, A.y - 1);
  linkH(B.y + 1, B.x + B.w, C.x - 1);
  link(C.x + 1, C.y + C.h, B.y + 1);
  link(D.x + 1, D.y + D.h, B.y - 1);
  // holes in the islands
  const holes = Math.min(3, Math.floor(n / 4) + (d.bridges < 0 ? 1 : 0));
  for (let i = 0; i < holes; i++) {
    const x = Math.floor(r() * COLS), y = Math.floor(r() * ROWS);
    if (cells[idx(x, y)] === T.FLOOR && !inSafe(x, y)) cells[idx(x, y)] = T.LETHAL;
  }
}

function patches(cells, r, n, kind, count, sizes) {
  for (let i = 0; i < count; i++) {
    const [w, h] = sizes[Math.floor(r() * sizes.length)];
    for (let tries = 0; tries < 30; tries++) {
      const x = Math.floor(r() * (COLS - w)), y = Math.floor(r() * (ROWS - h - 2));
      let ok = true;
      for (let j = y; j < y + h && ok; j++) for (let k = x; k < x + w; k++) if (inSafe(k, j) || cells[idx(k, j)] !== T.FLOOR) ok = false;
      if (ok) { fillRect(cells, x, y, w, h, kind); break; }
    }
  }
}

// Join every isolated dry region to the spawn area with a bridge across the shortest
// stretch of lethal terrain, so the level never hides floor the snake cannot reach.
function connect(cells, spawn, portals) {
  for (let round = 0; round < 8; round++) {
    const seen = reach(cells, spawn, portals);
    const isDry = (k) => { const t = cells[k]; return t !== T.SOLID && t !== T.LETHAL && t !== T.SPIKE; };
    let lost = 0;
    for (let k = 0; k < cells.length; k++) if (isDry(k) && !seen[k]) lost++;
    if (lost < 3) return;
    // BFS from the reachable area over lethal cells to the nearest unreachable dry cell
    const prev = new Int32Array(cells.length).fill(-2);
    const q = [];
    for (let k = 0; k < cells.length; k++) if (seen[k]) { prev[k] = -1; q.push(k); }
    let goal = -1;
    for (let i = 0; i < q.length && goal < 0; i++) {
      const k = q[i], x = k % COLS, y = (k / COLS) | 0;
      for (const [dx, dy] of N4) {
        const nx = x + dx, ny = y + dy;
        if (!inb(nx, ny)) continue;
        const n = idx(nx, ny);
        if (prev[n] !== -2) continue;
        const t = cells[n];
        if (t === T.SOLID) continue;
        if (t === T.LETHAL || t === T.SPIKE) { prev[n] = k; q.push(n); continue; }
        if (isDry(n) && !seen[n]) { prev[n] = k; goal = n; break; }
      }
    }
    if (goal < 0) return;
    for (let k = prev[goal]; k >= 0 && prev[k] !== -1; k = prev[k]) if (cells[k] === T.LETHAL) cells[k] = T.BRIDGE;
    // widen a little so the crossing is not a needle
    for (let k = prev[goal]; k >= 0; k = prev[k]) if (cells[k] === T.SPIKE) cells[k] = T.FLOOR;
  }
}

// ------------------------------------------------------------------ designed layouts
// Obstacles come in small formations placed mirrored around the vertical axis, so every board
// reads as a composed arena instead of scattered rocks. Formations keep at least two free cells
// between each other, and a placement is rejected if it would create a dead end or a one-cell
// corridor.
const dry = (t) => t !== T.SOLID && t !== T.LETHAL && t !== T.SPIKE;

const FORMS = {
  pillar: [[0, 0]],
  pair: [[0, 0], [1, 0]],
  post: [[0, 0], [0, 1]],
  elbow: [[0, 0], [1, 0], [0, 1]],
  bar: [[0, 0], [1, 0], [2, 0]],
  block: [[0, 0], [1, 0], [0, 1], [1, 1]],
};
// which formations each level tier may use
const TIERS = [
  ['pillar', 'pair'],
  ['pillar', 'pair', 'post'],
  ['pair', 'post', 'elbow'],
  ['post', 'elbow', 'bar', 'block'],
];

function thinCells(cells) {
  // dry cells that are not part of any fully dry 2x2 block: one-cell corridors, spurs and pockets
  const ok = (x, y) => inb(x, y) && dry(cells[idx(x, y)]);
  const list = [];
  for (let y = 0; y < ROWS; y++) for (let x = 0; x < COLS; x++) {
    if (!ok(x, y)) continue;
    let in2 = false;
    for (const [ax, ay] of [[0, 0], [-1, 0], [0, -1], [-1, -1]]) {
      if (ok(x + ax, y + ay) && ok(x + ax + 1, y + ay) && ok(x + ax, y + ay + 1) && ok(x + ax + 1, y + ay + 1)) { in2 = true; break; }
    }
    if (!in2) list.push(idx(x, y));
  }
  return list;
}

// Turn thin spots into hazard terrain (a natural shoreline) until every walkable cell has room.
function thinFix(cells) {
  let n = 0;
  for (let round = 0; round < 8; round++) {
    const list = thinCells(cells).filter((k) => cells[k] !== T.PORTAL);
    if (!list.length) return n;
    for (const k of list) cells[k] = T.LETHAL;
    n += list.length;
  }
  return n;
}

function cluster(cells, list, gap, avoid) {
  // is any cell of the formation closer than `gap` to a solid / hazard / portal?
  for (const [x, y] of list) {
    if (!inb(x, y) || x < 1 || y < 1 || x > COLS - 2 || y > ROWS - 2 || inSafe(x, y)) return true;
    if (avoid && avoid.has(idx(x, y))) return true;
    for (let j = -gap; j <= gap; j++) for (let i = -gap; i <= gap; i++) {
      if (!inb(x + i, y + j)) continue;
      const t = cells[idx(x + i, y + j)];
      if (t === T.SOLID || t === T.SPIKE || t === T.PORTAL) return true;
    }
    if (cells[idx(x, y)] !== T.FLOOR) return true;
  }
  return false;
}

function placeForms(cells, r, obs, nSprites, count, tier, kind, avoid) {
  // kind: T.SOLID (with sprite) or T.SPIKE. Formations are mirrored across x -> 11 - x.
  const forms = TIERS[tier];
  let placed = 0;
  for (let tries = 0; tries < 300 && placed < count; tries++) {
    const name = kind === T.SPIKE ? (r() < 0.6 ? 'pillar' : 'pair') : forms[Math.floor(r() * forms.length)];
    const shape = FORMS[name];
    const ox = 1 + Math.floor(r() * 5), oy = 1 + Math.floor(r() * 14);
    const list = shape.map(([a, b]) => [ox + a, oy + b]);
    const mirror = list.map(([x, y]) => [COLS - 1 - x, y]);
    const center = list.some(([x]) => x >= 5) ; // formation crossing the axis: place once
    const all = center ? list : list.concat(mirror);
    // the mirrored copy must not touch the original
    if (!center && list.some(([x, y]) => mirror.some(([mx, my]) => Math.abs(mx - x) <= 2 && Math.abs(my - y) <= 2))) continue;
    if (cluster(cells, all, 2, avoid)) continue;
    const before = thinCells(cells).length;
    const saved = all.map(([x, y]) => cells[idx(x, y)]);
    all.forEach(([x, y]) => { cells[idx(x, y)] = kind; });
    const seen = reach(cells, { x: 5, y: 15 }, []);
    let lost = 0;
    for (let k = 0; k < cells.length; k++) if (dry(cells[k]) && !seen[k]) lost++;
    if (lost > 0 || thinCells(cells).length > before) { all.forEach(([x, y], i) => { cells[idx(x, y)] = saved[i]; }); continue; }
    if (kind === T.SOLID) all.forEach(([x, y]) => obs.push({ x, y, s: Math.floor(r() * nSprites) }));
    placed += all.length;
  }
}

// Obstacle formations and (from level 3) mirrored spike pairs. `avoid` = cells that must stay free.
function populateObstacles(cells, r, obs, map, n, d, avoid) {
  const tier = n <= 2 ? 0 : n <= 5 ? 1 : n <= 8 ? 2 : 3;
  const nSprites = MX[map].obs;
  const lethalNow = () => { let c = 0; for (const t of cells) if (t === T.LETHAL || t === T.SPIKE) c++; return c; };
  const budget = Math.max(0, Math.round((d.id === 'easy' ? 14 : d.id === 'hard' ? 26 : 20) + n * 0.6) - lethalNow() * 0.5);
  const solids = Math.min(budget, Math.round((3 + n * 0.8 + (map - 1) * 0.15) * d.obst));
  placeForms(cells, r, obs, nSprites, solids, tier, T.SOLID, avoid);
  if (n >= 3) placeForms(cells, r, obs, nSprites, Math.min(6, Math.round(Math.floor((n - 1) / 2) * d.hazard)), tier, T.SPIKE, avoid);
}

// Level 5 / 10 event: every obstacle and spike jumps to a new composed layout.
export function reshuffleObstacles(level, salt, avoidKeys) {
  const { cells, map, n } = level;
  const d = DIFFS[level.diff] || DIFFS.normal;
  for (let k = 0; k < cells.length; k++) if (cells[k] === T.SOLID || cells[k] === T.SPIKE) cells[k] = T.FLOOR;
  level.obs = [];
  const r = rng(map * 31337 + n * 977 + salt * 7919);
  populateObstacles(cells, r, level.obs, map, n, d, new Set(avoidKeys));
  level.reachable = reach(cells, level.spawn, level.portals);
  return level;
}

// ------------------------------------------------------------------ level builder
function buildOnce(map, n, diffId, attempt) {
  const d = DIFFS[diffId] || DIFFS.normal;
  const def = MAPDEF[map];
  const seed = map * 7919 + n * 104729 + (diffId === 'easy' ? 11 : diffId === 'hard' ? 23 : 0) * 1231 + attempt * 65537;
  const r = rng(seed);
  const cells = new Uint8Array(COLS * ROWS);
  const spawn = { x: 5, y: 15, dir: 'up', len: 3 };

  switch (def.shape) {
    case 'river': shapeRiver(cells, r, n, d); break;
    case 'pools': shapePools(cells, r, n, d, map === 12 || map === 3); break;
    case 'cross': shapeCross(cells, r, n, d); break;
    case 'channel': shapeChannel(cells, r, n, d); break;
    case 'lagoon': shapeLagoon(cells, r, n, d); break;
    case 'islands': shapeIslands(cells, r, n, d); break;
    default: break;
  }
  if (def.slow) patches(cells, r, n, T.SLOW, 1 + Math.floor(n / 4), [[3, 2], [2, 2], [4, 2]]);
  if (def.ice) patches(cells, r, n, T.ICE, 2 + Math.floor(n / 3), [[4, 3], [3, 3], [5, 2]]);

  connect(cells, spawn, []);
  let fixed = thinFix(cells);
  connect(cells, spawn, []);
  fixed += thinFix(cells);

  // portals
  const portals = [];
  if (def.portals && n >= 3) {
    for (let p = 0; p < (n >= 8 ? 2 : 1); p++) {
      let a = null, b = null;
      for (let tries = 0; tries < 80 && !(a && b); tries++) {
        const x = 1 + Math.floor(r() * (COLS - 2)), y = 1 + Math.floor(r() * (ROWS - 4));
        if (inSafe(x, y) || cells[idx(x, y)] !== T.FLOOR) continue;
        if (N4.some(([dx, dy]) => !inb(x + dx, y + dy) || cells[idx(x + dx, y + dy)] !== T.FLOOR)) continue;
        if (!a) a = { x, y };
        else if (Math.hypot(a.x - x, a.y - y) > 6) b = { x, y };
      }
      if (a && b) { cells[idx(a.x, a.y)] = T.PORTAL; cells[idx(b.x, b.y)] = T.PORTAL; portals.push([a, b]); }
    }
  }

  const obs = [];
  populateObstacles(cells, r, obs, map, n, d, null);

  // anything still unreachable becomes terrain (water / void / lava) so orbs never spawn there
  const seen = reach(cells, spawn, portals);
  let fixedDead = 0; void fixedDead;
  const deadFill = def.shape === 'islands' || def.shape === 'cross' || def.shape === 'river' || def.shape === 'pools' || def.shape === 'lagoon' || def.shape === 'channel' ? T.LETHAL : T.SOLID;
  for (let k = 0; k < cells.length; k++) {
    const t = cells[k];
    if (t !== T.SOLID && t !== T.LETHAL && t !== T.SPIKE && !seen[k]) { cells[k] = deadFill === T.LETHAL ? T.LETHAL : T.SOLID; fixed++; }
  }
  for (const [a, b] of portals) { if (!seen[idx(a.x, a.y)] || !seen[idx(b.x, b.y)]) { cells[idx(a.x, a.y)] = T.FLOOR; cells[idx(b.x, b.y)] = T.FLOOR; } }

  const reachable = reach(cells, spawn, portals);
  return { map, n, diff: d.id, cells, obs, portals, spawn, reachable, def, fixed };
}

// Quality gate: enough walkable floor and no heavy after-the-fact trimming; otherwise redraw the level.
export function buildLevel(map, n, diffId = 'normal') {
  const minFree = def13(map) ? 132 : diffId === 'easy' ? 172 : diffId === 'normal' ? 164 : 156;
  let best = null, bestScore = -1e9;
  for (let attempt = 0; attempt < 24; attempt++) {
    const L = buildOnce(map, n, diffId, attempt);
    let free = 0;
    for (const t of L.cells) if (t !== T.SOLID && t !== T.LETHAL && t !== T.SPIKE) free++;
    const score = Math.min(free - minFree, 0) * 2 - L.fixed;
    if (score > bestScore) { best = L; bestScore = score; }
    if (free >= minFree && L.fixed <= 8) return L;
  }
  return best;
}
const def13 = (map) => map === 13;
