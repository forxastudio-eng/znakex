// Sprite snake renderer: the real head / body / tail art from each skin sheet.
// The body is a sequence of the sheet's own modules (straight, variants and
// special segments) mapped along the smoothed path in thin strips so it bends
// with the snake. The head is the sheet's top-down head; neck and tail base are
// blended into the body so the pieces read as one animal.
import { clamp, lerp, smoothstep } from './util.js';
import { glowSprite } from './fx.js';
import { IMG } from './assets.js';
import { SKIN_MODS } from './skinmods.js';

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

// Resample a polyline at a fixed step; samples carry distance from the head.
function resample(pts, step, d0) {
  const out = [];
  if (!pts.length) return out;
  out.push({ x: pts[0].x, y: pts[0].y, d: d0 });
  let dist = d0, next = d0 + step;
  for (let i = 0; i < pts.length - 1; i++) {
    const a = pts[i], b = pts[i + 1];
    const seg = Math.hypot(b.x - a.x, b.y - a.y);
    if (seg < 1e-6) continue;
    while (next <= dist + seg) {
      const t = (next - dist) / seg;
      out.push({ x: a.x + (b.x - a.x) * t, y: a.y + (b.y - a.y) * t, d: next });
      next += step;
    }
    dist += seg;
  }
  const last = pts[pts.length - 1];
  out.push({ x: last.x, y: last.y, d: dist });
  return out;
}

// ------------------------------------------------------------------ skin art
const meta = new Map();

function canvasOf(img, w, h) {
  const c = document.createElement('canvas');
  c.width = w; c.height = h;
  const g = c.getContext('2d');
  g.drawImage(img, 0, 0, w, h);
  return { c, g };
}

// Vertical extent of a module's core (rows that are opaque across at least half of
// its length, so fins and stray edge pixels do not count) plus its average colour.
// leftEdgeOnly measures just the first columns (the base of a tail).
function measure(img, leftEdgeOnly) {
  const W = leftEdgeOnly ? Math.min(10, img.width) : img.width;
  const { g } = canvasOf(img, img.width, img.height);
  let top = 0, bot = img.height - 1, r = 0, gg = 0, b = 0, n = 0;
  try {
    const d = g.getImageData(0, 0, W, img.height).data;
    const cnt = new Float32Array(img.height);
    for (let y = 0; y < img.height; y++) {
      for (let x = 0; x < W; x++) {
        const i = (y * W + x) * 4;
        if (d[i + 3] > 160) {
          cnt[y]++;
          if (x % 2 === 0) { r += d[i]; gg += d[i + 1]; b += d[i + 2]; n++; }
        }
      }
    }
    const need = W * 0.5;
    let first = -1, last = -1;
    for (let y = 0; y < img.height; y++) if (cnt[y] >= need) { if (first < 0) first = y; last = y; }
    if (first >= 0) { top = first; bot = last; }
  } catch { n = 0; }
  const avg = n ? [r / n, gg / n, b / n] : [90, 110, 70];
  const hex = (k) => '#' + avg.map((v) => Math.min(255, Math.round(v * k)).toString(16).padStart(2, '0')).join('');
  return { img, top, bot: Math.max(bot, top + 1), fill: hex(1), dark: hex(0.35) };
}

// Thickness of a tail where it meets the body: measured a little way in (past the
// rounded cap), on the columns 8% to 30% of its length.
function measureBase(img) {
  const x0 = Math.floor(img.width * 0.08), x1 = Math.max(x0 + 2, Math.floor(img.width * 0.3));
  const W = x1 - x0;
  const { g } = canvasOf(img, img.width, img.height);
  let top = 0, bot = img.height - 1;
  try {
    const d = g.getImageData(x0, 0, W, img.height).data;
    let first = -1, last = -1;
    for (let y = 0; y < img.height; y++) {
      let c = 0;
      for (let x = 0; x < W; x++) if (d[(y * W + x) * 4 + 3] > 160) c++;
      if (c >= W * 0.5) { if (first < 0) first = y; last = y; }
    }
    if (first >= 0) { top = first; bot = last; }
  } catch { /* keep full height */ }
  return { top, bot: Math.max(bot, top + 1) };
}

// Opaque width per row of the (upright) head sprite, as a fraction of its width.
function headProfile(img) {
  const { g } = canvasOf(img, img.width, img.height);
  const rows = new Float32Array(img.height);
  let maxW = 1;
  try {
    const d = g.getImageData(0, 0, img.width, img.height).data;
    for (let y = 0; y < img.height; y++) {
      let n = 0, first = -1, last = -1;
      for (let x = 0; x < img.width; x++) {
        if (d[(y * img.width + x) * 4 + 3] > 140) { n++; if (first < 0) first = x; last = x; }
      }
      rows[y] = first < 0 ? 0 : (last - first + 1);
      if (rows[y] > maxW) maxW = rows[y];
    }
  } catch { rows.fill(img.width); maxW = img.width; }
  return { rows, maxW };
}

