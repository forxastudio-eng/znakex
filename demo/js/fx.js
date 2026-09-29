// Particles, shockwaves, floating texts, flashes and screen shake.
import { rand, TAU, clamp, ease, hexToRgb } from './util.js';

const glowCache = new Map();

// Soft radial glow sprite, cached per colour.
export function glowSprite(color, size = 64) {
  const key = color + size;
  if (glowCache.has(key)) return glowCache.get(key);
  const c = document.createElement('canvas');
  c.width = c.height = size;
  const g = c.getContext('2d');
  const [r, gg, b] = hexToRgb(color);
  const grd = g.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
  grd.addColorStop(0, `rgba(${r},${gg},${b},1)`);
  grd.addColorStop(0.25, `rgba(${r},${gg},${b},0.55)`);
  grd.addColorStop(0.6, `rgba(${r},${gg},${b},0.12)`);
  grd.addColorStop(1, `rgba(${r},${gg},${b},0)`);
  g.fillStyle = grd;
  g.fillRect(0, 0, size, size);
  glowCache.set(key, c);
  return c;
}

export class FX {
  constructor() {
    this.parts = [];
    this.rings = [];
    this.texts = [];
    this.flashes = [];
    this.shakeT = 0;
    this.shakeMag = 0;
  }

  clear() {
    this.parts.length = 0;
    this.rings.length = 0;
    this.texts.length = 0;
    this.flashes.length = 0;
    this.shakeT = 0;
  }

  emit(o) {
    if (this.parts.length > 900) return;
    this.parts.push({
      x: o.x, y: o.y, vx: o.vx || 0, vy: o.vy || 0,
      life: 0, max: o.life || 0.8, size: o.size || 4, color: o.color || '#ffffff',
      type: o.type || 'dot', drag: o.drag ?? 2.2, grav: o.grav || 0, rot: o.rot ?? rand(TAU),
      vr: o.vr ?? rand(-6, 6), add: o.add ?? true, fade: o.fade ?? 1, grow: o.grow || 0,
    });
  }

  burst(x, y, n, o) {
    for (let i = 0; i < n; i++) {
      const a = rand(TAU);
      const sp = rand(o.speedMin ?? 60, o.speed ?? 260);
      this.emit({
        ...o, x: x + rand(-2, 2), y: y + rand(-2, 2),
        vx: Math.cos(a) * sp, vy: Math.sin(a) * sp,
        size: rand(o.sizeMin ?? (o.size || 4) * 0.6, o.size || 4),
        life: rand((o.life || 0.8) * 0.6, o.life || 0.8),
        color: Array.isArray(o.color) ? o.color[Math.floor(Math.random() * o.color.length)] : o.color,
      });
    }
  }

  ring(x, y, color, maxR, dur = 0.5, width = 6) {
    this.rings.push({ x, y, color, maxR, dur, t: 0, width });
  }

  text(x, y, str, color = '#F2EFE6', size = 40, dur = 1.0) {
    this.texts.push({ x, y, str, color, size, dur, t: 0 });
  }

  flash(x, y, color, r, dur = 0.25) {
    this.flashes.push({ x, y, color, r, dur, t: 0 });
  }

  shake(mag, dur = 0.35) {
    if (mag > this.shakeMag * (1 - this.shakeT)) {
      this.shakeMag = mag;
      this.shakeDur = dur;
      this.shakeT = 0.0001;
    }
  }

  shakeOffset() {
    if (!this.shakeT) return [0, 0];
    const k = 1 - this.shakeT;
    const m = this.shakeMag * k * k;
    return [rand(-m, m), rand(-m, m)];
  }

  update(dt) {
    if (this.shakeT) {
      this.shakeT += dt / this.shakeDur;
      if (this.shakeT >= 1) { this.shakeT = 0; this.shakeMag = 0; }
    }
    const P = this.parts;
    for (let i = P.length - 1; i >= 0; i--) {
      const p = P[i];
      p.life += dt;
      if (p.life >= p.max) { P[i] = P[P.length - 1]; P.pop(); continue; }
      const d = Math.exp(-p.drag * dt);
      p.vx *= d; p.vy *= d;
      p.vy += p.grav * dt;
      p.x += p.vx * dt; p.y += p.vy * dt;
      p.rot += p.vr * dt;
    }
    for (const arr of [this.rings, this.texts, this.flashes]) {
      for (let i = arr.length - 1; i >= 0; i--) {
        arr[i].t += dt / arr[i].dur;
        if (arr[i].t >= 1) arr.splice(i, 1);
      }
    }
  }

  // Particles that render under the snake (dust, leaves, petals).
  drawUnder(g) {
    for (const p of this.parts) if (!p.add) drawPart(g, p);
  }

