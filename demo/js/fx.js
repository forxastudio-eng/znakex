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

// Ambient particles that belong to a map: fireflies, petals, snow, embers, bubbles…
export class MapAmbient {
  constructor(kind, colors, n = 34) {
    this.kind = kind;
    this.colors = colors;
    this.n = kind === 'rain' ? 70 : kind === 'snow' ? 60 : kind === 'star' ? 36 : n;
    this.p = [];
  }

  resize(w, h) {
    this.w = w; this.h = h;
    this.p = Array.from({ length: this.n }, () => this.spawn(true));
  }

  spawn(anywhere) {
    const k = this.kind, w = this.w, h = this.h;
    const c = this.colors[Math.floor(Math.random() * this.colors.length)];
    const p = { x: rand(w), y: rand(h), vx: 0, vy: 0, s: rand(2, 4.5), ph: rand(TAU), f: rand(0.6, 1.6), rot: rand(TAU), vr: rand(-2, 2), c, life: 1 };
    switch (k) {
      case 'petal': case 'leaf': case 'feather':
        p.y = anywhere ? rand(h) : -10; p.vx = rand(4, 22); p.vy = rand(14, 34); p.s = rand(4, 7); break;
      case 'snow': p.y = anywhere ? rand(h) : -6; p.vx = rand(-6, 6); p.vy = rand(18, 46); p.s = rand(1.4, 3.6); break;
      case 'rain': p.y = anywhere ? rand(h) : -20; p.x = rand(w + 60); p.vx = -40; p.vy = rand(420, 620); p.s = rand(8, 16); break;
      case 'ember': p.y = anywhere ? rand(h) : h + 8; p.vx = rand(-10, 10); p.vy = rand(-52, -18); p.s = rand(1.6, 3.6); break;
      case 'bubble': p.y = anywhere ? rand(h) : h + 8; p.vx = rand(-6, 6); p.vy = rand(-40, -14); p.s = rand(2.5, 6.5); break;
      case 'spore': case 'wisp': p.y = anywhere ? rand(h) : h + 8; p.vx = rand(-8, 8); p.vy = rand(-24, -8); p.s = rand(2, k === 'wisp' ? 6 : 4); break;
      case 'sand': p.x = anywhere ? rand(w) : -12; p.vx = rand(60, 140); p.vy = rand(-6, 10); p.s = rand(8, 20); break;
      case 'dust': p.vx = rand(-6, 6); p.vy = rand(-8, 4); p.s = rand(1.5, 3.2); break;
      case 'star': case 'sparkle': p.vx = 0; p.vy = 0; p.s = rand(1.8, 4.2); break;
      default: p.vx = rand(-8, 8); p.vy = rand(-26, -8); break; // firefly
    }
    return p;
  }

  update(dt, t) {
    const k = this.kind;
    for (let i = 0; i < this.p.length; i++) {
      const q = this.p[i];
      q.rot += q.vr * dt;
      switch (k) {
        case 'petal': case 'leaf': case 'feather':
          q.x += (q.vx + Math.sin(t * 1.4 + q.ph) * 16) * dt; q.y += q.vy * dt; break;
        case 'snow': q.x += (q.vx + Math.sin(t + q.ph) * 8) * dt; q.y += q.vy * dt; break;
        case 'rain': q.x += q.vx * dt; q.y += q.vy * dt; break;
        case 'sand': q.x += q.vx * dt; q.y += (q.vy + Math.sin(t * 2 + q.ph) * 6) * dt; break;
        case 'star': case 'sparkle': break;
        default: q.x += (q.vx + Math.sin(t * q.f + q.ph) * 10) * dt; q.y += q.vy * dt;
      }
      const out = q.y < -24 || q.y > this.h + 24 || q.x < -60 || q.x > this.w + 60;
      if (out && k !== 'star' && k !== 'sparkle' && k !== 'dust') this.p[i] = this.spawn(false);
      if (out && (k === 'dust')) this.p[i] = this.spawn(true);
    }
  }

  draw(g, t, alpha = 1) {
    const k = this.kind;
    g.save();
    for (const q of this.p) {
      const tw = 0.5 + 0.5 * Math.sin(t * 2.2 * q.f + q.ph);
      switch (k) {
        case 'petal': case 'leaf': case 'feather': {
          g.globalAlpha = alpha * 0.85;
          g.save();
          g.translate(q.x, q.y);
          g.rotate(q.rot);
          g.scale(1, 0.5 + 0.5 * Math.abs(Math.sin(q.rot * 1.3)));
          g.fillStyle = q.c;
          g.beginPath();
          if (k === 'feather') g.ellipse(0, 0, q.s * 1.5, q.s * 0.35, 0, 0, TAU);
          else g.ellipse(0, 0, q.s, q.s * (k === 'leaf' ? 0.5 : 0.7), 0, 0, TAU);
          g.fill();
          g.restore();
          break;
        }
        case 'snow': g.globalAlpha = alpha * 0.85; g.fillStyle = q.c; g.beginPath(); g.arc(q.x, q.y, q.s, 0, TAU); g.fill(); break;
        case 'rain': g.globalAlpha = alpha * 0.4; g.strokeStyle = q.c; g.lineWidth = 1.2; g.beginPath(); g.moveTo(q.x, q.y); g.lineTo(q.x + 3, q.y + q.s); g.stroke(); break;
        case 'sand': g.globalAlpha = alpha * 0.22; g.strokeStyle = q.c; g.lineWidth = 1.6; g.beginPath(); g.moveTo(q.x, q.y); g.lineTo(q.x - q.s, q.y - 1); g.stroke(); break;
        case 'bubble':
          g.globalAlpha = alpha * (0.4 + 0.3 * tw); g.strokeStyle = q.c; g.lineWidth = 1.3; g.beginPath(); g.arc(q.x, q.y, q.s, 0, TAU); g.stroke();
          g.globalAlpha = alpha * 0.3; g.fillStyle = '#fff'; g.beginPath(); g.arc(q.x - q.s * 0.35, q.y - q.s * 0.35, q.s * 0.2, 0, TAU); g.fill();
          break;
        case 'star': case 'sparkle': {
          g.globalCompositeOperation = 'lighter';
          g.globalAlpha = alpha * tw;
          const sp = glowSprite(q.c, 64);
          g.drawImage(sp, q.x - q.s * 2, q.y - q.s * 2, q.s * 4, q.s * 4);
          g.fillStyle = '#fff';
          g.beginPath();
          for (let i = 0; i < 4; i++) {
            const a = (i * Math.PI) / 2;
            g.lineTo(q.x + Math.cos(a) * q.s * 1.7 * tw, q.y + Math.sin(a) * q.s * 1.7 * tw);
            g.lineTo(q.x + Math.cos(a + Math.PI / 4) * q.s * 0.3, q.y + Math.sin(a + Math.PI / 4) * q.s * 0.3);
          }
          g.closePath(); g.fill();
          g.globalCompositeOperation = 'source-over';
          break;
        }
        default: {
          g.globalCompositeOperation = 'lighter';
          g.globalAlpha = alpha * (k === 'wisp' ? 0.45 : 0.4 + 0.6 * tw);
          const sp = glowSprite(q.c, 64);
          const r = q.s * (k === 'ember' ? 2.4 : k === 'wisp' ? 4 : 3);
          g.drawImage(sp, q.x - r, q.y - r, r * 2, r * 2);
          g.globalCompositeOperation = 'source-over';
        }
      }
    }
    g.restore();
  }
}
