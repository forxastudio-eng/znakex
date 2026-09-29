// Board for the 16 story maps: ground, terrain (water / lava / void…), bridges,
// hazards, portals and obstacles all come from the map's own sheet.
import { COLS, ROWS } from './data.js';
import { Board } from './board.js';
import { IMG } from './assets.js';
import { MX } from './mapmanifest.js';
import { T } from './maps.js';
import { glowSprite } from './fx.js';
import { TAU } from './util.js';

const I = (map, name) => IMG[`mx/${String(map).padStart(2, '0')}/${name}`];
const k2 = (x, y) => y * COLS + x;

// deterministic per-cell noise so the ground never changes between renders
const noise = (x, y, s = 0) => {
  const v = Math.sin((x + 1) * 127.1 + (y + 1) * 311.7 + s * 74.7) * 43758.5453;
  return v - Math.floor(v);
};

const BRIDGE = {
  wood: { a: '#9A6A34', b: '#7A4E24', edge: '#3A2410', rail: '#5A3818' },
  dock: { a: '#A87A44', b: '#86602E', edge: '#3E2A14', rail: '#4E3418' },
  stone: { a: '#A9A79C', b: '#8C8A80', edge: '#3A3A36', rail: '#6E6C64' },
  metal: { a: '#59606E', b: '#464C58', edge: '#14161C', rail: '#20E6FF' },
  ice: { a: '#DDF4FF', b: '#B6E2F6', edge: '#4A86A8', rail: '#FFFFFF' },
};

export class MapBoard extends Board {
  constructor(level) {
    super({ floor: [], floorW: [], deco: [], decoRate: 0 }, null, {});
    this.level = level;
    this.map = level.map;
    this.def = level.def;
    this.mx = MX[level.map];
    const n = COLS * ROWS;
    this.solid = new Uint8Array(n);
    this.lethal = new Uint8Array(n);
    this.slow = new Uint8Array(n);
    this.ice = new Uint8Array(n);
    this.orbBlocked = new Uint8Array(n);
    this.portalMap = new Map();
    for (let k = 0; k < n; k++) {
      const t = level.cells[k];
      if (t === T.SOLID) this.solid[k] = 1;
      if (t === T.LETHAL || t === T.SPIKE) this.lethal[k] = 1;
      if (t === T.SLOW) this.slow[k] = 1;
      if (t === T.ICE) this.ice[k] = 1;
      if (t === T.SOLID || t === T.LETHAL || t === T.SPIKE || t === T.PORTAL || !level.reachable[k]) this.orbBlocked[k] = 1;
    }
    level.portals.forEach(([a, b], i) => {
      this.portalMap.set(k2(a.x, a.y), { x: b.x, y: b.y, pair: i });
      this.portalMap.set(k2(b.x, b.y), { x: a.x, y: a.y, pair: i });
    });
    this.torches = [];
  }

  isLethal(x, y) { return this.lethal[k2(x, y)] === 1; }
  isSlow(x, y) { return this.slow[k2(x, y)] === 1; }
  isIce(x, y) { return this.ice[k2(x, y)] === 1; }
  portalAt(x, y) { return this.portalMap.get(k2(x, y)) || null; }

  floorImg(x, y) {
    const n = this.mx.floor;
    // low-frequency value noise: variants form soft zones instead of loose tiles
    const vn = (px, py) => {
      const ix = Math.floor(px), iy = Math.floor(py), fx = px - ix, fy = py - iy;
      const a = noise(ix, iy, 21), b = noise(ix + 1, iy, 21), c = noise(ix, iy + 1, 21), d = noise(ix + 1, iy + 1, 21);
      const u = fx * fx * (3 - 2 * fx), v = fy * fy * (3 - 2 * fy);
      return a + (b - a) * u + (c - a) * v + (a - b - c + d) * u * v;
    };
    const r = vn(x / 3.2, y / 3.2) * 0.8 + noise(x, y, 4) * 0.2;
    const i = r < 0.6 ? 0 : r < 0.76 ? 1 : r < 0.88 ? 2 : Math.min(3, n - 1);
    return I(this.map, `floor${Math.min(i, n - 1)}.jpg`);
  }