  drawOver(g) {
    g.save();
    g.globalCompositeOperation = 'lighter';
    for (const f of this.flashes) {
      const k = 1 - f.t;
      const r = f.r * (0.6 + 0.6 * ease.outCubic(f.t));
      g.globalAlpha = k * k;
      const s = glowSprite(f.color, 128);
      g.drawImage(s, f.x - r, f.y - r, r * 2, r * 2);
    }
    for (const p of this.parts) if (p.add) drawPart(g, p);
    for (const r of this.rings) {
      const k = ease.outCubic(r.t);
      g.globalAlpha = (1 - r.t) * 0.9;
      g.strokeStyle = r.color;
      g.lineWidth = r.width * (1 - r.t) + 1;
      g.beginPath();
      g.arc(r.x, r.y, r.maxR * k, 0, TAU);
      g.stroke();
    }
    g.restore();
    g.save();
    for (const t of this.texts) {
      const k = t.t;
      const pop = k < 0.18 ? ease.outBack(k / 0.18) : 1;
      g.globalAlpha = k > 0.7 ? 1 - (k - 0.7) / 0.3 : 1;
      const y = t.y - 70 * ease.outCubic(k);
      g.font = `${Math.round(t.size * pop)}px "Bebas Neue", Impact, sans-serif`;
      g.textAlign = 'center';
      g.textBaseline = 'middle';
      g.lineWidth = Math.max(3, t.size * 0.14);
      g.strokeStyle = 'rgba(10,12,8,0.85)';
      g.strokeText(t.str, t.x, y);
      g.fillStyle = t.color;
      g.fillText(t.str, t.x, y);
    }
    g.restore();
  }
}

function drawPart(g, p) {
  const k = p.life / p.max;
  const a = clamp((1 - k) * p.fade, 0, 1);
  const s = p.size * (1 + p.grow * k);
  switch (p.type) {
    case 'spark': {
      g.globalAlpha = a;
      g.strokeStyle = p.color;
      g.lineWidth = s * 0.5;
      g.lineCap = 'round';
      const L = 0.035;
      g.beginPath();
      g.moveTo(p.x, p.y);
      g.lineTo(p.x - p.vx * L, p.y - p.vy * L);
      g.stroke();
      break;
    }
    case 'star': {
      g.globalAlpha = a;
      const sp = glowSprite(p.color, 64);
      g.drawImage(sp, p.x - s * 2, p.y - s * 2, s * 4, s * 4);
      g.fillStyle = '#FFFFFF';
      g.save();
      g.translate(p.x, p.y);
      g.rotate(p.rot);
      g.beginPath();
      for (let i = 0; i < 4; i++) {
        const an = (i * Math.PI) / 2;
        g.lineTo(Math.cos(an) * s * 1.6, Math.sin(an) * s * 1.6);
        g.lineTo(Math.cos(an + Math.PI / 4) * s * 0.35, Math.sin(an + Math.PI / 4) * s * 0.35);
      }
      g.closePath();
      g.fill();
      g.restore();
      break;
    }
    case 'leaf':
    case 'petal': {
      g.globalAlpha = a;
      g.save();
      g.translate(p.x, p.y);
      g.rotate(p.rot);
      g.scale(1, 0.55 + 0.45 * Math.sin(p.rot * 2));
      g.fillStyle = p.color;
      g.beginPath();
      g.ellipse(0, 0, s, s * (p.type === 'leaf' ? 0.45 : 0.7), 0, 0, TAU);
      g.fill();
      if (p.type === 'leaf') {
        g.strokeStyle = 'rgba(0,0,0,0.25)';
        g.lineWidth = 1;
        g.beginPath();
        g.moveTo(-s, 0);
        g.lineTo(s, 0);
        g.stroke();
      }
      g.restore();
      break;
    }
    case 'dust': {
      g.globalAlpha = a * 0.5;
      const sp = glowSprite(p.color, 64);
      g.drawImage(sp, p.x - s, p.y - s, s * 2, s * 2);
      break;
    }
    default: {
      g.globalAlpha = a;
      const sp = glowSprite(p.color, 64);
      g.drawImage(sp, p.x - s, p.y - s, s * 2, s * 2);
    }
  }
}

// Drifting fireflies / pollen used behind the menus and over the board.
export class Ambient {
  constructor(n, colors) {
    this.colors = colors;
    this.p = [];
    this.n = n;
  }

  resize(w, h) {
    this.w = w; this.h = h;
    this.p = Array.from({ length: this.n }, () => this.spawn(true));
  }

  spawn(anywhere) {
    return {
      x: rand(this.w), y: anywhere ? rand(this.h) : this.h + 10,
      vx: rand(-8, 8), vy: rand(-26, -8), s: rand(1.5, 4.2), ph: rand(TAU), f: rand(0.6, 1.6),
      c: this.colors[Math.floor(Math.random() * this.colors.length)],
    };
  }

  update(dt, t) {
    for (let i = 0; i < this.p.length; i++) {
      const q = this.p[i];
      q.x += (q.vx + Math.sin(t * q.f + q.ph) * 10) * dt;
      q.y += q.vy * dt;
      if (q.y < -10 || q.x < -20 || q.x > this.w + 20) this.p[i] = this.spawn(false);
    }
  }

  draw(g, t, alpha = 1) {
    g.save();
    g.globalCompositeOperation = 'lighter';
    for (const q of this.p) {
      const tw = 0.45 + 0.55 * Math.sin(t * 2.2 * q.f + q.ph);
      g.globalAlpha = alpha * tw;
      const sp = glowSprite(q.c, 64);
      const r = q.s * 3;
      g.drawImage(sp, q.x - r, q.y - r, r * 2, r * 2);
    }
    g.restore();
  }
}