export function skinArt(skin) {
  const key = skin.art || skin.id;
  if (meta.has(key)) return meta.get(key);
  const head = IMG[`skins2/${key}/head.png`], body = IMG[`skins2/${key}/body.png`], tail = IMG[`skins2/${key}/tail.png`];
  if (!head || !body || !tail) return null;
  const main = measure(body, false);
  const mods = SKIN_MODS[key] || { variants: 0, specials: 0 };
  const variants = [], specials = [];
  for (let i = 0; i < mods.variants; i++) { const im = IMG[`skins2/${key}/variant${i}.png`]; if (im) variants.push(measure(im, false)); }
  for (let i = 0; i < mods.specials; i++) { const im = IMG[`skins2/${key}/special${i}.png`]; if (im) specials.push(measure(im, false)); }
  const tailM = measureBase(tail);
  const hp = headProfile(head);
  const m = {
    head, tail, main, variants, specials, tailProf: tailM, hp,
    fill: main.fill, dark: main.dark,
    thick: main.bot - main.top + 1,
  };
  meta.set(key, m);
  return m;
}

const BLOCKY = new Set(['samurai', 'vampire', 'knight', 'scorpion', 'cyber', 'ghost', 'abyssal', 'crystal']);
const SPECIAL_GAP = 5.5; // cells of plain body between special segments
const CELL_PER_R = 1 / 0.34;

/**
 * pts: polyline head -> tail (css px). o: {
 *   R (body half thickness), tongue, mouth, squash, bulges:[{d, amp}], glow, ghost, death, t,
 *   breaks: Set(i) where pts[i] -> pts[i+1] is a wrap-around jump, clip, fat, shadow
 * }
 */
