// Procedural snake renderer: smooth shaded tube + per-skin pattern + animated head.
// Works from any polyline (grid positions in game, parametric paths in menus).
import { TAU, clamp, lerp, smoothstep, mixHex, hexToRgb } from './util.js';
import { glowSprite } from './fx.js';

const LIGHT = { x: -0.55, y: -0.83 }; // light comes from the top-left

// Chaikin corner cutting, keeps both ends.
function chaikin(pts, iters) {
  let p = pts;
  for (let k = 0; k < iters; k++) {
    if (p.length < 3) return p;
    const q = [p[0]];
    for (let i = 0; i < p.length - 1; i++) {
      const a = p[i], b = p[i + 1];
      q.push({ x: a.x * 0.75 + b.x * 0.25, y: a.y * 0.75 + b.y * 0.25 });
      q.push({ x: a.x * 0.25 + b.x * 0.75, y: a.y * 0.25 + b.y * 0.75 });
    }
    q.push(p[p.length - 1]);
    p = q;
  }
  return p;
}

// Resample a polyline at a fixed step; returns samples with distance from head.
function resample(pts, step, d0) {
  const out = [];
  if (!pts.length) return out;
  out.push({ x: pts[0].x, y: pts[0].y, d: d0 });
  let carry = 0, dist = d0;
  for (let i = 0; i < pts.length - 1; i++) {
    const a = pts[i], b = pts[i + 1];
    const seg = Math.hypot(b.x - a.x, b.y - a.y);
    if (seg < 1e-6) continue;
    let t = (step - carry) / seg;
    while (t <= 1) {
      out.push({ x: a.x + (b.x - a.x) * t, y: a.y + (b.y - a.y) * t, d: dist + t * seg });
      t += step / seg;
    }
    carry = (1 - (t - step / seg)) * seg;
    dist += seg;
  }
  const last = pts[pts.length - 1];
  const lp = out[out.length - 1];
  if (Math.hypot(last.x - lp.x, last.y - lp.y) > step * 0.25) out.push({ x: last.x, y: last.y, d: dist });
  return out;
}

// Deterministic pseudo random from a number.
const hash = (n) => {
  const s = Math.sin(n * 127.1 + 311.7) * 43758.5453;
  return s - Math.floor(s);
};

const GRAY = { base: '#6F726A', light: '#9A9C94', dark: '#3E403A', outline: '#1A1B18', pat: '#86887F', head: '#77796F' };

function palette(skin, death) {
  if (!death) return skin;
  const p = { ...skin };
  for (const k of Object.keys(GRAY)) if (skin[k]) p[k] = mixHex(skin[k], GRAY[k], death);
  p.eyeGlow = death > 0.3 ? null : skin.eyeGlow;
  p.glow = death > 0.3 ? null : skin.glow;
  return p;
}

/**
 * pts: polyline head -> tail (px). o: {
 *   R, mouth, blink, tongue, bulges:[{d, amp}], glow, ghost, death, t,
 *   breaks: Set of indices i where pts[i] -> pts[i+1] is disconnected (wrap-around),
 *   squash, shadow (bool), fat
 * }
 */
