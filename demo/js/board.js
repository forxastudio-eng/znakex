// Board: layout on screen, pre-rendered static art (floor, frame, obstacles) and live overlays.
import { COLS, ROWS } from './data.js';
import { IMG } from './assets.js';
import { rand, TAU } from './util.js';
import { glowSprite } from './fx.js';

const THEMES = {
  court: {
    floor: ['tiles/court/floor0.jpg', 'tiles/court/floor1.jpg', 'tiles/court/floor2.jpg', 'tiles/court/floor3.jpg'],
    floorW: [0, 5, 4, 1],
    deco: ['tiles/court/deco0.png', 'tiles/court/deco1.png', 'tiles/court/deco2.png', 'tiles/court/deco4.png', 'tiles/court/deco3.png'],
    decoRate: 0.13,
    wallH: 'tiles/court/wall_h.png', wallV: 'tiles/court/wall_v.png', corner: 'tiles/court/wall_corner.png',
    wallAlt: ['tiles/court/wall_ivy.png', 'tiles/court/wall_rune.png'],
    tint: 'rgba(40,70,30,0.10)',
  },
  glade: {
    floor: ['tiles/glade/floor0.jpg', 'tiles/glade/floor1.jpg', 'tiles/glade/floor2.jpg', 'tiles/glade/floor3.jpg'],
    floorW: [1, 4, 0, 3],
    deco: ['tiles/glade/deco2.png', 'tiles/glade/deco1.png'],
    decoRate: 0.08,
    noWalls: true,
    tint: 'rgba(30,20,0,0.18)',
  },
  ritual: {
    floor: ['tiles/ritual/floor0.jpg', 'tiles/ritual/floor1.jpg', 'tiles/ritual/floor2.jpg', 'tiles/ritual/floor3.jpg'],
    floorW: [3, 1, 4, 2],
    deco: [],
    decoRate: 0,
    wallH: 'tiles/ritual/wall_h.png', wallV: 'tiles/ritual/wall_v.png', corner: 'tiles/ritual/wall_corner.png',
    torches: true,
    sigil: true,
    tint: 'rgba(0,0,0,0.12)',
  },
};

// Theme for a story map: its own ground tiles, court walls and ruin obstacles
// tinted with the map colour.
export function mapTheme(mapInfo) {
  if (!mapInfo || mapInfo.id === 1) return 'court';
  const nn = String(mapInfo.sheet).padStart(2, '0');
  return {
    ...THEMES.court,
    floor: [0, 1, 2].map((k) => `tiles/maps/m${nn}_f${k}.jpg`),
    floorW: [4, 3, 2],
    tileCells: 1,
    deco: [],
    decoRate: 0,
    tint: 'rgba(0,0,0,0.06)',
    colorize: mapInfo.tint,
  };
}

// Tinted copy of an image (cached), used for walls and obstacles of each map.
const tintCache = new Map();
function tinted(img, color, amount = 0.38) {
  if (!img || !color) return img;
  const key = img.src + color;
  if (tintCache.has(key)) return tintCache.get(key);
  const c = document.createElement('canvas');
  c.width = img.width; c.height = img.height;
  const g = c.getContext('2d');
  g.drawImage(img, 0, 0);
  g.globalCompositeOperation = 'source-atop';
  g.globalAlpha = amount;
  g.fillStyle = color;
  g.fillRect(0, 0, c.width, c.height);
  tintCache.set(key, c);
  return c;
}

function weighted(list, weights) {
  let total = weights.reduce((a, b) => a + b, 0), r = Math.random() * total;
  for (let i = 0; i < list.length; i++) { r -= weights[i]; if (r <= 0) return list[i]; }
  return list[0];
}

export class Board {
  constructor(theme, layout, opts = {}) {
    this.theme = typeof theme === 'string' ? THEMES[theme] : theme;
    this.themeName = typeof theme === 'string' ? theme : 'map';
    this.layout = layout; // array of ROWS strings or null
    this.opts = opts;
    this.solid = new Uint8Array(COLS * ROWS);
    this.obstacles = [];
    if (layout) this.parse(layout);
    this.torches = [];
  }

  parse(layout) {
    for (let y = 0; y < ROWS; y++) {
      const row = layout[y] || '';
      for (let x = 0; x < COLS; x++) {
        const ch = row[x] || '.';
        if (ch === '.' || ch === 'c') continue;
        if (ch === 'C') {
          this.obstacles.push({ type: 'C', x, y, w: 2, h: 1 });
          this.solid[y * COLS + x] = 1;
          if (x + 1 < COLS) this.solid[y * COLS + x + 1] = 1;
        } else {
          this.obstacles.push({ type: ch, x, y, w: 1, h: 1 });
          this.solid[y * COLS + x] = 1;
        }
      }
    }
  }

