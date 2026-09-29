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

function freeCount(cells) {
  let n = 0;
  for (const t of cells) if (t !== T.SOLID && t !== T.LETHAL && t !== T.SPIKE) n++;
  return n;
}

function fillRect(cells, x, y, w, h, v, respectSafe = true) {
  for (let j = y; j < y + h; j++) for (let i = x; i < x + w; i++) {
    if (!inb(i, j)) continue;
    if (respectSafe && inSafe(i, j)) continue;
    cells[idx(i, j)] = v;
  }
}

// ------------------------------------------------------------------ terrain shapes
function shapeRiver(cells, r, n, d, vertical) {
  const bridges = Math.max(1, (n <= 3 ? 3 : n <= 6 ? 2 : 1) + d.bridges);
  const t = n >= 8 ? 3 : 2;
  const y0 = 4 + Math.floor(r() * 4);
  const shift = n >= 4 && r() < 0.6 ? (r() < 0.5 ? -1 : 1) : 0;
  const cut = 3 + Math.floor(r() * 5);
  const bx = [];
  const gap = COLS / (bridges + 1);
  for (let b = 1; b <= bridges; b++) bx.push(Math.max(1, Math.min(COLS - 2, Math.round(gap * b + (r() - 0.5) * 2))));
  for (let x = 0; x < COLS; x++) {
    const yy = y0 + (x >= cut ? shift : 0);
    const isBridge = bx.some((b) => Math.abs(b - x) <= (n <= 5 && d.bridges >= 0 ? 0 : 0));
    for (let j = 0; j < t; j++) {
      const cx = vertical ? yy + j : x;
      const cy = vertical ? x : yy + j;
      if (!inb(cx, cy)) continue;
      cells[idx(cx, cy)] = isBridge ? T.BRIDGE : T.LETHAL;
    }
  }
  // wider bridges on easy / early levels
  if (n <= 4 || d.bridges > 0) {
    for (const b of bx) for (let j = 0; j < t + 1; j++) {
      const x = Math.min(COLS - 1, b + 1);
      const yy = y0 + (x >= cut ? shift : 0);
      const cx = vertical ? yy + j : x;
      const cy = vertical ? x : yy + j;
      if (inb(cx, cy) && cells[idx(cx, cy)] === T.LETHAL) cells[idx(cx, cy)] = T.BRIDGE;
    }
  }
  if (n >= 7) { // a second, thinner river near the top
    const yb = 1 + Math.floor(r() * 2);
    const b2 = 2 + Math.floor(r() * 7);
    for (let x = 0; x < COLS; x++) if (cells[idx(x, yb)] === T.FLOOR) cells[idx(x, yb)] = Math.abs(x - b2) <= (d.bridges >= 0 ? 1 : 0) ? T.BRIDGE : T.LETHAL;
  }
}