export function drawSnake(g, pts, skin, o) {
  if (!pts || pts.length < 2) return;
  const R = o.R;
  const pal = palette(skin, o.death || 0);
  const t = o.t || 0;

  // --- build strands (split at wrap-around breaks), smooth and resample
  const strands = [];
  let cur = [pts[0]];
  for (let i = 0; i < pts.length - 1; i++) {
    if (o.breaks && o.breaks.has(i)) { strands.push(cur); cur = []; }
    cur.push(pts[i + 1]);
  }
  strands.push(cur);

  const step = R * 0.42;
  let dAcc = 0;
  const S = []; // array of sample arrays
  for (const st of strands) {
    if (st.length === 1) st.push({ x: st[0].x + 0.01, y: st[0].y });
    const sm = chaikin(st, 2);
    const smp = resample(sm, step, dAcc);
    if (smp.length) dAcc = smp[smp.length - 1].d + step;
    S.push(smp);
  }
  const total = Math.max(dAcc, R * 2);

  // radius profile
  const bulges = o.bulges || [];
  const fat = o.fat || 1;
  for (const smp of S) {
    for (const s of smp) {
      const taperLen = Math.min(total * 0.5, R * 5.5);
      let r = R * fat * lerp(1, 0.3, smoothstep(total - taperLen, total, s.d));
      if (s.d < R * 1.4) r *= lerp(0.86, 1, s.d / (R * 1.4));
      for (const b of bulges) {
        const x = (s.d - b.d) / (R * 1.25);
        if (x > -3 && x < 3) r += b.amp * R * Math.exp(-x * x);
      }
      s.r = r;
    }
    // normals facing the light
    for (let i = 0; i < smp.length; i++) {
      const a = smp[Math.max(0, i - 1)], b = smp[Math.min(smp.length - 1, i + 1)];
      let tx = a.x - b.x, ty = a.y - b.y;
      const l = Math.hypot(tx, ty) || 1;
      tx /= l; ty /= l;
      let nx = -ty, ny = tx;
      if (nx * LIGHT.x + ny * LIGHT.y < 0) { nx = -nx; ny = -ny; }
      smp[i].nx = nx; smp[i].ny = ny; smp[i].tx = tx; smp[i].ty = ty;
    }
  }

  g.save();
  if (o.ghost) g.globalAlpha = 0.45 + 0.4 * (0.5 + 0.5 * Math.sin(t * 22));
  if (o.clip) { g.beginPath(); g.rect(o.clip.x, o.clip.y, o.clip.w, o.clip.h); g.clip(); }

  // --- boost aura
  if (o.glow > 0) {
    g.save();
    g.globalCompositeOperation = 'lighter';
    const sp = glowSprite(pal.fx || '#FFD36A', 64);
    for (const smp of S) {
      for (let i = 0; i < smp.length; i += 2) {
        const s = smp[i];
        const rr = s.r * (2.3 + 0.3 * Math.sin(t * 10 - s.d * 0.05));
        g.globalAlpha = 0.22 * o.glow;
        g.drawImage(sp, s.x - rr, s.y - rr, rr * 2, rr * 2);
      }
    }
    g.restore();
  }

  // --- soft drop shadow (offset-shadow trick keeps it blurred and uniform)
  if (o.shadow !== false) {
    g.save();
    const off = 20000;
    const m = g.getTransform();
    g.shadowColor = 'rgba(8,10,6,0.42)';
    g.shadowBlur = R * 0.7 * m.a;
    g.shadowOffsetX = (off + R * 0.2) * m.a;
    g.shadowOffsetY = R * 0.38 * m.d;
    g.strokeStyle = '#000';
    g.lineCap = 'round';
    g.lineJoin = 'round';
    for (const smp of S) {
      for (let i = 0; i < smp.length - 1; i++) {
        g.lineWidth = smp[i].r * 2;
        g.beginPath();
        g.moveTo(smp[i].x - off, smp[i].y);
        g.lineTo(smp[i + 1].x - off, smp[i + 1].y);
        g.stroke();
      }
    }
    g.restore();
  }

  const ow = Math.max(2, R * 0.13);
  const layer = (color, wk, offk, tailCut = 1) => {
    g.strokeStyle = color;
    for (const smp of S) {
      for (let i = smp.length - 2; i >= 0; i--) {
        const a = smp[i], b = smp[i + 1];
        if (a.d / total > tailCut) continue;
        g.lineWidth = Math.max(0.5, a.r * 2 * wk);
        const oa = a.r * offk, ob = b.r * offk;
        g.beginPath();
        g.moveTo(a.x + a.nx * oa, a.y + a.ny * oa);
        g.lineTo(b.x + b.nx * ob, b.y + b.ny * ob);
        g.stroke();
      }
    }
  };

  g.lineCap = 'round';
  g.lineJoin = 'round';
  // outline + cylinder shading
  for (const smp of S) {
    g.fillStyle = pal.outline;
    for (let i = smp.length - 1; i >= 0; i--) {
      const s = smp[i];
      g.beginPath();
      g.arc(s.x, s.y, s.r + ow, 0, TAU);
      g.fill();
    }
  }
  layer(pal.dark, 1, 0);
  layer(pal.base, 0.8, 0.12);
  layer(mixHex(pal.base, pal.light, 0.55), 0.5, 0.3, 0.97);

  // --- pattern
  drawPattern(g, S, pal, R, total, t);

  // specular streak
  g.save();
  g.globalAlpha = 0.28;
  g.strokeStyle = pal.light;
  g.lineWidth = R * 0.16;
  for (const smp of S) {
    g.beginPath();
    let started = false;
    for (const s of smp) {
      if (s.d / total > 0.8 || s.d < R * 0.9) { started = false; continue; }
      const px = s.x + s.nx * s.r * 0.5, py = s.y + s.ny * s.r * 0.5;
      if (!started) { g.moveTo(px, py); started = true; } else g.lineTo(px, py);
    }
    g.stroke();
  }
  g.restore();

  // --- head
  const s0 = S[0][0];
  let k = 1;
  while (k < S[0].length - 1 && S[0][k].d < R * 0.9) k++;
  const s1 = S[0][Math.min(k, S[0].length - 1)];
  const ang = o.angle ?? Math.atan2(s0.y - s1.y, s0.x - s1.x);
  drawHead(g, s0.x, s0.y, ang, R * fat, pal, o, ow);

  g.restore();
}

