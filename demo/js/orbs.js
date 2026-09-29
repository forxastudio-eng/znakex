// Orb rendering: crimson orb and radiant golden orb.
import { TAU, ease, clamp } from './util.js';
import { glowSprite } from './fx.js';

const sphereCache = new Map();

function sphere(type, size) {
  const key = type + size;
  if (sphereCache.has(key)) return sphereCache.get(key);
  const c = document.createElement('canvas');
  c.width = c.height = size;
  const g = c.getContext('2d');
  const r = size / 2;
  const cols = type === 'gold'
    ? ['#FFFBE0', '#FFE27A', '#FFB81A', '#B86A00', '#5A2E00']
    : ['#FFD3D3', '#FF6A6A', '#E0142E', '#8A0618', '#3A0008'];
  const grd = g.createRadialGradient(r * 0.72, r * 0.62, r * 0.05, r, r, r);
  grd.addColorStop(0, cols[0]);
  grd.addColorStop(0.2, cols[1]);
  grd.addColorStop(0.55, cols[2]);
  grd.addColorStop(0.88, cols[3]);
  grd.addColorStop(1, cols[4]);
  g.fillStyle = grd;
  g.beginPath();
  g.arc(r, r, r * 0.98, 0, TAU);
  g.fill();
  // rim light
  g.strokeStyle = type === 'gold' ? 'rgba(255,240,180,0.55)' : 'rgba(255,150,150,0.45)';
  g.lineWidth = size * 0.035;
  g.beginPath();
  g.arc(r, r, r * 0.9, Math.PI * 0.15, Math.PI * 0.85);
  g.stroke();
  // specular
  g.fillStyle = 'rgba(255,255,255,0.9)';
  g.beginPath();
  g.ellipse(r * 0.66, r * 0.55, r * 0.22, r * 0.14, -0.6, 0, TAU);
  g.fill();
  g.fillStyle = 'rgba(255,255,255,0.5)';
  g.beginPath();
  g.arc(r * 1.3, r * 1.35, r * 0.06, 0, TAU);
  g.fill();
  sphereCache.set(key, c);
  return c;
}

/**
 * o: { spawnK 0..1, warn bool, t, big (frenzy) }
 */
export function drawOrb(g, x, y, cell, type, t, o = {}) {
  const k = o.spawnK ?? 1;
  const sc = k < 1 ? ease.outBack(k) : 1;
  const bob = Math.sin(t * 3 + x * 0.1) * cell * 0.03;
  const pulse = 0.5 + 0.5 * Math.sin(t * 4 + y * 0.1);
  let alpha = 1;
  if (o.warn) alpha = 0.35 + 0.65 * (0.5 + 0.5 * Math.sin(t * 20));
  const r = cell * (type === 'gold' ? 0.3 : 0.27) * sc;
  const cy = y + bob;

  g.save();
  g.globalAlpha = alpha;
  // floor shadow
  g.fillStyle = 'rgba(0,0,0,0.3)';
  g.beginPath();
  g.ellipse(x + cell * 0.04, y + cell * 0.28, r * 0.9, r * 0.35, 0, 0, TAU);
  g.fill();

  g.globalCompositeOperation = 'lighter';
  const hc = type === 'gold' ? '#FFC23A' : '#FF2A3A';
  const halo = glowSprite(hc, 128);
  const hr = r * (2.6 + 0.5 * pulse);
  g.globalAlpha = alpha * (0.55 + 0.25 * pulse);
  g.drawImage(halo, x - hr, cy - hr, hr * 2, hr * 2);

  if (type === 'red') {
    // heartbeat ring + a slow glint
    const hb = (t * 1.3 + x * 0.01) % 1;
    g.save();
    g.globalAlpha = alpha * (1 - hb) * 0.5;
    g.strokeStyle = '#FF6A7A';
    g.lineWidth = r * 0.14;
    g.beginPath();
    g.arc(x, cy, r * (1.1 + hb * 1.4), 0, TAU);
    g.stroke();
    g.translate(x, cy);
    g.rotate(t * 0.5);
    g.globalAlpha = alpha * 0.28;
    g.fillStyle = '#FFB0B0';
    for (let i = 0; i < 4; i++) {
      g.rotate(TAU / 4);
      g.beginPath();
      g.moveTo(r * 0.7, -r * 0.06);
      g.lineTo(r * 1.9, 0);
      g.lineTo(r * 0.7, r * 0.06);
      g.closePath();
      g.fill();
    }
    g.restore();
  }
  if (type === 'gold') {
    // rotating rays
    g.save();
    g.translate(x, cy);
    g.rotate(t * 0.8);
    g.globalAlpha = alpha * 0.45;
    g.fillStyle = '#FFE08A';
    for (let i = 0; i < 8; i++) {
      g.rotate(TAU / 8);
      g.beginPath();
      g.moveTo(r * 0.6, -r * 0.08);
      g.lineTo(r * (2.1 + 0.3 * Math.sin(t * 5 + i)), 0);
      g.lineTo(r * 0.6, r * 0.08);
      g.closePath();
      g.fill();
    }
    g.restore();
    // ring
    g.save();
    g.translate(x, cy);
    g.rotate(-t * 1.4);
    g.scale(1, 0.42);
    g.globalAlpha = alpha * 0.8;
    g.strokeStyle = '#FFE9A8';
    g.lineWidth = r * 0.12;
    g.beginPath();
    g.arc(0, 0, r * 1.55, 0, TAU * 0.8);
    g.stroke();
    g.restore();
  }
  g.globalCompositeOperation = 'source-over';
  g.globalAlpha = alpha;
  const sp = sphere(type, 96);
  g.drawImage(sp, x - r, cy - r, r * 2, r * 2);

  // orbiting sparkles
  g.globalCompositeOperation = 'lighter';
  const sg = glowSprite(type === 'gold' ? '#FFF0B0' : '#FFB0B0', 32);
  for (let i = 0; i < (type === 'gold' ? 5 : 3); i++) {
    const a = t * (2.2 + i * 0.6) + i * 2.1;
    const px = x + Math.cos(a) * r * 1.5, py = cy + Math.sin(a) * r * 0.9;
    const s = r * 0.5 * (0.6 + 0.4 * Math.sin(t * 6 + i));
    g.globalAlpha = alpha * 0.9;
    g.drawImage(sg, px - s, py - s, s * 2, s * 2);
  }
  // spawn ring
  if (k < 1) {
    g.globalAlpha = (1 - k) * 0.9;
    g.strokeStyle = hc;
    g.lineWidth = 3;
    g.beginPath();
    g.arc(x, y, cell * (0.3 + 0.7 * ease.outCubic(k)), 0, TAU);
    g.stroke();
  }
  g.restore();
}

export const orbSpawnK = (orb, now) => clamp((now - orb.born) / 0.45, 0, 1);