  prerender(dpr) {
    const s = this.cell;
    const f = this.frame;
    const pad = f + Math.round(s * 0.9);
    const cw = this.w + pad * 2, ch = this.h + pad * 2;
    const c = document.createElement('canvas');
    c.width = Math.ceil(cw * dpr);
    c.height = Math.ceil(ch * dpr);
    const g = c.getContext('2d');
    g.scale(dpr, dpr);
    g.translate(pad, pad);
    this.static = { canvas: c, pad, w: cw, h: ch };
    const cells = this.level.cells;
    const at = (x, y) => (inb(x, y) ? cells[k2(x, y)] : T.SOLID);
    const isWet = (x, y) => { const t = at(x, y); return t === T.LETHAL; };

    // board drop shadow
    g.save();
    g.shadowColor = 'rgba(0,0,0,0.55)';
    g.shadowBlur = s * 0.8 * dpr;
    g.shadowOffsetY = s * 0.25 * dpr;
    g.fillStyle = '#14160f';
    g.fillRect(-f, -f, this.w + f * 2, this.h + f * 2);
    g.restore();

    const feat = I(this.map, 'feat.jpg');
    const slowT = I(this.map, 'slow.jpg');
    const iceT = I(this.map, 'ice.jpg');
    const drawTile = (im, x, y, flipSeed) => {
      if (!im) return;
      g.save();
      g.translate(x * s + s / 2, y * s + s / 2);
      g.scale(noise(x, y, flipSeed) < 0.5 ? -1 : 1, noise(y, x, flipSeed + 3) < 0.5 ? -1 : 1);
      g.drawImage(im, -s / 2 - 0.5, -s / 2 - 0.5, s + 1, s + 1);
      g.restore();
    };

    // ground + terrain
    for (let y = 0; y < ROWS; y++) {
      for (let x = 0; x < COLS; x++) {
        const t = cells[k2(x, y)];
        if (t === T.LETHAL) drawTile(feat || this.floorImg(x, y), x, y, 5);
        else if (t === T.SLOW && slowT) drawTile(slowT, x, y, 7);
        else if (t === T.ICE && iceT) drawTile(iceT, x, y, 9);
        else drawTile(this.floorImg(x, y), x, y, 2);
      }
    }
    // gentle mood tint keeps the board calmer than the pickups
    g.fillStyle = 'rgba(14,18,12,0.16)';
    g.fillRect(0, 0, this.w, this.h);
    if (this.def.mood) { g.fillStyle = this.def.mood; g.fillRect(0, 0, this.w, this.h); }

    // shorelines, drawn on the terrain side of every edge
    const shore = this.def.shore || '#ffffff';
    g.save();
    for (let y = 0; y < ROWS; y++) {
      for (let x = 0; x < COLS; x++) {
        if (!isWet(x, y)) continue;
        for (const [dx, dy] of [[0, -1], [1, 0], [0, 1], [-1, 0]]) {
          const nx = x + dx, ny = y + dy;
          if (!inb(nx, ny) || isWet(nx, ny)) continue;
          const gx0 = x * s + (dx === 1 ? s : dx === -1 ? 0 : 0);
          const gy0 = y * s + (dy === 1 ? s : dy === -1 ? 0 : 0);
          const gr = g.createLinearGradient(gx0, gy0, gx0 - dx * s * 0.34, gy0 - dy * s * 0.34);
          gr.addColorStop(0, 'rgba(0,10,20,0.5)');
          gr.addColorStop(1, 'rgba(0,10,20,0)');
          g.fillStyle = gr;
          g.fillRect(x * s, y * s, s, s);
        }
      }
    }
    g.lineCap = 'round';
    for (let y = 0; y < ROWS; y++) {
      for (let x = 0; x < COLS; x++) {
        if (!isWet(x, y)) continue;
        g.strokeStyle = shore;
        g.globalAlpha = 0.55;
        g.lineWidth = Math.max(1.5, s * 0.05);
        g.beginPath();
        for (const [dx, dy] of [[0, -1], [1, 0], [0, 1], [-1, 0]]) {
          const nx = x + dx, ny = y + dy;
          if (!inb(nx, ny) || isWet(nx, ny)) continue;
          if (dy === -1) { g.moveTo(x * s + 2, y * s + 1); g.lineTo((x + 1) * s - 2, y * s + 1); }
          if (dy === 1) { g.moveTo(x * s + 2, (y + 1) * s - 1); g.lineTo((x + 1) * s - 2, (y + 1) * s - 1); }
          if (dx === -1) { g.moveTo(x * s + 1, y * s + 2); g.lineTo(x * s + 1, (y + 1) * s - 2); }
          if (dx === 1) { g.moveTo((x + 1) * s - 1, y * s + 2); g.lineTo((x + 1) * s - 1, (y + 1) * s - 2); }
        }
        g.stroke();
      }
    }
    g.restore();

    // faint grid for readability
    g.strokeStyle = 'rgba(10,14,8,0.10)';
    g.lineWidth = 1;
    g.beginPath();
    for (let x = 1; x < COLS; x++) { g.moveTo(x * s, 0); g.lineTo(x * s, this.h); }
    for (let y = 1; y < ROWS; y++) { g.moveTo(0, y * s); g.lineTo(this.w, y * s); }
    g.stroke();

    // bridges
    for (let y = 0; y < ROWS; y++) for (let x = 0; x < COLS; x++) if (cells[k2(x, y)] === T.BRIDGE) this.drawBridge(g, x, y, at);

    // spikes / hazards
    const spikeIdx = Math.min(this.def.spike || 0, this.mx.haz - 1);
    const spike = I(this.map, `haz${spikeIdx}.png`);
    for (let y = 0; y < ROWS; y++) {
      for (let x = 0; x < COLS; x++) {
        if (cells[k2(x, y)] !== T.SPIKE || !spike) continue;
        const sc = Math.min((s * 1.04) / spike.width, (s * 1.04) / spike.height);
        const w = spike.width * sc, h = spike.height * sc;
        g.fillStyle = 'rgba(0,0,0,0.3)';
        g.beginPath(); g.ellipse(x * s + s / 2, y * s + s * 0.78, w * 0.42, s * 0.14, 0, 0, TAU); g.fill();
        g.drawImage(spike, x * s + (s - w) / 2, y * s + (s - h) / 2, w, h);
      }
    }

    // portal bases (the swirl animates in drawLive)
    for (const [key] of this.portalMap) {
      const x = key % COLS, y = (key / COLS) | 0;
      g.fillStyle = 'rgba(0,0,0,0.35)';
      g.beginPath(); g.ellipse(x * s + s / 2, y * s + s * 0.62, s * 0.4, s * 0.3, 0, 0, TAU); g.fill();
    }

    // obstacles, back to front
    const obs = [...this.level.obs].sort((a, b) => a.y - b.y);
    for (const o of obs) this.drawObstacle(g, o);

    this.drawFrame(g, f);

    // lights for the live layer
    this.torches = [];
    if (this.def.torches) {
      for (const [tx, ty] of [[-f * 0.5, this.h * 0.2], [this.w + f * 0.5, this.h * 0.2], [-f * 0.5, this.h * 0.8], [this.w + f * 0.5, this.h * 0.8]]) this.torches.push({ x: tx, y: ty, c: '#FFB040' });
    }
  }