function drawPattern(g, S, pal, R, total, t) {
  const P = pal.pattern;
  g.save();
  g.lineCap = 'round';
  const inBody = (s) => s.d > R * 1.1 && s.d / total < 0.93;
  if (P === 'stripe') {
    g.strokeStyle = pal.pat;
    for (const smp of S) {
      for (let i = 0; i < smp.length - 1; i++) {
        const a = smp[i], b = smp[i + 1];
        if (!inBody(a)) continue;
        const ph = (a.d / (R * 2.1)) % 1;
        if (ph > 0.58) continue;
        g.lineWidth = a.r * 0.3;
        g.beginPath();
        g.moveTo(a.x + a.nx * a.r * 0.08, a.y + a.ny * a.r * 0.08);
        g.lineTo(b.x + b.nx * b.r * 0.08, b.y + b.ny * b.r * 0.08);
        g.stroke();
      }
    }
  } else if (P === 'bands' || P === 'plates') {
    const every = P === 'bands' ? R * 1.5 : R * 1.05;
    g.strokeStyle = pal.pat;
    for (const smp of S) {
      let next = Math.ceil(smp[0].d / every) * every;
      for (const s of smp) {
        if (s.d < next) continue;
        next += every;
        if (!inBody(s)) continue;
        const w = s.r * (P === 'bands' ? 0.9 : 0.95);
        g.lineWidth = P === 'bands' ? s.r * 0.42 : Math.max(1.5, s.r * 0.14);
        g.globalAlpha = P === 'bands' ? 0.95 : 0.8;
        g.beginPath();
        if (P === 'plates') {
          // curved armour plate edge
          const cx = s.x - s.tx * s.r * 0.35, cy = s.y - s.ty * s.r * 0.35;
          g.moveTo(cx + s.nx * w, cy + s.ny * w);
          g.quadraticCurveTo(s.x + s.tx * s.r * 0.25, s.y + s.ty * s.r * 0.25, cx - s.nx * w, cy - s.ny * w);
        } else {
          g.moveTo(s.x + s.nx * w, s.y + s.ny * w);
          g.lineTo(s.x - s.nx * w, s.y - s.ny * w);
        }
        g.stroke();
      }
    }
    if (pal.glow) {
      g.globalCompositeOperation = 'lighter';
      g.globalAlpha = 0.25 + 0.15 * Math.sin(t * 3);
      g.strokeStyle = pal.glow;
      g.lineWidth = R * 0.12;
      for (const smp of S) {
        let next = Math.ceil(smp[0].d / every) * every;
        for (const s of smp) {
          if (s.d < next) continue;
          next += every;
          if (!inBody(s)) continue;
          g.beginPath();
          g.moveTo(s.x + s.nx * s.r * 0.8, s.y + s.ny * s.r * 0.8);
          g.lineTo(s.x - s.nx * s.r * 0.8, s.y - s.ny * s.r * 0.8);
          g.stroke();
        }
      }
    }
  } else if (P === 'spots' || P === 'petals') {
    const every = R * (P === 'spots' ? 1.25 : 1.9);
    for (const smp of S) {
      let next = Math.ceil(smp[0].d / every) * every;
      for (const s of smp) {
        if (s.d < next) continue;
        const idx = Math.round(next / every);
        next += every;
        if (!inBody(s)) continue;
        const side = idx % 2 ? 1 : -1;
        const off = s.r * (0.38 + hash(idx) * 0.12) * side;
        const x = s.x + s.nx * off, y = s.y + s.ny * off;
        if (P === 'spots') {
          g.fillStyle = pal.pat;
          g.globalAlpha = 0.9;
          g.beginPath();
          g.ellipse(x, y, s.r * (0.2 + hash(idx + 3) * 0.12), s.r * 0.16, Math.atan2(s.ty, s.tx), 0, TAU);
          g.fill();
        } else {
          const rr = s.r * 0.17;
          g.fillStyle = pal.pat;
          for (let p = 0; p < 5; p++) {
            const an = (p / 5) * TAU + idx;
            g.beginPath();
            g.arc(x + Math.cos(an) * rr, y + Math.sin(an) * rr, rr * 0.75, 0, TAU);
            g.fill();
          }
          g.fillStyle = '#FFF3C4';
          g.beginPath();
          g.arc(x, y, rr * 0.45, 0, TAU);
          g.fill();
        }
      }
    }
  } else if (P === 'cracks') {
    // molten cracks: jagged glowing lines
    const every = R * 1.6;
    const pulse = 0.75 + 0.25 * Math.sin(t * 4);
    for (const pass of [0, 1]) {
      g.globalCompositeOperation = pass ? 'lighter' : 'source-over';
      g.strokeStyle = pass ? pal.glow : mixHex(pal.pat, '#FFD27A', 0.2);
      g.globalAlpha = pass ? 0.35 * pulse : 0.95;
      g.lineWidth = pass ? R * 0.4 : R * 0.1;
      for (const smp of S) {
        let next = Math.ceil(smp[0].d / every) * every;
        for (let i = 0; i < smp.length; i++) {
          const s = smp[i];
          if (s.d < next) continue;
          const idx = Math.round(next / every);
          next += every;
          if (!inBody(s)) continue;
          const w = s.r * 0.78;
          g.beginPath();
          g.moveTo(s.x + s.nx * w, s.y + s.ny * w);
          const j1 = (hash(idx) - 0.5) * s.r * 0.9, j2 = (hash(idx + 7) - 0.5) * s.r * 0.9;
          g.lineTo(s.x + s.nx * w * 0.3 + s.tx * j1, s.y + s.ny * w * 0.3 + s.ty * j1);
          g.lineTo(s.x - s.nx * w * 0.2 + s.tx * j2, s.y - s.ny * w * 0.2 + s.ty * j2);
          g.lineTo(s.x - s.nx * w, s.y - s.ny * w + (hash(idx + 2) - 0.5) * 4);
          g.stroke();
        }
      }
    }
  } else if (P === 'glowline') {
    const pulse = 0.7 + 0.3 * Math.sin(t * 5);
    for (const pass of [0, 1, 2]) {
      g.globalCompositeOperation = pass ? 'lighter' : 'source-over';
      g.strokeStyle = pass === 2 ? '#FFFFFF' : pal.pat;
      g.globalAlpha = pass === 0 ? 1 : pass === 1 ? 0.35 * pulse : 0.5;
      const wk = pass === 0 ? 0.22 : pass === 1 ? 0.75 : 0.07;
      g.lineWidth = R * wk;
      for (const smp of S) {
        g.beginPath();
        let started = false;
        for (const s of smp) {
          if (!inBody(s)) { started = false; continue; }
          if (!started) { g.moveTo(s.x, s.y); started = true; } else g.lineTo(s.x, s.y);
        }
        g.stroke();
      }
    }
    // energy nodes travelling down the body
    g.globalCompositeOperation = 'lighter';
    const sp = glowSprite(pal.pat, 64);
    for (const smp of S) {
      for (const s of smp) {
        if (!inBody(s)) continue;
        const ph = ((s.d - t * R * 6) / (R * 4)) % 1;
        if (ph < 0 || ph > 0.08) continue;
        g.globalAlpha = 0.9;
        const rr = s.r * 1.2;
        g.drawImage(sp, s.x - rr, s.y - rr, rr * 2, rr * 2);
      }
    }
  } else if (P === 'crystal') {
    g.strokeStyle = pal.pat;
    g.globalAlpha = 0.75;
    const every = R * 1.2;
    for (const smp of S) {
      let next = Math.ceil(smp[0].d / every) * every;
      for (const s of smp) {
        if (s.d < next) continue;
        next += every;
        if (!inBody(s)) continue;
        g.lineWidth = Math.max(1.5, s.r * 0.12);
        const w = s.r * 0.7;
        g.beginPath();
        g.moveTo(s.x + s.nx * w - s.tx * s.r * 0.35, s.y + s.ny * w - s.ty * s.r * 0.35);
        g.lineTo(s.x + s.tx * s.r * 0.25, s.y + s.ty * s.r * 0.25);
        g.lineTo(s.x - s.nx * w - s.tx * s.r * 0.35, s.y - s.ny * w - s.ty * s.r * 0.35);
        g.stroke();
      }
    }
    g.globalCompositeOperation = 'lighter';
    g.globalAlpha = 0.18 + 0.1 * Math.sin(t * 2);
    g.strokeStyle = pal.glow || '#FFFFFF';
    g.lineWidth = R * 0.9;
    for (const smp of S) {
      g.beginPath();
      smp.forEach((s, i) => (i ? g.lineTo(s.x, s.y) : g.moveTo(s.x, s.y)));
      g.stroke();
    }
  } else if (P === 'stars') {
    g.globalCompositeOperation = 'lighter';
    g.globalAlpha = 0.25 + 0.1 * Math.sin(t * 1.7);
    g.strokeStyle = pal.glow;
    g.lineWidth = R * 1.1;
    for (const smp of S) {
      g.beginPath();
      smp.forEach((s, i) => (i ? g.lineTo(s.x, s.y) : g.moveTo(s.x, s.y)));
      g.stroke();
    }
    const every = R * 0.55;
    for (const smp of S) {
      let next = Math.ceil(smp[0].d / every) * every;
      for (const s of smp) {
        if (s.d < next) continue;
        const idx = Math.round(next / every);
        next += every;
        if (!inBody(s)) continue;
        const off = (hash(idx) - 0.5) * 1.5 * s.r;
        const tw = 0.4 + 0.6 * Math.abs(Math.sin(t * (1 + hash(idx + 1) * 3) + idx));
        g.globalAlpha = tw;
        g.fillStyle = '#FFFFFF';
        const rr = s.r * (0.05 + hash(idx + 5) * 0.08);
        g.beginPath();
        g.arc(s.x + s.nx * off, s.y + s.ny * off, rr, 0, TAU);
        g.fill();
      }
    }
  }
  g.restore();
}