function shapePools(cells, r, n, d, big) {
  const count = Math.min(6, 2 + Math.floor((n + 1) / 3) + (d.bridges < 0 ? 1 : 0));
  const sizes = big ? [[4, 2], [3, 3], [5, 2], [2, 3]] : [[3, 2], [2, 2], [4, 2], [2, 3], [3, 3]];
  const placed = [];
  for (let tries = 0; tries < 80 && placed.length < count; tries++) {
    const [w, h] = sizes[Math.floor(r() * sizes.length)];
    const x = Math.floor(r() * (COLS - w + 1));
    const y = Math.floor(r() * 10); // upper part of the board only
    if (placed.some((p) => x < p.x + p.w + 2 && x + w + 2 > p.x && y < p.y + p.h + 2 && y + h + 2 > p.y)) continue;
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
  const bridges = Math.max(1, (n <= 4 ? 3 : n <= 7 ? 2 : 1) + d.bridges);
  const bx = [];
  const gap = COLS / (bridges + 1);
  for (let b = 1; b <= bridges; b++) bx.push(Math.round(gap * b));
  for (let x = 0; x < COLS; x++) for (let j = 0; j < 2; j++) {
    cells[idx(x, y0 + j)] = bx.some((b) => Math.abs(b - x) <= (n <= 5 ? 1 : 0)) ? T.BRIDGE : T.LETHAL;
  }
  // vertical arm in the upper half with one crossing
  const vx = 5 + (r() < 0.5 ? 0 : 1);
  const cross = 2 + Math.floor(r() * 3);
  for (let y = 0; y < y0; y++) for (let i = 0; i < 2; i++) {
    cells[idx(vx + i, y)] = Math.abs(cross - y) <= (n <= 6 ? 1 : 0) ? T.BRIDGE : T.LETHAL;
  }
}

function shapeChannel(cells, r, n, d) {
  // a vertical channel through the upper part plus a horizontal branch
  const vx = 4 + Math.floor(r() * 3);
  const bridges = Math.max(1, (n <= 4 ? 2 : 1) + d.bridges);
  const by = [];
  for (let b = 1; b <= bridges; b++) by.push(Math.round((9 / (bridges + 1)) * b));
  for (let y = 0; y < 10; y++) for (let i = 0; i < 2; i++) {
    cells[idx(vx + i, y)] = by.some((q) => Math.abs(q - y) <= (n <= 5 ? 1 : 0)) ? T.BRIDGE : T.LETHAL;
  }
  const hy = 9 + Math.floor(r() * 2);
  const bx = 1 + Math.floor(r() * (vx - 1));
  for (let x = 0; x < COLS; x++) {
    if (inSafe(x, hy)) continue;
    cells[idx(x, hy)] = x >= bx - 1 && x <= bx + 1 ? T.BRIDGE : T.LETHAL;
  }
  if (n >= 6) shapePools(cells, r, Math.max(2, n - 4), d, false);
}

function shapeLagoon(cells, r, n, d) {
  const cx = 4 + Math.floor(r() * 3), cy = 3 + Math.floor(r() * 2);
  const parts = [[cx, cy, 6, 4], [cx - 2, cy + 1, 3, 3], [cx + 3, cy + 2, 3, 3]];
  for (const [x, y, w, h] of parts) fillRect(cells, x, y, w, h, T.LETHAL);
  if (d.bridges >= 0) {
    const by = cy + 2;
    for (let x = cx - 2; x <= cx + 8; x++) if (cells[idx(x, by)] === T.LETHAL) cells[idx(x, by)] = T.BRIDGE;
  }
  if (n >= 5) shapePools(cells, r, Math.max(2, n - 3), d, false);
}

function shapeIslands(cells, r, n, d) {
  cells.fill(T.LETHAL);
  const w = Math.max(5, 9 - Math.floor(n / 5) - (d.bridges < 0 ? 1 : 0));
  const A = { x: 1, y: 10, w: 10, h: 8 };
  const B = { x: 1 + Math.floor(r() * 2), y: 5, w: Math.max(4, w - 2), h: 4 };
  const C = { x: 6 + Math.floor(r() * 2), y: 2, w: 5, h: 3 };
  const D = { x: 1 + Math.floor(r() * 3), y: 0, w: 6, h: 2 };
  for (const p of [A, B, C, D]) fillRect(cells, p.x, p.y, p.w, p.h, T.FLOOR, false);
  const link = (x, y0, y1) => { for (let y = y0; y <= y1; y++) if (cells[idx(x, y)] === T.LETHAL) cells[idx(x, y)] = T.BRIDGE; };
  const linkH = (y, x0, x1) => { for (let x = x0; x <= x1; x++) if (cells[idx(x, y)] === T.LETHAL) cells[idx(x, y)] = T.BRIDGE; };
  link(B.x + 1, B.y + B.h, A.y - 1);
  linkH(B.y + 1, B.x + B.w, C.x - 1);
  link(C.x + 1, C.y + C.h, B.y + 1);
  link(D.x + 1, D.y + D.h, B.y - 1);
  // holes in the islands
  const holes = Math.min(6, Math.floor(n / 2) + (d.bridges < 0 ? 1 : 0));
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

// ------------------------------------------------------------------ level builder
export function buildLevel(map, n, diffId = 'normal') {
  const d = DIFFS[diffId] || DIFFS.normal;
  const def = MAPDEF[map];
  const seed = map * 7919 + n * 104729 + (diffId === 'easy' ? 11 : diffId === 'hard' ? 23 : 0) * 1231;
  const r = rng(seed);
  const cells = new Uint8Array(COLS * ROWS);
  const spawn = { x: 5, y: 15, dir: 'up', len: 3 };

  switch (def.shape) {
    case 'river': shapeRiver(cells, r, n, d, false); break;
    case 'pools': shapePools(cells, r, n, d, map === 12 || map === 3); break;
    case 'cross': shapeCross(cells, r, n, d); break;
    case 'channel': shapeChannel(cells, r, n, d); break;
    case 'lagoon': shapeLagoon(cells, r, n, d); break;
    case 'islands': shapeIslands(cells, r, n, d); break;
    default: break;
  }
  if (def.slow) patches(cells, r, n, T.SLOW, 1 + Math.floor(n / 4), [[3, 2], [2, 2], [4, 2]]);
  if (def.ice) patches(cells, r, n, T.ICE, 2 + Math.floor(n / 3), [[4, 3], [3, 3], [5, 2]]);

  // hazards (single lethal cells)
  const hazards = Math.round((n >= 2 ? Math.floor(n * 0.7) : 0) * d.hazard) + (def.shape === 'islands' ? 0 : 0);
  for (let i = 0, placed = 0; i < 80 && placed < Math.min(hazards, 9); i++) {
    const x = 1 + Math.floor(r() * (COLS - 2)), y = 1 + Math.floor(r() * (ROWS - 3));
    if (inSafe(x, y) || cells[idx(x, y)] !== T.FLOOR) continue;
    cells[idx(x, y)] = T.SPIKE;
    placed++;
  }

  connect(cells, spawn, []);

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

  // obstacles, keeping the board connected
  const want = Math.round((3 + n * 0.9 + (map - 1) * 0.25) * d.obst);
  const obs = [];
  const nSprites = MX[map].obs;
  let free0 = freeCount(cells);
  for (let tries = 0; tries < 400 && obs.length < want; tries++) {
    const x = Math.floor(r() * COLS), y = Math.floor(r() * ROWS);
    if (inSafe(x, y) || cells[idx(x, y)] !== T.FLOOR) continue;
    if (portals.some(([a, b]) => (Math.abs(a.x - x) + Math.abs(a.y - y) <= 1) || (Math.abs(b.x - x) + Math.abs(b.y - y) <= 1))) continue;
    // keep a little breathing room between obstacles
    if (obs.some((o) => Math.abs(o.x - x) + Math.abs(o.y - y) < 3)) continue;
    cells[idx(x, y)] = T.SOLID;
    const seen = reach(cells, spawn, portals);
    let ok = true, unreachable = 0;
    for (let k = 0; k < cells.length; k++) {
      const t = cells[k];
      if (t !== T.SOLID && t !== T.LETHAL && t !== T.SPIKE && !seen[k]) unreachable++;
    }
    if (unreachable > 3) ok = false;
    if (!ok) { cells[idx(x, y)] = T.FLOOR; continue; }
    obs.push({ x, y, s: Math.floor(r() * nSprites) });
  }

  // anything still unreachable becomes terrain (water / void / lava) so orbs never spawn there
  const seen = reach(cells, spawn, portals);
  const deadFill = def.shape === 'islands' || def.shape === 'cross' || def.shape === 'river' || def.shape === 'pools' || def.shape === 'lagoon' || def.shape === 'channel' ? T.LETHAL : T.SOLID;
  for (let k = 0; k < cells.length; k++) {
    const t = cells[k];
    if (t !== T.SOLID && t !== T.LETHAL && t !== T.SPIKE && !seen[k]) cells[k] = deadFill === T.LETHAL ? T.LETHAL : T.SOLID;
  }
  for (const [a, b] of portals) { if (!seen[idx(a.x, a.y)] || !seen[idx(b.x, b.y)]) { cells[idx(a.x, a.y)] = T.FLOOR; cells[idx(b.x, b.y)] = T.FLOOR; } }

  const reachable = reach(cells, spawn, portals);
  void free0;
  return { map, n, diff: d.id, cells, obs, portals, spawn, reachable, def };
}