  drawBridge(g, x, y, at) {
    const s = this.cell;
    const m = BRIDGE[this.def.bridge] || BRIDGE.wood;
    const wet = (xx, yy) => at(xx, yy) === T.LETHAL;
    // planks run across the direction of travel: vertical crossings when water is above/below
    const vertical = wet(x, y - 1) || wet(x, y + 1) || (!wet(x - 1, y) && !wet(x + 1, y) && (at(x, y - 1) === T.BRIDGE || at(x, y + 1) === T.BRIDGE));
    const px = x * s, py = y * s;
    // shadow on the water
    g.fillStyle = 'rgba(0,0,0,0.28)';
    g.fillRect(px + s * 0.06, py + s * 0.1, s * 0.94, s * 0.94);
    // deck
    g.fillStyle = m.a;
    g.fillRect(px, py, s, s);
    g.strokeStyle = m.edge;
    g.lineWidth = Math.max(1.5, s * 0.045);
    const planks = 4;
    for (let i = 0; i < planks; i++) {
      const o = (i / planks) * s;
      g.fillStyle = i % 2 ? m.b : m.a;
      if (vertical) g.fillRect(px, py + o, s, s / planks);
      else g.fillRect(px + o, py, s / planks, s);
      g.beginPath();
      if (vertical) { g.moveTo(px, py + o); g.lineTo(px + s, py + o); } else { g.moveTo(px + o, py); g.lineTo(px + o, py + s); }
      g.stroke();
    }
    g.globalAlpha = 0.25;
    g.fillStyle = '#fff';
    if (vertical) g.fillRect(px, py, s, s * 0.06); else g.fillRect(px, py, s * 0.06, s);
    g.globalAlpha = 1;
    // side rails (only on the sides facing water)
    g.strokeStyle = m.rail;
    g.lineWidth = Math.max(2, s * 0.08);
    g.beginPath();
    if (vertical) {
      if (!at(x - 1, y) || wet(x - 1, y)) { g.moveTo(px + 1, py); g.lineTo(px + 1, py + s); }
      if (!at(x + 1, y) || wet(x + 1, y)) { g.moveTo(px + s - 1, py); g.lineTo(px + s - 1, py + s); }
    } else {
      if (wet(x, y - 1)) { g.moveTo(px, py + 1); g.lineTo(px + s, py + 1); }
      if (wet(x, y + 1)) { g.moveTo(px, py + s - 1); g.lineTo(px + s, py + s - 1); }
    }
    g.stroke();
    g.strokeStyle = m.edge;
    g.lineWidth = 1.2;
    g.strokeRect(px + 0.5, py + 0.5, s - 1, s - 1);
  }

