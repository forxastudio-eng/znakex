// Pickup items (force field, magnet, return portal, golden star): drawing helpers and tuning.
import { IMG } from './assets.js';
import { glowSprite } from './fx.js';
import { TAU } from './util.js';

export const PW = {
  shield: { label: 'CAMPO DE FUERZA', short: 'ESCUDO', img: 'shield', glow: '#D8FF8A', hud: 'shield', text: 'Rompe 2 obstáculos', dur: 0 },
  magnet: { label: 'IMÁN DE ORBES', short: 'IMÁN', img: 'magnet', glow: '#C8FF4A', hud: 'hud_magnet', text: 'Atrae los orbes cercanos', dur: 8 },
  portal: { label: 'PORTAL DE REGRESO', short: 'PORTAL', img: 'portal', glow: '#3FE8C8', hud: 'hud_portal', text: 'Si chocas, vuelves al inicio', dur: 8 },
  star: { label: 'ESTRELLA DORADA', short: 'ESTRELLA', img: 'star', glow: '#FFD36A', hud: 'hud_star', text: 'Velocidad x2 e invencible', dur: 6 },
};
export const MAGNET_RANGE = 3.6; // cells
export const ITEM_LIFE = 12; // seconds a pickup waits on the board
export const SHIELD_CHARGES = 2;

// brand v2 art: pickups and HUD icons in brand/pw, effect sprites in brand/fx (older names kept as aliases)
const ALIAS = { burst_magnet: 'burst_lime', burst_portal: 'burst_lime', star_sparkle: 'star_pop' };
const FX_NAMES = new Set(['burst_gold', 'burst_lime', 'burst_white', 'magnet_ring', 'portal_glow', 'portal_vortex', 'shield_bubble', 'shield_crack1', 'shield_crack2', 'shield_shards', 'star_pop', 'star_streak']);
export const pwPath = (n) => { n = ALIAS[n] || n; return `brand/${FX_NAMES.has(n) ? 'fx' : 'pw'}/${n}.webp`; };
const P = (n) => IMG[pwPath(n)];
export const pwImg = P;

const tintCache = new Map();
// The force-field art is neutral white: tint it with the skin's colour once and cache it.
export function tinted(name, color) {
  const key = name + color;
  if (tintCache.has(key)) return tintCache.get(key);
  const im = P(name);
  if (!im) return null;
  const c = document.createElement('canvas');
  c.width = im.width; c.height = im.height;
  const g = c.getContext('2d');
  g.drawImage(im, 0, 0);
  g.globalCompositeOperation = 'source-atop';
  g.globalAlpha = 0.72;
  g.fillStyle = color;
  g.fillRect(0, 0, c.width, c.height);
  tintCache.set(key, c);
  return c;
}

export function skinColor(skin) {
  return skin.aura || (skin.colors && skin.colors[1]) || '#9CDA6B';
}

// A pickup lying on the board.
export function drawItem(g, it, cx, cy, cell, t) {
  const def = PW[it.type];
  const im = P(def.img);
  if (!im) return;
  const age = t - it.born;
  const left = it.life - age;
  if (left < 3 && Math.floor(t * 8) % 2 === 0) return; // blink before it disappears
  const pop = Math.min(1, age / 0.35);
  const s = cell * 1.05 * (0.4 + 0.6 * (1 - Math.pow(1 - pop, 3))) * (1 + 0.05 * Math.sin(t * 4 + it.x));
  const bob = Math.sin(t * 3 + it.y) * cell * 0.05;
  g.save();
  g.globalCompositeOperation = 'lighter';
  g.globalAlpha = 0.55 + 0.2 * Math.sin(t * 5);
  const gs = glowSprite(def.glow, 64);
  g.drawImage(gs, cx - cell * 1.15, cy - cell * 1.15 + bob, cell * 2.3, cell * 2.3);
  g.restore();
  // slow rotating light rays behind the item so it reads as a special pickup
  g.save();
  g.globalCompositeOperation = 'lighter';
  g.globalAlpha = 0.28 + 0.1 * Math.sin(t * 4);
  g.translate(cx, cy + bob);
  g.rotate(t * 0.6);
  g.fillStyle = def.glow;
  const rr = cell * 1.25;
  g.beginPath();
  for (let i = 0; i < 8; i++) { const an = (i / 8) * TAU; g.moveTo(0, 0); g.arc(0, 0, rr, an - 0.12, an + 0.12); }
  g.fill();
  g.restore();
  g.save();
  g.translate(cx, cy + bob);
  if (it.type === 'star') g.rotate(Math.sin(t * 2) * 0.15);
  const k = s / Math.max(im.width, im.height);
  g.drawImage(im, -im.width * k / 2, -im.height * k / 2, im.width * k, im.height * k);
  g.restore();
}

// Rings and shells drawn around the snake while an effect is active.
export function drawAuras(g, game, t) {
  const b = game.board, s = game.player;
  if (!s.alive || s.hidden) return;
  const h = s.cells[0];
  // head position with the same interpolation the snake uses
  const hp = game.headPixel();
  const cell = b.cell;
  if (game.pw.magnet > 0) {
    const im = P('magnet_ring');
    if (im) {
      const r = cell * 3.6 * (1 + 0.02 * Math.sin(t * 6));
      g.save();
      g.globalCompositeOperation = 'lighter';
      g.globalAlpha = 0.45 + 0.2 * Math.sin(t * 5);
      g.translate(hp.x, hp.y);
      g.rotate(t * 0.7);
      g.drawImage(im, -r, -r, r * 2, r * 2);
      g.restore();
    }
  }
  if (game.pw.shield > 0) {
    const col = skinColor(s.skin);
    const im = tinted(game.pw.shield === 1 ? 'shield_crack1' : 'shield_bubble', col);
    if (im) {
      const r = cell * 1.75 * (1 + 0.03 * Math.sin(t * 4));
      g.save();
      g.globalCompositeOperation = 'lighter';
      g.globalAlpha = 0.75;
      g.drawImage(im, hp.x - r, hp.y - r, r * 2, r * 2);
      g.restore();
    }
  }
  if (game.pw.portal > 0) {
    const im = P('portal_glow');
    if (im) {
      const r = cell * 1.6;
      g.save();
      g.globalCompositeOperation = 'lighter';
      g.globalAlpha = 0.45 + 0.2 * Math.sin(t * 6);
      g.translate(hp.x, hp.y);
      g.rotate(t * 1.2);
      const v = P('portal_vortex');
      if (v) g.drawImage(v, -r, -r, r * 2, r * 2);
      g.restore();
    }
  }
  void h;
}