  isSolid(x, y) {
    return this.solid[y * COLS + x] === 1;
  }

  // Place the board inside the canvas area (css px).
  layoutIn(W, H, top, bottom) {
    const cell = Math.floor(Math.min(W / 13.1, (H - top - bottom) / 19.2));
    this.cell = cell;
    this.w = cell * COLS;
    this.h = cell * ROWS;
    this.frame = Math.round(cell * 0.62);
    this.x = Math.round((W - this.w) / 2);
    this.y = Math.round(top + (H - top - bottom - this.h) / 2);
    this.W = W; this.H = H;
  }

  cx(x) { return this.x + (x + 0.5) * this.cell; }
  cy(y) { return this.y + (y + 0.5) * this.cell; }

  prerender(dpr) {
    const f = this.theme.noWalls ? Math.round(this.cell * 0.25) : this.frame;
    const pad = f + Math.round(this.cell * 0.9);
    const cw = this.w + pad * 2, ch = this.h + pad * 2;
    const c = document.createElement('canvas');
    c.width = Math.ceil(cw * dpr);
    c.height = Math.ceil(ch * dpr);
    const g = c.getContext('2d');
    g.scale(dpr, dpr);
    g.translate(pad, pad);
    this.static = { canvas: c, pad, w: cw, h: ch };
    const s = this.cell;
    const T = this.theme;

    // outer drop shadow of the whole board
    g.save();
    g.shadowColor = 'rgba(0,0,0,0.55)';
    g.shadowBlur = s * 0.8 * dpr;
    g.shadowOffsetY = s * 0.25 * dpr;
    g.fillStyle = '#1a1c16';
    g.fillRect(-f, -f, this.w + f * 2, this.h + f * 2);
    g.restore();

    // floor: tiles cover 2x2 cells (hi-res arenas) or 1 cell (map sheets),
    // randomly mirrored to hide repetition
    const tc = T.tileCells || 2;
    for (let y = 0; y < ROWS; y += tc) {
      for (let x = 0; x < COLS; x += tc) {
        const im = IMG[weighted(T.floor, T.floorW)];
        if (!im) continue;
        const hs = (s * tc) / 2;
        g.save();
        g.translate(x * s + hs, y * s + hs);
        g.scale(Math.random() < 0.5 ? -1 : 1, Math.random() < 0.5 ? -1 : 1);
        g.drawImage(im, -hs - 0.5, -hs - 0.5, hs * 2 + 1, hs * 2 + 1);
        g.restore();
      }
    }
    // decorations (non-blocking)
    for (let y = 0; y < ROWS; y++) {
      for (let x = 0; x < COLS; x++) {
        if (Math.random() > T.decoRate || this.isSolid(x, y)) continue;
        const im = IMG[T.deco[Math.floor(Math.random() * T.deco.length)]];
        if (!im) continue;
        g.globalAlpha = 0.85;
        g.drawImage(im, x * s, y * s, s, s);
        g.globalAlpha = 1;
      }
    }
    // calm the floor so orbs and snakes always stand out
    g.fillStyle = 'rgba(18,22,14,0.2)';
    g.fillRect(0, 0, this.w, this.h);
    // tint + faint grid for readability
    g.fillStyle = T.tint;
    g.fillRect(0, 0, this.w, this.h);
    g.strokeStyle = 'rgba(10,14,8,0.10)';
    g.lineWidth = 1;
    g.beginPath();
    for (let x = 1; x < COLS; x++) { g.moveTo(x * s, 0); g.lineTo(x * s, this.h); }
    for (let y = 1; y < ROWS; y++) { g.moveTo(0, y * s); g.lineTo(this.w, y * s); }
    g.stroke();

    // ritual sigil
    if (T.sigil && IMG['tiles/ritual/sigil.png']) {
      const sw = s * 4.6, sh = sw * 0.925;
      g.globalAlpha = 0.9;
      g.drawImage(IMG['tiles/ritual/sigil.png'], this.w / 2 - sw / 2, this.h / 2 - sh / 2, sw, sh);
      g.globalAlpha = 1;
      this.sigil = { x: this.w / 2 - sw / 2, y: this.h / 2 - sh / 2, w: sw, h: sh };
    }
    // spawn runes
    for (const sp of this.opts.spawns || []) {
      const im = IMG[sp.img];
      if (!im) continue;
      g.globalAlpha = 0.85;
      g.drawImage(im, sp.x * s - s * 0.35, sp.y * s - s * 0.35, s * 1.7, s * 1.7);
      g.globalAlpha = 1;
    }

    // inner vignette
    const vg = g.createRadialGradient(this.w / 2, this.h / 2, this.h * 0.25, this.w / 2, this.h / 2, this.h * 0.75);
    vg.addColorStop(0, 'rgba(0,0,0,0)');
    vg.addColorStop(1, 'rgba(0,0,0,0.38)');
    g.fillStyle = vg;
    g.fillRect(0, 0, this.w, this.h);
    // inner edge shade
    const e = s * 0.5;
    for (const [x, y, w, h, gx0, gy0, gx1, gy1] of [
      [0, 0, this.w, e, 0, 0, 0, e], [0, this.h - e, this.w, e, 0, this.h, 0, this.h - e],
      [0, 0, e, this.h, 0, 0, e, 0], [this.w - e, 0, e, this.h, this.w, 0, this.w - e, 0]]) {
      const lg = g.createLinearGradient(gx0, gy0, gx1, gy1);
      lg.addColorStop(0, 'rgba(0,0,0,0.35)');
      lg.addColorStop(1, 'rgba(0,0,0,0)');
      g.fillStyle = lg;
      g.fillRect(x, y, w, h);
    }

    // obstacles (sorted by row so lower ones overlap upper ones)
    const obs = [...this.obstacles].sort((a, b) => a.y - b.y);
    for (const o of obs) this.drawObstacle(g, o);

    // frame
    if (!T.noWalls) this.drawFrame(g, f);
  }