  drawObstacle(g, o) {
    const s = this.cell;
    const im = I(this.map, `obs${o.s}.png`);
    if (!im) return;
    const cx = o.x * s + s / 2, by = o.y * s + s * 0.9;
    const maxd = s * (im.width > im.height * 1.4 ? 1.25 : 1.12);
    const sc = Math.min(maxd / im.width, (s * 1.22) / im.height);
    const w = im.width * sc, h = im.height * sc;
    g.fillStyle = 'rgba(0,0,0,0.38)';
    g.beginPath(); g.ellipse(cx + s * 0.05, by - s * 0.06, w * 0.42, s * 0.16, 0, 0, TAU); g.fill();
    g.drawImage(im, cx - w / 2, by - h, w, h);
  }

  drawFrame(g, f) {
    const s = this.cell;
    const wall = I(this.map, 'wall.png');
    const corner = I(this.map, 'corner.png') || wall;
    if (!wall) return;
    // top, bottom, left, right with the map's own wall piece. The piece's own
    // outline is trimmed on both ends so neighbours join without dark seams.
    const seg = (x, y, w, h) => {
      const cut = wall.width * 0.06;
      g.drawImage(wall, cut, 0, wall.width - cut * 2, wall.height, x, y, w, h);
    };
    for (let i = 0; i < COLS; i++) {
      seg(i * s - 0.3, -f, s + 0.6, f);
      g.save();
      g.translate(i * s, this.h + f);
      g.scale(1, -1);
      seg(-0.3, 0, s + 0.6, f);
      g.restore();
    }
    for (let j = 0; j < ROWS; j++) {
      g.save();
      g.translate(-f, j * s + s);
      g.rotate(-Math.PI / 2);
      seg(-0.3, 0, s + 0.6, f);
      g.restore();
      g.save();
      g.translate(this.w + f, j * s);
      g.rotate(Math.PI / 2);
      seg(-0.3, 0, s + 0.6, f);
      g.restore();
    }
    // corners
    const cs = f * 1.25;
    for (const [cx, cy, sx, sy] of [[-f, -f, 1, 1], [this.w + f, -f, -1, 1], [-f, this.h + f, 1, -1], [this.w + f, this.h + f, -1, -1]]) {
      g.save();
      g.translate(cx, cy);
      g.scale(sx, sy);
      g.drawImage(corner, 0, 0, cs, cs);
      g.restore();
    }
    g.strokeStyle = 'rgba(0,0,0,0.5)';
    g.lineWidth = 2;
    g.strokeRect(0, 0, this.w, this.h);
  }