export function drawSnake(g, pts, skin, o) {
  if (!pts || pts.length < 2) return;
  const art = skinArt(skin);
  if (!art) return;
  const R = o.R * (o.fat || 1);
  const t = o.t || 0;
  const unit = (2 * R) / art.thick; // sheet pixels -> screen pixels, from the body thickness

  // strands split at wrap-around jumps, smoothed and finely resampled
  const strands = [];
  let cur = [pts[0]];
  for (let i = 0; i < pts.length - 1; i++) {
    if (o.breaks && o.breaks.has(i)) { strands.push(cur); cur = []; }
    cur.push(pts[i + 1]);
  }
  strands.push(cur);
  const step = Math.max(1.1, R * 0.12);
  let dAcc = 0;
  const S = [];
  for (const st of strands) {
    if (st.length === 1) st.push({ x: st[0].x + 0.01, y: st[0].y });
    const smp = resample(chaikin(st, 3), step, dAcc);
    dAcc = smp[smp.length - 1].d + step;
    S.push(smp);
  }
  const total = Math.max(dAcc - step, R);

  // tangent angle (pointing towards the head)
  for (const smp of S) {
    for (let i = 0; i < smp.length; i++) {
      const a = smp[Math.max(0, i - 2)], b = smp[Math.min(smp.length - 1, i + 2)];
      smp[i].a = Math.atan2(a.y - b.y, a.x - b.x);
    }
  }

  // --- head geometry (needed for the neck blend)
  const hRatio = clamp(art.head.width / art.thick, 1.12, 1.9) * (skin.headScale || 1);
  const hw = 2 * R * hRatio;
  const hh = hw * (art.head.height / art.head.width);
  const fwd = R * (0.25 + (skin.headShift || 0));
  const neck = R * 0.7;
  // where the body starts, the head is this wide (in body-thickness units)
  const rowPx = hh / art.head.height;
  const rowAt = clamp(Math.round(art.head.height / 2 + (neck + fwd) / rowPx), 0, art.head.height - 1);
  const headThere = (art.hp.rows[rowAt] / art.head.width) * hw;
  const neckK = clamp(headThere / (2 * R), 0.62, 1);
  const neckLen = R * 1.7;

  // --- tail geometry: scaled by the sheet's own proportions, base blended into the body
  const tailBase = art.tailProf.bot - art.tailProf.top + 1;
  const tailRatio = clamp(tailBase / art.thick, 0.6, 1.12);
  const tailScale = (2 * R * tailRatio) / tailBase;
  const tailImgW = art.tail.width, tailImgH = art.tail.height;
  const tailLen = Math.min(tailImgW * tailScale, total * 0.42, R * (skin.tailLen || 5.4));
  const tailStart = total - tailLen;
  const tailBlend = R * 2.2;

  // --- module plan: variants cycle, a special segment appears every few cells
  const trimFrac = BLOCKY.has(skin.art || skin.id) ? 0 : 0.03;
  const gapPx = SPECIAL_GAP * R * CELL_PER_R;
  const cycle = art.variants.length ? art.variants : [art.main];
  const plan = [];
  {
    let d = neck, k = 0, sinceSpecial = 0, sp = 0;
    while (d < tailStart + R && plan.length < 90) {
      let m;
      if (art.specials.length && sinceSpecial >= gapPx) {
        m = art.specials[sp++ % art.specials.length];
        sinceSpecial = 0;
      } else {
        m = cycle[k++ % cycle.length];
      }
      const cut = trimFrac * m.img.width;
      const len = (m.img.width - cut * 2) * unit;
      plan.push({ m, start: d, len, cut });
      d += len;
      sinceSpecial += len;
    }
  }
  const planAt = (d) => {
    for (let i = plan.length - 1; i >= 0; i--) if (d >= plan[i].start) return plan[i];
    return plan[0];
  };

  // thickness profile: swallowed orbs bulge, the neck and tail base blend
  const bulges = o.bulges || [];
  const thick = (d) => {
    let k = 1;
    for (const b of bulges) {
      const x = (d - b.d) / (R * 1.3);
      if (x > -3 && x < 3) k += b.amp * Math.exp(-x * x);
    }
    if (d < neck + neckLen) k *= lerp(neckK, 1, smoothstep(neck, neck + neckLen, d));
    if (d > tailStart - tailBlend && d <= tailStart) k *= lerp(1, tailRatio, smoothstep(tailStart - tailBlend, tailStart, d));
    return k;
  };

  g.save();
  if (o.clip) { g.beginPath(); g.rect(o.clip.x, o.clip.y, o.clip.w, o.clip.h); g.clip(); }
  if (o.ghost) g.globalAlpha = 0.45 + 0.4 * (0.5 + 0.5 * Math.sin(t * 22));
  const base = g.getTransform();

  // boost aura (and a faint permanent aura for glowing skins)
  if (o.glow > 0 || skin.aura) {
    g.save();
    g.globalCompositeOperation = 'lighter';
    const col = o.glow > 0 ? '#FFD36A' : skin.aura;
    const sp = glowSprite(col, 64);
    const k = o.glow > 0 ? 0.26 * o.glow : 0.09 + 0.05 * Math.sin(t * 3);
    for (const smp of S) {
      for (let i = 0; i < smp.length; i += 7) {
        const s = smp[i];
        const rr = R * (2.4 + 0.3 * Math.sin(t * 9 - s.d * 0.05));
        g.globalAlpha = k;
        g.drawImage(sp, s.x - rr, s.y - rr, rr * 2, rr * 2);
      }
    }
    g.restore();
  }

  // soft drop shadow: a few stacked translucent strokes (no shadowBlur, which is very slow on phones)
  if (o.shadow !== false) {
    g.save();
    g.translate(R * 0.25, R * 0.45);
    g.strokeStyle = '#060804';
    g.lineCap = 'round';
    g.lineJoin = 'round';
    for (const [w, a] of [[2.5, 0.07], [2.1, 0.09], [1.75, 0.12]]) {
      g.globalAlpha = a;
      g.lineWidth = R * w;
      for (const smp of S) {
        g.beginPath();
        let started = false;
        for (const s of smp) {
          if (s.d > total - tailLen * 0.4) break;
          if (!started) { g.moveTo(s.x, s.y); started = true; } else g.lineTo(s.x, s.y);
        }
        g.stroke();
      }
    }
    g.restore();
  }

  // underlay tube: hides hairline gaps between strips on tight curves
  g.lineCap = 'round';
  g.lineJoin = 'round';
  for (const smp of S) {
    for (const [col, w] of [[art.dark, 1.9], [art.fill, 1.5]]) {
      g.strokeStyle = col;
      g.lineWidth = R * w * Math.min(1, tailRatio + 0.15);
      g.beginPath();
      let started = false;
      for (const s of smp) {
        if (s.d < neck) continue;
        if (s.d > tailStart + R * 0.5) break;
        if (!started) { g.moveTo(s.x, s.y); started = true; } else g.lineTo(s.x, s.y);
      }
      g.stroke();
    }
  }

  // textured strips, from the tail towards the head
  const dw = step * 2.3;
  for (let si = S.length - 1; si >= 0; si--) {
    const smp = S[si];
    for (let i = smp.length - 1; i >= 0; i--) {
      const s = smp[i];
      if (s.d < neck) break;
      const c = Math.cos(s.a), sn = Math.sin(s.a);
      // strip axis: +x along the body (towards the tail), +y across it
      g.setTransform(-base.a * c, -base.d * sn, -base.a * sn, base.d * c, base.a * s.x + base.e, base.d * s.y + base.f);
      if (s.d >= tailStart) {
        const u = (s.d - tailStart) / tailLen;
        const sx = clamp(u * tailImgW, 0, tailImgW - 1);
        const sw = Math.max(1, (step / tailLen) * tailImgW);
        const h = tailImgH * tailScale;
        const cy = ((art.tailProf.top + art.tailProf.bot) / 2 - tailImgH / 2) * tailScale;
        g.drawImage(art.tail, sx, 0, Math.min(sw, tailImgW - sx), tailImgH, -dw / 2, -h / 2 - cy, dw, h);
      } else {
        const seg = planAt(s.d);
        const im = seg.m.img;
        const k = thick(s.d);
        const span = im.width - seg.cut * 2;
        const sx = clamp(seg.cut + ((s.d - seg.start) / seg.len) * span, 0, im.width - 1);
        const sw = Math.max(1, step / unit);
        const h = im.height * unit * k;
        const cy = ((seg.m.top + seg.m.bot) / 2 - im.height / 2) * unit * k;
        g.drawImage(im, sx, 0, Math.min(sw, im.width - sx), im.height, -dw / 2, -h / 2 - cy, dw, h);
      }
    }
  }
  g.setTransform(base);

  // head: the sheet's top-down head, rotated to the direction of travel
  const s0 = S[0][0];
  let k1 = 1;
  while (k1 < S[0].length - 1 && S[0][k1].d < R * 1.2) k1++;
  const s1 = S[0][k1];
  const ang = Math.atan2(s0.y - s1.y, s0.x - s1.x);
  drawHead(g, s0.x, s0.y, ang, R, art, skin, o, { hw, hh, fwd });
  g.restore();
}