  drawObstacle(g, o) {
    const s = this.cell;
    const x = o.x * s, y = o.y * s;
    // contact shadow
    g.save();
    g.fillStyle = 'rgba(0,0,0,0.35)';
    g.beginPath();
    g.ellipse(x + (o.w * s) / 2 + s * 0.08, y + s * 0.62, (o.w * s) / 2 * 0.95, s * 0.36, 0, 0, TAU);
    g.fill();
    g.restore();
    let im, dw, dh, dx, dy;
    if (o.type === 'P') {
      im = IMG['tiles/ritual/pillar.png']; dw = s * 1.12; dh = dw * (181 / 178); dx = x - s * 0.06; dy = y + s - dh + s * 0.06;
    } else if (o.type === 'T') {
      im = IMG['tiles/ritual/totem.png']; dw = s * 1.12; dh = dw * (180 / 176); dx = x - s * 0.06; dy = y + s - dh + s * 0.06;
    } else if (o.type === 'C') {
      im = IMG['tiles/ritual/column.png']; dw = s * 2.1; dh = dw * (180 / 257); dx = x - s * 0.05; dy = y + s - dh + s * 0.12;
    } else {
      const alt = this.theme.wallAlt || [];
      const pickAlt = (o.x * 7 + o.y * 13) % 5 === 0 && alt.length;
      im = IMG[pickAlt ? alt[(o.x + o.y) % alt.length] : this.theme.wallH || 'tiles/court/wall_h.png'];
      dw = s * 1.04; dh = s * 1.04; dx = x - s * 0.02; dy = y - s * 0.02;
    }
    if (im) g.drawImage(tinted(im, this.theme.colorize), dx, dy, dw, dh);
  }

  drawFrame(g, f) {
    const T = this.theme, s = this.cell;
    const wh = tinted(IMG[T.wallH], T.colorize), wv = tinted(IMG[T.wallV], T.colorize), wc = tinted(IMG[T.corner], T.colorize);
    this.torches = [];
    // top & bottom
    for (let i = 0; i < COLS; i++) {
      const torch = T.torches && (i === 2 || i === 9);
      const top = torch ? IMG['tiles/ritual/wall_torch_crimson.png'] : wh;
      const bot = torch ? IMG['tiles/ritual/wall_torch_amber.png'] : wh;
      if (top) g.drawImage(top, i * s, -f, s + 0.5, f);
      if (bot) {
        g.save();
        g.translate(i * s, this.h + f);
        g.scale(1, -1);
        g.drawImage(bot, 0, 0, s + 0.5, f);
        g.restore();
      }
      if (torch) {
        this.torches.push({ x: (i + 0.62) * s, y: -f * 0.5, c: '#FF3A3A' });
        this.torches.push({ x: (i + 0.62) * s, y: this.h + f * 0.5, c: '#FFB040' });
      }
    }
    // left & right
    for (let j = 0; j < ROWS; j++) {
      if (!wv) break;
      g.drawImage(wv, -f, j * s, f, s + 0.5);
      g.save();
      g.translate(this.w + f, j * s);
      g.scale(-1, 1);
      g.drawImage(wv, 0, 0, f, s + 0.5);
      g.restore();
    }
    if (T.torches) {
      for (const j of [4, 13]) {
        this.torches.push({ x: -f * 0.5, y: (j + 0.5) * s, c: j < 9 ? '#FF3A3A' : '#FFB040' });
        this.torches.push({ x: this.w + f * 0.5, y: (j + 0.5) * s, c: j < 9 ? '#FF3A3A' : '#FFB040' });
      }
    }
    // corners
    const corners = [[-f, -f, 1, 1], [this.w + f, -f, -1, 1], [-f, this.h + f, 1, -1], [this.w + f, this.h + f, -1, -1]];
    for (const [cx, cy, sx, sy] of corners) {
      if (this.opts.statues && IMG['tiles/court/statue.png']) continue;
      if (!wc) continue;
      g.save();
      g.translate(cx, cy);
      g.scale(sx, sy);
      g.drawImage(wc, 0, 0, f, f);
      g.restore();
    }
    if (this.opts.statues && IMG['tiles/court/statue.png']) {
      const st = IMG['tiles/court/statue.png'];
      const d = s * 1.25;
      for (const [cx, cy, sx, sy] of corners) {
        g.save();
        g.translate(cx + sx * (d / 2 - f * 0.5) - (sx < 0 ? 0 : 0), cy + sy * (d / 2 - f * 0.5));
        g.scale(sx, 1);
        g.drawImage(st, -d / 2, -d / 2, d, d);
        g.restore();
      }
    }
    // frame bevel line
    g.strokeStyle = 'rgba(242,239,230,0.12)';
    g.lineWidth = 2;
    g.strokeRect(-f + 1, -f + 1, this.w + f * 2 - 2, this.h + f * 2 - 2);
  }