  drawLive(g, t, glowBoost = 0) {
    const s = this.cell;
    const cells = this.level.cells;
    g.save();
    g.translate(this.x, this.y);
    const def = this.def;
    g.globalCompositeOperation = 'lighter';
    // glowing terrain (lava, toxic, energy, moon water…)
    if (def.glow) {
      const K = def.glowK ?? 0.16;
      g.fillStyle = def.glow;
      for (let y = 0; y < ROWS; y++) {
        for (let x = 0; x < COLS; x++) {
          const ty = cells[k2(x, y)];
          if (ty !== T.LETHAL) continue;
          g.globalAlpha = K * (0.7 + 0.3 * Math.sin(t * 2 + x * 0.9 + y * 1.3));
          g.fillRect(x * s, y * s, s, s);
        }
      }
    }
    // water shimmer: moving highlights
    if (!def.glow || def.glowK) {
      g.strokeStyle = def.shore || '#fff';
      g.lineWidth = Math.max(1, s * 0.03);
      g.lineCap = 'round';
      for (let y = 0; y < ROWS; y++) {
        for (let x = 0; x < COLS; x++) {
          if (cells[k2(x, y)] !== T.LETHAL) continue;
          const ph = t * 0.9 + x * 1.7 + y * 2.3;
          const a = 0.5 + 0.5 * Math.sin(ph);
          g.globalAlpha = 0.16 * a;
          const yy = y * s + s * (0.25 + 0.5 * ((ph / TAU) % 1));
          g.beginPath();
          g.moveTo(x * s + s * 0.2, yy);
          g.lineTo(x * s + s * 0.55, yy + Math.sin(ph) * s * 0.03);
          g.stroke();
        }
      }
    }
    // ice shine
    for (let y = 0; y < ROWS; y++) {
      for (let x = 0; x < COLS; x++) {
        if (cells[k2(x, y)] !== T.ICE) continue;
        const sweep = ((t * 0.35 + (x + y) * 0.09) % 1);
        g.globalAlpha = 0.18 * Math.max(0, Math.sin(sweep * Math.PI));
        g.fillStyle = '#ffffff';
        g.fillRect(x * s, y * s, s, s);
      }
    }
    // portals
    const portal = I(this.map, 'portal.png');
    for (const [key, p] of this.portalMap) {
      const x = key % COLS, y = (key / COLS) | 0;
      const col = p.pair === 0 ? '#38E8FF' : '#FF5AE8';
      const cx = x * s + s / 2, cy = y * s + s / 2;
      const sp = glowSprite(col, 64);
      g.globalAlpha = 0.65 + 0.25 * Math.sin(t * 3 + key);
      g.drawImage(sp, cx - s * 0.95, cy - s * 0.95, s * 1.9, s * 1.9);
      g.save();
      g.translate(cx, cy);
      g.rotate(t * 1.6 * (p.pair ? -1 : 1));
      g.globalAlpha = 0.9;
      g.strokeStyle = col;
      g.lineWidth = s * 0.07;
      g.beginPath();
      g.arc(0, 0, s * 0.36, 0, TAU * 0.72);
      g.stroke();
      g.rotate(1.9);
      g.lineWidth = s * 0.04;
      g.beginPath();
      g.arc(0, 0, s * 0.24, 0, TAU * 0.55);
      g.stroke();
      g.restore();
    }
    g.globalCompositeOperation = 'source-over';
    if (portal) {
      for (const [key, p] of this.portalMap) {
        const x = key % COLS, y = (key / COLS) | 0;
        const sc = Math.min((s * 0.8) / portal.width, (s * 0.95) / portal.height);
        g.globalAlpha = 0.55;
        g.drawImage(portal, x * s + s / 2 - (portal.width * sc) / 2, y * s + s / 2 - (portal.height * sc) / 2, portal.width * sc, portal.height * sc);
        void p;
      }
    }
    g.globalAlpha = 1;
    g.globalCompositeOperation = 'lighter';
    for (const tc of this.torches) {
      const fl = 0.75 + 0.25 * Math.sin(t * 17 + tc.x) * Math.sin(t * 7.3 + tc.y);
      g.globalAlpha = 0.5 * fl;
      const sp = glowSprite(tc.c, 64);
      const r = s * 1.7;
      g.drawImage(sp, tc.x - r, tc.y - r, r * 2, r * 2);
    }
    // drifting canopy light
    g.globalCompositeOperation = 'soft-light';
    for (let k = 0; k < 3; k++) {
      const px = this.w * (0.5 + 0.45 * Math.sin(t * 0.07 + k * 2.1));
      const py = this.h * (0.5 + 0.45 * Math.cos(t * 0.05 + k * 1.3));
      const r = this.w * 0.55;
      g.globalAlpha = 0.3;
      const sp = glowSprite('#FFE7A0', 128);
      g.drawImage(sp, px - r, py - r, r * 2, r * 2);
    }
    g.restore();
    void glowBoost;
  }
}

function inb(x, y) { return x >= 0 && y >= 0 && x < COLS && y < ROWS; }