function drawHead(g, x, y, ang, R, art, skin, o, hd) {
  const img = art.head;
  const { hw: w, hh: h, fwd } = hd;
  const sq = clamp(o.squash || 0, 0, 1);
  const tg = clamp(Math.max(o.tongue || 0, (o.mouth || 0) > 0.4 ? o.mouth : 0), 0, 1);
  g.save();
  g.translate(x, y);
  g.rotate(ang + Math.PI / 2); // the sprite faces up (-y)
  g.translate(0, -fwd);
  // forked tongue flicking out from under the snout
  if (tg > 0.02) {
    const len = R * 1.1 * tg;
    const tipY = -h * 0.42;
    g.strokeStyle = skin.tongue || '#C7354A';
    g.lineWidth = Math.max(1.4, R * 0.12);
    g.lineCap = 'round';
    g.lineJoin = 'round';
    g.beginPath();
    g.moveTo(0, tipY + R * 0.4);
    g.lineTo(0, tipY - len);
    g.lineTo(-R * 0.22, tipY - len - R * 0.3);
    g.moveTo(0, tipY - len);
    g.lineTo(R * 0.22, tipY - len - R * 0.3);
    g.stroke();
  }
  // eating: quick lunge and squash (the head art stays whole)
  g.translate(0, -sq * R * 0.2);
  g.scale(1 + sq * 0.1, 1 + sq * 0.14);
  g.save();
  g.globalAlpha *= 0.32;
  g.drawImage(glowSprite('#000000', 64), -w * 0.55 + R * 0.25, -h * 0.5 + R * 0.4, w * 1.1, h * 1.05);
  g.restore();
  g.drawImage(img, -w / 2, -h / 2, w, h);
  if (skin.eyeGlow) {
    g.globalCompositeOperation = 'lighter';
    g.globalAlpha = 0.22 + 0.1 * Math.sin((o.t || 0) * 3);
    const sp = glowSprite(skin.eyeGlow, 64);
    g.drawImage(sp, -w * 0.7, -h * 0.65, w * 1.4, h * 1.1);
  }
  g.restore();
}

// Paths used by the menus and the skins preview.
export function pathPoints(cx, cy, w, h, t, len, n = 40, kind = 'eight') {
  const pts = [];
  for (let i = 0; i < n; i++) {
    const u = t - (i / n) * len;
    if (kind === 'eight') pts.push({ x: cx + Math.sin(u) * w, y: cy + Math.sin(u * 2) * h });
    else pts.push({ x: cx + Math.cos(u) * w, y: cy + Math.sin(u) * h });
  }
  return pts;
}