function headPath(g, R, side) {
  // one half (side = 1 right, -1 left) of the head outline in local space (x forward)
  const L = R * 2.05;
  g.moveTo(-L * 0.42, 0);
  g.lineTo(-L * 0.42, side * R * 0.9);
  g.bezierCurveTo(-L * 0.1, side * R * 1.18, L * 0.38, side * R * 1.12, L * 0.62, side * R * 0.72);
  g.bezierCurveTo(L * 0.78, side * R * 0.48, L * 0.84, side * R * 0.18, L * 0.84, 0);
  g.closePath();
}

function headOuter(g, R, side) {
  const L = R * 2.05;
  g.moveTo(-L * 0.42, side * R * 0.9);
  g.bezierCurveTo(-L * 0.1, side * R * 1.18, L * 0.38, side * R * 1.12, L * 0.62, side * R * 0.72);
  g.bezierCurveTo(L * 0.78, side * R * 0.48, L * 0.84, side * R * 0.18, L * 0.84, 0);
}

function drawHead(g, x, y, ang, R, pal, o, ow) {
  const mouth = clamp(o.mouth || 0, 0, 1);
  const L = R * 2.05;
  const sq = o.squash || 0; // chomp squash
  const m = g.getTransform();
  const off = 20000;
  // soft shadow, drawn far away and pulled back with the canvas shadow offset
  g.save();
  g.shadowColor = 'rgba(8,10,6,0.45)';
  g.shadowBlur = R * 0.6 * m.a;
  g.shadowOffsetX = (off + R * 0.2) * m.a;
  g.shadowOffsetY = R * 0.38 * m.d;
  g.translate(x - off, y);
  g.rotate(ang);
  g.scale(1 + sq * 0.12, 1 - sq * 0.06);
  g.fillStyle = '#000';
  g.beginPath();
  headPath(g, R, 1);
  headPath(g, R, -1);
  g.fill();
  g.restore();

  g.save();
  g.translate(x, y);
  g.rotate(ang);
  g.scale(1 + sq * 0.12, 1 - sq * 0.06);
  const localLightY = -Math.sin(ang) * LIGHT.x + Math.cos(ang) * LIGHT.y;

  const open = mouth * 0.62;
  const pivotX = -L * 0.18;

  // inner mouth + tongue (visible between the jaws)
  if (mouth > 0.02) {
    g.save();
    g.fillStyle = '#3A0A12';
    g.beginPath();
    g.moveTo(pivotX, 0);
    g.arc(pivotX, 0, L * 1.0, -open, open);
    g.closePath();
    g.fill();
    g.fillStyle = '#7A1A26';
    g.beginPath();
    g.moveTo(pivotX + L * 0.1, 0);
    g.arc(pivotX + L * 0.1, 0, L * 0.72, -open * 0.7, open * 0.7);
    g.closePath();
    g.fill();
    g.strokeStyle = pal.tongue || '#C7354A';
    g.lineWidth = R * 0.16;
    g.lineCap = 'round';
    g.beginPath();
    g.moveTo(pivotX + L * 0.1, 0);
    g.lineTo(pivotX + L * 0.62, 0);
    g.stroke();
    g.restore();
  }

  for (const side of [-1, 1]) {
    g.save();
    g.translate(pivotX, 0);
    g.rotate(side * open);
    g.translate(-pivotX, 0);

    // fill with a light-to-dark gradient across the head
    const grd = g.createLinearGradient(0, -R * 1.1, 0, R * 1.1);
    const lightTop = localLightY < 0; // keep lighting world-consistent while the head turns
    grd.addColorStop(0, lightTop ? pal.light : pal.dark);
    grd.addColorStop(0.45, pal.head || pal.base);
    grd.addColorStop(1, lightTop ? pal.dark : pal.light);
    g.beginPath();
    headPath(g, R, side);
    g.fillStyle = grd;
    g.fill();

    // top plate (clipped to this half so both halves read as one plate when closed)
    g.save();
    g.clip();
    g.fillStyle = pal.base;
    g.globalAlpha = 0.5;
    g.beginPath();
    g.ellipse(L * 0.04, 0, L * 0.4, R * 0.5, 0, 0, TAU);
    g.fill();
    g.restore();
    g.globalAlpha = 1;

    // outer contour only (no line across the neck or down the middle)
    g.beginPath();
    headOuter(g, R, side);
    if (mouth > 0.05) g.lineTo(pivotX, 0);
    g.lineWidth = ow * 2;
    g.strokeStyle = pal.outline;
    g.lineJoin = 'round';
    g.lineCap = 'round';
    g.stroke();

    // fang (only when open)
    if (mouth > 0.15) {
      g.fillStyle = '#F4F0E0';
      g.strokeStyle = pal.outline;
      g.lineWidth = 1.2;
      g.beginPath();
      g.moveTo(L * 0.55, side * R * 0.42);
      g.lineTo(L * 0.72, side * R * 0.3);
      g.lineTo(L * 0.6, side * R * 0.18);
      g.closePath();
      g.fill();
      g.stroke();
    }

    // nostril
    g.fillStyle = pal.outline;
    g.globalAlpha = 0.7;
    g.beginPath();
    g.ellipse(L * 0.7, side * R * 0.22, R * 0.07, R * 0.045, 0, 0, TAU);
    g.fill();
    g.globalAlpha = 1;

    // eye
    const ex = L * 0.2, ey = side * R * 0.58;
    const blink = clamp(o.blink || 0, 0, 1);
    if (pal.eyeGlow) {
      g.save();
      g.globalCompositeOperation = 'lighter';
      g.globalAlpha = 0.7 * (1 - blink);
      const sp = glowSprite(pal.eyeGlow, 64);
      const rr = R * 1.1;
      g.drawImage(sp, ex - rr, ey - rr, rr * 2, rr * 2);
      g.restore();
    }
    g.save();
    g.translate(ex, ey);
    g.scale(1, Math.max(0.08, 1 - blink));
    g.fillStyle = pal.outline;
    g.beginPath();
    g.ellipse(0, 0, R * 0.34, R * 0.3, 0, 0, TAU);
    g.fill();
    g.fillStyle = pal.eye;
    g.beginPath();
    g.ellipse(0, 0, R * 0.26, R * 0.22, 0, 0, TAU);
    g.fill();
    g.fillStyle = pal.pupil;
    g.beginPath();
    g.ellipse(R * 0.04, 0, R * 0.2, R * 0.06, 0, 0, TAU);
    g.fill();
    g.fillStyle = 'rgba(255,255,255,0.85)';
    g.beginPath();
    g.arc(-R * 0.08, -side * R * 0.07, R * 0.06, 0, TAU);
    g.fill();
    g.restore();
    // brow
    g.strokeStyle = pal.outline;
    g.globalAlpha = 0.6;
    g.lineWidth = R * 0.08;
    g.beginPath();
    g.moveTo(ex - R * 0.32, ey - side * R * 0.34);
    g.quadraticCurveTo(ex, ey - side * R * 0.48, ex + R * 0.34, ey - side * R * 0.28);
    g.stroke();
    g.globalAlpha = 1;
    g.restore();
  }

  // tongue flick (mouth closed)
  const tg = clamp(o.tongue || 0, 0, 1);
  if (tg > 0 && mouth < 0.05) {
    const len = R * 1.1 * tg;
    g.strokeStyle = pal.tongue || '#C7354A';
    g.lineWidth = R * 0.11;
    g.lineCap = 'round';
    g.beginPath();
    g.moveTo(L * 0.8, 0);
    g.lineTo(L * 0.8 + len, 0);
    g.lineTo(L * 0.8 + len + R * 0.28 * tg, -R * 0.18 * tg);
    g.moveTo(L * 0.8 + len, 0);
    g.lineTo(L * 0.8 + len + R * 0.28 * tg, R * 0.18 * tg);
    g.stroke();
  }
  g.restore();
}

// Figure-eight / wave path used by menus and the skins preview.
export function pathPoints(cx, cy, w, h, t, len, n = 40, kind = 'eight') {
  const pts = [];
  for (let i = 0; i < n; i++) {
    const u = t - (i / n) * len;
    if (kind === 'eight') {
      pts.push({ x: cx + Math.sin(u) * w, y: cy + Math.sin(u * 2) * h });
    } else {
      pts.push({ x: cx + Math.cos(u) * w, y: cy + Math.sin(u) * h });
    }
  }
  return pts;
}

export function rgbStr(hex) {
  const [r, g, b] = hexToRgb(hex);
  return `${r},${g},${b}`;
}