  drawStatic(g) {
    const st = this.static;
    g.drawImage(st.canvas, this.x - st.pad, this.y - st.pad, st.w, st.h);
  }

  // Animated overlays: torches, sigil pulse, glade edges, drifting light.
  drawLive(g, t, glowBoost = 0) {
    const s = this.cell;
    g.save();
    g.translate(this.x, this.y);
    g.globalCompositeOperation = 'lighter';
    if (this.sigil && IMG['tiles/ritual/sigil_glow.png']) {
      g.globalAlpha = 0.18 + 0.14 * Math.sin(t * 1.6) + glowBoost * 0.4;
      const sg = this.sigil;
      g.drawImage(IMG['tiles/ritual/sigil_glow.png'], sg.x, sg.y, sg.w, sg.h);
    }
    for (const tc of this.torches) {
      const fl = 0.75 + 0.25 * Math.sin(t * 17 + tc.x) * Math.sin(t * 7.3 + tc.y);
      g.globalAlpha = 0.55 * fl;
      const sp = glowSprite(tc.c, 64);
      const r = s * 1.6 * (0.9 + 0.1 * fl);
      g.drawImage(sp, tc.x - r, tc.y - r, r * 2, r * 2);
    }
    if (this.theme.noWalls) {
      const pulse = 0.55 + 0.25 * Math.sin(t * 2.4);
      g.globalAlpha = pulse;
      g.strokeStyle = '#FFC94A';
      g.shadowColor = '#FFB020';
      g.shadowBlur = s * 0.5;
      g.lineWidth = s * 0.08;
      g.strokeRect(-s * 0.06, -s * 0.06, this.w + s * 0.12, this.h + s * 0.12);
      g.shadowBlur = 0;
      // sparks running along the edge
      const per = 2 * (this.w + this.h);
      const sp = glowSprite('#FFD36A', 64);
      for (let k = 0; k < 6; k++) {
        let d = ((t * 90 + (k * per) / 6) % per);
        let px, py;
        if (d < this.w) { px = d; py = 0; } else if ((d -= this.w) < this.h) { px = this.w; py = d; }
        else if ((d -= this.h) < this.w) { px = this.w - d; py = this.h; } else { d -= this.w; px = 0; py = this.h - d; }
        g.globalAlpha = 0.9;
        g.drawImage(sp, px - s * 0.4, py - s * 0.4, s * 0.8, s * 0.8);
      }
    }
    // slow drifting light patches (sun through the canopy)
    g.globalCompositeOperation = 'soft-light';
    for (let k = 0; k < 3; k++) {
      const px = this.w * (0.5 + 0.45 * Math.sin(t * 0.07 + k * 2.1));
      const py = this.h * (0.5 + 0.45 * Math.cos(t * 0.05 + k * 1.3));
      const r = this.w * 0.55;
      g.globalAlpha = 0.35;
      const sp = glowSprite('#FFE7A0', 128);
      g.drawImage(sp, px - r, py - r, r * 2, r * 2);
    }
    g.restore();
  }
}

export function randomFreeCell(board, occupied, avoid) {
  const free = [];
  for (let y = 0; y < ROWS; y++) {
    for (let x = 0; x < COLS; x++) {
      const k = y * COLS + x;
      if (board.solid[k] || occupied.has(k)) continue;
      if (avoid && Math.abs(avoid.x - x) + Math.abs(avoid.y - y) < 3) continue;
      free.push({ x, y });
    }
  }
  if (!free.length) return null;
  return free[Math.floor(rand(free.length))];
}
